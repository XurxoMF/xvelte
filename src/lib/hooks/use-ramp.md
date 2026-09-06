# UseRamp

`useRamp` repeats an increment after an initial delay and gradually shortens the interval while an interaction remains active. Use it to build press-and-hold steppers, scrub controls, or other repeated adjustments. It supplies timing and state only; the consuming control owns pointer, keyboard, disabled, focus, and labeling behavior.

<!-- xvelte-example: overview -->

## Contents

- [Installation](#installation)
- [Import](#import)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Reactivity and lifecycle](#reactivity-and-lifecycle)
- [Accessibility and localization](#accessibility-and-localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Installation

Copy `use-ramp.svelte.ts` and install Svelte 5 if the project does not already provide it:

```sh
# Bun
bun add -D svelte

# npm
npm install -D svelte

# pnpm
pnpm add -D svelte
```

---

## Import

```svelte
<script lang="ts">
	import { useRamp, type UseRampOptions } from "$lib/hooks/use-ramp.svelte";
</script>
```

The file exports `useRamp` and `UseRampOptions`. Its returned object has an inferred type and no separately exported name.

---

## Basic usage

```svelte
<script lang="ts">
	import { onDestroy } from "svelte";

	import { useRamp } from "$lib/hooks/use-ramp.svelte";

	let value = $state(0);
	const maximum = 100;

	const ramp = useRamp({
		increment: () => value++,
		canRamp: () => value < maximum
	});

	onDestroy(ramp.reset);
</script>

<button
	type="button"
	disabled={value >= maximum}
	onpointerdown={() => ramp.start()}
	onpointerup={ramp.reset}
	onpointercancel={ramp.reset}
	onpointerleave={ramp.reset}
>
	Increase continuously
</button>

<output aria-live="polite">{value}</output>
```

The first increment occurs only after `startDelay`; a quick press performs no increment. Add a separate click or keyboard behavior when the control must also support single-step activation.

---

## Examples

### Custom acceleration

```ts
const ramp = useRamp({
	increment: increaseZoom,
	canRamp: () => zoom < 4,
	startDelay: 300,
	maxFrequency: 240,
	minFrequency: 40,
	rampUpTime: 1800
});
```

Despite their names, the frequency options are delays in milliseconds. `maxFrequency` is the initial slower interval and `minFrequency` is the eventual faster interval. The implementation normalizes reversed values automatically.

### Add accessible single-step behavior

Keep normal activation separate from hold repetition so keyboard and assistive-technology users can increment once:

```svelte
<button
	type="button"
	disabled={!canIncrease()}
	onclick={() => canIncrease() && increase()}
	onpointerdown={(event) => {
		if (event.pointerType !== "mouse" || event.button === 0) ramp.start();
	}}
	onpointerup={ramp.reset}
	onpointercancel={ramp.reset}
	onpointerleave={ramp.reset}
>
	Increase value
</button>
```

A completed pointer hold normally also produces a click, adding one final increment in this example. Suppress that click in the surrounding control if that is not the desired behavior. `useRamp` intentionally does not decide this interaction policy.

### Stop at a dynamic boundary

```ts
const ramp = useRamp({
	increment: () => quantity++,
	canRamp: () => !disabled && quantity < availableStock
});
```

`canRamp` is checked immediately before every repeated increment. Returning `false` resets the complete ramp and cancels further work.

---

## Public API

### `useRamp(options)`

| Option         | Type            | Default  | Behavior                                                                                                  |
| -------------- | --------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `increment`    | `() => void`    | Required | Runs once per repeated step after the initial delay.                                                      |
| `canRamp`      | `() => boolean` | Required | Checked before each step; `false` stops and resets the ramp.                                              |
| `maxFrequency` | `number`        | `200`    | Slow interval in milliseconds. Values below zero are clamped through normalization.                       |
| `minFrequency` | `number`        | `25`     | Fast interval in milliseconds reached at the end of the ramp.                                             |
| `startDelay`   | `number`        | `100`    | Delay in milliseconds before the first repeated increment; negative values become zero.                   |
| `rampUpTime`   | `number`        | `2500`   | Time in milliseconds for linear interpolation from slow to fast; zero or negative uses the fast interval. |

`useRamp` returns:

| Member    | Type               | Behavior                                                                           |
| --------- | ------------------ | ---------------------------------------------------------------------------------- |
| `start()` | `() => void`       | Resets any existing cycle, marks it active, and starts the initial-delay timer.    |
| `reset()` | `() => void`       | Clears both timers and returns `active` and `ramping` to `false`.                  |
| `active`  | `readonly boolean` | Reactive state that is true during both the initial delay and repeated increments. |
| `ramping` | `readonly boolean` | Reactive state that becomes true at the first repeated increment.                  |

The callbacks and timing values are captured when `useRamp` runs. Recreate the hook to replace those options; callbacks may still read current reactive values.

---

## Reactivity and lifecycle

The hook uses Svelte runes for `active` and `ramping` and native `setTimeout` calls for scheduling. It does not register lifecycle cleanup automatically. Always call `reset()` when the interaction ends and when the owning component is destroyed, as shown in Basic usage.

Calling `start()` repeatedly is safe: it clears the previous initial-delay and repeat timers before beginning a new cycle. Timer scheduling is approximate and follows normal browser throttling in inactive tabs.

---

## Accessibility and localization

The hook renders no content and contains no copy. Apply it to a semantic control with an accessible name, visible focus, normal single-step keyboard activation, a real disabled state, and understandable limits. Repeated updates should not flood an `aria-live` region; choose the surrounding announcement strategy according to the value and task.

Labels, values, units, validation, and feedback are supplied and translated by the app.

---

## Dependencies

`useRamp` requires only Svelte 5 runes and `use-ramp.svelte.ts`. The installation command is under Installation. It requires no Runed package, CSS, icons, `$lib/utils` exports, xvelte components, other hooks, attachments, contexts, or localization setup.

---

## Credits

`useRamp` is adapted from [shadcn-svelte-extras UseRamp](https://shadcn-svelte-extras.com/docs/hooks/use-ramp).

The API, behavior, and limitations in this guide describe the local xvelte implementation.

---

## File organization

| File                 | Responsibility                                            |
| -------------------- | --------------------------------------------------------- |
| `use-ramp.svelte.ts` | Exported implementation, types, and public API.           |
| `use-ramp.md`        | Installation, usage, API, behavior, and dependency guide. |

`use-ramp.svelte.ts` and its exported declarations are the source of truth for this hook's public API.

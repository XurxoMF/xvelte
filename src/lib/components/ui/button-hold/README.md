# Hold Button

A button that completes an action only after a continuous mouse or touch hold. A directional overlay fills across the native button for a configurable duration, cancels when the supported hold ends early, and calls `onComplete` after the timer finishes.

Use Hold Button as an additional guard for deliberate pointer actions such as deleting, resetting, powering off, or confirming a physical-style control. Do not use it as the only way to perform an essential action: the local hold gesture is not available from the keyboard, does not expose progress to assistive technology, and is not a replacement for a fully accessible confirmation flow.

## Contents

- [Import](#import)
- [Anatomy](#anatomy)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Styling and DOM contract](#styling-and-dom-contract)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Import

Import the component from its public `index.ts`:

```svelte
<script lang="ts">
	import * as ButtonHold from "$lib/components/ui/button-hold";
</script>
```

`index.ts` exports `Root`, `RootProps`, and the `HoldDirection` union.

---

## Anatomy

Hold Button has one public part and always renders the local Button component:

```svelte
<ButtonHold.Root onComplete={confirmAction}>Hold to confirm</ButtonHold.Root>
```

The rendered button contains two internal layers:

1. An absolute, non-interactive fill layer that scales from the selected edge.
2. A relative content layer that renders the required `children` snippet above the fill.

The app supplies the label and performs the guarded action in `onComplete`. Do not put that action in `onclick`: a native click can occur when the button is released even if the required hold did not complete, and keyboard activation calls `onclick` without starting the hold timer.

---

## Basic usage

`duration` is measured in milliseconds. Keep the instruction visible so pointer users understand the required interaction:

```svelte
<script lang="ts">
	import * as ButtonHold from "$lib/components/ui/button-hold";

	let confirmed = $state(false);
</script>

<ButtonHold.Root duration={1500} variant="destructive" fillColor="bg-black/20" onComplete={() => (confirmed = true)}>
	Hold for 1.5 seconds to delete
</ButtonHold.Root>

{#if confirmed}
	<p role="status">The item was deleted.</p>
{/if}
```

Press and hold with the mouse or touch. Releasing early cancels the timer and retracts the fill. Completion calls `onComplete` once, keeps the full overlay visible for approximately 200 ms, then resets it for another hold.

---

## Examples

### Fill directions

`from` changes both the transform axis and its origin:

```svelte
<div class="grid grid-cols-2 gap-3">
	<ButtonHold.Root from="top" onComplete={confirmAction}>Fill from top</ButtonHold.Root>
	<ButtonHold.Root from="bottom" onComplete={confirmAction}>Fill from bottom</ButtonHold.Root>
	<ButtonHold.Root from="left" onComplete={confirmAction}>Fill from left</ButtonHold.Root>
	<ButtonHold.Root from="right" onComplete={confirmAction}>Fill from right</ButtonHold.Root>
</div>
```

`top` and `bottom` animate `scaleY`. `left` and `right` animate `scaleX`.

### Button variants and fill contrast

Hold Button forwards the local Button's `variant` and `size` props. `fillColor` is a Tailwind class string rather than a CSS color value:

```svelte
<div class="flex flex-wrap gap-3">
	<ButtonHold.Root variant="outline" size="sm" from="left" fillColor="bg-emerald-500/20" duration={1000} onComplete={confirmAction}>
		Hold to approve
	</ButtonHold.Root>

	<ButtonHold.Root variant="destructive" from="bottom" fillColor="bg-black/20" duration={2500} onComplete={deleteAccount}>
		Hold to delete account
	</ButtonHold.Root>
</div>
```

Choose a fill with enough contrast against both the selected Button variant and its label. Tailwind must be able to discover the class at build time; safelist values that are assembled dynamically or loaded from external data.

### Asynchronous action and disabled state

`onComplete` is called synchronously and its return value is ignored. The component does not await a returned promise or enter a loading state, so the app must manage that state:

```svelte
<script lang="ts">
	import * as ButtonHold from "$lib/components/ui/button-hold";

	let deleting = $state(false);
	let error = $state("");

	async function deleteProject() {
		deleting = true;
		error = "";

		try {
			await removeProject();
		} catch {
			error = "The project could not be deleted.";
		} finally {
			deleting = false;
		}
	}
</script>

<ButtonHold.Root
	disabled={deleting}
	variant="destructive"
	duration={2000}
	onComplete={() => {
		void deleteProject();
	}}
>
	{deleting ? "Deleting…" : "Hold to delete project"}
</ButtonHold.Root>

{#if error}
	<p role="alert">{error}</p>
{/if}
```

The internal hold state resets about 200 ms after `onComplete`, independently of the asynchronous task. `disabled` prevents new native pointer interaction while the app operation is running.

### Safe form submission

The inherited Button default is `type="button"`. Keep it when submission must happen only after completion, then request submission explicitly:

```svelte
<script lang="ts">
	import * as ButtonHold from "$lib/components/ui/button-hold";

	let formRef = $state<HTMLFormElement | null>(null);

	function save(event: SubmitEvent) {
		event.preventDefault();
		// Validate and save.
	}
</script>

<form bind:this={formRef} onsubmit={save}>
	<!-- Fields -->

	<ButtonHold.Root type="button" duration={1200} onComplete={() => formRef?.requestSubmit()}>Hold to submit</ButtonHold.Root>
</form>
```

Do not set `type="submit"` or `type="reset"` for the guarded action. Native click behavior can submit or reset the form on release without a completed hold.

### Consumer event handlers

Mouse and touch handlers can observe the gesture without replacing its main internal handlers:

```svelte
<ButtonHold.Root
	onComplete={confirmAction}
	onmousedown={() => console.info("Hold started with mouse")}
	onmouseup={() => console.info("Mouse released")}
	ontouchstart={() => console.info("Hold started with touch")}
	ontouchend={() => console.info("Touch ended")}
>
	Hold to confirm
</ButtonHold.Root>
```

The four handlers above run after Hold Button's corresponding internal logic. Do not pass `onmouseleave`: because of the current native-prop forwarding order, it replaces the internal mouse-leave cancellation handler instead of composing with it.

---

## Public API

Hold Button wraps the local Button component. The table documents every Hold Button-owned prop and the inherited Button options most relevant to normal use. Follow the Button component's README for its complete variants, sizes, native attributes, form behavior, styling, and dependencies. Hold Button's `index.ts`, exported types, and local source are the source of truth.

### `ButtonHold.Root`

Type: `RootProps`, based on Button's `RootProps` after replacing its optional children with a required snippet.

| Prop         | Type                                     | Default         | Behavior                                                                                         |
| ------------ | ---------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `children`   | `Snippet`                                | Required        | Renders the visible label or icon content above the fill layer.                                  |
| `duration`   | `number`                                 | `1000`          | Hold time and active linear transition duration in milliseconds.                                 |
| `onComplete` | `() => void`                             | `undefined`     | Runs once after a continuous supported hold reaches `duration`. Its return value is not awaited. |
| `fillColor`  | `string`                                 | `"bg-black/10"` | Tailwind classes merged onto the internal fill layer.                                            |
| `from`       | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"`      | Selects fill axis and transform origin.                                                          |
| `variant`    | Button variant                           | `"default"`     | Inherited local Button visual treatment.                                                         |
| `size`       | Button size                              | `"default"`     | Inherited local Button dimensions and spacing.                                                   |
| `type`       | `"button" \| "submit" \| "reset"`        | `"button"`      | Inherited native form behavior. Keep `button` for a guarded action.                              |
| `disabled`   | `boolean`                                | `undefined`     | Inherited native disabled state and styling.                                                     |
| `ref`        | `HTMLElement \| null`                    | `null`          | Inherited bindable native button reference.                                                      |
| `class`      | `string`                                 | `undefined`     | Merged into the underlying Button together with `relative overflow-hidden select-none`.          |

All remaining Button/native button props are forwarded, including `name`, `value`, `form*`, `aria-*`, `onclick`, focus handlers, and keyboard handlers. Forwarding an attribute does not integrate it with the hold timer.

`duration` is not rounded or clamped. Pass a finite non-negative value. Changing it during an active hold can desynchronize the already scheduled timer from the reactive CSS transition, so keep it stable until the gesture ends.

`HoldDirection` is exactly:

```ts
type HoldDirection = "top" | "bottom" | "left" | "right";
```

### Gesture lifecycle

| Input/event              | Local behavior                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `mousedown`              | Starts the hold unless the component is in its 200 ms completed state. Every mouse button is accepted; there is no primary-button filter. |
| `mouseup`                | Cancels an incomplete mouse hold.                                                                                                         |
| `mouseleave`             | Cancels an incomplete mouse hold unless a forwarded consumer handler has replaced this internal handler.                                  |
| `touchstart`             | Calls `preventDefault()` when cancelable, then starts the hold.                                                                           |
| `touchend`               | Cancels an incomplete touch hold.                                                                                                         |
| Timer reaches `duration` | Marks completion, calls `onComplete`, waits 200 ms, and begins the reset.                                                                 |
| Incomplete cancellation  | Changes the fill transition to 100 ms and retracts it.                                                                                    |

`onmousedown`, `onmouseup`, `ontouchstart`, and `ontouchend` are composed: internal logic runs first and the supplied handler runs afterward. `onmouseleave` is not composed because it remains in the final forwarded prop object and can override the internal handler.

The component does not handle `touchcancel`, `pointercancel`, `pointerleave`, loss of focus, page visibility changes, or pointer capture. A touch moving outside the element is not equivalent to mouse leave. Use `onComplete` as the only guarded action callback and test the intended devices.

### Completion and cleanup limitations

The component stores its timers internally but does not clear them when it is destroyed. If a held button is conditionally removed before its timer fires, `onComplete` can still run after unmount. Cancel or prevent the surrounding removal while a hold may be active, or adapt the component before using it in a lifecycle where that guarantee is required.

After completion, further starts and cancellations are ignored for about 200 ms. The visual reset then uses a 100 ms transition. No public prop, binding, event, or data attribute exposes holding percentage, active state, or completed state.

---

## Styling and DOM contract

The root is the local Button's native `button` with `relative`, `overflow-hidden`, and `select-none` added to the inherited variant/size classes.

Stable xvelte hook:

| Part | Stable hook               | Element         |
| ---- | ------------------------- | --------------- |
| Root | `data-slot="button-hold"` | Native `button` |

Passing `data-slot="button-hold"` through Button replaces Button's usual `data-slot="button"` on the rendered element. Do not rely on `data-slot="button"` selectors for Hold Button.

The fill layer is an absolute `div` covering the button with `pointer-events-none` and `z-0`. It receives the selected `origin-*` class, `fillColor`, an inline `transform`, and an inline linear `transition`:

- While holding: `transform {duration}ms linear`.
- While idle or retracting: `transform 100ms linear`.

The content layer is a relative `span` with `z-10`, flex alignment, a small gap, and `pointer-events-none`. Children cannot receive their own pointer interaction, which is appropriate because interactive content must not be nested inside a button.

Neither internal layer has a public `data-slot`. Targeting its exact element order or classes is implementation-dependent; use `fillColor` for the fill and Root's `class` for the button. The component exposes no CSS variable, state attribute, animation name, or keyframe.

Caller `class` values flow through Hold Button's `cn` call and then Button's variant merging, so later conflicting Tailwind utilities can replace ordinary root defaults. Inline transform and transition styles on the fill are not overridable through Root's class.

---

## Accessibility

The rendered element retains native button semantics, focus, disabled behavior, and accessible naming from its children. The hold gesture itself is pointer-only:

- Space and Enter can produce a native `click` but never start the hold or call `onComplete`.
- The visual fill has no progressbar semantics, live announcement, textual percentage, or exposed active state.
- The inline transition does not respond to `prefers-reduced-motion`.
- Touch cancellation and assistive-technology gesture behavior are not handled comprehensively.

Always provide a keyboard-accessible alternative for the same essential action, such as an ordinary button that opens an accessible confirmation dialog. Do not place the alternative inside Hold Button. A hold-only destructive action can prevent keyboard and assistive-technology users from completing the task.

Use a concise label that explains both the action and the need to hold. Do not communicate purpose or completion using fill color alone. Render app-owned status or error feedback after `onComplete`, and use an appropriate live region when the result is not otherwise apparent.

Do not supply `onclick` for the guarded action. Native mouse release and keyboard activation can call it independently of `onComplete`. Avoid `type="submit"` and `type="reset"` for the same reason.

Inherited Button focus, invalid, pressed, and expanded styling does not create those behaviors. Follow the Button README for the complete native and ARIA obligations.

---

## Localization

Hold Button has no built-in user-facing copy and imports no localization messages. The app supplies and translates the required children, hold instruction, accessible name, alternative keyboard action, completion status, error feedback, and any duration text.

`fillColor`, `from`, variant names, size names, event names, and `data-slot` are technical values and are not translated. Prefer a localized human duration such as “Hold for 1.5 seconds” rather than exposing raw milliseconds.

---

## Dependencies

Hold Button expects a Svelte 5 project using Tailwind CSS 4. It requires the complete local Button component, Bits UI's type helpers, Tailwind Variants, and the shared xvelte utilities.

Install every runtime dependency first and Tailwind as the development dependency:

```sh
# bun
bun add bits-ui tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

### Required UI component

Copy the complete `src/lib/components/ui/button` component:

- `button-root.svelte`
- `index.ts`
- `README.md`

Follow the Button component's README to install it and understand its variants, sizes, native API, styling, accessibility, and theme requirements. Hold Button imports `Root` and `RootProps` through Button's public `index.ts`.

No other xvelte UI component is required.

### Shared utilities

Hold Button imports `cn` directly. Button imports `cn` and `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when absent:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class values and resolves conflicting Tailwind utilities in favor of the last value.
 *
 * @param inputs - Conditional, nested, or plain class values to merge.
 * @returns The normalized class string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block includes `clsx` and `tailwind-merge`. `WithoutChildren` comes from the installed `bits-ui` package and requires no local helper.

### Global CSS

The stylesheet must include Tailwind, Button's dark variant, semantic Button tokens, and shared radius mappings. The default Hold Button fill uses Tailwind's built-in black color and adds no token of its own.

The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}
```

The app owns dark-mode activation. Hold Button requires no `tw-animate-css` import, component-specific CSS, keyframe, icon export, localization message, hook, attachment, context file, image, font, network service, or additional layout rule.

---

## Credits

Adapted from [more-shadcn-svelte's Hold Button](https://more-shadcn.noair.fun/docs/components/hold-button). The local xvelte Button dependency, API, event forwarding, timing, styling, accessibility limitations, and behavior documented here are the source of truth.

---

## File organization

| File                      | Responsibility                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `button-hold-root.svelte` | Hold timers, mouse/touch composition, cancellation, completion reset, directional transform, fill layer, and Button wrapper. |
| `index.ts`                | Public Root component, props type, and direction type exports.                                                               |
| `README.md`               | Composition, examples, API, gesture lifecycle, styling, accessibility, localization, dependencies, limitations, and credits. |

Treat `index.ts`, its exported types, and the local source as the source of truth for the public API.

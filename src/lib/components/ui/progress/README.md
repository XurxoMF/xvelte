# Progress

An accessible horizontal progress bar for showing how far a task has advanced toward completion. It provides determinate and indeterminate semantics, a built-in animated fill, configurable maximum values, native progressbar attributes, and local semantic styling.

Use Progress for uploads, downloads, installations, multi-step processing, or another task that advances toward completion. Use Meter for a measurement that may fluctuate, such as storage, signal strength, or resource usage, and use Spinner when no meaningful amount of completion is available.

<!-- xvelte-example: overview -->

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

## Import

Import the component through its public `index.ts`:

```svelte
<script lang="ts">
	import * as Progress from "$lib/components/ui/progress";
</script>
```

The component exports `Root` and its `RootProps` type. The visual indicator is built into Root and is not exported as a separate part.

## Anatomy

Progress has one public part:

```svelte
<Progress.Root value={40} aria-label="Uploading files" />
```

Root renders the accessible progressbar track and an internal indicator. It deliberately removes the Bits UI `children` and `child` props, so app content cannot replace or render inside the indicator.

Place visible labels, percentages, status details, and actions beside Root rather than inside it.

## Basic usage

```svelte
<script lang="ts">
	import * as Progress from "$lib/components/ui/progress";

	let value = $state(68);
</script>

<div class="grid max-w-md gap-2">
	<div class="flex items-center justify-between text-sm">
		<span id="upload-progress-label">Uploading files</span>
		<span>{value}%</span>
	</div>

	<Progress.Root {value} aria-labelledby="upload-progress-label" aria-valuetext={`${value}%`} />
</div>
```

The default range is `0` to `100`. Progress does not manage a task or update its own value; application state supplies each new value.

## Examples

### Animate an application update

The internal indicator uses `transition-all`, so changing `value` animates its transform with the browser's default transition timing:

```svelte
<script lang="ts">
	import { onMount } from "svelte";

	import * as Progress from "$lib/components/ui/progress";

	let value = $state(15);

	onMount(() => {
		const timer = setTimeout(() => (value = 70), 500);
		return () => clearTimeout(timer);
	});
</script>

<Progress.Root {value} aria-label="Preparing workspace" aria-valuetext={`${value}% complete`} />
```

For continuous work, update `value` from the real task state instead of simulating progress with a timer.

### Custom maximum

Keep the minimum at `0` and use `max` for totals expressed in files, bytes, records, or steps:

```svelte
<script lang="ts">
	import * as Progress from "$lib/components/ui/progress";

	let completed = $state(18);
	const total = 24;
</script>

<div class="grid gap-2">
	<span id="image-progress-label">Processed {completed} of {total} images</span>
	<Progress.Root value={completed} max={total} aria-labelledby="image-progress-label" aria-valuetext={`${completed} of ${total} images`} />
</div>
```

The local visual fill is calculated as `value / max`; do not use a non-zero `min` even though the inherited Bits UI type exposes it.

### Indeterminate semantics

Pass `null` when a task is running but no completion amount is known:

```svelte
<Progress.Root value={null} aria-label="Preparing export" />
```

Bits UI removes `aria-valuenow` and exposes indeterminate state attributes. The local xvelte indicator treats `null` as zero and therefore shows an empty, static track; it does not provide an indeterminate animation. Pair it with visible loading text or use Spinner when an animated unknown-duration indicator is required.

### Change track and indicator styles

`class` styles Root. Target the stable indicator slot from that class when the fill also needs a local variation:

```svelte
<Progress.Root value={85} aria-label="Storage migration" class="h-2 bg-muted/60 **:data-[slot=progress-indicator]:bg-accent" />
```

The component does not expose an indicator class prop. Prefer the documented slot selector instead of relying on its internal element order.

### Completed task

```svelte
<Progress.Root value={100} aria-label="Import complete" aria-valuetext="Complete" />
```

When `value` exactly equals `max`, Bits UI changes `data-state` from `"loading"` to `"loaded"`. The local appearance does not change automatically beyond the full-width indicator.

## Public API

Progress wraps the installed stable Bits UI Progress primitive. The table documents the complete local surface and the inherited values relevant to this wrapper; see the [Bits UI Progress API](https://bits-ui.com/docs/components/progress#api-reference) for dependency-owned semantics and attributes. The component's `index.ts` and exported `RootProps` type remain the source of truth.

### `Progress.Root`

`RootProps` is `ProgressPrimitive.RootProps` with `children` and `child` removed.

| Prop    | Type                     | Default | Behavior                                                                                                 |
| ------- | ------------------------ | ------- | -------------------------------------------------------------------------------------------------------- |
| `value` | `number \| null`         | `0`     | Current task progress. `null` selects primitive indeterminate semantics but renders an empty local fill. |
| `max`   | `number`                 | `100`   | Maximum value and denominator used by the local indicator transform.                                     |
| `min`   | `number`                 | `0`     | Inherited semantic minimum. Keep it at `0` because the local fill calculation does not subtract it.      |
| `ref`   | `HTMLDivElement \| null` | `null`  | Bindable reference to the progressbar Root element.                                                      |
| `class` | `string`                 | —       | Merged after the local track, size, color, clipping, and radius classes.                                 |

The component forwards compatible native `div` attributes such as `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-valuetext`, `title`, `style`, and event handlers. It has no bindable `value`, change callback, orientation, size, label, value formatter, indicator prop, or public snippet.

Use a finite positive `max` and values from `0` through `max`. Neither the local wrapper nor the installed primitive clamps invalid, negative, overflowing, or non-finite values. A zero or invalid maximum can also produce an invalid CSS transform.

### Indicator calculation

The internal indicator always occupies the full track size and moves horizontally with this local formula:

```ts
const translate = 100 - (100 * (value ?? 0)) / (max ?? 1);
```

It renders `transform: translateX(-${translate}%)`. At `0` the indicator is completely translated outside the left edge; at `max` it sits at its full visible width. The track clips horizontal overflow.

Because this calculation ignores `min`, the documented visual range is `0` through `max`. The inherited `min` prop changes Bits UI's `aria-valuemin` and `data-min` but does not change the indicator position.

## Styling and DOM contract

Stable local hooks:

| Element            | Stable hook                      | Local behavior                                                               |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------- |
| Root track         | `data-slot="progress"`           | Relative, `h-1`, full width, rounded, clipped, and uses `bg-muted`.          |
| Internal indicator | `data-slot="progress-indicator"` | Full size, primary background, `flex: 1`, transform-driven `transition-all`. |

Bits UI additionally supplies these dependency-owned Root attributes:

| Attribute            | Behavior                                                                        |
| -------------------- | ------------------------------------------------------------------------------- |
| `data-progress-root` | Identifies the primitive Root.                                                  |
| `data-value`         | Current determinate value; omitted when `value` is `null`.                      |
| `data-min`           | Current semantic minimum.                                                       |
| `data-max`           | Current maximum.                                                                |
| `data-state`         | `"indeterminate"`, `"loading"`, or `"loaded"`; loaded requires `value === max`. |
| `data-indeterminate` | Present only when `value` is `null`.                                            |

Root classes are merged with `cn()`. The indicator has no public class prop, but its stable slot can be targeted by descendant CSS or Tailwind selectors. Its inline transform is behavioral and overrides a transform supplied only through a class; changing indicator movement requires changing the component.

Progress uses the semantic `muted` track and `primary` indicator tokens. It has no component CSS variable, keyframe, state-specific local class, or external animation hook.

## Accessibility

Bits UI renders Root with `role="progressbar"`, `aria-valuemin`, and `aria-valuemax`. Determinate values also receive `aria-valuenow`; indeterminate `null` values omit it.

- Every progressbar needs an accessible name. Connect a visible label with `aria-labelledby`, or supply `aria-label` when no visible label exists.
- Use `aria-valuetext` when the raw number does not explain the user-facing value, such as `"18 of 24 images"`, `"Complete"`, or a localized percentage.
- Render important status and error text outside Progress. The component contains no visible label, percentage, failure state, or live announcement.
- Do not communicate completion only through color or fill length. Adjacent text should state the relevant amount or result.
- Keep `value` between `0` and `max` so visual and semantic state remain coherent.
- Indeterminate mode is semantically available but visually static in this implementation. Ensure sighted users also receive loading feedback.

Progress is read-only status, not an input. It has no keyboard interaction or focus behavior.

## Localization

Progress has no built-in human-readable copy and uses no localization message. Your app supplies and translates the accessible name, visible task label, units, percentage, completion text, errors, and adjacent actions.

Use `Intl.NumberFormat` for locale-aware percentages or quantities before passing the result to visible text and `aria-valuetext`. Primitive `data-state` values and numeric ARIA attributes are technical values and are not translated.

## Dependencies

### Packages

Install runtime dependencies first and development dependencies second:

```sh
# Bun
bun add bits-ui clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui clsx tailwind-merge
pnpm add -D tailwindcss
```

Implement against the stable Bits UI version installed by your project. Progress does not need `tw-animate-css`; its transition uses Tailwind's built-in `transition-all` utility.

### Component files

Copy the complete `src/lib/components/ui/progress` component folder:

- `progress-root.svelte`
- `index.ts`
- `README.md`

Progress requires no other xvelte component, icon, hook, attachment, context module, localization message, shared style file, font, image, or external network service.

### Shared utilities

Progress imports `cn` and `WithoutChildrenOrChild` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
```

### Icons

Progress does not use icons and requires no export from `src/lib/icons.ts` or icon package.

### Global styles

Load Tailwind CSS and expose the two semantic colors used by the component. The values below are xvelte's defaults and may be replaced with your own theme:

```css
@import "tailwindcss";

:root {
	--primary: oklch(0.841 0.238 128.85);
	--muted: oklch(0.97 0.001 106.424);
}

.dark {
	--primary: oklch(0.768 0.233 130.85);
	--muted: oklch(0.268 0.007 34.298);
}

@theme inline {
	--color-primary: var(--primary);
	--color-muted: var(--muted);
}
```

Define dark values only when your app supports a dark theme. No custom variant, keyframe, `tw-animate-css` import, icon style, font, radius variable, or component-specific CSS variable is required.

## Credits

Progress is adapted from the [shadcn-svelte Progress](https://www.shadcn-svelte.com/docs/components/progress). Its implementation has been modified to follow xvelte's local API, styling, type, and import conventions.

## File organization

| File                   | Responsibility                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `progress-root.svelte` | Public primitive wrapper, fixed indicator rendering, fill calculation, styling, and DOM hooks. |
| `index.ts`             | Public Root component and exported `RootProps` type.                                           |
| `README.md`            | Usage, examples, API, visual limitations, DOM contract, accessibility, and dependencies.       |

The component's `index.ts` and exported `RootProps` type are the source of truth for the public API.

# Slider

An accessible single-value or multi-value range input built on Bits UI. It renders the track, selected range, one thumb per value, horizontal or vertical layouts, discrete steps, and an optional local buffer indicator for media-style progress.

Use Slider when people benefit from adjusting a value spatially, such as volume, price, zoom, or a range. Use a numeric input when exact entry is more important, and use Progress when the value is display-only.

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

```svelte
<script lang="ts">
	import * as Slider from "$lib/components/ui/slider";
</script>
```

`index.ts` exports `Root` and `RootProps`.

## Anatomy

Root owns the complete visual composition:

```text
Root
├── Track
│   ├── Buffer (only when bufferValue is supplied)
│   └── Range
└── Thumb (one per value)
```

The local wrapper removes Bits UI's `children` and `child` snippets, so callers cannot replace these internal parts.

## Basic usage

```svelte
<script lang="ts">
	import * as Slider from "$lib/components/ui/slider";

	let volume = $state(40);
</script>

<label for="volume">Volume: {volume}%</label>
<Slider.Root id="volume" type="single" bind:value={volume} min={0} max={100} step={1} aria-label="Volume" />
```

`type="single"` uses a number. The label and `aria-label` describe the control because Slider does not render its own text.

## Examples

### Range with two thumbs

```svelte
<script lang="ts">
	import * as Slider from "$lib/components/ui/slider";

	let priceRange = $state([20, 80]);
</script>

<p id="price-range-label">Price range: €{priceRange[0]} to €{priceRange[1]}</p>
<Slider.Root type="multiple" bind:value={priceRange} min={0} max={100} step={5} aria-labelledby="price-range-label" />
```

Bits UI renders one thumb for every array entry and sorts values by default when thumbs cross.

### Buffered media value

```svelte
<script lang="ts">
	import * as Slider from "$lib/components/ui/slider";

	let position = $state(32);
	let buffered = $state(68);
</script>

<Slider.Root type="single" bind:value={position} bufferValue={buffered} min={0} max={100} aria-label="Playback position" />
```

`bufferValue` is visual only and does not constrain or change `value`. Values below `min` or above `max` are clamped to the track ends; when `min === max`, the indicator remains at 0%.

### Vertical slider

```svelte
<div class="h-52">
	<Slider.Root type="single" value={65} orientation="vertical" aria-label="Zoom" />
</div>
```

The vertical root uses the available parent height and has a local minimum height of 10rem.

### Commit expensive work

```svelte
<Slider.Root
	type="single"
	bind:value={quality}
	step={[25, 50, 75, 100]}
	onValueChange={(value) => previewQuality(value)}
	onValueCommit={(value) => saveQuality(value)}
	aria-label="Export quality"
/>
```

Use `onValueChange` for responsive previews and `onValueCommit` for persistence or other expensive work after the interaction ends.

## Public API

`RootProps` is based on the installed stable `bits-ui@2.18.1` `Slider.RootProps`, removes `children` and `child`, and adds `bufferValue`. The table covers every local option and important inherited behavior; see the complete [Bits UI Slider API](https://bits-ui.com/docs/components/slider#api-reference). The component's `index.ts`, exported type, and source are the source of truth.

| Prop               | Type                         | Default          | Behavior                                                                  |
| ------------------ | ---------------------------- | ---------------- | ------------------------------------------------------------------------- |
| `type`             | `"single" \| "multiple"`     | Required         | Selects a number value or number-array value.                             |
| `value`            | `number \| number[]`         | `min` for single | Bindable current value matching `type`.                                   |
| `bufferValue`      | `number`                     | —                | Local visual buffered value in the same scale as `min` and `max`.         |
| `min`              | `number`                     | `0`              | Minimum value. Also used as the buffer baseline.                          |
| `max`              | `number`                     | `100`            | Maximum value.                                                            |
| `step`             | `number \| number[]`         | `1`              | Increment or allowed discrete values.                                     |
| `orientation`      | `"horizontal" \| "vertical"` | `"horizontal"`   | Changes layout, range, buffer, and thumb interaction axis.                |
| `dir`              | `"ltr" \| "rtl"`             | `"ltr"`          | Controls value direction for horizontal and vertical layouts.             |
| `disabled`         | `boolean`                    | `false`          | Disables all thumbs and reduces local opacity.                            |
| `autoSort`         | `boolean`                    | `true`           | Sorts multi-value arrays when thumbs cross.                               |
| `thumbPositioning` | `"contain" \| "overflow"`    | `"contain"`      | Controls whether thumb centers remain inside the track bounds.            |
| `trackPadding`     | `number`                     | —                | Percentage padding for ticks and an SSR-friendly positioning alternative. |
| `onValueChange`    | `(value) => void`            | —                | Runs as interaction updates the value.                                    |
| `onValueCommit`    | `(value) => void`            | —                | Runs when pointer or keyboard interaction commits.                        |
| `ref`              | `HTMLSpanElement \| null`    | `null`           | Bindable root span.                                                       |

Native `<span>` attributes and ARIA attributes are forwarded to the Bits UI Root. Custom internal children are unsupported.

## Styling and DOM contract

| Element | Stable local hook           | Important styling                                                                 |
| ------- | --------------------------- | --------------------------------------------------------------------------------- |
| Root    | `data-slot="slider"`        | Flex layout, touch selection disabled, disabled opacity.                          |
| Track   | `data-slot="slider-track"`  | Rounded `muted` background; four pixels thick.                                    |
| Buffer  | `data-slot="slider-buffer"` | Optional absolute `primary/30` fill with inline percentage width or height.       |
| Range   | `data-slot="slider-range"`  | Absolute semantic `primary` fill.                                                 |
| Thumb   | `data-slot="slider-thumb"`  | 12-pixel white thumb, `ring` border, expanded hit area, hover/focus/active rings. |

Bits UI supplies `data-orientation`, `data-disabled`, values, ARIA range attributes, and interaction styles. Root `class` uses `cn()`. Internal parts do not expose separate class props; use stable slots if app-level CSS customization is necessary.

## Accessibility

Bits UI gives every thumb slider semantics, current/minimum/maximum values, pointer and keyboard behavior, focus management, orientation, and disabled state. Supply an accessible name with a visible `<label>`, `aria-label`, or `aria-labelledby`; multi-thumb sliders need context that makes each boundary understandable.

Arrow keys adjust by the configured step, while the underlying primitive supports standard slider keyboard controls such as Home, End, Page Up, and Page Down. Keep visible focus rings and adequate surrounding space for the enlarged thumb hit area. `bufferValue` is not announced; expose buffered progress separately if users need that information.

## Localization

Slider has no built-in copy and requires no localization messages. The app supplies and translates labels, formatted values, units, range boundary descriptions, and any buffered-status text.

## Dependencies

### Packages

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

No animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--muted: oklch(0.97 0.001 106.424);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--primary: oklch(0.768 0.233 130.85);
	--muted: oklch(0.268 0.007 34.298);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-muted: var(--muted);
	--color-ring: var(--ring);
}

@custom-variant data-disabled {
	&:where([data-disabled="true"]),
	&:where([data-disabled]:not([data-disabled="false"])) {
		@slot;
	}
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}

@custom-variant data-horizontal {
	&:where([data-orientation="horizontal"]) {
		@slot;
	}
}

@custom-variant data-vertical {
	&:where([data-orientation="vertical"]) {
		@slot;
	}
}
```

The semantic values may be replaced by the app's theme. The thumb currently uses Tailwind's fixed `white`; no custom keyframe, font, or layout rule is required.

### Shared utilities

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

### Component files and other integration

```text
slider/
├── index.ts
└── slider-root.svelte
```

Slider requires no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

## Credits

The component structure and styling are adapted from [shadcn-svelte Slider](https://www.shadcn-svelte.com/docs/components/slider).

## File organization

| File                 | Responsibility                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `slider-root.svelte` | Primitive state, local track/range/thumb composition, buffer calculation, orientation, and styling. |
| `index.ts`           | Public component and props type.                                                                    |
| `README.md`          | Usage, API, accessibility, styling, and installation guide.                                         |

The component's `index.ts` and `RootProps` are the source of truth for the public API.

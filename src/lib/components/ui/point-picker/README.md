# Point Picker

A two-dimensional input for selecting an `x` and `y` coordinate over arbitrary visual content. It supports independent bounds and steps, pointer dragging, keyboard control, controlled or initial values, optional grid and crosshair overlays, custom cursors, formatted value display, and separate change and commit callbacks.

Use Point Picker for map coordinates, audio parameters, image positions, color planes, spatial controls, or other genuinely two-dimensional values. Prefer Slider for one-dimensional values, and do not place interactive controls inside its visual background layer.

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

Import the component through its public `index.ts`:

```svelte
<script lang="ts">
	import * as PointPicker from "$lib/components/ui/point-picker";
</script>
```

The component exports:

- Component: `Root`.
- Props type: `RootProps`.
- Coordinate type: `Point`.

The indicator component and coordinate helpers remain internal.

---

## Anatomy

Point Picker has one public part. Place any visual layer inside Root and give Root an explicit height or aspect ratio:

```svelte
<PointPicker.Root class="h-64" label="Position">
	<div class="size-full">Visual background</div>
</PointPicker.Root>
```

Root places `children` below its grid, crosshair, cursor, and value indicators. The background wrapper has `pointer-events: none`, allowing Root to own dragging across the complete surface. Use it for visual content rather than nested buttons, links, or other controls.

---

## Basic usage

```svelte
<script lang="ts">
	import type { Point } from "$lib/components/ui/point-picker";

	import * as PointPicker from "$lib/components/ui/point-picker";

	let value = $state<Point>({ x: 50, y: 50 });
</script>

<div class="grid max-w-xl gap-2">
	<PointPicker.Root bind:value label="Map position" class="h-64 rounded-lg border bg-background" showGrid showCrosshair showValue>
		<div class="grid size-full place-items-center text-sm text-muted-foreground">Map or visual content</div>
	</PointPicker.Root>

	<p class="text-sm text-muted-foreground">Selected position: {value.x}, {value.y}</p>
</div>
```

The default range for both axes is `0` to `100`. Horizontal movement increases `x` from left to right; vertical movement increases `y` from bottom to top.

---

## Examples

### Map coordinates

Use independent geographic bounds and format the visible value with application-specific units:

```svelte
<script lang="ts">
	import type { Point } from "$lib/components/ui/point-picker";

	import * as PointPicker from "$lib/components/ui/point-picker";

	let coordinates = $state<Point>({ x: -8.54, y: 42.88 });
	let savedCoordinates = $state<Point | null>(null);
</script>

<PointPicker.Root
	bind:value={coordinates}
	minX={-180}
	maxX={180}
	minY={-90}
	maxY={90}
	stepX={0.01}
	stepY={0.01}
	label="Map coordinates"
	class="h-72 rounded-lg border bg-background"
	showCrosshair
	showValue
	formatValue={(point) => `${point.y.toFixed(2)}°, ${point.x.toFixed(2)}°`}
	onValueCommit={(point) => (savedCoordinates = point)}
>
	<div class="grid size-full place-items-center text-sm text-muted-foreground">Map rendering</div>
</PointPicker.Root>
```

Replace the placeholder with your map, image, canvas output, or other visual layer. Pointer interaction belongs to Point Picker; do not rely on interaction from the nested background.

### Audio parameters

The axes do not need to share a range or step:

```svelte
<script lang="ts">
	import type { Point } from "$lib/components/ui/point-picker";

	import * as PointPicker from "$lib/components/ui/point-picker";

	let mix = $state<Point>({ x: 0, y: -12 });
</script>

<PointPicker.Root
	bind:value={mix}
	minX={-1}
	maxX={1}
	stepX={0.01}
	minY={-60}
	maxY={6}
	stepY={0.5}
	label="Stereo pan and level"
	class="h-56 rounded-lg border bg-background"
	showGrid
	showValue
	formatValue={(point) => `Pan ${point.x.toFixed(2)}, level ${point.y.toFixed(1)} dB`}
/>
```

Use `onValueChange` for live audio or visual updates. Use `onValueCommit` for persistence, history entries, analytics, or other work that should happen once an interaction is committed.

### Initial value without a binding

`defaultValue` supplies the initial point when `value` is omitted:

```svelte
<PointPicker.Root
	defaultValue={{ x: 25, y: 75 }}
	label="Crop focal point"
	class="h-48 rounded-lg border bg-background"
	onValueCommit={(point) => saveFocalPoint(point)}
/>
```

The first pointer or keyboard update creates the component's current `value`. Use `bind:value` when application code must observe every change or assign a new point later.

### Custom cursor

The `cursor` snippet receives the current effective `Point`. Point Picker positions its wrapper; the snippet only defines the marker itself:

```svelte
<script lang="ts">
	import type { Point } from "$lib/components/ui/point-picker";

	import * as PointPicker from "$lib/components/ui/point-picker";
</script>

{#snippet cursor(point: Point)}
	<div class="grid size-8 place-items-center rounded-full border-2 border-primary bg-background text-xs font-medium text-primary">
		{point.x.toFixed(0)}
	</div>
{/snippet}

<PointPicker.Root {cursor} label="Custom marker position" class="h-56 rounded-lg border bg-background" showCrosshair />
```

The complete cursor wrapper is decorative and uses `aria-hidden="true"`. Expose meaningful values through labels, adjacent text, or the optional value indicator instead of cursor content alone.

### Disabled state

```svelte
<PointPicker.Root value={{ x: 40, y: 60 }} label="Saved position" class="h-40 rounded-lg border bg-background" showValue disabled />
```

Disabled Root is removed from the tab order, ignores pointer interaction, and exposes `aria-disabled="true"`.

---

## Public API

The component's `index.ts` and exported types are the source of truth.

### `PointPicker.Root`

`RootProps` extends native `div` attributes, omits the native `children` shape, and adds the two-dimensional input API.

| Prop            | Type                       | Default                           | Behavior                                                                                                   |
| --------------- | -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `value`         | `Point`                    | `undefined`                       | Bindable current point. When absent, Root reads `defaultValue` or the midpoint until the first update.     |
| `defaultValue`  | `Point`                    | Both axis midpoints               | Initial fallback used while `value` is undefined.                                                          |
| `minX`          | `number`                   | `0`                               | Inclusive horizontal minimum at the left edge.                                                             |
| `maxX`          | `number`                   | `100`                             | Inclusive horizontal maximum at the right edge.                                                            |
| `minY`          | `number`                   | `0`                               | Inclusive vertical minimum at the bottom edge.                                                             |
| `maxY`          | `number`                   | `100`                             | Inclusive vertical maximum at the top edge.                                                                |
| `stepX`         | `number`                   | `1`                               | Horizontal snapping interval measured from `minX`.                                                         |
| `stepY`         | `number`                   | `1`                               | Vertical snapping interval measured from `minY`.                                                           |
| `disabled`      | `boolean`                  | `false`                           | Disables pointer and keyboard interaction and removes Root from the tab order.                             |
| `label`         | `string`                   | Localized `"Point picker"`        | Accessible name placed on the application role.                                                            |
| `showGrid`      | `boolean`                  | `false`                           | Shows fixed horizontal and vertical grid lines at 20%, 40%, 60%, and 80%.                                  |
| `showCrosshair` | `boolean`                  | `false`                           | Shows full-width and full-height lines through the current point.                                          |
| `showCursor`    | `boolean`                  | `true`                            | Shows the built-in or custom cursor at the current point.                                                  |
| `showValue`     | `boolean`                  | `false`                           | Shows the formatted value in a polite live region.                                                         |
| `formatValue`   | `(value: Point) => string` | Integer `"x, y"`                  | Formats the value indicator. Use it for fractional steps, units, translated copy, or locale-aware numbers. |
| `onValueChange` | `(value: Point) => void`   | —                                 | Runs for every published pointer or keyboard update.                                                       |
| `onValueCommit` | `(value: Point) => void`   | —                                 | Runs on pointer release and after every handled keyboard command.                                          |
| `children`      | `Snippet`                  | —                                 | Renders arbitrary non-interactive visual content below the indicators.                                     |
| `cursor`        | `Snippet<[Point]>`         | Built-in three-layer circular dot | Replaces the cursor marker and receives the current effective point.                                       |
| `ref`           | `HTMLDivElement \| null`   | `null`                            | Bindable Root element reference.                                                                           |
| `class`         | `string`                   | —                                 | Merged after local positioning, interaction, focus, and disabled classes.                                  |

Root forwards remaining native `div` attributes and event handlers. It handles these native callbacks specially:

- `onpointerdown`, `onpointermove`, `onpointerup`, and `onpointercancel` run before the matching internal pointer behavior.
- `onkeydown` runs before internal keyboard behavior.
- Calling `preventDefault()` from `onpointerdown` or `onkeydown` cancels the corresponding internal update.
- Pointer release publishes one final value and then calls `onValueCommit`; pointer cancellation ends dragging without a commit.

The remaining attributes are spread last. Do not override `role`, `tabindex`, `data-slot`, `data-disabled`, `aria-label`, or `aria-disabled` unless you intentionally replace the component's documented semantics and styling hooks.

Supply `minX <= maxX`, `minY <= maxY`, and normally positive step values. Pointer and keyboard updates are quantized and clamped, but externally supplied `value` and `defaultValue` objects are displayed as provided; keep them inside the configured bounds.

### `Point`

```ts
type Point = {
	x: number;
	y: number;
};
```

`x` maps from left to right and `y` maps from bottom to top. Point Picker publishes a new object for each update instead of mutating the previous object.

### Pointer behavior

- Pointer down captures the pointer and immediately updates the point.
- Captured pointer movement continues updating even when the pointer leaves the visible surface.
- Pointer up performs a final update, releases capture, and commits the point.
- Coordinates are calculated from Root's current bounding rectangle, then snapped to the configured step and clamped to the configured bounds.

### Keyboard behavior

| Key          | Result                                    |
| ------------ | ----------------------------------------- |
| `ArrowRight` | Adds `stepX` to `x`.                      |
| `ArrowLeft`  | Subtracts `stepX` from `x`.               |
| `ArrowUp`    | Adds `stepY` to `y`.                      |
| `ArrowDown`  | Subtracts `stepY` from `y`.               |
| `PageUp`     | Adds ten `stepY` intervals to `y`.        |
| `PageDown`   | Subtracts ten `stepY` intervals from `y`. |
| `Home`       | Moves to `{ x: minX, y: maxY }`.          |
| `End`        | Moves to `{ x: maxX, y: minY }`.          |

Every handled key prevents the browser default, clamps the result, calls `onValueChange`, and then calls `onValueCommit`.

---

## Styling and DOM contract

Root has no intrinsic height because its visual content is absolutely positioned. Always supply a height, minimum height, or aspect-ratio class. It defaults to `width: 100%`, clips overflow, disables touch scrolling and text selection during interaction, and shows a semantic focus ring.

Stable xvelte hooks:

| Element                                 | Stable hook                                 | Notes                                                         |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| Root                                    | `data-slot="point-picker"`                  | Also has `data-disabled="true"` only while disabled.          |
| Background wrapper                      | `data-slot="point-picker-content"`          | Absolute, clipped, and `pointer-events: none`.                |
| Grid wrapper                            | `data-slot="point-picker-grid"`             | Decorative overlay below crosshair, cursor, and value.        |
| Each horizontal or vertical grid line   | `data-slot="point-picker-grid-line"`        | Positioned at one of the four fixed percentage intervals.     |
| Horizontal and vertical crosshair lines | `data-slot="point-picker-crosshair"`        | Positioned from the current axis percentages.                 |
| Cursor wrapper                          | `data-slot="point-picker-cursor"`           | Positions either the built-in marker or the `cursor` snippet. |
| Built-in cursor glow                    | `data-slot="point-picker-cursor-glow"`      | Present only when no custom cursor is supplied.               |
| Built-in cursor dot                     | `data-slot="point-picker-cursor-dot"`       | Present only when no custom cursor is supplied.               |
| Built-in cursor highlight               | `data-slot="point-picker-cursor-highlight"` | Present only when no custom cursor is supplied.               |
| Value indicator                         | `data-slot="point-picker-value"`            | Top-right, translucent, monospaced polite live region.        |

Root classes are merged with `cn()`. The `children` and `cursor` snippets own their internal styling. Grid, crosshair, cursor, and value positions are applied through inline percentage styles and are part of the component's behavior.

The component uses the semantic `background`, `primary`, `primary-foreground`, `muted-foreground`, `border`, and `ring` color tokens. It has no component-specific CSS variables, keyframes, stable class names, or external animation hooks.

---

## Accessibility

Root uses `role="application"` because the same focused surface handles two coordinate axes with a custom keyboard model.

- Supply a concise `label` describing the controlled value. The localized default is generic and may not explain a map, audio, or editing context adequately.
- Preserve Root's focus ring and keyboard handlers.
- Arrow keys move by one axis step; Page Up and Page Down move vertically by ten steps; Home and End select opposite corners.
- `showValue` exposes formatted changes through `aria-live="polite"`. For important values, also render persistent text outside Root so it remains discoverable without interaction.
- Grid, crosshair, cursor, and the cursor snippet are hidden from assistive technology. Do not put the only meaningful label or state inside the cursor.
- Background children remain in the accessibility tree even though pointer events are disabled. Give meaningful images appropriate alternative text and mark purely decorative content as hidden.
- Do not nest buttons, links, fields, or another keyboard interaction inside the background layer.
- Disabled Root uses `aria-disabled="true"`, `tabindex="-1"`, reduced opacity, and no pointer events.

Point Picker does not expose slider roles or `aria-valuenow` because it controls a two-dimensional point. Prefer two separate Sliders when each axis must be exposed and operated as an independent standard range input.

---

## Localization

Point Picker uses one Paraglide message from `messages/en.json`:

| Message ID          | English value  | Used by                                           |
| ------------------- | -------------- | ------------------------------------------------- |
| `olive_heron_point` | `Point picker` | Default accessible label when `label` is omitted. |

Pass `label` to provide context-specific accessible copy. The default numeric formatter is not locale-aware; use `formatValue` with `Intl.NumberFormat` and translated units or labels when the visible value must follow the active locale.

Background content, adjacent instructions, and external value summaries belong to your app and must use its localization system.

---

## Dependencies

### Packages

Point Picker expects Svelte 5 and Tailwind CSS 4. Install its runtime utilities first and development dependencies second:

```sh
# Bun
bun add clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss
```

Point Picker does not wrap an external interaction primitive and requires no additional runtime package.

### Component files

Copy the complete `src/lib/components/ui/point-picker` component folder:

- `point-picker-root.svelte`
- `point-picker-indicators.svelte`
- `point-picker-utils.ts`
- `index.ts`
- `README.md`

No other xvelte component, hook, attachment, context module, shared style file, font, image, or external network service is required.

### Shared utilities

Point Picker imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

### Icons

Point Picker does not use icons and requires no export from `src/lib/icons.ts` or icon package.

### Global styles

Load Tailwind CSS and expose the semantic tokens used by the component. The values below are xvelte's defaults and may be replaced with your own theme values:

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--color-ring: var(--ring);
}

@custom-variant data-disabled {
	&:where([data-disabled="true"]),
	&:where([data-disabled]:not([data-disabled="false"])) {
		@slot;
	}
}
```

Define the dark values only when your app supports a dark theme. Point Picker requires no global keyframe, `tw-animate-css` import, font, or component-specific CSS variable.

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the message listed in [Localization](#localization) to `messages/en.json`. Its exact key and value are already shown there and are not duplicated here.

---

## Credits

Point Picker is adapted from the [Svelte Audio UI XY Pad](https://svelte-audio-ui.vercel.app/docs/ui/xy-pad). The original audio-oriented component was substantially simplified and modified in xvelte to provide generic coordinate ranges, arbitrary visual content, optional indicators, a custom cursor, local accessibility behavior, and use cases such as maps and image positioning.

---

## File organization

| File                             | Responsibility                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `point-picker-root.svelte`       | Public bindings, pointer and keyboard interaction, coordinate mapping, callbacks, and Root DOM. |
| `point-picker-indicators.svelte` | Internal grid, crosshair, cursor, custom cursor, and formatted value overlays.                  |
| `point-picker-utils.ts`          | Public `Point` type plus internal clamping, quantization, event, and keyboard helpers.          |
| `index.ts`                       | Public Root component and exported `RootProps` and `Point` types.                               |
| `README.md`                      | Usage, API, DOM contract, accessibility, localization, dependencies, and credits.               |

The component's `index.ts` and exported types are the source of truth for the public API.

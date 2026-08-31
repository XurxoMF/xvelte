# Knob

An accessible rotary-style value control for choosing a number within a range. It supports vertical mouse and touch dragging without page scrolling, stepped mouse-wheel changes, arrow-key changes, Home and End navigation, double-click reset, configurable bounds and step size, a bindable value, custom sizing and color, and an optional visible label.

Use Knob for compact continuous controls such as gain, intensity, balance, or effect parameters when a rotary visual matches the interface. Prefer Slider when a linear range is easier to understand, and use a native number input when exact text entry is the primary task.

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

---

## Import

Import the component through its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Knob from "$lib/components/ui/knob";
</script>
```

Knob's `index.ts` exports `Root` and the `RootProps` type.

---

## Anatomy

Knob is a single public component:

```svelte
<Knob.Root label="Volume" />
```

It renders an outer layout `div`, an optional visible label, an inner focusable element with `role="slider"`, an SVG progress arc, a rotating indicator, and a visible numeric value. The SVG and indicator are internal implementation details rather than public component parts.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Knob from "$lib/components/ui/knob";

	let volume = $state(40);
</script>

<Knob.Root label="Volume" bind:value={volume} />

<p>Current volume: {volume}%</p>
```

Drag upward to increase the value and downward to decrease it. Touch dragging stays dedicated to the control instead of scrolling the page. With a pointer over the knob, scroll upward to increase by one `step` and downward to decrease by one `step`; handled vertical wheel events do not scroll the page. The same control works with the keyboard when focused.

---

## Examples

### Custom range and step

```svelte
<script lang="ts">
	import * as Knob from "$lib/components/ui/knob";

	let gain = $state(0);
</script>

<Knob.Root label="Gain" min={-12} max={12} step={0.5} bind:value={gain} />

<output>{gain} dB</output>
```

Use finite bounds with `min < max` and a positive finite `step`. Step snapping is calculated relative to zero, so choose bounds and step sizes that align with zero when exact increments matter.

### Reset on double click

```svelte
<script lang="ts">
	import * as Knob from "$lib/components/ui/knob";

	let pan = $state(0);
</script>

<Knob.Root label="Pan" min={-50} max={50} step={1} defaultValue={0} bind:value={pan} />

<p>Double-click the knob to return to the center position.</p>
```

`defaultValue` is only the double-click reset target. It does not initialize `value`; bind or pass `value` separately. When `defaultValue` is omitted, double-click resets to `min`.

### Custom size and color

```svelte
<Knob.Root label="Mix" value={65} size={84} color="var(--accent)" />
```

`size` controls the control's width and height in pixels. `color` accepts any valid CSS color and paints both the active arc and the indicator. Ensure custom colors retain enough contrast against the surrounding theme.

### React to user changes

```svelte
<script lang="ts">
	import * as Knob from "$lib/components/ui/knob";

	let frequency = $state(440);
	let lastUserValue = $state(440);
</script>

<Knob.Root label="Frequency" min={20} max={2000} step={10} bind:value={frequency} onValueChange={(next) => (lastUserValue = next)} />

<p>Last interaction: {lastUserValue} Hz</p>
```

`onValueChange` runs for the component's drag, wheel, keyboard, and double-click updates. Assigning a new bound `value` from application code does not call it.

### Disabled

```svelte
<Knob.Root label="Feedback" value={25} disabled />
```

A disabled Knob is removed from the tab order, ignores dragging, wheel, keyboard input, and double clicks, exposes `aria-disabled="true"`, and uses reduced-opacity styling. Wheel events over a disabled Knob remain available for normal page scrolling.

---

## Public API

The component's `index.ts`, exported `RootProps`, and local source are the source of truth.

### `Knob.Root`

Type: `RootProps`, based on native `div` attributes.

| Prop            | Type                      | Default            | xvelte behavior                                                                                           |
| --------------- | ------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `value`         | `number`                  | `0`                | Bindable current value. Internal interactions snap and clamp it before assignment.                        |
| `defaultValue`  | `number`                  | `undefined`        | Double-click reset target. Falls back to `min`; does not initialize `value`.                              |
| `min`           | `number`                  | `0`                | Minimum keyboard, wheel, drag, reset, and visual value.                                                   |
| `max`           | `number`                  | `100`              | Maximum keyboard, wheel, drag, reset, and visual value.                                                   |
| `step`          | `number`                  | `1`                | Increment used by arrow keys, wheel input, and zero-relative snapping.                                    |
| `label`         | `string`                  | `undefined`        | Visible uppercase label and accessible name for the slider.                                               |
| `size`          | `number`                  | `60`               | Slider diameter in CSS pixels and drag-sensitivity input.                                                 |
| `color`         | `string`                  | `"var(--primary)"` | CSS color for the active arc and rotating indicator.                                                      |
| `disabled`      | `boolean`                 | `false`            | Removes keyboard focus and blocks every value-changing interaction without blocking page-wheel scrolling. |
| `onValueChange` | `(value: number) => void` | `undefined`        | Runs after an internal interaction updates `value`.                                                       |
| `ref`           | `HTMLDivElement \| null`  | `null`             | Bindable reference to the outer layout element, not the slider element.                                   |
| `class`         | `string`                  | `undefined`        | Merged after the outer layout and disabled-state classes.                                                 |

Remaining native `div` attributes are forwarded to the outer wrapper. They are not forwarded to the inner element with `role="slider"`; in particular, attributes such as `aria-describedby` on Root describe the wrapper rather than the slider.

### Value normalization and limitations

Internal updates use this order:

1. Snap the candidate with `Math.round(next / step) * step`.
2. Clamp the result between `min` and `max`.
3. Assign `value` and call `onValueChange`.

Provide finite values with `min < max`, `step > 0`, and `size > 0`. The component does not validate invalid range configurations, and a zero step can produce `NaN`.

Externally assigned values are not rewritten. The arc and rotation clamp their visual calculation, but the visible number and `aria-valuenow` use the supplied `value` directly. Keep bound values within the configured range to avoid a mismatch between the visual position and announced value.

Dragging changes half of the complete range for each vertical distance equal to `size`. A full-range change therefore takes approximately twice the configured size in vertical pixels. The callback may run repeatedly with the same snapped value during a drag.

Each enabled vertical wheel event changes exactly one `step`, regardless of its `deltaY` magnitude or `deltaMode`: a negative delta increases and a positive delta decreases. The component prevents the handled event's default behavior even at `min` or `max`, so the page does not begin scrolling while the pointer remains over an enabled Knob. Purely horizontal wheel events and every wheel event over a disabled Knob remain native browser behavior.

---

## Styling and DOM contract

The outer wrapper has the stable `data-slot="knob"`. Internal markup currently contains:

- An optional visible label.
- A focusable `div` with `role="slider"`.
- A decorative SVG with background and progress circles.
- A secondary-colored circular body and rotating colored indicator.
- A visible numeric value.

Only `data-slot="knob"` is a stable xvelte styling hook. The internal elements do not expose public slots, classes, CSS variables, or part names and may change. Root's `class` is merged only onto the outer wrapper.

The component uses semantic `primary`, `secondary`, `muted`, `muted-foreground`, `foreground`, and `border` theme colors. Its active color is an inline style controlled by `color`; its geometry and rotation are also inline styles derived from `size` and `value`.

Disabled state adds reduced opacity and slight grayscale. The slider cursor is a vertical-resize cursor when enabled and `not-allowed` when disabled. The enabled interactive element applies `touch-action: none` through `touch-none`, preventing native panning and zoom gestures that begin on the knob while preserving page gestures elsewhere. Disabled state switches to `touch-action: auto`.

The enabled slider receives the standard three-pixel, 50%-opacity semantic `ring` treatment from the required global `*:focus-visible` rule.

---

## Accessibility

The inner interactive element uses `role="slider"`, exposes `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-disabled`, and is keyboard-focusable unless disabled.

Keyboard behavior:

| Key                        | Result                  |
| -------------------------- | ----------------------- |
| `ArrowUp` or `ArrowRight`  | Increase by one `step`. |
| `ArrowDown` or `ArrowLeft` | Decrease by one `step`. |
| `Home`                     | Move to `min`.          |
| `End`                      | Move to `max`.          |

Pointer and touch behavior:

- Mouse and touch dragging use vertical distance to adjust the value.
- Touch gestures beginning on the knob are reserved for adjustment and do not pan or zoom the page.
- Vertical wheel gestures over an enabled knob adjust one step and do not scroll the page.
- Horizontal wheel gestures and wheel gestures over a disabled knob remain available to the browser.

Consumer responsibilities:

- Always pass a concise, translated `label` that identifies the controlled setting. Without it, the localized generic name “Knob” is used, which is rarely descriptive enough on its own.
- Display units or context near the component when the raw number is ambiguous. The current API does not expose `aria-valuetext`, so prefer visible accompanying text for units and non-numeric meanings.
- Preserve keyboard focus visibility and do not rely on dragging as the only instruction.
- Double click is an optional pointer convenience; ensure the same reset can be understood or performed another way when reset is important.
- The displayed value is not a native form control and is not submitted with a form. Mirror the bound value into application form state or a named input when needed.

---

## Localization

Knob uses one Paraglide message:

| Message ID       | English value | Purpose                                                   |
| ---------------- | ------------- | --------------------------------------------------------- |
| `navy_lynx_knob` | `Knob`        | Fallback accessible name when `label` is absent or empty. |

The public `label` prop overrides that fallback and also renders visible text above the control. Translate the label in application code because it should describe the specific setting, such as “Volume” or “Gain”. Your app also owns translated units, instructions, reset guidance, validation, and surrounding output text.

Numbers are rendered with JavaScript's default string conversion; the component does not apply locale-aware number formatting. Numeric values, CSS colors, `data-slot`, and ARIA attribute names are technical values and are not translated.

---

## Dependencies

Knob expects a Svelte 5 project using Tailwind CSS 4 and generated Paraglide messages. Install the runtime packages first and development packages second in each package-manager group:

```sh
# bun
bun add clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/knob` component folder:

- `knob-root.svelte`
- `index.ts`
- `README.md`

No other xvelte UI component, hook, attachment, context file, icon, image, or shared component stylesheet is required.

### Shared utilities

Root imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

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

The package installation block includes `clsx` and `tailwind-merge`.

### Localization setup

Add the `navy_lynx_knob` message listed completely in [Localization](#localization) to every locale, then compile Paraglide into `src/lib/paraglide`. The component imports the generated function from `$lib/paraglide/messages.js`; do not copy or edit generated output manually.

If the app uses another localization system, replace that import and fallback call while preserving a localized accessible name. No other message or localization helper is required.

### Global CSS

The global stylesheet must load Tailwind and expose the semantic colors used by Knob. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--secondary: oklch(0.967 0.001 286.375);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--secondary: oklch(0.274 0.006 286.033);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-secondary: var(--secondary);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--color-ring: var(--ring);
}

@layer base {
	* {
		@apply border-border;
	}

	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

The app owns dark-mode activation. Knob requires no `tw-animate-css` import, keyframe, component-specific global CSS variable, `src/lib/icons.ts` export, font, network service, or additional layout rule. The component uses browser mouse, touch, and window event APIs directly and needs no additional package for them.

---

## Credits

Knob is adapted from [more-shadcn-svelte's Knob component](https://more-shadcn.noair.fun/docs/components/knob). The local xvelte API, localization, interaction behavior, styling, and limitations documented here are the source of truth.

---

## File organization

| File               | Responsibility                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `knob-root.svelte` | Range state, drag, touch, wheel, and keyboard interaction, accessibility, SVG rendering, and styling. |
| `index.ts`         | Public component and `RootProps` export.                                                              |
| `README.md`        | Installation, API, behavior, accessibility, localization, and usage guide.                            |

The component's `index.ts` and exported `RootProps` are the source of truth for the public API.

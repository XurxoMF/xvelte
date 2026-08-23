# Color Picker

An integrated color editor with a saturation-and-brightness field, hue control, optional opacity, live preview, editable color text, and HEX, RGB, HSL, and OKLCH output. It keeps one bindable CSS color string synchronized with its internal HSVA color state.

Use Color Picker when an app needs a visible, compact color editor. Do not use it when a native browser picker is sufficient, when a form requires built-in `name`, validation, disabled, or read-only behavior, or when complete keyboard access is required without first extending the local implementation.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as ColorPicker from "$lib/components/ui/color-picker";
</script>
```

Color Picker's `index.ts` exports `Root` together with the `RootProps` and `ColorFormat` types. It does not export the internal conversion or parsing helpers.

---

## Anatomy

Color Picker is a single component rather than a set of composable parts:

```svelte
<ColorPicker.Root />
```

`Root` renders, in order:

1. A two-dimensional saturation-and-brightness field.
2. A color preview beside a hue track and, when enabled, an opacity track.
3. A Button Group containing the format selector, editable color value, and optional opacity percentage.

The format selector opens a Popover containing a Command list when more than one entry is passed to `formats`. These controls are internal implementation details; their state and individual props are not exposed by Color Picker.

---

## Basic usage

```svelte
<script lang="ts">
	import * as ColorPicker from "$lib/components/ui/color-picker";

	let color = $state("#7C3AED");
</script>

<div class="space-y-3">
	<ColorPicker.Root bind:value={color} />
	<p>Selected color: {color}</p>
</div>
```

Dragging a visual control, typing a supported value, or choosing another output format updates `color`. Changes made to `color` by the parent are parsed back into the picker while no drag is active.

---

## Examples

### Opacity

Enable the alpha track and percentage field with `allowOpacity`:

```svelte
<script lang="ts">
	import * as ColorPicker from "$lib/components/ui/color-picker";

	let color = $state("#7C3AED80");
</script>

<ColorPicker.Root bind:value={color} allowOpacity />
```

Alpha is included in the output only when `allowOpacity` is true and the current alpha is below `1`. Fully opaque colors therefore serialize without alpha: `#RRGGBB`, `rgb(...)`, `hsl(...)`, or `oklch(...)`.

### Start with another color syntax

Supply a value in a supported syntax. The picker recognizes its prefix and keeps using that syntax:

```svelte
<script lang="ts">
	import * as ColorPicker from "$lib/components/ui/color-picker";

	let color = $state("oklch(62% 0.2 265)");
</script>

<ColorPicker.Root bind:value={color} />
```

The accepted input is intentionally narrower than the complete CSS Color specification. Prefer the forms emitted by this component: `#RGB`, `#RRGGBB`, `#RRGGBBAA`, numeric `rgb()`/`rgba()`, `hsl()`/`hsla()`, and `oklch()` values. Do not use Color Picker as a general CSS color validator.

### Submit the value with a form

`Root` is not a native form control and has no `name` prop. Mirror its value into a hidden input when it must be submitted:

```svelte
<script lang="ts">
	import * as ColorPicker from "$lib/components/ui/color-picker";

	let brandColor = $state("#2563EB");
</script>

<form method="POST">
	<ColorPicker.Root bind:value={brandColor} />
	<input type="hidden" name="brandColor" value={brandColor} />
	<button type="submit">Save color</button>
</form>
```

Perform required-field and accepted-format validation in the form because Color Picker does not expose native validity state.

### Responsive width

The default width is `21.875rem` (`w-87.5`). Override it through `class` when the picker must fit its container:

```svelte
<ColorPicker.Root bind:value={color} class="w-full max-w-md" />
```

### Current `formats` limitation

The current `formats` prop only decides whether the selector is interactive: arrays with more than one entry show the menu, while arrays with zero or one entry show a static format button. The menu still contains all four formats, and a one-entry array does not select that entry.

Do not use `formats` as a format allowlist. To force one format today, initialize `value` in that syntax and remove or adapt the format selector in `color-picker-root.svelte`.

---

## Public API

### `ColorPicker.Root`

Type: `RootProps`.

| Prop            | Type            | Default                          | xvelte behavior                                                                                                                                     |
| --------------- | --------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string`        | `"#000000"`                      | Bindable color string. Parent changes are parsed into HSVA; picker interactions serialize HSVA back into this value.                                |
| `allowOpacity`  | `boolean`       | `false`                          | Adds the alpha track and percentage field. Serialized output includes alpha only when the current opacity is below 100%.                            |
| `defaultFormat` | `ColorFormat`   | `"hex"`                          | Initializes the internal output format. A non-equivalent external `value` subsequently selects its own format from its prefix.                      |
| `formats`       | `ColorFormat[]` | `["hex", "rgb", "hsl", "oklch"]` | Controls whether the format selector opens, based only on `length > 1`. It does not currently filter the hard-coded menu or select its first entry. |
| `class`         | `string`        | `undefined`                      | Merged after the root layout, width, border, surface, radius, padding, gap, and shadow classes with `cn`.                                           |

`Root` does not accept children, a render snippet, `ref`, native `div` attributes, input attributes, event callbacks, form props, disabled/read-only state, or bindings for the active format or format-menu state. Its `class` is the only forwarded presentation prop.

### `ColorFormat`

```ts
type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";
```

The selected format controls serialization:

| Format  | Opaque output example      | Output with opacity example      |
| ------- | -------------------------- | -------------------------------- |
| `hex`   | `#7C3AED`                  | `#7C3AED80`                      |
| `rgb`   | `rgb(124, 58, 237)`        | `rgba(124, 58, 237, 0.5)`        |
| `hsl`   | `hsl(262, 83%, 58%)`       | `hsla(262, 83%, 58%, 0.5)`       |
| `oklch` | `oklch(56.4% 0.230 291.1)` | `oklch(56.4% 0.230 291.1 / 0.5)` |

HEX output is uppercase. RGB channels and HSL percentages are rounded to integers; alpha is rounded to at most two decimal places; OKLCH lightness, chroma, and hue use fixed local precision. Format conversion can therefore normalize or slightly round the supplied string.

The parser ignores an unsupported non-`#` value rather than changing the current color. Its hexadecimal branch is permissive for unsupported lengths and invalid digits, so validate untrusted strings before assigning them. The component's `index.ts`, exported types, and local source are the source of truth for the public API.

---

## Styling and DOM contract

Color Picker uses Tailwind utilities, semantic theme tokens, inline color gradients, and a small embedded checkerboard image. It exposes no component-specific CSS variables.

| Element | Stable xvelte hook         | Styling and behavior                                                                                                             |
| ------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Root    | `data-slot="color-picker"` | `div` with column layout, `w-87.5`, `rounded-lg`, `border`, `bg-popover`, padding, gap, and `shadow-sm`; `class` is merged last. |

Internal saturation, hue, alpha, preview, and handle elements do not have stable `data-slot` hooks. Targeting their current element order or utility classes couples an app to implementation details; prefer styling the root or changing the local component when deeper customization is required.

The white/black saturation overlays and rainbow hue gradient are functional color controls, not theme colors. The preview and alpha track use an embedded checkerboard PNG so transparency remains visible without an external asset. Descendant Button, Button Group, Input, Popover, and Command components retain their own documented `data-slot` and dependency-owned state attributes.

The three keyboard-focusable color controls receive their three-pixel, 50%-opacity semantic `ring` treatment from the required global `*:focus-visible` rule.

The internal Popover uses Bits UI positioning variables and open/closed state attributes through the local Popover wrapper. See the [Bits UI Popover documentation](https://www.bits-ui.com/docs/components/popover) for those dependency-owned behaviors and the [Bits UI Command documentation](https://www.bits-ui.com/docs/components/command) for the format list's selection and keyboard behavior.

---

## Accessibility

The format trigger is a button with a visible format acronym. Its Popover and Command list provide focus management, Escape handling, and keyboard item navigation through Bits UI.

The local color controls currently have important accessibility limitations:

- The saturation-and-brightness field, hue track, and alpha track are focusable `div` elements with `role="slider"`, but none implements keyboard value changes.
- Only the saturation-and-brightness field has an accessible name. Hue and alpha have no `aria-label`, and the component exposes no prop for adding one.
- The two-dimensional field exposes saturation as `aria-valuenow` but does not expose brightness. The sliders also omit explicit minimum, maximum, and formatted value text.
- The editable color and opacity inputs have no associated labels or accessible-name props.
- There is no disabled or read-only mode.

Mouse dragging and touch dragging are supported, and `touch-none` prevents native touch gestures over the tracks. For a production interface that must be fully keyboard and screen-reader accessible, adapt the component to add keyboard handlers and complete slider metadata, or replace the visual tracks with appropriately labeled native range controls. These gaps cannot be fixed through the current public props alone.

Place visible instructions near the picker when its format or accepted syntax may be unfamiliar, validate the submitted string independently, and do not rely on the color swatch alone to communicate the selected value.

---

## Localization

Color Picker uses one Paraglide message for built-in human-readable copy. Keep this entry in `messages/en.json` and translate it in every supported locale:

| Message ID          | English value               | Used by                                             |
| ------------------- | --------------------------- | --------------------------------------------------- |
| `pearl_bison_color` | `Saturation and Brightness` | Accessible name of the two-dimensional color field. |

The technical acronyms `HEX`, `RGB`, `HSL`, and `OKLCH` are not localized. The component has no public copy override. Apps supply and translate surrounding labels, help text, validation errors, and form actions.

---

## Dependencies

Color Picker expects a Svelte 5 project using Tailwind CSS 4 and xvelte's Paraglide setup. Install all runtime and development packages in one of these command groups:

```sh
# bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss tw-animate-css

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss tw-animate-css
```

### Required UI components

Copy these complete xvelte component folders and follow each component's README to install it and understand its API:

- `src/lib/components/ui/button`: `button-root.svelte`, `index.ts`
- `src/lib/components/ui/button-group`: `button-group-root.svelte`, `button-group-separator.svelte`, `button-group-text.svelte`, `index.ts`
- `src/lib/components/ui/command`: `command-root.svelte`, `command-dialog.svelte`, `command-empty.svelte`, `command-group.svelte`, `command-input.svelte`, `command-item.svelte`, `command-link-item.svelte`, `command-list.svelte`, `command-loading.svelte`, `command-separator.svelte`, `command-shortcut.svelte`, `index.ts`
- `src/lib/components/ui/input`: `input-root.svelte`, `index.ts`
- `src/lib/components/ui/popover`: `popover-root.svelte`, `popover-close.svelte`, `popover-content.svelte`, `popover-description.svelte`, `popover-header.svelte`, `popover-portal.svelte`, `popover-title.svelte`, `popover-trigger.svelte`, `index.ts`

The complete public component folders above also import these components through their own `index.ts` files, so copy them as well and follow their README guides:

- `src/lib/components/ui/dialog`: `dialog-root.svelte`, `dialog-close.svelte`, `dialog-content.svelte`, `dialog-description.svelte`, `dialog-footer.svelte`, `dialog-header.svelte`, `dialog-overlay.svelte`, `dialog-portal.svelte`, `dialog-title.svelte`, `dialog-trigger.svelte`, `index.ts`
- `src/lib/components/ui/input-group`: `input-group-root.svelte`, `input-group-addon.svelte`, `input-group-button.svelte`, `input-group-input.svelte`, `input-group-text.svelte`, `input-group-textarea.svelte`, `index.ts`
- `src/lib/components/ui/separator`: `separator-root.svelte`, `index.ts`
- `src/lib/components/ui/textarea`: `textarea-root.svelte`, `index.ts`

Color Picker requires no xvelte hook, attachment, context module, shared component stylesheet, or external image asset.

### Shared utilities

Color Picker and its required UI components import `cn`, `WithoutChild`, `WithoutChildren`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block includes `clsx` and `tailwind-merge`, which `cn` imports.

### Icons

Color Picker and the complete Command and Dialog component folders import these semantic names from `$lib/icons`. Add the exact exports to `src/lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as ChevronDownIcon } from "@tabler/icons-svelte/icons/chevron-down";
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
export { default as SearchIcon } from "@tabler/icons-svelte/icons/search";
```

Keep the semantic aliases in the shared icon facade instead of importing Tabler directly from component files.

### Localization setup

Keep the `pearl_bison_color` entry documented in [Localization](#localization) in every locale and compile the Paraglide output to `src/lib/paraglide`. The component imports generated messages from `$lib/paraglide/messages.js`; no localization file is stored inside the component folder. The required Command and Dialog folders contain additional messages documented in their own README guides.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, define the dark and Bits UI state variants, set the shared border/outline defaults, and expose the semantic colors and radii used by Color Picker and its required components. The values below are xvelte's defaults; apps may replace the values while preserving the variable names and mappings:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--accent: oklch(0.841 0.238 128.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--accent: oklch(0.768 0.233 130.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
}

@custom-variant data-open {
	&:where([data-state="open"]),
	&:where([data-open]:not([data-open="false"])) {
		@slot;
	}
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}

@custom-variant data-closed {
	&:where([data-state="closed"]),
	&:where([data-closed]:not([data-closed="false"])) {
		@slot;
	}
}

@custom-variant data-selected {
	&:where([data-selected]) {
		@slot;
	}
}
```

`tw-animate-css` supplies the Popover and Dialog animation utilities; no component-specific keyframe must be copied. The app remains responsible for applying its `.dark` class when dark mode is supported.

---

## Credits

Color Picker is adapted from [more-shadcn-svelte's Color Picker](https://more-shadcn.noair.fun/docs/components/color-picker). Local xvelte behavior, API, dependencies, styling, parsing, and limitations are documented here.

---

## File organization

| File                       | Responsibility                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `color-picker-root.svelte` | Public component, HSVA state, parsing and conversion helpers, drag interactions, format selector, and rendering. |
| `index.ts`                 | Public entry point exporting `Root`, `RootProps`, and `ColorFormat`.                                             |
| `README.md`                | Installation, usage, public API, behavior, accessibility, dependencies, and provenance guide.                    |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

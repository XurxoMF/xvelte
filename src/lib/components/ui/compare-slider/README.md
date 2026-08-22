# Compare Slider

An interactive before-and-after viewer that reveals one visual over another with a draggable divider. It supports horizontal and vertical comparisons, a bindable percentage, pointer and keyboard interaction, and a replaceable handle icon.

Use Compare Slider to compare two aligned images, designs, maps, or visual states. Do not use it for unrelated content, precise numeric input, or interactive descendants such as buttons and links; use the dedicated Slider component when the numeric value itself is the primary information.

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

Import all parts from the component's public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as CompareSlider from "$lib/components/ui/compare-slider";
</script>
```

Compare Slider's `index.ts` exports `Root`, `Item`, and `Handle`, together with the `RootProps`, `ItemProps`, `HandleProps`, and `Orientation` types.

---

## Anatomy

Place two Items and one Handle beneath Root, in that order:

```svelte
<CompareSlider.Root>
	<CompareSlider.Item target="first">First visual</CompareSlider.Item>
	<CompareSlider.Item target="second">Second visual</CompareSlider.Item>
	<CompareSlider.Handle />
</CompareSlider.Root>
```

The first Item is the full-size base. The second Item is clipped at the current position and must follow the first in the DOM so it paints above it. At `value={0}` none of the second visual is revealed; at `value={100}` it is fully revealed. Handle draws the divider above both items and follows the same shared position.

Root has no built-in dimensions. Give it a width and height or an aspect ratio, and make both visuals fill the available area. Item and Handle read the nearest Compare Slider context and must remain below Root.

---

## Basic usage

```svelte
<script lang="ts">
	import * as CompareSlider from "$lib/components/ui/compare-slider";
</script>

<CompareSlider.Root class="aspect-video w-full max-w-2xl rounded-lg">
	<CompareSlider.Item target="first">
		<img src="/images/street-before.webp" alt="Street before landscaping" class="h-full w-full object-cover" draggable={false} />
	</CompareSlider.Item>

	<CompareSlider.Item target="second">
		<img src="/images/street-after.webp" alt="Street after landscaping" class="h-full w-full object-cover" draggable={false} />
	</CompareSlider.Item>

	<CompareSlider.Handle />
</CompareSlider.Root>
```

The visuals must use the same dimensions, crop, and subject alignment for the comparison to be meaningful. `draggable={false}` prevents native image dragging from competing with the slider's pointer capture.

---

## Examples

### Bind the reveal percentage

```svelte
<script lang="ts">
	import * as CompareSlider from "$lib/components/ui/compare-slider";

	let reveal = $state(35);
</script>

<CompareSlider.Root bind:value={reveal} class="aspect-video w-full max-w-2xl">
	<CompareSlider.Item target="first">
		<img src="/images/original.webp" alt="Original photograph" class="h-full w-full object-cover" draggable={false} />
	</CompareSlider.Item>

	<CompareSlider.Item target="second">
		<img src="/images/edited.webp" alt="Edited photograph" class="h-full w-full object-cover" draggable={false} />
	</CompareSlider.Item>

	<CompareSlider.Handle />
</CompareSlider.Root>

<p>{Math.round(reveal)}% of the edited photograph revealed</p>
```

Pointer and keyboard interactions keep the binding synchronized. Initialize and assign only finite values from `0` through `100`; external assignments are not clamped by Root.

### Vertical comparison

```svelte
<CompareSlider.Root orientation="vertical" class="h-96 w-72 rounded-lg">
	<CompareSlider.Item target="first">
		<img src="/images/day.webp" alt="Landscape during the day" class="h-full w-full object-cover" draggable={false} />
	</CompareSlider.Item>

	<CompareSlider.Item target="second">
		<img src="/images/night.webp" alt="Landscape at night" class="h-full w-full object-cover" draggable={false} />
	</CompareSlider.Item>

	<CompareSlider.Handle />
</CompareSlider.Root>
```

Vertical mode measures from the top: `0` hides the second Item and `100` reveals it to the bottom. It also changes the resize cursor, divider axis, offset, and default handle icon.

The current Root does not set `aria-orientation="vertical"`; see [Accessibility](#accessibility) before using this mode in production.

### Custom handle content

Replace only the icon inside the existing handle thumb:

```svelte
<CompareSlider.Handle>
	<span aria-hidden="true" class="text-xs font-bold">↔</span>
</CompareSlider.Handle>
```

The divider line, accent surface, border, shadow, size, and pointer pass-through remain in place. The custom content is visual only because Handle has `pointer-events-none` and Root owns all interaction.

### Add visible before and after labels

Labels belong inside each Item so they remain on the corresponding visual:

```svelte
<CompareSlider.Item target="first">
	<img src="/images/raw.webp" alt="Unprocessed landscape" class="h-full w-full object-cover" draggable={false} />
	<span class="absolute right-3 bottom-3 rounded bg-black/60 px-2 py-1 text-xs text-white">Before</span>
</CompareSlider.Item>

<CompareSlider.Item target="second">
	<img src="/images/graded.webp" alt="Color-graded landscape" class="h-full w-full object-cover" draggable={false} />
	<span class="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">After</span>
</CompareSlider.Item>
```

Translate these labels in the app. Keep Item descendants non-interactive: pointer presses anywhere inside Root start repositioning and dragging the comparison.

---

## Public API

### `CompareSlider.Root`

Type: `RootProps`.

| Prop          | Type                         | Default        | xvelte behavior                                                                                                  |
| ------------- | ---------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `value`       | `number`                     | `50`           | Bindable reveal percentage. Pointer and keyboard changes are clamped to `0`–`100`; external assignments are not. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Selects the measured axis, cursor, clipping direction, divider axis, and default handle icon.                    |
| `children`    | `Snippet`                    | required       | Renders the two Items, Handle, and any passive overlay content.                                                  |
| `class`       | `string`                     | `undefined`    | Merged after positioning, clipping, touch, text-selection, group, and orientation-specific cursor styles.        |

Root renders a focusable `div` with `role="slider"`, `aria-valuemin="0"`, `aria-valuemax="100"`, and reactive `aria-valuenow`. It does not forward native `div` or ARIA attributes, expose its DOM ref, emit a change callback, provide disabled/read-only state, validate finite numbers, or set dimensions.

Pointer behavior:

- Only the primary mouse button starts a mouse drag; touch and pen pointer types are accepted.
- Pressing anywhere within Root immediately updates `value` and captures that pointer.
- Captured movement updates the position along the configured axis and clamps it to the Root bounds.
- Pointer release ends dragging and releases capture.
- The current implementation does not handle `pointercancel` or `lostpointercapture` explicitly.

Keyboard behavior:

| Key                         | Result                      |
| --------------------------- | --------------------------- |
| `ArrowLeft` or `ArrowUp`    | Decreases by 1.             |
| `ArrowRight` or `ArrowDown` | Increases by 1.             |
| Shift + any arrow           | Changes by 10 instead of 1. |
| `Home`                      | Sets `0`.                   |
| `End`                       | Sets `100`.                 |

All four arrow keys work in both orientations. In particular, vertical mode currently makes Arrow Up decrease and Arrow Down increase.

### `CompareSlider.Item`

Type: `ItemProps`.

| Prop       | Type                  | Default     | xvelte behavior                                                                                          |
| ---------- | --------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `target`   | `"first" \| "second"` | `"first"`   | First remains fully visible; second is clipped from its inline or block end using the shared percentage. |
| `children` | `Snippet`             | required    | Renders the visual and any passive labels or overlays.                                                   |
| `class`    | `string`              | `undefined` | Merged after absolute full-size positioning and text-selection prevention.                               |

Item renders a `div` and does not forward native attributes or expose a ref. Both targets use the same `data-slot`; target is not written as a public data attribute. Render exactly one first and one second Item for the intended two-layer comparison. Additional or reordered Items share the same stacking context and can cover each other.

### `CompareSlider.Handle`

Type: `HandleProps`.

| Prop       | Type      | Default          | xvelte behavior                                                                                                           |
| ---------- | --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `children` | `Snippet` | orientation icon | Replaces the icon inside the existing thumb.                                                                              |
| `class`    | `string`  | `undefined`      | Merged on the outer full-length divider container after absolute position, z-index, pointer pass-through, and foreground. |

Handle renders nested `div` elements and does not forward native attributes or expose a ref. Its default icon is `DragHandleIcon` in horizontal mode and `DragHorizontalIcon` in vertical mode. The naming describes the icon artwork rather than the slider axis.

### `Orientation`

```ts
type Orientation = "horizontal" | "vertical";
```

The component's `index.ts`, exported types, and local source are the source of truth for the public API.

---

## Styling and DOM contract

Compare Slider uses Tailwind utilities, three semantic theme tokens, a shared CSS custom property, and fixed functional shadow/border colors. It has no required stylesheet outside the global Tailwind theme setup.

| Part     | Stable xvelte hook                  | Important contract                                                                   |
| -------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `Root`   | `data-slot="compare-slider"`        | Relative clipping container, focusable slider, pointer target, and owner of `--pos`. |
| `Item`   | `data-slot="compare-slider-item"`   | Absolute full-size layer; only `target="second"` receives an inline `clip-path`.     |
| `Handle` | `data-slot="compare-slider-handle"` | Absolute `z-2` divider with `pointer-events-none`; positioned from `--pos`.          |

Root writes `--pos: <value>%` inline. Item and Handle read it through Tailwind's arbitrary property utilities and inline clipping. Treat `--pos` as a stable local styling hook, but update the public `value` binding rather than writing the variable independently or the ARIA value and visuals will disagree.

There is no default width, height, aspect ratio, image object-fit, border radius, focus ring, caption, or label placement. Supply these through Root class and child content. Root clips everything through `overflow-hidden`, so focusable descendants and overlays extending outside its bounds are unsuitable.

The accent divider and thumb use semantic colors. The thumb also uses a low-opacity black border and a fixed black drop shadow so it remains visible over varied imagery; these are local implementation colors rather than theme variables.

---

## Accessibility

Root is keyboard focusable and exposes slider role, value, minimum, and maximum. Pointer, touch, pen, arrow, Shift+arrow, Home, and End interaction are implemented without requiring the small visual thumb itself to receive events.

The current public API has important limitations:

- Root has no accessible name and does not forward `aria-label` or `aria-labelledby`, so an app cannot name the slider without modifying the component.
- Vertical mode does not expose `aria-orientation="vertical"`; slider role defaults to horizontal semantics.
- Root does not expose `aria-valuetext`, so assistive technology receives only the numeric percentage.
- Arrow Up decreases and Arrow Down increases, which is opposite the usual vertical-slider expectation.
- Root has no disabled or read-only mode and no explicit focus-visible styling.
- `pointercancel` and lost pointer capture are not handled explicitly.

Do not describe this implementation as fully accessible without addressing those gaps. For production use, add public accessible-name props, forward the required ARIA attributes, set orientation, and align vertical keyboard direction with the intended value model.

Supply meaningful alternative text or nearby captions for both visuals. Because both Item children remain in the accessibility tree even when one is visually clipped, write labels that explain the two states without relying on the reveal percentage or visual position alone. Avoid interactive descendants because Root treats pointer presses anywhere inside it as slider interaction.

---

## Localization

Compare Slider contains no built-in human-readable copy and does not use Paraglide messages. Apps provide and translate image alternative text, captions, visible before/after labels, instructions, and any displayed percentage.

The current Root cannot receive an app-supplied localized accessible name through its public API. Add that capability to the reusable component before relying on it in an accessible localized interface.

---

## Dependencies

Compare Slider expects a Svelte 5 project using Tailwind CSS 4. Install its runtime and development packages with one of these command groups:

```sh
# bun
bun add @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss
```

### Shared context

Keep `compare-slider-context.ts` in the component folder. Add this complete file when copying the component:

```ts
import { createContext } from "svelte";

type CompareContext = {
	readonly position: number;
	readonly orientation: "horizontal" | "vertical";
	readonly isDragging: boolean;
};

const [getCompareState, setCompareState] = createContext<CompareContext>();

/**
 * Provides compare-slider position, orientation, and dragging state.
 *
 * @param props - Reactive values owned by the slider root.
 */
export function setCompareContext(props: CompareContext) {
	return setCompareState(props);
}

/** @returns The nearest compare-slider context. */
export function getCompareContext() {
	return getCompareState();
}
```

This context is internal and is not exported from the component's `index.ts`. Copy it unchanged with Root, Item, and Handle.

### Shared utilities

All three parts import `cn` from `$lib/utils`. Add this exact code to `src/lib/utils.ts` when it is not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

The package block includes `clsx` and `tailwind-merge`, which this helper imports. No other shared utility is required.

### Icons

Handle imports two semantic names from `$lib/icons`. Add these exact exports to `src/lib/icons.ts`:

```ts
export { default as DragHandleIcon } from "@tabler/icons-svelte/icons/grip-vertical";
export { default as DragHorizontalIcon } from "@tabler/icons-svelte/icons/grip-horizontal";
```

Keep these aliases in the shared icon facade instead of importing Tabler directly from the component.

### Global CSS

The global stylesheet must import Tailwind and expose the semantic colors used by Handle. The values below are xvelte's light defaults; apps may replace them while preserving their names and mappings:

```css
@import "tailwindcss";

:root {
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--accent: oklch(0.841 0.238 128.85);
}

@theme inline {
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-accent: var(--accent);
}
```

Define equivalent values in the app's dark selector when it supports dark mode. No custom variant, global keyframe, animation package, radius variable, shared component stylesheet, or external asset is required.

### Other requirements

Compare Slider requires no other xvelte UI component, hook, attachment, localization message, Paraglide setup, or Bits UI primitive. The media files and their delivery strategy belong to the app.

---

## Credits

Compare Slider is adapted from [more-shadcn-svelte's Compare Slider](https://more-shadcn.noair.fun/docs/components/compare-slider). Local xvelte API, interaction, styling, dependencies, accessibility notes, and limitations documented here take precedence.

---

## File organization

| File                         | Responsibility                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `compare-slider-root.svelte` | Bindable position, orientation, pointer capture, keyboard interaction, ARIA range state, and context.      |
| `compare-item.svelte`        | Full-size visual layer and orientation-aware clipping for the second target.                               |
| `compare-handle.svelte`      | Positioned divider, thumb, default orientation icon, and custom handle content.                            |
| `compare-slider-context.ts`  | Internal reactive position, orientation, and dragging state shared by Item and Handle.                     |
| `index.ts`                   | Public components and `RootProps`, `ItemProps`, `HandleProps`, and `Orientation` type exports.             |
| `README.md`                  | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits. |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

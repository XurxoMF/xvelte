# Scroll Area

An accessible custom-styled scrolling container built on Bits UI. It can render vertical, horizontal, or both scrollbars, exposes the viewport element for programmatic scrolling, and preserves native scrolling behavior while keeping scrollbar styling consistent.

Use Scroll Area for bounded panels whose custom scrollbar must match the interface, such as side lists or horizontally scrolling galleries. Prefer the browser's normal page scroll for primary documents and avoid creating unnecessary nested scroll regions.

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

```svelte
<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";
</script>
```

`index.ts` exports `Root`, `Scrollbar`, `RootProps`, and `ScrollbarProps`.

---

## Anatomy

For normal use, render Root with content. It owns the viewport, requested scrollbars, thumbs, and corner:

```svelte
<ScrollArea.Root orientation="vertical">Long content</ScrollArea.Root>
```

The generated structure is:

```text
Root
├── Viewport
│   └── app content
├── Scrollbar → Thumb (according to orientation)
└── Corner
```

`Scrollbar` is exported for advanced composition, but Root already creates it. Do not add a second scrollbar of the same orientation inside Root.

---

## Basic usage

```svelte
<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";

	const releases = Array.from({ length: 30 }, (_, index) => `Version 2.${29 - index}`);
</script>

<ScrollArea.Root class="h-72 w-64 rounded-lg border">
	<div class="space-y-2 p-4">
		<h2 class="font-medium">Releases</h2>
		{#each releases as release (release)}
			<p class="text-sm">{release}</p>
		{/each}
	</div>
</ScrollArea.Root>
```

The root needs a constrained width or height on the scrolling axis; otherwise its content expands and no scrollbar is needed.

---

## Examples

### Horizontal scrolling

```svelte
<ScrollArea.Root orientation="horizontal" class="w-96 rounded-lg border">
	<div class="flex w-max gap-4 p-4">
		{#each ["Overview", "Activity", "Analytics", "Exports", "Permissions", "History"] as section}
			<div class="w-40 shrink-0 rounded-md bg-muted p-4">{section}</div>
		{/each}
	</div>
</ScrollArea.Root>
```

Keep the inner content wider than the viewport and avoid wrapping when horizontal scrolling is intentional.

### Both axes

```svelte
<ScrollArea.Root orientation="both" class="size-64 rounded-lg border">
	<div class="h-[32rem] w-[42rem] p-4">
		<p>A large canvas or table can scroll in both directions.</p>
	</div>
</ScrollArea.Root>
```

Use two-axis scrolling only when the content cannot reasonably reflow.

### Programmatic viewport scrolling

```svelte
<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";

	let viewport = $state<HTMLElement | null>(null);
</script>

<button type="button" onclick={() => viewport?.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })}>Scroll to latest</button>

<ScrollArea.Root bind:viewportRef={viewport} class="mt-3 h-64 rounded-lg border">
	<div class="space-y-3 p-4">
		{#each messages as message (message.id)}
			<p>{message.text}</p>
		{/each}
	</div>
</ScrollArea.Root>
```

`ref` points to the outer root; `viewportRef` points to the actual scrolling element.

### Scrollbar behavior and classes

```svelte
<ScrollArea.Root orientation="both" type="always" scrollbarYClasses="w-3" scrollbarXClasses="h-3" class="size-64 rounded-lg border">
	<div class="size-[36rem] p-4">Scrollable content</div>
</ScrollArea.Root>
```

The local class props configure the generated vertical and horizontal scrollbar separately.

---

## Public API

Scroll Area wraps the installed stable `bits-ui@2.18.1` primitive. The tables describe local additions and important inherited options; see the complete [Bits UI Scroll Area API](https://bits-ui.com/docs/components/scroll-area#api-reference). The component's `index.ts`, exported types, and source are the source of truth.

### `ScrollArea.Root`

Type: `RootProps`, based on Bits UI `ScrollArea.RootProps` with the advanced root `child` snippet removed.

| Prop                | Type                                        | Default       | Behavior                                                          |
| ------------------- | ------------------------------------------- | ------------- | ----------------------------------------------------------------- |
| `orientation`       | `"vertical" \| "horizontal" \| "both"`      | `"vertical"`  | Local option controlling which scrollbar components Root creates. |
| `scrollbarXClasses` | `string`                                    | `""`          | Classes passed to the generated horizontal Scrollbar.             |
| `scrollbarYClasses` | `string`                                    | `""`          | Classes passed to the generated vertical Scrollbar.               |
| `viewportRef`       | `HTMLElement \| null`                       | `null`        | Bindable reference to the actual scrolling viewport.              |
| `type`              | `"hover" \| "scroll" \| "auto" \| "always"` | `"hover"`     | Controls when Bits UI shows scrollbars.                           |
| `scrollHideDelay`   | `number`                                    | `600`         | Milliseconds before a transient scrollbar hides.                  |
| `dir`               | `"ltr" \| "rtl"`                            | App direction | Controls reading direction and horizontal behavior.               |
| `children`          | `Snippet`                                   | —             | Content rendered inside the viewport.                             |
| `ref`               | `HTMLDivElement \| null`                    | `null`        | Bindable outer Root element.                                      |

Root forwards native `<div>` attributes. Its `orientation` is an xvelte composition option and is not forwarded to the Bits UI Root; each generated Scrollbar receives the corresponding primitive orientation.

### `ScrollArea.Scrollbar`

Type: `ScrollbarProps`, based on Bits UI `ScrollArea.ScrollbarProps` with the advanced `child` snippet removed.

| Prop          | Type                         | Default              | Behavior                                                                         |
| ------------- | ---------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` locally | Selects axis, layout classes, and `data-orientation`.                            |
| `forceMount`  | `boolean`                    | `false`              | Keeps the scrollbar mounted for external animation or measurement.               |
| `children`    | `Snippet`                    | —                    | Optional content rendered before the built-in Thumb. Avoid adding another thumb. |
| `ref`         | `HTMLDivElement \| null`     | `null`               | Bindable Scrollbar element.                                                      |

Scrollbar forwards native `<div>` attributes. Root's normal composition passes no custom children.

---

## Styling and DOM contract

| Element   | Stable local hook                                             | Styling                                                               |
| --------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| Root      | `data-slot="scroll-area"`                                     | Relative positioning; caller supplies dimensions and borders.         |
| Viewport  | `data-slot="scroll-area-viewport"`, `cn-scroll-area-viewport` | Full size, inherited radius, outline and `ring` focus treatment.      |
| Scrollbar | `data-slot="scroll-area-scrollbar"`                           | 10-pixel axis thickness, one-pixel padding, touch selection disabled. |
| Thumb     | `data-slot="scroll-area-thumb"`                               | Flexible rounded thumb using the `border` token.                      |

The Scrollbar also receives local `data-orientation`; Bits UI adds dependency-owned state attributes such as orientation and visibility. Corner is generated by Bits UI but has no local slot or class.

Root and Scrollbar `class` props use `cn()`. The viewport does not expose a class prop; style it through `cn-scroll-area-viewport` or its stable slot. `scrollbarXClasses` and `scrollbarYClasses` are merged by the generated Scrollbar.

---

## Accessibility

Bits UI preserves native wheel, trackpad, touch, and keyboard scrolling on the viewport while providing custom scrollbar controls. Keep the viewport focus outline, ensure a constrained region has a useful accessible name when its purpose is not evident, and avoid trapping keyboard users inside nested scroll areas.

Content semantics remain unchanged inside the viewport. Use headings, lists, tables, and landmarks normally. Do not hide essential content solely because the custom scrollbar is visually subtle, and test horizontal scrolling in both LTR and RTL layouts.

---

## Localization

Scroll Area contains no built-in human-readable copy and requires no localization messages. The app supplies and translates content and any optional accessible label on the scrolling region.

---

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
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-border: var(--border);
	--color-ring: var(--ring);
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

The values may be replaced by the app's theme. No custom keyframe, variant, font, or layout rule is required.

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;
```

### Component files and other integration

```text
scroll-area/
├── index.ts
├── scroll-area-root.svelte
└── scroll-area-scrollbar.svelte
```

Scroll Area requires no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

---

## Credits

The component structure and styling are adapted from [shadcn-svelte Scroll Area](https://www.shadcn-svelte.com/docs/components/scroll-area).

---

## File organization

| File                           | Responsibility                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `scroll-area-root.svelte`      | Root, viewport, orientation composition, scrollbar classes, corner, and viewport ref. |
| `scroll-area-scrollbar.svelte` | Axis-specific scrollbar, built-in thumb, styles, props, and ref.                      |
| `index.ts`                     | Public component parts and props types.                                               |
| `README.md`                    | Usage, API, accessibility, styling, and installation guide.                           |

The component's `index.ts` and exported types are the source of truth for the public API.

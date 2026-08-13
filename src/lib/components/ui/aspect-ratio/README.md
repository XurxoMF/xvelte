# Aspect Ratio

A single-part layout component that keeps its content at a specified width-to-height ratio while adapting to the available width. It is useful for responsive images, videos, maps, previews, and other media whose dimensions should remain stable as the page resizes.

Use Aspect Ratio when the ratio is part of the layout and the available width determines the height. Do not use it when the content must keep fixed dimensions, determine its own intrinsic size, or change ratio independently at different breakpoints without updating the `ratio` prop.

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
	import * as AspectRatio from "$lib/components/ui/aspect-ratio";
</script>
```

Aspect Ratio's `index.ts` exports `Root` and its `RootProps` type.

---

## Anatomy

Aspect Ratio has one public part:

```svelte
<AspectRatio.Root ratio={16 / 9}>
	<!-- Content -->
</AspectRatio.Root>
```

The component creates a full-width outer sizing wrapper and an absolutely positioned inner element that fills the calculated area. Public attributes, `class`, `children`, `data-slot`, and `ref` apply to the inner element.

---

## Basic usage

```svelte
<script lang="ts">
	import * as AspectRatio from "$lib/components/ui/aspect-ratio";
</script>

<div class="w-full max-w-xl">
	<AspectRatio.Root ratio={16 / 9} class="overflow-hidden rounded-lg">
		<img src="/images/coast.jpg" alt="Rocky coast at sunset" class="size-full object-cover" />
	</AspectRatio.Root>
</div>
```

The parent controls the available width. Make media fill the inner element with styles such as `size-full object-cover` when cropping is appropriate.

---

## Examples

### Square content

Use `ratio={1}` for a square:

```svelte
<AspectRatio.Root ratio={1} class="overflow-hidden rounded-full">
	<img src="/images/profile.jpg" alt="Profile photograph of Alex" class="size-full object-cover" />
</AspectRatio.Root>
```

### Video

The wrapper controls layout only; native media behavior and accessible labeling still belong to the child:

```svelte
<AspectRatio.Root ratio={4 / 3} class="overflow-hidden rounded-lg bg-black">
	<video class="size-full object-contain" controls preload="metadata">
		<source src="/videos/demonstration.mp4" type="video/mp4" />
		<track kind="captions" src="/videos/demonstration.en.vtt" srclang="en" label="English" default />
	</video>
</AspectRatio.Root>
```

---

## Public API

### `AspectRatio.Root`

Type: `RootProps`, an alias of `AspectRatioPrimitive.RootProps`. The wrapper forwards the complete Bits UI API and native inner-`div` attributes; see the [Bits UI Aspect Ratio API reference](https://www.bits-ui.com/docs/components/aspect-ratio#api-reference).

| Prop       | Type                      | Default     | xvelte behavior                                                                                 |
| ---------- | ------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `ratio`    | `number`                  | `1`         | Width divided by height. Use a finite positive number, commonly `16 / 9`, `4 / 3`, or `1`.      |
| `children` | `Snippet`                 | `undefined` | Renders inside the default inner `div`.                                                         |
| `child`    | `Snippet<{ props: ... }>` | `undefined` | Replaces the inner `div` through render delegation; the outer sizing wrapper remains.           |
| `ref`      | `HTMLDivElement \| null`  | `null`      | Bindable reference to the inner default element, not the outer sizing wrapper.                  |
| `class`    | `string`                  | `undefined` | Forwarded to the inner element. xvelte adds no classes and does not use `cn` for class merging. |

Native attributes such as `id`, `style`, and `aria-*` are also forwarded to the inner element. A zero ratio collapses the calculated height; negative or non-finite ratios do not represent a valid layout and should not be used.

Use `index.ts` and the exported `RootProps` type as the source of truth for the local API. The installed Bits UI type defines all inherited options.

---

## Styling and DOM contract

The outer Bits UI wrapper uses `position: relative`, `width: 100%`, and percentage bottom padding derived from `ratio`. The default inner element is absolutely positioned on all four edges.

| Part                  | Stable hook                | Behavior                                                          |
| --------------------- | -------------------------- | ----------------------------------------------------------------- |
| Inner root element    | `data-slot="aspect-ratio"` | Receives public attributes, classes, children, and the bound ref. |
| Bits UI inner element | `data-aspect-ratio-root`   | Dependency-owned selector identifying the primitive root.         |

Aspect Ratio defines no local variants, semantic color tokens, animations, CSS variables, or state attributes. Style the child explicitly to fill, crop, contain, or center its content. Treat the outer sizing wrapper as dependency-owned because it has no xvelte `data-slot`.

---

## Accessibility

Aspect Ratio is layout-only and adds no role, accessible name, keyboard behavior, or focus management.

- Provide appropriate alternative text for informative images and `alt=""` for decorative images.
- Supply captions, controls, labels, and fallbacks required by embedded video, audio, iframe, canvas, or other content.
- Do not encode meaning only through cropping or visual placement.
- Ensure delegated elements receive every prop supplied by the `child` snippet so layout and references continue to work.

---

## Localization

Aspect Ratio has no built-in user-facing copy or localization messages. Your app supplies all child content, alternative text, captions, titles, and accessible labels. Do not translate the technical `data-slot` value or ratio.

---

## Dependencies

Aspect Ratio requires Svelte 5 and Bits UI. Install the runtime package with one of the following commands:

```sh
# bun
bun add bits-ui

# npm
npm install bits-ui

# pnpm
pnpm add bits-ui
```

This component has no development-only package dependency. The examples use Tailwind utilities, but the component itself does not require Tailwind CSS, `tw-animate-css`, theme variables, `layout.css` imports, keyframes, semantic icon exports, `$lib/utils`, other xvelte components, hooks, attachments, context modules, localization messages, or shared styles.

---

## Credits

Aspect Ratio is adapted from the [shadcn-svelte Aspect Ratio](https://www.shadcn-svelte.com/docs/components/aspect-ratio). Its public naming and import path have been aligned with xvelte conventions.

---

## File organization

| File                       | Responsibility                                                 |
| -------------------------- | -------------------------------------------------------------- |
| `aspect-ratio-root.svelte` | Wraps Bits UI, exposes the inner reference, and adds the slot. |
| `index.ts`                 | Exports the public `Root` component and `RootProps` type.      |

Use `index.ts` and the exported `RootProps` type as the source of truth for the public API. If this guide and the implementation disagree, verify the installed Bits UI API and update this guide with the code change.

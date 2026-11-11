# Scroll fade

Direction-aware, scroll-position-aware edge fades for overflowing content, with physical and logical directions, independent sizing, a static browser fallback, and right-to-left support. Use them to hint that a compact list or strip can scroll; do not use a fade as the only indication that essential content is available.

<!-- xvelte-example: overview -->

## Contents

- [Import](#import)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Styling and browser behavior](#styling-and-browser-behavior)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Import

Import the stylesheet after Tailwind in the global stylesheet of an app that needs the utilities:

```css
@import "tailwindcss";
@import "../lib/styles/scroll-fade.css";
```

The import registers Tailwind utilities; it does not add a JavaScript export.

---

## Basic usage

Apply the fade and overflow to the same scroll container:

```svelte
<div class="h-48 scroll-fade-y overflow-y-auto">
	<!-- Scrollable content -->
</div>
```

`scroll-fade` is an alias for the vertical two-edge behavior. The fade responds to the container's own scroll position where scroll-driven CSS animations are supported.

---

## Examples

### Horizontal content

Use the inline-axis utility for direction-aware horizontal layouts:

```svelte
<div class="scroll-fade-x overflow-x-auto" dir="rtl">
	<div class="flex w-max gap-3">...</div>
</div>
```

### One edge and custom sizes

```svelte
<div class="h-48 scroll-fade-b overflow-y-auto scroll-fade-b-16">...</div>
<div class="scroll-fade-s overflow-x-auto scroll-fade-s-[15%]">...</div>
<div class="scroll-fade-x overflow-x-auto scroll-fade-[3rem]">...</div>
```

Use `scroll-fade-none` at a responsive breakpoint or state variant to remove an inherited mask:

```svelte
<div class="scroll-fade-y overflow-y-auto lg:scroll-fade-none">...</div>
```

---

## Public API

The CSS file is the source of truth for these classes.

| Utility                                        | Effect                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `scroll-fade`, `scroll-fade-y`                 | Fade the top and bottom edges.                                                   |
| `scroll-fade-x`                                | Fade the logical start and end edges.                                            |
| `scroll-fade-t`, `scroll-fade-b`               | Fade only the physical top or bottom edge.                                       |
| `scroll-fade-l`, `scroll-fade-r`               | Fade only the physical left or right edge.                                       |
| `scroll-fade-s`, `scroll-fade-e`               | Fade only the logical inline start or end edge; these follow `dir`.              |
| `scroll-fade-<size>`                           | Set the shared fade size from a Tailwind spacing integer, length, or percentage. |
| `scroll-fade-t-<size>`, `scroll-fade-b-<size>` | Set an independent physical block-edge size.                                     |
| `scroll-fade-s-<size>`, `scroll-fade-e-<size>` | Set an independent logical inline-edge size.                                     |
| `scroll-fade-none`                             | Remove the generated mask.                                                       |

Arbitrary values use normal Tailwind syntax, such as `scroll-fade-[2.5rem]` or `scroll-fade-e-[18%]`.

| CSS custom property                            | Purpose                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `--scroll-fade-size`                           | Shared fade depth; defaults to `min(12%, calc(var(--spacing) * 10))`.                   |
| `--scroll-fade-t-size`, `--scroll-fade-b-size` | Top and bottom overrides.                                                               |
| `--scroll-fade-s-size`, `--scroll-fade-e-size` | Logical start and end overrides.                                                        |
| `--scroll-fade-reveal`                         | Scroll distance over which a fade is revealed; defaults to `calc(var(--spacing) * 24)`. |
| `--scroll-fade-mask`                           | Complete mask override; `scroll-fade-none` sets it to `none`.                           |

---

## Styling and browser behavior

The utilities apply a non-repeating CSS mask to the scroll container. In browsers with `animation-timeline: scroll()`, each edge changes with the container's position: an edge remains clear until more content exists beyond it. Browsers without scroll-driven animations receive a static fade on the selected edges, so the effect remains usable but does not react to the scroll position.

The physical `l` and `r` utilities always mean left and right. The logical `x`, `s`, and `e` utilities reverse their gradients in a right-to-left document. Applying another CSS animation to the same element may replace the scroll-fade animation declaration; wrap the content or animate a child when both are required.

---

## Accessibility

The mask is presentational and does not change document semantics, focus order, or scrolling. Keep the container keyboard-scrollable when its content needs interaction, provide an accessible label when its purpose is not evident, and make sure focused descendants are not visually obscured at an edge. Do not rely on the fade alone to communicate instructions or state.

Hiding a scrollbar is separate from this utility and can make overflow harder to discover. If an app also uses `no-scrollbar`, preserve another clear scrolling cue and test keyboard, touch, pointer, and assistive-technology navigation.

---

## Localization

Scroll fade contains no human-readable copy and requires no localization messages. Prefer the logical `scroll-fade-x`, `scroll-fade-s`, and `scroll-fade-e` utilities for content whose direction follows the active locale; the physical utilities intentionally do not change with `dir`.

---

## Dependencies

Scroll fade requires Tailwind CSS 4. Install it as a development dependency when the app does not already provide it:

```sh
# Bun
bun add -D tailwindcss

# npm
npm install -D tailwindcss

# pnpm
pnpm add -D tailwindcss
```

Copy `scroll-fade.css` and `scroll-fade.md` into `src/lib/styles`, then add the import shown in [Import](#import). The utility uses Tailwind's `--spacing` variable but no xvelte semantic colors, icons, JavaScript helpers, components, hooks, attachments, context modules, localization messages, or additional shared styles.

---

## Credits

The implementation is adapted from the [shadcn-svelte Scroll Fade utility](https://www.shadcn-svelte.com/docs/utils/scroll-fade) for xvelte's standalone style organization and documentation.

---

## File organization

| File              | Responsibility                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `scroll-fade.css` | Registered properties, keyframes, masks, direction handling, fallbacks, and Tailwind utility definitions. |
| `scroll-fade.md`  | Installation, API, behavior, and usage guide.                                                             |

`scroll-fade.css` is the source of truth for the available classes and custom properties.

# Horizontal Scroll

A horizontal overflow container that translates vertical mouse-wheel movement into eased horizontal scrolling. It hides the visible scrollbar, accepts any app-owned content, exposes the rendered element, and lets the app tune wheel sensitivity and animation damping.

Use Horizontal Scroll for card rows, media shelves, tag filters, timelines, or other wide content where vertical wheel input should move through a horizontal strip. Do not use it for ordinary page sections that can wrap cleanly, or when capturing vertical page scrolling would be surprising. The component is a visual and input-behavior helper, not a carousel: it has no slides, snapping, pagination, navigation buttons, selection state, or announcements.

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
	import * as HorizontalScroll from "$lib/components/ui/horizontal-scroll";
</script>
```

`index.ts` exports `Root` and its `RootProps` type.

## Anatomy

Horizontal Scroll has one public part. Place content directly inside Root and prevent each item from shrinking when it must retain a fixed width:

```svelte
<HorizontalScroll.Root class="gap-4">
	<article class="w-64 shrink-0">First item</article>
	<article class="w-64 shrink-0">Second item</article>
	<article class="w-64 shrink-0">Third item</article>
</HorizontalScroll.Root>
```

Root renders one native `div` with `display: flex` and horizontal overflow. There is no internal viewport, content wrapper, button, or external scrolling primitive.

The browser only creates horizontal overflow when the children are wider than Root. Flex items shrink by default, so fixed-width cards normally need `shrink-0`, a suitable `min-width`, or another layout rule that preserves their width.

## Basic usage

This complete example renders an accessible, labeled row of project cards:

```svelte
<script lang="ts">
	import * as HorizontalScroll from "$lib/components/ui/horizontal-scroll";

	const projects = [
		{ name: "Storefront", status: "Ready for review" },
		{ name: "Documentation", status: "In progress" },
		{ name: "Design system", status: "Planned" },
		{ name: "Analytics", status: "Ready for review" }
	];
</script>

<HorizontalScroll.Root class="gap-4 pb-2" role="region" aria-label="Projects" tabindex={0}>
	{#each projects as project}
		<article class="w-72 shrink-0 rounded-lg border p-4">
			<h3 class="font-medium">{project.name}</h3>
			<p class="text-sm text-muted-foreground">{project.status}</p>
		</article>
	{/each}
</HorizontalScroll.Root>
```

When the pointer is over an overflowing Root, a wheel event with vertical movement is prevented from scrolling the page and updates the horizontal target instead. The component then eases `scrollLeft` toward that target with `requestAnimationFrame`.

Touch, keyboard, and trackpad input that the browser handles natively can still use the element's ordinary horizontal overflow. The component's custom animation only processes non-zero `deltaY` wheel input.

## Examples

### Tune sensitivity and damping

`sensitivity` controls the target distance added for each wheel delta. `damping` controls how much of the remaining distance is applied on every animation frame:

```svelte
<HorizontalScroll.Root sensitivity={1} damping={0.18} class="gap-3">
	{#each items as item}
		<div class="w-56 shrink-0 rounded-lg border p-4">
			{item.name}
		</div>
	{/each}
</HorizontalScroll.Root>
```

A higher positive `sensitivity` moves farther for the same wheel input. With ordinary values between `0` and `1`, a higher `damping` reaches the target faster and a lower value creates a longer ease. The component does not validate either number; see [Public API](#public-api) before using values outside the normal range.

### Horizontally scrolling filters

Keep controls on one line and expose their pressed state with native button semantics:

```svelte
<script lang="ts">
	import * as HorizontalScroll from "$lib/components/ui/horizontal-scroll";

	const categories = ["All", "Unread", "Favorites", "Archives", "Social", "Updates"];
	let selected = $state("All");
</script>

<HorizontalScroll.Root class="gap-2 p-2" role="group" aria-label="Filter by category">
	{#each categories as category}
		<button
			type="button"
			class="shrink-0 rounded-full border px-3 py-1.5 text-sm"
			aria-pressed={selected === category}
			onclick={() => (selected = category)}
		>
			{category}
		</button>
	{/each}
</HorizontalScroll.Root>
```

Root applies `select-none`, but its children remain interactive. Their DOM order, tab order, labels, selected state, and focus styles are owned by the app.

### Programmatic navigation buttons

Bind `ref` when the interface needs an explicit keyboard-accessible way to move the strip:

```svelte
<script lang="ts">
	import * as HorizontalScroll from "$lib/components/ui/horizontal-scroll";

	let viewport = $state<HTMLDivElement | null>(null);

	function move(direction: -1 | 1) {
		viewport?.scrollBy({ left: direction * viewport.clientWidth * 0.8, behavior: "smooth" });
	}
</script>

<div class="flex items-center justify-between gap-3">
	<button type="button" onclick={() => move(-1)} aria-label="Scroll items left">Previous</button>
	<button type="button" onclick={() => move(1)} aria-label="Scroll items right">Next</button>
</div>

<HorizontalScroll.Root bind:ref={viewport} class="gap-4" role="region" aria-label="Featured items">
	{#each items as item}
		<article class="w-72 shrink-0">{item.name}</article>
	{/each}
</HorizontalScroll.Root>
```

Programmatic scrolling is independent of the component's wheel animation. Avoid starting native smooth scrolling while a wheel animation is still active because both can write `scrollLeft` at the same time.

### Preserve the visible scrollbar

The local defaults hide scrollbars with inline and scoped CSS. A caller `style` attribute is forwarded after the component's inline style and can restore the standards-based scrollbar setting:

```svelte
<HorizontalScroll.Root style="scrollbar-width: auto" class="gap-4 pb-2">
	<!-- Wide content -->
</HorizontalScroll.Root>
```

This does not override the component's scoped WebKit scrollbar rule, so a visible cross-browser scrollbar requires adapting the component stylesheet. If a visible scrollbar is an application requirement, make that behavior explicit and test every supported browser.

## Public API

Horizontal Scroll is implemented with a native `div` and has no external primitive API. The component's `index.ts`, exported types, and local source are the source of truth.

### `HorizontalScroll.Root`

Type: `RootProps`, combining the xvelte-owned motion options with native `HTMLAttributes<HTMLDivElement>` and a bindable element reference.

| Prop          | Type                     | Default     | Behavior                                                                                |
| ------------- | ------------------------ | ----------- | --------------------------------------------------------------------------------------- |
| `sensitivity` | `number`                 | `1.5`       | Multiplies each vertical wheel delta before adding it to the bounded horizontal target. |
| `damping`     | `number`                 | `0.1`       | Fraction of the remaining target distance applied on each animation frame.              |
| `ref`         | `HTMLDivElement \| null` | `null`      | Bindable rendered scroll container.                                                     |
| `children`    | `Snippet`                | `undefined` | Renders the app-owned items directly inside Root.                                       |
| `class`       | `string`                 | `undefined` | Merged after `flex w-full overflow-x-auto overflow-y-hidden select-none`.               |

Remaining native `div` attributes are forwarded after the component's own attributes. This ordering has several consequences:

- Do not pass `onwheel`: it replaces the internal wheel handler rather than running alongside it, so vertical-to-horizontal translation stops.
- A caller `style` replaces the component's inline `scrollbar-width: none; -ms-overflow-style: none;` declaration rather than merging with it.
- A conflicting `data-slot` can replace `data-slot="horizontal-scroll"`. Keep the documented value if styling or tests depend on it.

The component exposes no scroll-position binding, active state, start/end state, callback, action, attachment, or imperative helper. Use `ref`, native scroll events, and DOM scrolling methods when the app needs them.

### Wheel and animation behavior

The local wheel algorithm behaves as follows:

1. Events with `deltaY === 0`, a missing element reference, or no horizontal overflow are left to the browser.
2. For a non-zero vertical delta and available overflow, the component calls `preventDefault()`.
3. A new animation starts from the element's current `scrollLeft`.
4. The target changes by `deltaY * sensitivity` and is clamped between `0` and `scrollWidth - clientWidth`.
5. Each animation frame moves by `(target - current) * damping` until the remaining difference is below `0.5` pixels.
6. The final frame writes the exact target. The latest scheduled frame is cancelled if the component unmounts.

Because `preventDefault()` runs whenever overflow exists, vertical page scrolling remains blocked while the pointer is over Root even when the horizontal target is already at its first or last edge. The component does not hand the wheel back to the page at those boundaries.

`deltaMode` is not normalized. Browsers or devices that report wheel deltas in lines or pages can therefore feel different from pixel-based devices. A purely horizontal wheel event with `deltaY === 0` does not enter the custom easing path and remains native browser behavior; when an event contains both axes, preventing the event also prevents its native horizontal movement.

### Numeric constraints

The component accepts any JavaScript number without clamping or finite-value checks:

- Use a finite, non-negative `sensitivity`. A negative value reverses the wheel direction.
- Prefer a finite `damping` greater than `0` and no greater than `1`.
- `damping={1}` reaches the target on the next update.
- `damping={0}` never advances and continually schedules animation frames.
- Negative values or values at or above `2` can diverge or oscillate indefinitely.

Changing `sensitivity` affects subsequent wheel events. Changing `damping` while an animation is active affects subsequent frames.

## Styling and DOM contract

Root renders one native `div` with these local defaults:

- `flex w-full` creates a full-width row.
- `overflow-x-auto overflow-y-hidden` enables horizontal overflow and clips vertical overflow.
- `select-none` prevents text selection throughout the strip unless a descendant overrides it.
- Inline `scrollbar-width: none` and `-ms-overflow-style: none` hide standards-based and legacy Microsoft scrollbars.
- Scoped `div::-webkit-scrollbar { display: none; }` hides the WebKit scrollbar.

Stable xvelte hook:

| Part | Stable hook                     | Element      |
| ---- | ------------------------------- | ------------ |
| Root | `data-slot="horizontal-scroll"` | Native `div` |

Root merges caller classes with `cn`, so later conflicting Tailwind utilities can replace the ordinary flex, width, overflow, or selection defaults. The inline scrollbar declarations and scoped pseudo-element rule are separate from Tailwind class merging.

The component defines no semantic color token, CSS variable, keyframe, named animation, state attribute, snap point, mask, gradient, padding, gap, or child size. All appearance and item spacing belong to the app.

The hidden scrollbar is an intentional local behavior, but the exact scoped selector and inline legacy declaration are implementation details. Prefer the stable `data-slot` for app styling and testing.

## Accessibility

Root is a generic `div`. It does not add a landmark role, accessible name, focusability, keyboard controls, navigation buttons, item semantics, active-item state, or screen-reader announcements.

- Add `role="region"` and `aria-label` or `aria-labelledby` when the strip is an important named section.
- Add `tabindex={0}` when users should be able to focus the scroll container, and test the browser's native horizontal keyboard behavior. For predictable navigation, provide explicit Previous and Next buttons using the bound `ref`.
- Keep every interactive child semantic and keyboard operable. Visual horizontal order should match DOM and tab order.
- Give icon-only navigation buttons accessible names and expose disabled state when no movement remains.
- Do not depend on the hidden scrollbar as the only indication that more content exists. Partial next items, instructions, controls, or another visible cue can communicate overflow.
- Avoid trapping ordinary page navigation. The current wheel behavior prevents vertical page scrolling at both horizontal edges whenever Root still has overflow.
- Verify zoom, reflow, touch input, trackpads, reduced-motion needs, right-to-left layouts, and screen-reader reading order for the intended content.

The custom easing does not respond to `prefers-reduced-motion`. Use native overflow or adapt the component when wheel animation must be removed for reduced-motion users.

The algorithm writes positive `scrollLeft` values and has no explicit RTL normalization. Test before using it in a right-to-left scrolling interface because browser `scrollLeft` conventions differ.

## Localization

Horizontal Scroll has no built-in user-facing copy and imports no localization messages. The app supplies and translates region names, item content, instructions, navigation labels, empty states, and any status text.

`sensitivity`, `damping`, DOM event names, CSS classes, and `data-slot` are technical values and are not translated.

## Dependencies

Horizontal Scroll expects a Svelte 5 project using Tailwind CSS 4. It has no external scrolling primitive, icon package, localization package, hook, attachment, context file, or other xvelte component dependency.

Install the class-merging packages as runtime dependencies and Tailwind as a development dependency:

```sh
# bun
bun add clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/horizontal-scroll` component folder:

- `horizontal-scroll-root.svelte`
- `index.ts`
- `README.md`

The scoped scrollbar rule is inside `horizontal-scroll-root.svelte`; no separate component stylesheet is required.

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

The package block includes `clsx` and `tailwind-merge`.

### Global CSS

The application stylesheet only needs to load Tailwind:

```css
@import "tailwindcss";
```

Horizontal Scroll uses no global semantic token, theme mapping, custom variant, keyframe, animation import, shared class, or additional layout rule. It also requires no `tw-animate-css`, icon export from `src/lib/icons.ts`, localization message, image, font, or network service.

## Credits

Adapted from [more-shadcn-svelte's Horizontal Scroll](https://more-shadcn.noair.fun/docs/components/horizontal-scroll). The local xvelte props, animation algorithm, forwarding behavior, styling, accessibility limitations, and source are the source of truth.

## File organization

| File                            | Responsibility                                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `horizontal-scroll-root.svelte` | Wheel translation, eased animation, bounds, cleanup, horizontal overflow layout, hidden scrollbar styles, and native forwarding. |
| `index.ts`                      | Public Root component and props type exports.                                                                                    |
| `README.md`                     | Usage, examples, API, animation behavior, styling, accessibility, localization, dependencies, limitations, and credits.          |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

# Scroll Area

An accessible compound scrolling container built on Bits UI. Root owns primitive state, Viewport exposes the actual scrolling element, and fixed-axis scrollbar parts register themselves so Root can add the corner automatically when both axes are present.

Use Scroll Area for bounded panels whose custom scrollbar must match the interface, such as side lists, tables, or horizontally scrolling galleries. Prefer normal page scrolling for primary documents and avoid unnecessary nested scroll regions.

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

```svelte
<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";
</script>
```

`index.ts` exports `Root`, `Viewport`, `ScrollbarVertical`, and `ScrollbarHorizontal`, together with their props types and the thumb props types.

---

## Anatomy

Add exactly the axes the interface needs:

```svelte
<ScrollArea.Root>
	<ScrollArea.Viewport>
		<!-- Scrollable content -->
	</ScrollArea.Viewport>

	<ScrollArea.ScrollbarVertical />
</ScrollArea.Root>
```

The complete two-axis structure is:

```text
Root
├── Viewport
│   └── app content
├── ScrollbarVertical → Thumb
├── ScrollbarHorizontal → Thumb
└── internal Corner
```

Root and Viewport do not generate omitted scrollbars. Each scrollbar registers its fixed axis with the nearest Root during component initialization and unregisters when destroyed. Root renders its internal Corner only while at least one vertical and one horizontal scrollbar are registered.

---

## Basic usage

```svelte
<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";

	const releases = Array.from({ length: 30 }, (_, index) => `Version 2.${29 - index}`);
</script>

<ScrollArea.Root class="h-72 w-64 rounded-lg border">
	<ScrollArea.Viewport>
		<div class="space-y-2 p-4">
			<h2 class="font-medium">Releases</h2>
			{#each releases as release (release)}
				<p class="text-sm">{release}</p>
			{/each}
		</div>
	</ScrollArea.Viewport>

	<ScrollArea.ScrollbarVertical />
</ScrollArea.Root>
```

Constrain Root on the scrolling axis; otherwise its content can expand and no scrollbar is needed.

---

## Examples

### Horizontal scrolling

```svelte
<ScrollArea.Root class="w-96 rounded-lg border">
	<ScrollArea.Viewport>
		<div class="flex w-max gap-4 p-4">
			{#each ["Overview", "Activity", "Analytics", "Exports", "Permissions", "History"] as section}
				<div class="w-40 shrink-0 rounded-md bg-muted p-4">{section}</div>
			{/each}
		</div>
	</ScrollArea.Viewport>

	<ScrollArea.ScrollbarHorizontal />
</ScrollArea.Root>
```

Keep the inner content wider than Viewport and avoid wrapping when horizontal scrolling is intentional.

### Both axes

```svelte
<ScrollArea.Root type="always" class="size-64 rounded-lg border">
	<ScrollArea.Viewport class="bg-muted/20">
		<div class="h-[32rem] w-[42rem] p-4">A large two-dimensional canvas.</div>
	</ScrollArea.Viewport>

	<ScrollArea.ScrollbarVertical class="w-3" thumbProps={{ class: "bg-primary" }} />
	<ScrollArea.ScrollbarHorizontal class="h-3" thumbProps={{ class: "bg-primary" }} />
</ScrollArea.Root>
```

The two scrollbar parts cause Root to add the primitive Corner automatically. Corner is intentionally internal and exposes no styling props.

### Conditional axes

```svelte
<ScrollArea.Root class="size-72 rounded-lg border">
	<ScrollArea.Viewport>Large dynamic content</ScrollArea.Viewport>

	{#if showVertical}
		<ScrollArea.ScrollbarVertical />
	{/if}

	{#if showHorizontal}
		<ScrollArea.ScrollbarHorizontal />
	{/if}
</ScrollArea.Root>
```

Registration follows component lifetime, so Corner appears and disappears as the axes change. Multiple scrollbar instances on the same axis are counted independently.

### Programmatic viewport scrolling

```svelte
<script lang="ts">
	let viewport = $state<HTMLDivElement | null>(null);
</script>

<button type="button" onclick={() => viewport?.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })}>Scroll to latest</button>

<ScrollArea.Root class="mt-3 h-64 rounded-lg border">
	<ScrollArea.Viewport bind:ref={viewport}>Scrollable messages</ScrollArea.Viewport>
	<ScrollArea.ScrollbarVertical />
</ScrollArea.Root>
```

Viewport's bindable `ref` points to the actual scrolling element. Root's `ref` points to the outer primitive element.

### Bind a scrollbar and thumb

```svelte
<script lang="ts">
	let scrollbar = $state<HTMLDivElement | null>(null);
	let thumb = $state<HTMLDivElement | null>(null);
</script>

<ScrollArea.Root class="h-64">
	<ScrollArea.Viewport>Scrollable content</ScrollArea.Viewport>
	<ScrollArea.ScrollbarVertical bind:ref={scrollbar} bind:thumbRef={thumb} />
</ScrollArea.Root>
```

---

## Public API

Scroll Area wraps the installed stable `bits-ui@2.18.1` primitive. The tables describe local additions and important inherited options; see the complete [Bits UI Scroll Area API](https://bits-ui.com/docs/components/scroll-area#api-reference). The component's `index.ts`, exported types, and source are the source of truth.

### `ScrollArea.Root`

Type: `RootProps`, based on Bits UI `ScrollArea.RootProps` with the advanced `child` snippet removed.

| Prop              | Type                                        | Default       | Behavior                                                |
| ----------------- | ------------------------------------------- | ------------- | ------------------------------------------------------- |
| `type`            | `"hover" \| "scroll" \| "auto" \| "always"` | `"hover"`     | Controls when Bits UI shows registered scrollbar parts. |
| `scrollHideDelay` | `number`                                    | `600`         | Delay before transient scrollbars hide.                 |
| `dir`             | `"ltr" \| "rtl"`                            | App direction | Controls reading direction and horizontal behavior.     |
| `children`        | `Snippet`                                   | —             | Manually composed Viewport and scrollbar parts.         |
| `ref`             | `HTMLDivElement \| null`                    | `null`        | Bindable outer Root element.                            |
| `class`           | `string`                                    | `undefined`   | Merged after the relative-positioning default.          |

Root forwards remaining native `div` attributes. It has no orientation prop: rendered scrollbar parts determine the active axes.

### `ScrollArea.Viewport`

Type: `ViewportProps`, based on Bits UI `ScrollArea.ViewportProps`.

| Prop       | Type                     | Default     | Behavior                                                          |
| ---------- | ------------------------ | ----------- | ----------------------------------------------------------------- |
| `children` | `Snippet`                | —           | Scrollable application content.                                   |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable actual scrolling element for measurement or native APIs. |
| `class`    | `string`                 | `undefined` | Merged with full-size, inherited-radius, and transition classes.  |

Viewport forwards native `div` attributes and primitive-owned viewport behavior. Render it inside Root.

### `ScrollArea.ScrollbarVertical`

Type: `ScrollbarVerticalProps`, based on Bits UI `ScrollArea.ScrollbarProps` with `orientation`, `children`, and `child` removed.

### `ScrollArea.ScrollbarHorizontal`

Type: `ScrollbarHorizontalProps`, with the same contract as the vertical part and a fixed horizontal orientation.

| Prop            | Type                     | Default | Behavior                                                       |
| --------------- | ------------------------ | ------- | -------------------------------------------------------------- |
| inherited props | Bits UI scrollbar props  | —       | Forwards native attributes, events, `forceMount`, and `class`. |
| `ref`           | `HTMLDivElement \| null` | `null`  | Bindable fixed-axis Scrollbar element.                         |
| `thumbRef`      | `HTMLDivElement \| null` | `null`  | Bindable built-in Thumb element.                               |
| `thumbProps`    | axis thumb props         | `{}`    | Forwards attributes and merges `class` on the built-in Thumb.  |

Both parts require the nearest ScrollArea Root, register during initialization, unregister during destruction, and own exactly one built-in Thumb. The fixed orientation cannot be overridden.

`VerticalThumbProps` and `HorizontalThumbProps` are equivalent axis-specific aliases based on Bits UI `ThumbProps` with `ref`, `children`, and `child` removed.

### Internal Corner and context

Corner is not exported and accepts no xvelte props. Root renders it with `data-slot="scroll-area-corner"` only when the registration counts contain both axes. This derived behavior remains correct when conditional or duplicate scrollbar parts mount and unmount.

---

## Styling and DOM contract

| Element              | Stable local hook                   | Styling                                                                           |
| -------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| Root                 | `data-slot="scroll-area"`           | Relative container; caller normally supplies constrained dimensions.              |
| Viewport             | `data-slot="scroll-area-viewport"`  | Full size and inherited radius; global `*:focus-visible` supplies its focus ring. |
| Each axis Scrollbar  | `data-slot="scroll-area-scrollbar"` | 10-pixel axis thickness, one-pixel padding, touch selection disabled.             |
| Each Thumb           | `data-slot="scroll-area-thumb"`     | Flexible rounded thumb using the `border` token.                                  |
| Automatically Corner | `data-slot="scroll-area-corner"`    | Primitive-owned spacer with no public styling API.                                |

Scrollbar parts receive their fixed `data-orientation`. Root, Viewport, both scrollbar parts, and both Thumb instances merge caller classes at their corresponding element. Bits UI owns remaining visibility and state attributes.

---

## Accessibility

Bits UI preserves native wheel, trackpad, touch, and keyboard scrolling on Viewport while providing custom scrollbar controls. Keep Viewport's focus outline, give a constrained region a useful accessible name when its purpose is not evident, and avoid trapping keyboard users inside nested scroll areas.

Content semantics remain unchanged inside Viewport. Use headings, lists, tables, and landmarks normally. Omitting a scrollbar preserves native scrolling behavior but removes that visible custom control. Test horizontal scrolling in both LTR and RTL layouts.

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

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

Theme values may be replaced while preserving the semantic names. No keyframe, font, or component-specific global stylesheet is required.

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

### Internal context

Copy `scroll-area-context.svelte.ts` unchanged with the component:

```ts
import { createContext } from "svelte";

/** Fixed axis owned by one Scroll Area scrollbar part. */
export type ScrollbarOrientation = "vertical" | "horizontal";

/** Tracks mounted scrollbar parts so Root can derive whether it needs a corner. */
export class ScrollAreaContext {
	#verticalScrollbars = $state(0);
	#horizontalScrollbars = $state(0);

	/** @returns Whether at least one scrollbar exists on each axis. */
	get hasCorner() {
		return this.#verticalScrollbars > 0 && this.#horizontalScrollbars > 0;
	}

	/**
	 * Registers one mounted scrollbar part.
	 *
	 * @param orientation - Fixed axis rendered by the part.
	 * @returns A cleanup function that unregisters that exact mount.
	 */
	registerScrollbar(orientation: ScrollbarOrientation) {
		if (orientation === "vertical") this.#verticalScrollbars++;
		else this.#horizontalScrollbars++;

		let registered = true;

		return () => {
			if (!registered) return;
			registered = false;

			if (orientation === "vertical") this.#verticalScrollbars--;
			else this.#horizontalScrollbars--;
		};
	}
}

const [getScrollAreaContext, provideScrollAreaContext] = createContext<ScrollAreaContext>();

/** Creates and provides the state shared by one Scroll Area composition. */
export function setScrollAreaContext() {
	return provideScrollAreaContext(new ScrollAreaContext());
}

/** Returns the state from the nearest Scroll Area Root. */
export { getScrollAreaContext };
```

### Component files and other integration

```text
scroll-area/
├── index.ts
├── scroll-area-context.svelte.ts
├── scroll-area-root.svelte
├── scroll-area-scrollbar-horizontal.svelte
├── scroll-area-scrollbar-vertical.svelte
└── scroll-area-viewport.svelte
```

Scroll Area requires no icon, other xvelte component, hook, attachment, localization setup, shared style, image, font, or network service.

---

## Credits

The component structure and styling are adapted from [shadcn-svelte Scroll Area](https://www.shadcn-svelte.com/docs/components/scroll-area).

---

## File organization

| File                                      | Responsibility                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `scroll-area-context.svelte.ts`           | Counts mounted axes and derives whether Root needs Corner.                              |
| `scroll-area-root.svelte`                 | Owns Bits UI state, outer attributes, registration context, children, and Corner.       |
| `scroll-area-viewport.svelte`             | Renders the actual scrolling element with public attributes, content, and bindable ref. |
| `scroll-area-scrollbar-vertical.svelte`   | Registers and renders one vertical track with its built-in Thumb.                       |
| `scroll-area-scrollbar-horizontal.svelte` | Registers and renders one horizontal track with its built-in Thumb.                     |
| `index.ts`                                | Exports all public parts and their props types.                                         |
| `README.md`                               | Documents composition, API, styling, dependencies, accessibility, and installation.     |

The component's `index.ts`, exported types, and source are the source of truth for the public API.

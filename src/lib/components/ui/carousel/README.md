# Carousel

An accessible carousel with touch dragging, mouse dragging, animated snapping, horizontal or vertical layouts, previous and next controls, Embla options, plugins, and programmatic navigation.

Use Carousel for a short, ordered collection of related items when viewing one or a few items at a time helps people focus. Prefer a normal list or grid when every item should remain visible, easy to scan, searchable on the page, or compared at once.

<!-- xvelte-example: overview -->

## Contents

- [Import](#import)
- [Anatomy](#anatomy)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Embla behavior](#embla-behavior)
- [Styling and DOM contract](#styling-and-dom-contract)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

## Import

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Carousel from "$lib/components/ui/carousel";
</script>
```

Carousel's `index.ts` exports `Root`, `Content`, `Item`, `Previous`, and `Next`, their matching props types, Embla-related types, and the `getEmblaContext` and `setEmblaContext` helpers.

## Anatomy

`Root` provides the shared Embla state required by every other Carousel component:

```svelte
<Carousel.Root>
	<Carousel.Content>
		<Carousel.Item>...</Carousel.Item>
		<Carousel.Item>...</Carousel.Item>
		<Carousel.Item>...</Carousel.Item>
	</Carousel.Content>

	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
```

The rendered structure is:

```text
Root (region and positioning wrapper)
├── Content viewport (overflow hidden and Embla action)
│   └── Content container (ref, custom attributes, and moving track)
│       ├── Item (slide)
│       ├── Item (slide)
│       └── Item (slide)
├── Previous
└── Next
```

Keep `Item` components as direct children of `Content`. Previous and Next belong outside Content so they are not clipped or dragged with the slides.

## Basic usage

```svelte
<script lang="ts">
	import * as Carousel from "$lib/components/ui/carousel";
</script>

<Carousel.Root aria-label="Featured projects" class="mx-auto w-full max-w-sm">
	<Carousel.Content>
		{#each ["Atlas", "Beacon", "Compass"] as project, index (project)}
			<Carousel.Item aria-label={`${index + 1} of 3`}>
				<div class="flex aspect-video items-center justify-center rounded-lg border border-border bg-background text-foreground">
					{project}
				</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>

	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
```

Each item occupies the complete viewport by default. Root needs a specific accessible name because its built-in role description identifies the widget type but not its content.

## Examples

### Multiple items per view

Set slide width with Tailwind `basis-*` classes and align snaps to the start:

```svelte
<Carousel.Root opts={{ align: "start" }} aria-label="Team members" class="w-full">
	<Carousel.Content>
		{#each members as member, index (member.id)}
			<Carousel.Item class="sm:basis-1/2 lg:basis-1/3" aria-label={`${index + 1} of ${members.length}`}>
				<div class="rounded-lg border border-border bg-background p-4 text-foreground">
					<p class="font-medium">{member.name}</p>
					<p class="text-sm text-muted-foreground">{member.role}</p>
				</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>

	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
```

The default `basis-full` makes one item fill the track. Classes such as `basis-1/2`, `basis-1/3`, and responsive combinations replace that width.

### Custom spacing

Default horizontal spacing combines `-ms-4` on Content with `ps-4` on every Item. Override both sides of that pair together:

```svelte
<Carousel.Root aria-label="Recent articles">
	<Carousel.Content class="-ms-2 md:-ms-6">
		{#each articles as article, index (article.id)}
			<Carousel.Item class="ps-2 md:basis-1/2 md:ps-6" aria-label={`${index + 1} of ${articles.length}`}>
				<!-- article -->
			</Carousel.Item>
		{/each}
	</Carousel.Content>
</Carousel.Root>
```

For a vertical carousel, match Content's negative top margin with each Item's top padding instead.

### Vertical orientation

```svelte
<Carousel.Root orientation="vertical" opts={{ align: "start" }} aria-label="Upcoming appointments" class="mx-auto w-full max-w-sm">
	<Carousel.Content class="h-72">
		{#each appointments as appointment, index (appointment.id)}
			<Carousel.Item class="basis-1/2" aria-label={`${index + 1} of ${appointments.length}`}>
				<div class="h-full rounded-lg border border-border bg-background p-4">{appointment.title}</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>

	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
```

Vertical Content requires an explicit height. The navigation buttons move above and below the viewport and rotate their chevrons. Their keyboard handlers still use ArrowLeft and ArrowRight in the current local implementation.

### Looping and grouped slides

Pass Embla options through `opts`:

```svelte
<Carousel.Root
	opts={{
		align: "start",
		loop: true,
		slidesToScroll: 2
	}}
	aria-label="Product gallery"
>
	<Carousel.Content>
		{#each products as product, index (product.id)}
			<Carousel.Item class="basis-1/2" aria-label={`${index + 1} of ${products.length}`}>
				<!-- product -->
			</Carousel.Item>
		{/each}
	</Carousel.Content>

	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
```

Carousel forwards the complete local `CarouselOptions` type rather than documenting every Embla setting here. See the [Embla Carousel options reference](https://www.embla-carousel.com/docs/v8/api/options) for `align`, `loop`, `dragFree`, `slidesToScroll`, breakpoints, focus behavior, and other supported options.

### Accessing the Embla API

Use `setApi` when the surrounding component needs the selected snap, event listeners, or direct Embla methods:

```svelte
<script lang="ts">
	import * as Carousel from "$lib/components/ui/carousel";
	import type { CarouselAPI } from "$lib/components/ui/carousel";

	let api = $state<CarouselAPI | undefined>();
	let current = $state(0);
	let count = $state(0);

	$effect(() => {
		if (!api) return;

		const update = () => {
			current = api?.selectedScrollSnap() ?? 0;
			count = api?.scrollSnapList().length ?? 0;
		};

		update();
		api.on("select", update);

		return () => api?.off("select", update);
	});
</script>

<Carousel.Root setApi={(emblaApi) => (api = emblaApi)} aria-label="Testimonials">
	<Carousel.Content>...</Carousel.Content>
	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>

{#if count > 0}
	<p aria-live="polite" class="mt-2 text-center text-sm text-muted-foreground">
		Slide {current + 1} of {count}
	</p>
{/if}
```

Always remove listeners registered through the API when the effect reruns or the component is destroyed.

### Custom navigation or pagination

A descendant component can use the public context to build dots, a counter, or a different toolbar:

```svelte
<!-- CarouselDots.svelte -->
<script lang="ts">
	import { getEmblaContext } from "$lib/components/ui/carousel";

	const carousel = getEmblaContext("CarouselDots");
</script>

<div class="flex justify-center gap-2" aria-label="Choose a slide">
	{#each carousel.scrollSnaps as _, index (index)}
		<button
			type="button"
			aria-label={`Go to slide ${index + 1}`}
			aria-current={carousel.selectedIndex === index ? "true" : undefined}
			class="size-2 rounded-full bg-muted-foreground aria-current:bg-primary"
			onclick={() => carousel.scrollTo(index)}
		></button>
	{/each}
</div>
```

Render `CarouselDots` anywhere inside `Carousel.Root`. Localize the labels shown in this example in the app.

### Plugins

Pass initialized Embla plugins through `plugins`:

```svelte
<script lang="ts">
	import Autoplay from "embla-carousel-autoplay";

	import * as Carousel from "$lib/components/ui/carousel";

	const autoplay = Autoplay({ delay: 4000, stopOnInteraction: true });
</script>

<Carousel.Root plugins={[autoplay]} onmouseenter={autoplay.stop} onmouseleave={autoplay.reset} aria-label="Highlights">
	<Carousel.Content>...</Carousel.Content>
	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
```

`embla-carousel-autoplay` is optional and required only for this example. Other plugins follow the same pattern; see the [Embla Carousel plugins guide](https://www.embla-carousel.com/docs/v8/plugins).

## Public API

Carousel wraps Embla Carousel 8.6.0. The tables below document the local API and defaults; use the [Embla Carousel documentation](https://www.embla-carousel.com/docs/v8/get-started/svelte) for the complete engine API.

### `Carousel.Root`

Type: `RootProps`, equivalent to `WithElementRef<CarouselProps>` and based on native `div` attributes.

| Prop          | Type                                      | Default        | Behavior                                                                          |
| ------------- | ----------------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| `opts`        | `CarouselOptions`                         | `{}`           | Embla options captured when Root is created. `orientation` overrides `opts.axis`. |
| `plugins`     | `CarouselPlugins`                         | `[]`           | Initialized Embla plugins captured when Root is created.                          |
| `setApi`      | `(api: CarouselAPI \| undefined) => void` | No-op          | Receives the initialized Embla API when Content mounts.                           |
| `orientation` | `"horizontal" \| "vertical"`              | `"horizontal"` | Chooses track direction, spacing axis, control placement, and Embla axis.         |
| `children`    | `Snippet \| undefined`                    | `undefined`    | Content, navigation controls, and custom descendants.                             |
| `ref`         | `HTMLDivElement \| null`                  | `null`         | Bindable root region.                                                             |
| `class`       | `string`                                  | `undefined`    | Merged with the local relative-positioning class.                                 |

Native `div` attributes and handlers are forwarded. The current local context captures `opts`, `plugins`, and `orientation` during Root creation rather than updating them reactively. Keep those values stable; remount the root or use the Embla API's `reInit` method when configuration must change after initialization.

Root forces `axis: "x"` for horizontal orientation and `axis: "y"` for vertical orientation. Do not use `opts.axis` to select direction. The local Content also supplies Embla's container and slide selectors; avoid overriding `opts.container` or `opts.slides` unless you are intentionally replacing that contract.

### `Carousel.Content`

Type: `ContentProps`, based on native `div` attributes.

| Prop       | Type                     | Default     | Behavior                                                                      |
| ---------- | ------------------------ | ----------- | ----------------------------------------------------------------------------- |
| `children` | `Snippet \| undefined`   | `undefined` | Direct `Carousel.Item` descendants.                                           |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable moving track element, not the overflow-hidden viewport.              |
| `class`    | `string`                 | `undefined` | Merged onto the moving track with flex direction and negative spacing margin. |

Native `div` attributes and handlers are forwarded to the moving track. The outer viewport owns `data-slot="carousel-content"`, `overflow-hidden`, the Embla action, and the initialization listener; it does not currently expose a separate ref or class prop.

### `Carousel.Item`

Type: `ItemProps`, based on native `div` attributes.

| Prop       | Type                     | Default     | Behavior                                                     |
| ---------- | ------------------------ | ----------- | ------------------------------------------------------------ |
| `children` | `Snippet \| undefined`   | `undefined` | Slide content.                                               |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable slide element.                                      |
| `class`    | `string`                 | `undefined` | Merged with full-basis sizing and orientation-aware spacing. |

Native `div` attributes and handlers are forwarded. Each Item is an Embla slide, uses `role="group"`, and receives the localized `aria-roledescription="slide"`. Pass an `aria-label` or `aria-labelledby` that identifies the slide within the collection.

### `Carousel.Previous` and `Carousel.Next`

Types: `PreviousProps` and `NextProps`, based on local `Button.RootProps` with `children` removed.

| Prop      | Type                        | Default     | Behavior                                                               |
| --------- | --------------------------- | ----------- | ---------------------------------------------------------------------- |
| `variant` | `Button.RootVariants`       | `"outline"` | Applies a local Button visual variant.                                 |
| `size`    | `Button.RootSizes`          | `"icon-sm"` | Applies a local Button size.                                           |
| `ref`     | `HTMLButtonElement \| null` | `null`      | Bindable navigation button.                                            |
| `class`   | `string`                    | `undefined` | Merged with circular shape and orientation-aware absolute positioning. |

The buttons supply their own semantic chevron icons and localized screen-reader text, so custom `children` are intentionally unavailable. Their disabled state follows Embla's `canScrollPrev()` and `canScrollNext()` values. Remaining Button and native button props are forwarded; avoid overriding `onclick`, `onkeydown`, `disabled`, or `aria-disabled` unless replacing the built-in navigation behavior deliberately.

Previous and Next handle ArrowLeft and ArrowRight while either button is focused. This mapping does not change to ArrowUp and ArrowDown for a vertical carousel.

### Types and context helpers

| Export                    | Purpose                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `CarouselAPI`             | Initialized Embla API type derived from `embla-carousel-svelte`.                                         |
| `EmblaCarouselConfig`     | Complete configuration type accepted by the Svelte Embla action.                                         |
| `CarouselOptions`         | `options` field from `EmblaCarouselConfig`.                                                              |
| `CarouselPlugins`         | `plugins` field from `EmblaCarouselConfig`.                                                              |
| `CarouselProps`           | Shared Root props before the element-ref type is added.                                                  |
| `EmblaContext`            | Reactive state and actions shared by Root with descendant parts.                                         |
| `getEmblaContext(name?)`  | Returns the nearest Carousel context or throws a named error outside Root.                               |
| `setEmblaContext(config)` | Provides a custom `EmblaContext`; used internally by Root and exported for advanced custom compositions. |

`EmblaContext` contains `api`, `orientation`, `options`, `plugins`, `scrollSnaps`, `selectedIndex`, `canScrollPrev`, `canScrollNext`, `scrollPrev`, `scrollNext`, `scrollTo`, `handleKeyDown`, and the internal initialization handler.

Use `index.ts` and the exported props types as the source of truth for the local API.

## Embla behavior

- Content initializes Embla in the browser through the `embla-carousel-svelte` action and cleans it up when the component unmounts.
- Dragging, snapping, loop behavior, focus watching, resize observation, and slide observation follow the supplied Embla options.
- Root listens to Embla's `select` event to update the selected snap and navigation availability. It removes that listener when destroyed.
- `scrollSnaps` and `selectedIndex` are available through the local context for pagination and status displays.
- Navigation buttons call `scrollPrev()` and `scrollNext()` and become disabled when Embla cannot move in that direction. Looping carousels normally keep both directions available.
- Changing slide width changes how many items are visible. It does not by itself change how many slides advance; use Embla's `slidesToScroll` option for grouped movement.
- Plugins are separate packages and are not included automatically with `embla-carousel-svelte`.

## Styling and DOM contract

Carousel exposes stable selectors for its public elements and separate Embla selectors for the engine:

| Selector                          | Element          | Purpose                                                          |
| --------------------------------- | ---------------- | ---------------------------------------------------------------- |
| `[data-slot="carousel"]`          | Root `div`       | Named region and relative positioning context.                   |
| `[data-slot="carousel-content"]`  | Outer `div`      | Overflow-hidden Embla viewport.                                  |
| `[data-embla-container]`          | Inner `div`      | Flex track, custom Content attributes, and bindable Content ref. |
| `[data-slot="carousel-item"]`     | Slide `div`      | Public slide wrapper and accessibility semantics.                |
| `[data-embla-slide]`              | Same slide `div` | Embla slide selector.                                            |
| `[data-slot="carousel-previous"]` | Button           | Previous navigation control.                                     |
| `[data-slot="carousel-next"]`     | Button           | Next navigation control.                                         |

Horizontal Content uses `-ms-4`, and Items use `ps-4`; these logical properties support left-to-right and right-to-left spacing. Vertical Content uses `-mt-4 flex-col`, and Items use `pt-4`.

Previous and Next sit `3rem` outside Root by default. Ensure the surrounding layout leaves room for them, or override their positions through `class`. The viewport clips slides but not these sibling controls.

## Accessibility

- Root uses `role="region"` and the localized `aria-roledescription="carousel"`. Supply a meaningful `aria-label` or `aria-labelledby` for the collection.
- Each Item uses `role="group"` and the localized `aria-roledescription="slide"`. Add an accessible name such as “2 of 5” or combine the position with the slide title.
- Previous and Next are real buttons with localized hidden text. They become disabled at the beginning or end when looping is off.
- ArrowLeft and ArrowRight navigate while a built-in navigation button has focus. Root itself does not capture keyboard events, and vertical mode does not switch to vertical arrow keys.
- Embla may move focusable content and respond to focus according to `watchFocus`. Test tab order and focus behavior with the exact `opts` used by the app.
- Do not autoplay essential content. When autoplay is appropriate, provide a clear pause control and respect reduced-motion expectations.
- Do not place the only copy of critical information in off-screen slides. Ensure content remains available through a list, details page, or another suitable path when needed.
- Announce the selected position with a polite live region when that context is important; Carousel does not render a counter or announcement automatically.

Test dragging, touch scrolling, focus order, navigation disabled states, keyboard behavior, responsive slide widths, and reduced motion in the final layout.

## Localization

Carousel uses Paraglide messages for built-in accessible descriptions and navigation text. Keep these entries in `messages/en.json` and provide translations for every supported locale:

| Message ID             | English value    | Used by                             |
| ---------------------- | ---------------- | ----------------------------------- |
| `purple_mink_carousel` | `carousel`       | Root role description.              |
| `round_larch_slide`    | `slide`          | Item role description.              |
| `bright_coral_back`    | `Previous slide` | Previous button screen-reader text. |
| `crisp_hare_forward`   | `Next slide`     | Next button screen-reader text.     |

Slide labels, counters, autoplay controls, titles, descriptions, and all slide content belong to the app and should follow its localization conventions.

## Dependencies

Carousel requires Svelte 5, Embla Carousel for Svelte, Bits UI for the `WithoutChildren` type, the Tabler Svelte icon package, Tailwind Variants through Button, the local utility helpers, Paraglide messages, and Tailwind CSS. Install its runtime and development packages with one of these command groups:

```sh
# bun
bun add embla-carousel-svelte bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install embla-carousel-svelte bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add embla-carousel-svelte bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss

# optional: only for the Autoplay example
bun add embla-carousel-autoplay
npm install embla-carousel-autoplay
pnpm add embla-carousel-autoplay
```

### Required UI component

Copy the complete Button UI component from `src/lib/components/ui/button`. Previous and Next use its variants, sizes, disabled behavior, and native button props. Copy these files:

- `src/lib/components/ui/button/button-root.svelte`
- `src/lib/components/ui/button/index.ts`

Follow the Button component's README to install it and understand its API. Carousel requires no other xvelte UI component, hook, or attachment. Keep `carousel-context.ts` with the Carousel component files because it provides their shared state and public Embla types.

### Shared utilities

Carousel imports `cn` and `WithElementRef` from `$lib/utils`; Button uses the same helpers. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block above includes `clsx` and `tailwind-merge`, which this code imports.

### Icons

Add these exact semantic exports to `src/lib/icons.ts`:

```ts
export { default as ChevronLeftIcon } from "@tabler/icons-svelte/icons/chevron-left";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
```

The package block above includes `@tabler/icons-svelte`. Carousel imports icons only through this shared semantic file.

### Global CSS

Your global stylesheet must import Tailwind, define the dark variant, and expose the semantic colors and radius scale used by Carousel's Button dependency. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}
```

The app remains responsible for applying its `.dark` class, normally through root-level theme management.

No `tw-animate-css` import, global keyframe, shared component stylesheet, or additional icon is required. Optional Embla plugins are separate packages; add only those used by the app and follow their official documentation.

## Credits

Carousel is adapted from the [shadcn-svelte Carousel](https://www.shadcn-svelte.com/docs/components/carousel). Its composition has been adapted to xvelte's local props types, context conventions, semantic icon facade, localization, and Button styles.

## File organization

| File                       | Responsibility                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `carousel-root.svelte`     | Provides the named region, Embla API state, navigation actions, selection tracking, orientation, and context. |
| `carousel-content.svelte`  | Creates the clipped viewport, initializes Embla, and renders the moving track.                                |
| `carousel-item.svelte`     | Defines each sized, spaced, and accessibly described Embla slide.                                             |
| `carousel-previous.svelte` | Renders and positions the previous-slide Button.                                                              |
| `carousel-next.svelte`     | Renders and positions the next-slide Button.                                                                  |
| `carousel-context.ts`      | Defines public Embla types, shared reactive state, and context access helpers.                                |
| `index.ts`                 | Exports all components, props types, Embla types, and context helpers.                                        |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, verify the installed Embla 8 API and update the guide with the code change.

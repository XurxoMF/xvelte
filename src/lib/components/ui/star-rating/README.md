# Star Rating

An accessible rating input that renders full, half, and empty semantic star icons on top of Bits UI Rating Group. It supports bindable numeric values, half steps, read-only and disabled states, hover previews, forms, orientation-aware keyboard navigation, and customizable star count.

Use Star Rating when people assign or review a bounded preference score. Use Slider for a continuous numeric scale, Radio Group when every labelled choice must remain explicit, and a plain text value when the rating is display-only and stars would add no meaning.

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
	import * as StarRating from "$lib/components/ui/star-rating";
</script>
```

`index.ts` exports `Root`, `Star`, `RootProps`, and `StarProps`.

---

## Anatomy

Root provides an `items` array to its child snippet. Render one Star for each item and pass both values unchanged:

```svelte
<StarRating.Root>
	{#snippet children({ items })}
		{#each items as { index, state } (index)}
			<StarRating.Star {index} {state} />
		{/each}
	{/snippet}
</StarRating.Root>
```

`state` is `active`, `partial`, or `inactive`. Passing the Root-provided state keeps the local icon fill synchronized with Bits UI's value and hover preview.

---

## Basic usage

```svelte
<script lang="ts">
	import * as StarRating from "$lib/components/ui/star-rating";

	let rating = $state(3);
</script>

<div>
	<p id="rating-label">Your rating: {rating} out of 5</p>

	<StarRating.Root bind:value={rating} aria-labelledby="rating-label">
		{#snippet children({ items })}
			{#each items as { index, state } (index)}
				<StarRating.Star {index} {state} />
			{/each}
		{/snippet}
	</StarRating.Root>
</div>
```

The default maximum is five and the default value is zero.

---

## Examples

### Half-star ratings

```svelte
<StarRating.Root bind:value={rating} allowHalf aria-label="Product rating">
	{#snippet children({ items })}
		{#each items as { index, state } (index)}
			<StarRating.Star {index} {state} />
		{/each}
	{/snippet}
</StarRating.Root>

<p>{rating.toFixed(1)} out of 5</p>
```

Partial fill mirrors correctly in LTR and RTL layouts. Bits UI determines half steps from pointer position and keyboard behavior.

### Read-only display

```svelte
<div class="flex items-center gap-2">
	<StarRating.Root value={4.5} allowHalf readonly aria-label="Average rating: 4.5 out of 5">
		{#snippet children({ items })}
			{#each items as { index, state } (index)}
				<StarRating.Star {index} {state} />
			{/each}
		{/snippet}
	</StarRating.Root>

	<span>4.5 from 128 reviews</span>
</div>
```

Keep a numeric value visible when precision matters. `readonly` preserves a rating display without allowing changes.

### Custom maximum and size

```svelte
<StarRating.Root bind:value={difficulty} max={10} aria-label="Difficulty">
	{#snippet children({ items })}
		{#each items as { index, state } (index)}
			<StarRating.Star {index} {state} class="size-4" />
		{/each}
	{/snippet}
</StarRating.Root>
```

Root creates `max` item descriptors; do not hard-code a different number of Star components.

### Form submission and localized value text

```svelte
<form method="POST">
	<StarRating.Root
		bind:value={serviceRating}
		name="serviceRating"
		required
		aria-label="Service rating"
		aria-valuetext={(value, max) => `${value} de ${max} estrelas`}
	>
		{#snippet children({ items })}
			{#each items as { index, state } (index)}
				<StarRating.Star {index} {state} />
			{/each}
		{/snippet}
	</StarRating.Root>

	<button type="submit">Send review</button>
</form>
```

Bits UI renders the hidden input only when `name` is provided.

---

## Public API

Star Rating wraps the installed stable `bits-ui@2.18.1` Rating Group. The tables describe the local parts and important inherited behavior; see the complete [Bits UI Rating Group API](https://bits-ui.com/docs/components/rating-group#api-reference). The component's `index.ts`, exported types, and source are the source of truth.

### `StarRating.Root`

Type: `RootProps`, equal to Bits UI `RatingGroupRootProps`.

| Prop                 | Type                                 | Default                      | Behavior                                                                                |
| -------------------- | ------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `value`              | `number`                             | `0`                          | Bindable current rating.                                                                |
| `onValueChange`      | `(value: number) => void`            | —                            | Runs when the rating changes.                                                           |
| `min`                | `number`                             | `0`                          | Minimum allowed rating.                                                                 |
| `max`                | `number`                             | `5`                          | Maximum value and number of generated item descriptors.                                 |
| `allowHalf`          | `boolean`                            | `false`                      | Enables half-step values and partial states.                                            |
| `hoverPreview`       | `boolean`                            | `true`                       | Temporarily previews pointer-hover values; touch is ignored.                            |
| `readonly`           | `boolean`                            | `false`                      | Prevents changes while preserving display semantics.                                    |
| `disabled`           | `boolean`                            | `false`                      | Disables the complete group and fades local stars.                                      |
| `orientation`        | `"horizontal" \| "vertical"`         | `"horizontal"`               | Controls keyboard direction. Local Root remains a flex row unless its class is changed. |
| `name`               | `string`                             | —                            | Creates a hidden form input.                                                            |
| `required`           | `boolean`                            | `false`                      | Adds form validation; supply `name` as well.                                            |
| `aria-valuetext`     | `string \| ((value, max) => string)` | English `"value out of max"` | Describes the numeric rating to assistive technology.                                   |
| `children` / `child` | `Snippet<[{ items, value, max }]>`   | —                            | Renders Star items from the primitive-generated state.                                  |
| `ref`                | `HTMLDivElement \| null`             | `null`                       | Bindable group element inherited and forwarded through rest props.                      |

Root forwards native `<div>` attributes. Its local defaults explicitly set `value=0`, `max=5`, and `orientation="horizontal"` before forwarding them.

### `StarRating.Star`

Type: `StarProps`, based on Bits UI `RatingGroupItemProps` with required local visual state.

| Prop       | Type                                  | Default  | Behavior                                                                               |
| ---------- | ------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `index`    | `number`                              | Required | Zero-based primitive item index. Pass it from Root's `items`.                          |
| `state`    | `"active" \| "partial" \| "inactive"` | Required | Controls full, split, or empty local icon fill. Pass it from the same item descriptor. |
| `disabled` | `boolean \| null`                     | `false`  | Disables this rating item.                                                             |
| `ref`      | `HTMLDivElement \| null`              | `null`   | Bindable primitive item element.                                                       |
| `class`    | `string`                              | —        | Merges after local size, color, and focus classes.                                     |

Star forwards native `<div>` attributes and Bits UI's `child`/`children` options through rest props, but the local component already renders its icon content as the primitive's normal children. Treat custom primitive snippets as advanced and test that they do not replace the required star visuals.

---

## Styling and DOM contract

| Part | Stable hook                    | Local styling                                                                       |
| ---- | ------------------------------ | ----------------------------------------------------------------------------------- |
| Root | `data-slot="star-rating"`      | `group`, row flex, 0.25rem gap, rounded outline container.                          |
| Star | `data-slot="star-rating-star"` | 1.25rem square and semantic primary color; the global focus rule supplies its halo. |

Each Star renders one full outline icon and two mirrored half-star icons. `active` fills the full icon; `partial` fills the direction-appropriate half. Bits UI supplies dependency-owned `data-state` and disabled/ARIA state.

Root and Star classes pass through `cn()`. Internal SVG layers have no public slot; customize their inherited color and the Star container rather than targeting vendor path markup.

---

## Accessibility

Bits UI supplies rating-group semantics, numeric value attributes, item focus and selection, orientation-aware arrow navigation, read-only and disabled behavior, and form integration. Give Root an accessible name with visible text, `aria-label`, or `aria-labelledby`.

Translate `aria-valuetext`: the dependency's default sentence is English. Do not use stars without a numeric or textual explanation when the score must be interpreted precisely. Keep focus rings visible and do not pass mismatched `index` or `state` values to Star.

---

## Localization

The local components contain no Paraglide messages. Bits UI's default `aria-valuetext` is equivalent to `"{value} out of {max}"`; pass a translated string-producing function for non-English interfaces.

The app also supplies and translates visible labels, review counts, scale explanations, validation errors, and submit actions.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss
```

No animation package is required.

### Icon facade

```ts
export { default as StarHalfIcon } from "@tabler/icons-svelte/icons/star-half";
export { default as StarIcon } from "@tabler/icons-svelte/icons/star";
```

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--primary: oklch(0.768 0.233 130.85);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

The values may be replaced by the app's theme. No keyframe, custom variant, font, or layout rule is required.

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Component files and other integration

```text
star-rating/
├── index.ts
├── star-rating-root.svelte
└── star-rating-star.svelte
```

Star Rating requires no other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service. Bits UI owns its internal rating context.

---

## Credits

The component structure and star presentation are adapted from [shadcn-svelte-extras Star Rating](https://shadcn-svelte-extras.com/docs/components/star-rating).

---

## File organization

| File                      | Responsibility                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `star-rating-root.svelte` | Bindable rating state, maximum, orientation, primitive item descriptors, and group styles.       |
| `star-rating-star.svelte` | Rating item semantics and active/partial/inactive semantic icon layers.                          |
| `index.ts`                | Public component parts and props types.                                                          |
| `README.md`               | Composition, examples, API, accessibility, forms, localization, styling, and installation guide. |

The component's `index.ts` and exported types are the source of truth for the public API.

# Pagination

Pagination divides a large collection into numbered pages and provides controls for moving between them. Use it when people benefit from choosing a specific page or understanding their position in a result set. Prefer progressive loading or infinite scrolling when page numbers do not add useful context.

This component wraps Bits UI pagination with xvelte styling, localized control labels, button variants, bindable state, and a renderable page model.

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

Import the component through its public `index.ts`:

```svelte
<script lang="ts">
	import * as Pagination from "$lib/components/ui/pagination";
</script>
```

The component exports:

- Components: `Root`, `Content`, `Item`, `Link`, `Ellipsis`, `Previous`, and `Next`.
- Types: `RootProps`, `ContentProps`, `ItemProps`, `LinkProps`, `EllipsisProps`, `PreviousProps`, and `NextProps`.

---

## Anatomy

`Root` calculates the visible page items. Render them through its `children` snippet and compose the controls as follows:

```svelte
<Pagination.Root {count} {perPage}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.Previous />
			</Pagination.Item>

			{#each pages as page (page.key)}
				{#if page.type === "ellipsis"}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link {page} isActive={currentPage === page.value} />
					</Pagination.Item>
				{/if}
			{/each}

			<Pagination.Item>
				<Pagination.Next />
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
```

`Previous`, `Next`, and `Link` must be descendants of `Root` because Bits UI provides their state through context. `Content` and `Item` are semantic layout elements and may be replaced only if the replacement preserves the list structure.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Pagination from "$lib/components/ui/pagination";

	const count = 95;
	const perPage = 10;
	let page = $state(1);
</script>

<Pagination.Root {count} {perPage} bind:page>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.Previous />
			</Pagination.Item>

			{#each pages as pageItem (pageItem.key)}
				{#if pageItem.type === "ellipsis"}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link page={pageItem} isActive={currentPage === pageItem.value} />
					</Pagination.Item>
				{/if}
			{/each}

			<Pagination.Item>
				<Pagination.Next />
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>

<p class="mt-4 text-center text-sm text-muted-foreground">
	Page {page} of {Math.ceil(count / perPage)}
</p>
```

`count` is the total number of records, not the number of pages. The root derives the total page count from `count / perPage`.

---

## Examples

### Load data when the page changes

Use `onPageChange` for side effects and keep `page` bound when the rest of the interface also needs the current value:

```svelte
<script lang="ts">
	import * as Pagination from "$lib/components/ui/pagination";

	let page = $state(1);

	async function loadPage(nextPage: number) {
		await fetch("/api/orders?page=" + nextPage);
	}
</script>

<Pagination.Root count={240} perPage={20} bind:page onPageChange={loadPage}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item><Pagination.Previous /></Pagination.Item>

			{#each pages as pageItem (pageItem.key)}
				<Pagination.Item>
					{#if pageItem.type === "ellipsis"}
						<Pagination.Ellipsis />
					{:else}
						<Pagination.Link page={pageItem} isActive={currentPage === pageItem.value} />
					{/if}
				</Pagination.Item>
			{/each}

			<Pagination.Item><Pagination.Next /></Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
```

The callback may be asynchronous, but pagination does not wait for it or manage loading, errors, URL state, or fetched data. Handle those concerns in your app.

### Show a compact paginator

Reduce `siblingCount` when horizontal space is limited:

```svelte
<Pagination.Root count={500} perPage={10} siblingCount={0}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item><Pagination.Previous /></Pagination.Item>

			{#each pages as pageItem (pageItem.key)}
				<Pagination.Item>
					{#if pageItem.type === "ellipsis"}
						<Pagination.Ellipsis />
					{:else}
						<Pagination.Link page={pageItem} isActive={currentPage === pageItem.value} />
					{/if}
				</Pagination.Item>
			{/each}

			<Pagination.Item><Pagination.Next /></Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
```

### Show the visible record range

The root also exposes a one-based `range`:

```svelte
<Pagination.Root count={87} perPage={10}>
	{#snippet children({ pages, range, currentPage })}
		<p class="text-sm text-muted-foreground">
			Showing {range.start}–{range.end} of 87 results
		</p>

		<Pagination.Content>
			<Pagination.Item><Pagination.Previous /></Pagination.Item>

			{#each pages as pageItem (pageItem.key)}
				<Pagination.Item>
					{#if pageItem.type === "ellipsis"}
						<Pagination.Ellipsis />
					{:else}
						<Pagination.Link page={pageItem} isActive={currentPage === pageItem.value} />
					{/if}
				</Pagination.Item>
			{/each}

			<Pagination.Item><Pagination.Next /></Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
```

Handle an empty collection separately: with `count={0}`, Bits UI keeps page 1 and reports a range whose end is 0.

---

## Public API

The component `index.ts` and its exported types are the source of truth. The tables below document xvelte defaults and adaptations; inherited primitive options are summarized rather than duplicated.

### `Root`

`RootProps` extends the Bits UI `Pagination.Root` props.

| Prop           | Type                                              | Default        | Description                                                                                   |
| -------------- | ------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `count`        | `number`                                          | `0` at runtime | Total number of records. The exported Bits UI type requires this prop, so pass it explicitly. |
| `perPage`      | `number`                                          | `10`           | Number of records per page. This xvelte default differs from the Bits UI default.             |
| `page`         | `number`                                          | `1`            | Current one-based page. Bind with `bind:page`.                                                |
| `siblingCount` | `number`                                          | `1`            | Numbered pages shown on each side of the current page.                                        |
| `orientation`  | `"horizontal" \| "vertical"`                      | `"horizontal"` | Determines arrow-key navigation. Change the content layout when using vertical orientation.   |
| `loop`         | `boolean`                                         | `false`        | Allows keyboard focus to wrap from the final page control to the first, and conversely.       |
| `onPageChange` | `(page: number) => void`                          | —              | Runs after a page is selected.                                                                |
| `children`     | `Snippet<[{ pages, range, currentPage }]>`        | —              | Renders the calculated model.                                                                 |
| `child`        | `Snippet<[{ props, pages, range, currentPage }]>` | —              | Replaces the root element while exposing the props that must be applied to the replacement.   |
| `ref`          | `HTMLDivElement \| null`                          | `null`         | Bindable root element reference.                                                              |
| `class`        | `string`                                          | —              | Merged after the default root classes.                                                        |

The root forwards remaining supported Bits UI and `div` attributes. xvelte always supplies `role="navigation"`, its localized `aria-label`, and its local data and class hooks.

The `pages` value is an array of:

```ts
type PageItem = { type: "page"; value: number; key: string } | { type: "ellipsis"; key: string };
```

See the [Bits UI Pagination API](https://www.bits-ui.com/docs/components/pagination#api-reference) for the complete inherited primitive API.

### `Content`

`ContentProps` extends Svelte `HTMLAttributes<HTMLUListElement>` with a bindable `ref`. It renders a `ul`, merges `class` with the default flex layout, renders `children`, and forwards remaining list attributes.

### `Item`

`ItemProps` extends Svelte `HTMLLiAttributes` with a bindable `ref`. It renders a plain `li` and forwards `class`, `children`, and other list-item attributes unchanged.

### `Link`

`LinkProps` extends the Bits UI `Pagination.Page` props and adds:

| Prop       | Type                              | Default     | Description                                                        |
| ---------- | --------------------------------- | ----------- | ------------------------------------------------------------------ |
| `page`     | `{ type: "page"; value: number }` | Required    | Page model received from `Root`.                                   |
| `isActive` | `boolean \| undefined`            | Required    | Controls xvelte active styling, `aria-current`, and `data-active`. |
| `children` | `Snippet`                         | Page number | Optional visible content for the button.                           |
| `child`    | Bits UI child snippet             | —           | Delegates rendering while preserving primitive behavior.           |
| `ref`      | `HTMLButtonElement \| null`       | `null`      | Bindable button reference.                                         |
| `class`    | `string`                          | —           | Merged after the local button classes.                             |

Pass `isActive={currentPage === page.value}`. Bits UI independently exposes `data-selected` from the real root state, so an incorrect `isActive` value can make the styling and `aria-current` disagree with the selected page.

The component forwards supported primitive and button attributes. Bits UI provides `type="button"`, `data-value`, `data-selected`, and an English `aria-label` in the form “Page N”.

### `Previous` and `Next`

`PreviousProps` and `NextProps` extend the corresponding Bits UI button props. Both expose a bindable `ref`, merge `class` after the icon-button styles, forward supported primitive and button attributes, and disable themselves automatically at the collection boundaries.

Their standard rendering is intentionally fixed to a localized accessible name, a direction icon, and screen-reader-only “Previous” or “Next” text. Use the inherited `child` snippet when a fully custom rendered control is required.

### `Ellipsis`

`EllipsisProps` extends Svelte `HTMLAttributes<HTMLSpanElement>` with a bindable `ref` and omits `children`. It renders the fixed ellipsis icon and forwards remaining `span` attributes. The whole marker is `aria-hidden="true"` because it is visual context rather than an interactive control.

---

## Styling and DOM contract

Stable xvelte hooks:

| Part       | Element             | Stable hooks                                                       |
| ---------- | ------------------- | ------------------------------------------------------------------ |
| `Root`     | `div` by default    | `data-slot="pagination"`, `cn-pagination`                          |
| `Content`  | `ul`                | `data-slot="pagination-content"`                                   |
| `Item`     | `li`                | `data-slot="pagination-item"`                                      |
| `Link`     | `button` by default | `data-slot="pagination-link"`, `data-active`, `cn-pagination-link` |
| `Ellipsis` | `span`              | `data-slot="pagination-ellipsis"`                                  |
| `Previous` | `button` by default | `cn-pagination-previous-text` on its hidden text                   |
| `Next`     | `button` by default | `cn-pagination-next-text` on its hidden text                       |

`Previous` and `Next` do not define local `data-slot` attributes. Bits UI currently adds `data-pagination-root`, `data-pagination-page`, `data-pagination-prev-button`, `data-pagination-next-button`, `data-orientation`, `data-value`, and `data-selected`. Treat those as dependency-owned behavior and confirm them against the installed Bits UI version before relying on them as a long-term xvelte contract.

The root centers a full-width flex container. `Content` is a horizontal flex list with a small gap. Links, previous, and next reuse the Button component variants: active links use `outline`, other controls use `ghost`, and all use icon sizing. Every local `class` value is merged with `cn()` so later Tailwind utilities can override defaults.

---

## Accessibility

- `Root` renders a navigation landmark with the localized accessible name “Pagination”.
- The semantic `ul` and `li` structure groups the controls as a list. Keep each button inside an `Item`.
- `Link` sets `aria-current="page"` when `isActive` is true. Derive that value from the `currentPage` supplied by `Root`.
- Bits UI manages roving keyboard focus. Horizontal pagination uses Left and Right Arrow; vertical pagination uses Up and Down Arrow. Home and End move to the first and last available page control, and Enter or Space activates it.
- `Previous` and `Next` are disabled automatically on the first and last pages and provide localized accessible names.
- Ellipses are hidden from assistive technology and must not be used as interactive controls.
- If `child` replaces a primitive element, apply every provided prop and preserve button semantics, focus behavior, disabled behavior, and the accessible name.
- Keep pagination near the content it controls. If a page change replaces results without navigation, move focus or announce the update when the surrounding experience needs that feedback.

See [Bits UI Pagination](https://www.bits-ui.com/docs/components/pagination) for the underlying keyboard and focus implementation.

---

## Localization

The component uses these Paraglide messages from `messages/en.json`:

| Message ID            | English value         | Used by               |
| --------------------- | --------------------- | --------------------- |
| `tidy_robin_pages`    | `Pagination`          | Root navigation label |
| `urban_deer_previous` | `Go to previous page` | Previous button label |
| `vivid_pine_next`     | `Go to next page`     | Next button label     |
| `warm_koala_previous` | `Previous`            | Previous hidden text  |
| `young_elm_next`      | `Next`                | Next hidden text      |
| `zesty_duck_pages`    | `More pages`          | Ellipsis hidden text  |

The ellipsis hidden text is included for visual parity but is not announced because the enclosing marker is `aria-hidden`. Bits UI currently creates the individual page-button label as English “Page N”; this wrapper does not expose a separate override for that generated label.

Any result summary, loading message, empty state, or custom link content belongs to the app and must be translated there.

---

## Dependencies

### Packages

Install the runtime packages first and the development packages second. All commands are kept in one block:

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss
```

No attachment or hook is required.

### Required Button component

Pagination reuses the Button component styles. Copy the complete `src/lib/components/ui/button` component, including:

- `button-root.svelte`
- `index.ts`
- `README.md`

Follow the Button component README to install its dependencies and preserve the `rootVariants` export used by Pagination.

### `$lib/utils`

Add these exports to `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

`WithoutChildren` is needed by `Ellipsis`. `WithElementRef` adds the bindable element reference used by the HTML wrappers.

### Icons

Pagination imports semantic names from `src/lib/icons.ts`. Add these exports, backed by `@tabler/icons-svelte`:

```ts
export { default as ChevronLeftIcon } from "@tabler/icons-svelte/icons/chevron-left";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
export { default as EllipsisIcon } from "@tabler/icons-svelte/icons/dots";
```

### Global styles

Pagination itself has no animation, font, or component-specific global CSS. Its Button variants require Tailwind, the dark-mode selector, and these semantic theme tokens from `src/routes/layout.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.145 0 0);
	--muted: oklch(0.97 0 0);
	--muted-foreground: oklch(0.556 0 0);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.922 0 0);
	--input: oklch(0.922 0 0);
	--ring: oklch(0.708 0 0);
	--radius: 0.625rem;
}

.dark {
	--background: oklch(0.145 0 0);
	--foreground: oklch(0.985 0 0);
	--muted: oklch(0.269 0 0);
	--muted-foreground: oklch(0.708 0 0);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.556 0 0);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
}
```

Replace the color and radius values with your own theme while keeping the variable names. `tw-animate-css` is not required.

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the six messages listed in [Localization](#localization) to `messages/en.json`. Their keys and complete English values are already shown there, so they are not duplicated in this section.

No shared attachment, hook, context file, font, keyframe, or additional xvelte component is required.

---

## Credits

Adapted from the [shadcn-svelte Pagination component](https://www.shadcn-svelte.com/docs/components/pagination).

---

## File organization

| File                         | Responsibility                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `pagination-root.svelte`     | Wraps the Bits UI root, binds the page, applies defaults, and labels the navigation landmark. |
| `pagination-content.svelte`  | Renders the styled `ul` that contains the controls.                                           |
| `pagination-item.svelte`     | Renders a semantic `li` wrapper.                                                              |
| `pagination-link.svelte`     | Renders a numbered page button with active styling.                                           |
| `pagination-ellipsis.svelte` | Renders a non-interactive gap marker.                                                         |
| `pagination-previous.svelte` | Renders the localized previous-page control.                                                  |
| `pagination-next.svelte`     | Renders the localized next-page control.                                                      |
| `index.ts`                   | Exports every public component and props type.                                                |
| `README.md`                  | Documents installation, composition, API, styling, accessibility, and localization.           |

The component `index.ts` and its exported types are the source of truth for the public API.

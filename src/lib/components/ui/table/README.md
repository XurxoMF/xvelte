# Table

A set of semantic HTML table components with consistent local styling and an automatic horizontal Scroll Area wrapper. It supports captions, headers, bodies, footers, selected-row styling, native table attributes, and bindable references without introducing a data-grid state model.

Use Table for genuinely tabular information whose rows and columns have meaningful relationships. Use lists or cards for unrelated records, and use a dedicated data-table implementation when sorting, filtering, pagination, virtualization, or column state must be managed for the app.

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

```svelte
<script lang="ts">
	import * as Table from "$lib/components/ui/table";
</script>
```

`index.ts` exports `Root`, `Header`, `Body`, `Footer`, `Row`, `Head`, `Cell`, and `Caption`, together with a matching props type for every part.

## Anatomy

```svelte
<Table.Root>
	<Table.Caption>Table description</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Column</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		<Table.Row>
			<Table.Cell>Value</Table.Cell>
		</Table.Row>
	</Table.Body>
	<Table.Footer>…</Table.Footer>
</Table.Root>
```

Root renders a native `<table>` inside an explicitly composed xvelte Scroll Area Root, Viewport, and ScrollbarHorizontal. This composition remains internal to Table; the remaining public parts map directly to native table elements.

## Basic usage

```svelte
<script lang="ts">
	import * as Table from "$lib/components/ui/table";

	const invoices = [
		{ id: "INV-001", status: "Paid", total: "€240.00" },
		{ id: "INV-002", status: "Pending", total: "€125.00" }
	];
</script>

<Table.Root>
	<Table.Caption>Recent invoices</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head scope="col">Invoice</Table.Head>
			<Table.Head scope="col">Status</Table.Head>
			<Table.Head scope="col" class="text-right">Total</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each invoices as invoice (invoice.id)}
			<Table.Row>
				<Table.Cell class="font-medium">{invoice.id}</Table.Cell>
				<Table.Cell>{invoice.status}</Table.Cell>
				<Table.Cell class="text-right">{invoice.total}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
```

The inner table keeps its intrinsic width and scrolls horizontally when columns no longer fit.

## Examples

### Row headers and footer

```svelte
<Table.Root>
	<Table.Caption>Quarterly revenue in euros</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head scope="col">Quarter</Table.Head>
			<Table.Head scope="col" class="text-right">Revenue</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		<Table.Row>
			<Table.Head scope="row">Q1</Table.Head>
			<Table.Cell class="text-right">€42,000</Table.Cell>
		</Table.Row>
	</Table.Body>
	<Table.Footer>
		<Table.Row>
			<Table.Cell>Total</Table.Cell>
			<Table.Cell class="text-right">€42,000</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>
```

Head can be used inside Body with `scope="row"` when the first cell identifies the row.

### Selected row

```svelte
<Table.Row data-state={selectedId === invoice.id ? "selected" : undefined}>…</Table.Row>
```

The local Row styles `data-state="selected"`; selection state and interaction remain app-owned.

### Checkbox column

```svelte
<Table.Head class="w-10">
	<input type="checkbox" aria-label="Select all invoices" />
</Table.Head>

<Table.Cell>
	<input type="checkbox" aria-label={`Select ${invoice.id}`} />
</Table.Cell>
```

Head and Cell remove end padding when a descendant has `role="checkbox"`. Native checkbox inputs do not receive that role attribute explicitly in every browser, so add the desired column padding class when the selector does not match.

## Public API

Table is implemented with native HTML elements. Every part accepts the corresponding Svelte element attributes, children, `class`, and a bindable element `ref`. The component's `index.ts`, exported types, and source are the source of truth.

| Part and type              | Element   | Local behavior                                                                                                                                |
| -------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Root` — `RootProps`       | `table`   | Full width, bottom caption, small text; automatically wrapped in horizontal Scroll Area. `ref` points to the table, not its scroll container. |
| `Caption` — `CaptionProps` | `caption` | Muted small text with top spacing; Root places captions at the bottom.                                                                        |
| `Header` — `HeaderProps`   | `thead`   | Adds a bottom border to each direct Row.                                                                                                      |
| `Body` — `BodyProps`       | `tbody`   | Removes the final Row border.                                                                                                                 |
| `Footer` — `FooterProps`   | `tfoot`   | Top border, muted background, medium weight, and no final bottom border.                                                                      |
| `Row` — `RowProps`         | `tr`      | Bottom border, hover background, selected-state background, and color transition.                                                             |
| `Head` — `HeadProps`       | `th`      | 2.5rem height, horizontal padding, left alignment, medium weight, and no wrapping.                                                            |
| `Cell` — `CellProps`       | `td`      | Padding, middle alignment, and no wrapping.                                                                                                   |

All native attributes—including `scope`, `colspan`, `rowspan`, ARIA attributes, event handlers, and IDs—are forwarded. Classes merge through `cn()` after local defaults.

## Styling and DOM contract

| Element         | Stable hook                                      |
| --------------- | ------------------------------------------------ |
| Scroll wrapper  | `data-slot="table-container"` on ScrollArea.Root |
| Scroll viewport | `data-slot="scroll-area-viewport"`               |
| Table           | `data-slot="table"`                              |
| Caption         | `data-slot="table-caption"`                      |
| Header          | `data-slot="table-header"`                       |
| Body            | `data-slot="table-body"`                         |
| Footer          | `data-slot="table-footer"`                       |
| Row             | `data-slot="table-row"`                          |
| Head            | `data-slot="table-head"`                         |
| Cell            | `data-slot="table-cell"`                         |

Row recognizes `data-state="selected"`. The scroll container's viewport, scrollbar, and thumb hooks are documented by Scroll Area. Root exposes no direct prop for styling that outer container; use `data-slot="table-container"` in app-level CSS when necessary.

## Accessibility

Native table semantics are preserved. Provide a concise Caption for unfamiliar tables, use Head with correct `scope="col"` or `scope="row"`, and keep a logical source order. Do not replace table elements with generic divs.

Horizontal scrolling does not change semantics, but keyboard and zoom users must still be able to reach every column. Interactive sorting, selection, or expansion controls require their own accessible names, state attributes, and keyboard behavior; this component does not add them.

## Localization

Table contains no built-in copy and requires no localization messages. The app supplies and translates captions, headings, cell content, action labels, empty states, formatted numbers, dates, and currencies.

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

Bits UI is required by the Scroll Area component. No animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
}
```

These are Table's direct tokens. Follow Scroll Area's README for its additional `ring` token and orientation variants. Theme values may be replaced by the app.

### Shared utilities

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

### Required xvelte component

Copy Scroll Area and follow its README:

```text
scroll-area/
├── index.ts
├── scroll-area-context.svelte.ts
├── scroll-area-root.svelte
├── scroll-area-scrollbar-horizontal.svelte
├── scroll-area-scrollbar-vertical.svelte
└── scroll-area-viewport.svelte
```

### Component files and other integration

```text
table/
├── index.ts
├── table-body.svelte
├── table-caption.svelte
├── table-cell.svelte
├── table-footer.svelte
├── table-head.svelte
├── table-header.svelte
├── table-root.svelte
└── table-row.svelte
```

Table needs no icon, hook, attachment, context, localization setup, shared style, image, font, or network service.

## Credits

The component structure and styling are adapted from [shadcn-svelte Table](https://www.shadcn-svelte.com/docs/components/table).

## File organization

| File                   | Responsibility                                                          |
| ---------------------- | ----------------------------------------------------------------------- |
| `table-root.svelte`    | Native table and automatic horizontal Scroll Area wrapper.              |
| `table-caption.svelte` | Caption semantics and muted styling.                                    |
| `table-header.svelte`  | Header section and row borders.                                         |
| `table-body.svelte`    | Body section and final-border cleanup.                                  |
| `table-footer.svelte`  | Footer section and summary styling.                                     |
| `table-row.svelte`     | Row hover, border, and selected state.                                  |
| `table-head.svelte`    | Header cell semantics, dimensions, and alignment.                       |
| `table-cell.svelte`    | Data cell spacing and alignment.                                        |
| `index.ts`             | Public parts and every exported props type.                             |
| `README.md`            | Composition, examples, API, semantics, styling, and installation guide. |

The component's `index.ts` and exported types are the source of truth for the public API.

# Marker

Inline conversation statuses, system notes, bordered rows, labeled separators, decorative icons, and polymorphic links or buttons. Use Marker for compact metadata inside a thread; use Bubble for framed conversational content and Message for a complete sender row.

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
	import * as Marker from "$lib/components/ui/marker";
</script>
```

The component's `index.ts` exports `Root`, `Icon`, `Content`, every named props type, `RootVariants`, and `rootVariants`.

---

## Anatomy

```svelte
<Marker.Root>
	<Marker.Icon />
	<Marker.Content />
</Marker.Root>
```

`Icon` is optional and always decorative. `Content` supplies the visible and accessible meaning.

---

## Basic usage

```svelte
<Marker.Root role="status">
	<Marker.Content>Checking the project files...</Marker.Content>
</Marker.Root>
```

Add `role="status"` only for a dynamic update that should be announced when it appears.

---

## Examples

### Labeled separator

```svelte
<Marker.Root variant="separator">
	<Marker.Content>Today</Marker.Content>
</Marker.Root>
```

The divider lines are decorative pseudo-elements. Do not add `role="separator"` to a separator with meaningful visible text.

### Bordered note with an icon

```svelte
<script lang="ts">
	import { FileIcon } from "$lib/icons";

	import * as Marker from "$lib/components/ui/marker";
</script>

<Marker.Root variant="border">
	<Marker.Icon><FileIcon /></Marker.Icon>
	<Marker.Content>Opened implementation notes</Marker.Content>
</Marker.Root>
```

### Streaming shimmer

```svelte
<Marker.Root role="status">
	<Marker.Content class="shimmer">Generating the preview...</Marker.Content>
</Marker.Root>
```

Copy the Shimmer style and follow its `shimmer.md` guide before using this optional class.

### Link or button

```svelte
<Marker.Root class="transition-colors">
	{#snippet child({ props })}
		<a href="/files" {...props}>
			<Marker.Content>View the changed files</Marker.Content>
		</a>
	{/snippet}
</Marker.Root>
```

Spread `props` onto exactly one native or component-owned element.

---

## Public API

The component's `index.ts` and exported types are the source of truth.

### Root

`RootProps` extends native `div` attributes.

| Prop       | Type                                   | Default     | Description                                                |
| ---------- | -------------------------------------- | ----------- | ---------------------------------------------------------- |
| `variant`  | `"default" \| "separator" \| "border"` | `"default"` | Layout and divider treatment.                              |
| `child`    | `Snippet<[{ props }]>`                 | —           | Delegates rendering to a link, button, or another element. |
| `ref`      | `HTMLDivElement \| null`               | `null`      | Bindable only for the default `div`.                       |
| `children` | `Snippet`                              | —           | Default root content.                                      |
| `class`    | `string`                               | —           | Classes merged after `rootVariants`.                       |

`rootVariants` and `RootVariants` are exported for typed composition. With `child`, caller-owned markup receives the complete native props but cannot receive Root's `ref` binding.

### Icon

`IconProps` extends native `span` attributes. Icon renders a `span`, sets `aria-hidden="true"`, forwards remaining attributes, and exposes bindable `ref`, `children`, and `class` props. Consumer attributes can override `aria-hidden`, but meaningful graphics should generally be placed outside Icon or described by adjacent Content.

### Content

`ContentProps` extends native `span` attributes. Content renders a wrapping `span`, forwards all attributes, and exposes bindable `ref`, `children`, and `class` props.

---

## Styling and DOM contract

| Part      | Element                       | Stable hooks                                         |
| --------- | ----------------------------- | ---------------------------------------------------- |
| `Root`    | `div` or caller-owned element | `data-slot="marker"`, `data-variant`, `group/marker` |
| `Icon`    | `span`                        | `data-slot="marker-icon"`, `aria-hidden="true"`      |
| `Content` | `span`                        | `data-slot="marker-content"`                         |

The default layout is a full-width, left-aligned flex row. `separator` adds flexible lines before and after the content; `border` adds a bottom border and padding. Descendant links are underlined and gain foreground color on hover. `class` values are merged with `cn()`, so later conflicting Tailwind utilities win. Marker uses the `muted-foreground`, `foreground`, and `border` semantic tokens.

---

## Accessibility

Marker is presentational by default because its correct semantics depend on its purpose.

- Use `role="status"` for newly appearing progress or streaming updates. Do not place rapidly changing verbose content in the status region.
- Leave labeled date or section separators without `role="separator"`; that role would make their visible children presentational and would require an `aria-label` instead.
- Icon is hidden from assistive technology. Keep meaningful text in Content, or label an icon-only Root explicitly.
- Use the `child` snippet with a real `a` or `button` for interactive markers. The visible content becomes its accessible name, and the shared global focus rule provides keyboard focus styling.

---

## Localization

Marker contains no built-in human-readable copy and imports no localization messages. The app supplies and translates status text, date labels, section labels, links, and accessible names. Separator margins use logical directions and follow the document's `dir` value.

---

## Dependencies

Install the runtime and development packages with one command group:

```sh
# Bun
bun add clsx tailwind-merge tailwind-variants
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge tailwind-variants
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge tailwind-variants
pnpm add -D tailwindcss
```

Marker requires `cn` and `WithElementRef` from `$lib/utils`:

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The global stylesheet must provide Tailwind, xvelte's shared focus-visible rule for delegated interactive roots, and mappings for `muted-foreground`, `foreground`, `border`, and `ring`:

```css
@import "tailwindcss";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(65.6% 0.241 354.308);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(65.6% 0.241 354.308);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--color-ring: var(--ring);
}

@layer base {
	* {
		@apply border-border;
	}

	*:focus-visible {
		@apply rounded-sm border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

Marker itself requires no icon facade export: the app supplies any icon. Spinner and Shimmer are optional; for Shimmer copy `src/lib/styles/shimmer.css` and `shimmer.md`, then follow that guide. Marker requires no primitive package, context, hook, attachment, localization message, asset, font, or network service. Message is optional composition and should be copied with its guide when used.

---

## Credits

Marker is adapted from the [shadcn-svelte Marker component](https://www.shadcn-svelte.com/docs/components/marker). Its filenames, exported type names, logical separator spacing, focus handling, and inline style integration follow xvelte's local conventions.

---

## File organization

| File                    | Responsibility                                                   |
| ----------------------- | ---------------------------------------------------------------- |
| `marker-root.svelte`    | Variants, polymorphic root rendering, and root state attributes. |
| `marker-icon.svelte`    | Decorative icon wrapper.                                         |
| `marker-content.svelte` | Wrapping marker text and link styling.                           |
| `index.ts`              | Public components, types, and variant helper.                    |
| `marker.md`             | Installation, API, behavior, and usage guide.                    |

The component's `index.ts` and exported types are the source of truth for the public API.

# Typography

A custom collection of styled native text elements for consistent headings, paragraphs, leading copy, links, block quotations, and inline code. Every part preserves its native semantics, accepts native attributes, merges classes, and exposes a bindable element reference.

Use Typography to apply the xvelte text scale to authored content without repeating utility classes. Keep heading levels in document order, use Link only for real navigation, and use Code for full syntax-highlighted blocks rather than InlineCode.

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
- [File organization](#file-organization)

---

## Import

```svelte
<script lang="ts">
	import * as Typography from "$lib/components/ui/typography";
</script>
```

`index.ts` exports `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `P`, `Leading`, `Link`, `Blockquote`, and `InlineCode`, together with a matching props type for every part.

---

## Anatomy

Typography parts are independent native elements rather than a required compound structure:

```svelte
<Typography.H1>Page title</Typography.H1>
<Typography.Leading>Short introduction.</Typography.Leading>
<Typography.P>Body paragraph.</Typography.P>
```

Choose the part for its HTML meaning first and its visual size second.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Typography from "$lib/components/ui/typography";
</script>

<article class="space-y-4">
	<Typography.H1>Designing resilient interfaces</Typography.H1>
	<Typography.Leading>A practical guide to predictable application layouts.</Typography.Leading>
	<Typography.P>
		Start with semantic content, then add presentation. Read the
		<Typography.Link href="/guide">complete guide</Typography.Link>
		for examples.
	</Typography.P>
</article>
```

---

## Examples

### Heading hierarchy

```svelte
<Typography.H1>Documentation</Typography.H1>
<Typography.H2>Installation</Typography.H2>
<Typography.H3>Package manager</Typography.H3>
```

Do not choose H4 because its size looks preferable when the document requires H2. Override classes without changing semantics.

### Inline code

```svelte
<Typography.P>
	Run <Typography.InlineCode>bun run check</Typography.InlineCode> before committing component changes.
</Typography.P>
```

InlineCode renders only a native `<code>` element. It does not highlight syntax, copy text, or wrap a `<pre>`.

### Quotation

```svelte
<Typography.Blockquote cite="https://example.com/source">Interfaces should make the next action clear.</Typography.Blockquote>
```

Add a visible citation in surrounding content when attribution matters; the `cite` attribute is not normally displayed.

### External link

```svelte
<Typography.Link href="https://example.com" target="_blank" rel="noreferrer">External documentation</Typography.Link>
```

Tell users when a link opens a new context if that behavior would be unexpected.

---

## Public API

Typography is original xvelte code built from native HTML. Every part accepts the corresponding Svelte element attributes, a `children` snippet, `class`, and bindable `ref`. The component's `index.ts`, exported types, and source are the source of truth.

| Part and type                    | Element      | Default classes                                                                     |
| -------------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| `H1` — `H1Props`                 | `h1`         | Scroll margin, semibold, tight tracking, 2.25rem text and 3rem on large screens.    |
| `H2` — `H2Props`                 | `h2`         | Scroll margin, 1.875rem semibold text, tight tracking, color transition.            |
| `H3` — `H3Props`                 | `h3`         | Scroll margin, 1.5rem semibold text, tight tracking.                                |
| `H4` — `H4Props`                 | `h4`         | Scroll margin, 1.25rem semibold text, tight tracking.                               |
| `H5` — `H5Props`                 | `h5`         | Scroll margin, 1.125rem semibold text, tight tracking.                              |
| `H6` — `H6Props`                 | `h6`         | Scroll margin, 1rem semibold text, tight tracking.                                  |
| `P` — `PProps`                   | `p`          | 1.75 line height.                                                                   |
| `Leading` — `LeadingProps`       | `p`          | 1.25rem muted introductory text.                                                    |
| `Link` — `LinkProps`             | `a`          | Medium primary text, underline, and underline offset.                               |
| `Blockquote` — `BlockquoteProps` | `blockquote` | Logical start border, start padding, and italic text.                               |
| `InlineCode` — `InlineCodeProps` | `code`       | Relative rounded muted background, compact padding, monospace, small semibold text. |

All native attributes and handlers are forwarded. Classes merge through `cn()` after defaults. Heading props use the common `HTMLAttributes<HTMLHeadingElement>` type; each rendered tag remains fixed by its component.

---

## Styling and DOM contract

Typography currently adds no `data-slot` attributes, state attributes, internal wrappers, or stable custom classes. The rendered native tag and exported component name are the public styling boundary.

Semantic tokens are `primary`, `muted`, `muted-foreground`, and `border`. Class merging lets callers replace type size, weight, color, spacing, or decoration. No automatic vertical rhythm is added between sibling components; the app controls surrounding spacing.

---

## Accessibility

Native semantics are preserved. Keep exactly one appropriate page-level H1 in ordinary documents, do not skip heading levels solely for appearance, use P and Leading for paragraphs, and use Blockquote only for quoted material.

Link must have an `href` and descriptive content. InlineCode is for short code fragments; wrap longer code in a semantic `<pre>` or the xvelte Code component. Color and typography do not replace semantic structure.

---

## Localization

Typography contains no built-in copy and requires no localization messages. All rendered text, link labels, quotation attribution, and code fragments are supplied by the app and translated when appropriate.

---

## Dependencies

### Packages

```sh
# Bun
bun add clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss
```

No primitive, icon, or animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--primary: oklch(0.841 0.238 128.85);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--primary: oklch(0.768 0.233 130.85);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-primary: var(--primary);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--radius-sm: calc(var(--radius) * 0.6);
}
```

Values may be replaced by the app's theme. No keyframe, custom variant, font import, or global layout rule is required; the app should configure a monospace fallback if its design requires one.

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

### Component files and other integration

```text
typography/
├── index.ts
├── typography-blockquote.svelte
├── typography-h1.svelte
├── typography-h2.svelte
├── typography-h3.svelte
├── typography-h4.svelte
├── typography-h5.svelte
├── typography-h6.svelte
├── typography-inline-code.svelte
├── typography-leading.svelte
├── typography-link.svelte
└── typography-p.svelte
```

Typography needs no other xvelte component, hook, attachment, context, localization setup, shared style, image, font file, or network service.

---

## File organization

| File                            | Responsibility                                          |
| ------------------------------- | ------------------------------------------------------- |
| `typography-h1.svelte`          | Level-one heading and its largest visual scale.         |
| `typography-h2.svelte`          | Level-two heading and bottom-border treatment.          |
| `typography-h3.svelte`          | Level-three heading presentation.                       |
| `typography-h4.svelte`          | Level-four heading presentation.                        |
| `typography-h5.svelte`          | Level-five heading presentation.                        |
| `typography-h6.svelte`          | Level-six heading and muted treatment.                  |
| `typography-p.svelte`           | Standard body paragraph.                                |
| `typography-leading.svelte`     | Muted introductory paragraph.                           |
| `typography-link.svelte`        | Native anchor and primary underline treatment.          |
| `typography-blockquote.svelte`  | Native quotation and logical border.                    |
| `typography-inline-code.svelte` | Short inline code presentation.                         |
| `index.ts`                      | Public text components and every exported props type.   |
| `README.md`                     | Usage, API, semantics, styling, and installation guide. |

The component's `index.ts` and exported types are the source of truth for the public API.

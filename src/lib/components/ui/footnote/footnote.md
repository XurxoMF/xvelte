# Footnote

A semantic compound component for linking inline note markers to an ordered definition section and back again. It provides accessible default labels, repeated-reference markers, native anchor navigation, bindable elements, and styling without owning note collection or numbering.

Use Footnote for manually composed notes, citations, or as the rendering layer for a parser such as xvelte Markdown. Do not use it as a tooltip or for information that must remain visible in the main reading flow.

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
- [File organization](#file-organization)

---

## Import

```svelte
<script lang="ts">
	import * as Footnote from "$lib/components/ui/footnote";
</script>
```

The component's `index.ts` exports `Root`, `List`, `Item`, `Reference`, `BackReference`, and their `RootProps`, `ListProps`, `ItemProps`, `ReferenceProps`, and `BackReferenceProps` types.

---

## Anatomy

References appear inline in document content, while Root contains the separate definition list:

```svelte
<p>
	Document content<Footnote.Reference id="note-reference-1" href="#note-1" number={1} />.
</p>

<Footnote.Root>
	<Footnote.List>
		<Footnote.Item id="note-1">
			Footnote content.
			<Footnote.BackReference href="#note-reference-1" number={1} />
		</Footnote.Item>
	</Footnote.List>
</Footnote.Root>
```

Root does not collect Reference parts through context because inline references are not its descendants. The app or renderer must assign matching IDs, order definitions, and provide one BackReference for every Reference occurrence.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Footnote from "$lib/components/ui/footnote";
</script>

<article>
	<p>
		The bundle is smaller than the previous release<Footnote.Reference id="bundle-reference" href="#bundle-note" number={1} />.
	</p>

	<Footnote.Root>
		<Footnote.List>
			<Footnote.Item id="bundle-note">
				The comparison excludes source maps and development-only code.
				<Footnote.BackReference href="#bundle-reference" number={1} />
			</Footnote.Item>
		</Footnote.List>
	</Footnote.Root>
</article>
```

Use document-unique IDs. Reference's `href` points to Item's `id`; BackReference reverses that relationship.

---

## Examples

### Repeated references

Give every occurrence a unique ID and render a matching return link:

```svelte
<p>
	The first claim<Footnote.Reference id="claim-reference-1" href="#claim-note" number={1} /> introduces the result. The summary cites it again<Footnote.Reference
		id="claim-reference-2"
		href="#claim-note"
		number={1}
	/>.
</p>

<Footnote.Root>
	<Footnote.List>
		<Footnote.Item id="claim-note">
			Measured against the production build from the previous release.
			<Footnote.BackReference href="#claim-reference-1" number={1} />
			<Footnote.BackReference href="#claim-reference-2" number={1} occurrence={2} />
		</Footnote.Item>
	</Footnote.List>
</Footnote.Root>
```

The second BackReference displays a small occurrence number and uses the default accessible label “Back to reference 1, occurrence 2”.

### Custom labels and markers

Native `aria-label` attributes override the localized defaults. Children replace only the visible marker:

```svelte
<Footnote.Reference href="#licence-note" id="licence-reference" number={1} aria-label="See licence note">[a]</Footnote.Reference>

<Footnote.Root aria-label="Licence notes">
	<Footnote.List>
		<Footnote.Item id="licence-note">
			Available under the project's documented licence.
			<Footnote.BackReference href="#licence-reference" number={1} aria-label="Return to licence note marker">Return</Footnote.BackReference>
		</Footnote.Item>
	</Footnote.List>
</Footnote.Root>
```

Translate every override in the app. Preserve understandable visible markers and accessible names.

---

## Public API

The component's `index.ts` and exported types are the source of truth. All parts merge `class`, forward the remaining native attributes and event handlers to their documented element, and expose a bindable `ref`.

### `Footnote.Root`

Root renders the labelled section that contains the definition list. `RootProps` extends native `<section>` attributes.

| Prop         | Type                  | Default       | Behavior                                                   |
| ------------ | --------------------- | ------------- | ---------------------------------------------------------- |
| `aria-label` | `string`              | `"Footnotes"` | Gives the section its localized accessible name.           |
| `children`   | `Snippet`             | —             | Renders the List and any app-owned section content.        |
| `ref`        | `HTMLElement \| null` | `null`        | Bindable section element.                                  |
| `class`      | `string`              | —             | Merges after the default divider, spacing, and text style. |

### `Footnote.List`

List renders the ordered definition list and accepts native `<ol>` attributes through `ListProps`.

| Prop       | Type                       | Default | Behavior                                       |
| ---------- | -------------------------- | ------- | ---------------------------------------------- |
| `children` | `Snippet`                  | —       | Renders Item parts in semantic reading order.  |
| `ref`      | `HTMLOListElement \| null` | `null`  | Bindable ordered-list element.                 |
| `class`    | `string`                   | —       | Merges after marker, indentation, and spacing. |

Native ordered-list options such as `start`, `reversed`, and `type` are forwarded. Number values shown by Reference remain app-owned and are not derived from these attributes.

### `Footnote.Item`

Item renders one native `<li>` and accepts native list-item attributes through `ItemProps`.

| Prop       | Type                    | Default | Behavior                                                        |
| ---------- | ----------------------- | ------- | --------------------------------------------------------------- |
| `id`       | `string`                | —       | Destination for one or more Reference links.                    |
| `children` | `Snippet`               | —       | Renders arbitrary definition content and its BackReferences.    |
| `ref`      | `HTMLLIElement \| null` | `null`  | Bindable list-item element.                                     |
| `class`    | `string`                | —       | Merges after the default logical padding and line-height style. |

Item does not require `id` at the type level because it remains a native attribute, but navigation requires one whenever a Reference points to it.

### `Footnote.Reference`

Reference renders a native anchor inside `<sup>`. Anchor attributes and handlers are forwarded to the anchor.

| Prop         | Type                        | Default               | Behavior                                                        |
| ------------ | --------------------------- | --------------------- | --------------------------------------------------------------- |
| `href`       | `string`                    | Required              | Points to the matching Item ID.                                 |
| `number`     | `number`                    | Required              | Default visible marker and parameter for the accessible label.  |
| `aria-label` | `string`                    | `"Footnote {number}"` | Overrides the localized accessible name.                        |
| `children`   | `Snippet`                   | —                     | Replaces the visible number without changing the default label. |
| `ref`        | `HTMLAnchorElement \| null` | `null`                | Bindable inner anchor; the `<sup>` wrapper has no public ref.   |
| `class`      | `string`                    | —                     | Merges onto the anchor after its link treatment.                |

### `Footnote.BackReference`

BackReference renders a native anchor from a definition to one inline occurrence.

| Prop         | Type                        | Default                                                | Behavior                                                  |
| ------------ | --------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| `href`       | `string`                    | Required                                               | Points to one Reference ID.                               |
| `number`     | `number`                    | Required                                               | Parameter for the default accessible label.               |
| `occurrence` | `number`                    | `1`                                                    | Distinguishes repeated references to the same definition. |
| `aria-label` | `string`                    | `"Back to reference {number}"` or the repeated variant | Overrides the localized accessible name.                  |
| `children`   | `Snippet`                   | —                                                      | Replaces the visible return marker.                       |
| `ref`        | `HTMLAnchorElement \| null` | `null`                                                 | Bindable anchor element.                                  |
| `class`      | `string`                    | —                                                      | Merges after its inline link treatment.                   |

The default marker is `↩`. Occurrences after the first add their number as a visually small suffix. Footnote does not validate positive numbers, matching IDs, or occurrence continuity.

---

## Styling and DOM contract

| Stable hook               | Element | Default treatment                                       |
| ------------------------- | ------- | ------------------------------------------------------- |
| `footnote`                | section | Top border, top padding, and small text.                |
| `footnote-list`           | ol      | Decimal markers, logical indentation, and item spacing. |
| `footnote-item`           | li      | Logical start padding and readable line height.         |
| `footnote-reference`      | sup     | Superscript alignment and compact marker size.          |
| `footnote-reference-link` | a       | Primary color, medium weight, and hover underline.      |
| `footnote-back-reference` | a       | Inline return marker with the same link treatment.      |

Root uses `border-border`; both anchors use `text-primary`. Every public `class` merges through `cn()`. Reference's `class` and native anchor attributes belong to the inner link rather than its structural `<sup>` wrapper.

The component adds no JavaScript event handling, animation, CSS variable, or state attribute. ID values are application-owned and are part of the document navigation contract rather than xvelte-generated styling hooks.

---

## Accessibility

Root's localized `aria-label` gives the native section an accessible name. List and Item retain ordered-list semantics. Reference uses superscript presentation around a real anchor, while BackReference is another real anchor, so standard keyboard navigation, focus, browser history, and fragment scrolling remain available without JavaScript.

Create unique IDs within the complete document. Every Reference must point to an existing Item, and every occurrence should have a BackReference that returns to its exact inline marker. When one definition is referenced several times, use distinct Reference IDs and increasing `occurrence` values on the return links.

The default accessible labels identify the footnote and return destination independently of the visible numeric or arrow markers. When custom children change a marker's meaning, override `aria-label` as well. Do not place interactive controls inside either anchor and do not use footnotes for essential information that readers must discover in the main flow.

---

## Localization

| Message ID           | English default                                       | Purpose                                 |
| -------------------- | ----------------------------------------------------- | --------------------------------------- |
| `hollow_cedar_dance` | `Footnotes`                                           | Root's default accessible section name. |
| `ivory_badger_drift` | `Footnote {number}`                                   | Reference's default accessible name.    |
| `kind_marten_glow`   | `Back to reference {number}`                          | First BackReference accessible name.    |
| `lucid_willow_rest`  | `Back to reference {number}, occurrence {occurrence}` | Repeated BackReference accessible name. |

`number` and `occurrence` are interpolated dynamically. Override native `aria-label` when the app needs different terminology, then translate that override itself. Definition content and custom visible markers come from the app and must already be localized.

---

## Dependencies

### Packages

```sh
# Bun
bun add clsx tailwind-merge
bun add -D tailwindcss @inlang/paraglide-js

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss @inlang/paraglide-js

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss @inlang/paraglide-js
```

No primitive, animation, or icon package is required.

### Global styles and theme tokens

Copy the Tailwind import, semantic colors, mappings, and shared focus-visible rule into the app's global stylesheet:

```css
@import "tailwindcss";

:root {
	--primary: oklch(65.6% 0.241 354.308);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(65.6% 0.241 354.308);
}

.dark {
	--primary: oklch(65.6% 0.241 354.308);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(65.6% 0.241 354.308);
}

@theme inline {
	--color-primary: var(--primary);
	--color-border: var(--border);
	--color-ring: var(--ring);
}

@layer base {
	*:focus-visible {
		@apply rounded-sm border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

The color values may be replaced by the app's theme. No keyframe, custom variant, font, image, or layout rule is required.

### Shared utilities

Copy these exports from `$lib/utils`:

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

### Localization setup

Add the four keys listed in Localization to every locale and compile Paraglide to `src/lib/paraglide`. Root, Reference, and BackReference import the generated messages from `$lib/paraglide/messages.js`. Native `href`, `id`, `data-slot`, and numeric values are implementation details and are not translated.

### Component files and other integration

```text
footnote/
├── footnote-root.svelte
├── footnote-list.svelte
├── footnote-item.svelte
├── footnote-reference.svelte
├── footnote-back-reference.svelte
├── index.ts
└── footnote.md
```

Footnote needs no other xvelte component, hook, attachment, context module, semantic icon export, shared component stylesheet, asset, font, browser API, or network service. xvelte Markdown composes it to render parsed GFM footnotes, but Markdown is not a Footnote dependency.

---

## File organization

| File                             | Responsibility                                                              |
| -------------------------------- | --------------------------------------------------------------------------- |
| `footnote-root.svelte`           | Labelled section wrapper and top-divider presentation.                      |
| `footnote-list.svelte`           | Native ordered list, indentation, markers, and definition spacing.          |
| `footnote-item.svelte`           | Native definition list item and caller-owned content.                       |
| `footnote-reference.svelte`      | Superscript inline anchor and localized accessible name.                    |
| `footnote-back-reference.svelte` | Return anchor, repeated-reference marker, and localized accessible name.    |
| `index.ts`                       | Public components and every exported props type.                            |
| `footnote.md`                    | Composition, API, semantics, styling, localization, and installation guide. |

The component's `index.ts` and exported props types are the source of truth for the public API.

# Markdown

A headless renderer that turns a parsed `mdast` document into xvelte Typography, Code, List, Table, Alert, Checkbox, and Separator components. It supports CommonMark, GitHub Flavored Markdown, GitHub blockquote alerts, stable GitHub-style heading IDs, safe link protocols, and lazy syntax highlighting for every language bundled by Shiki.

Use Markdown for documentation, README files, release notes, and other trusted or untrusted Markdown strings that should use the application's xvelte components. Wrap it in `Typography.Prose` when the document needs automatic vertical rhythm. Images, footnotes, and raw HTML deliberately render TODO placeholders until dedicated renderers are added.

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

## Import

```svelte
<script lang="ts">
	import { UseMarkdown, parseMarkdown } from "$lib/hooks/use-markdown.svelte";
	import * as Markdown from "$lib/components/ui/markdown";
</script>
```

The component's `index.ts` exports `Root` and `RootProps`. The hook file separately exports `UseMarkdown`, `parseMarkdown`, `MarkdownAst`, and `MarkdownAlertKind`.

## Anatomy

Parse the source first, then pass the standard mdast root to the headless renderer:

```svelte
<Typography.Prose>
	<Markdown.Root ast={markdown.current} />
</Typography.Prose>
```

`Root` introduces no wrapper element, so the rendered blocks remain direct children of an optional `Typography.Prose`. It recursively composes the required xvelte components.

## Basic usage

```svelte
<script lang="ts">
	import { UseMarkdown } from "$lib/hooks/use-markdown.svelte";
	import * as Markdown from "$lib/components/ui/markdown";
	import * as Typography from "$lib/components/ui/typography";

	let source = $state(`# Installation

Run \`bun install\`.

\`\`\`ts
const ready: boolean = true;
\`\`\``);

	const markdown = new UseMarkdown();

	$effect(() => {
		markdown.source = source;
	});
</script>

<Typography.Prose>
	<Markdown.Root ast={markdown.current} />
</Typography.Prose>
```

For a static or server-loaded string, use the pure parser directly:

```svelte
<script lang="ts">
	const ast = parseMarkdown(source);
</script>

<Markdown.Root {ast} />
```

## Examples

### GitHub alerts

```md
> [!NOTE]
> Additional context.

> [!TIP]
> A useful recommendation.

> [!IMPORTANT]
> Information required to complete the task.

> [!WARNING]
> Something may produce an unexpected result.

> [!CAUTION]
> This action can cause data loss.
```

The parser annotates the blockquote while keeping it a valid mdast `blockquote` node. Root maps Note to `info`, Tip to `success`, Important to `important`, Warning to `warning`, and Caution to `danger`.

### Manual AST rendering

The parser returns standard mdast rather than renderer-specific HTML. An app may inspect or render it itself:

```svelte
{#each ast.children as node}
	{#if node.type === "heading"}
		<h2 id={node.data?.headingId}>Custom heading renderer</h2>
	{:else if node.type === "code"}
		<pre>{node.value}</pre>
	{/if}
{/each}
```

Use the node's documented mdast fields rather than depending on source positions. The [mdast specification](https://github.com/syntax-tree/mdast) is the source of truth for standard node formats.

### Table of contents

Bind the optional Prose container to `UseToc`. Markdown headings already receive stable unique IDs:

```svelte
<script lang="ts">
	import { UseToc } from "$lib/hooks/use-toc.svelte";

	const toc = new UseToc();
	let content = $state<HTMLDivElement>();

	$effect(() => {
		toc.ref = content;
		return () => toc.destroy();
	});
</script>

<Typography.Prose bind:ref={content}>
	<Markdown.Root {ast} />
</Typography.Prose>
```

## Public API

### `Markdown.Root`

| Prop                  | Type          | Default  | Behavior                                                                                        |
| --------------------- | ------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `ast`                 | `MarkdownAst` | Required | Standard mdast root produced by `parseMarkdown`, `UseMarkdown`, or compatible application code. |
| `showCopyButton`      | `boolean`     | `true`   | Adds a keyboard-accessible `Code.CopyButton` to every fenced block.                             |
| `leadingIntroduction` | `boolean`     | `true`   | Uses `Typography.Leading` for the paragraph immediately following a top-level H1.               |

Root has no `children`, `class`, or `ref` prop because it renders no element of its own. Wrap it when a layout element, styling scope, DOM reference, article semantic, or TOC observation target is required.

### Parsed formats and renderer coverage

Parsing follows CommonMark with the official GFM extensions supplied by `micromark-extension-gfm` and `mdast-util-gfm`. Refer to the [GitHub Flavored Markdown specification](https://github.github.com/gfm/) and [mdast node specification](https://github.com/syntax-tree/mdast) for exact parsing rules.

| Markdown or mdast node                       | Root rendering                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ATX/Setext headings                          | `Typography.H1`–`H6` with unique GitHub-style IDs.                                                 |
| Paragraphs                                   | `Typography.P`; the optional introductory paragraph uses `Typography.Leading`.                     |
| Emphasis, strong, deletion, and hard breaks  | Native `em`, `strong`, `del`, and `br` with stable slots.                                          |
| Inline code and links                        | `Typography.InlineCode` and `Typography.Link`; reference links are resolved from definitions.      |
| Fenced and indented code                     | `Code.Root`, all lazy Shiki languages/aliases, plain-text fallback, and optional copy button.      |
| Ordered, unordered, nested, and spread lists | `List.Root` and `List.Item`; ordered-list start values are preserved.                              |
| GFM task lists                               | Marker-free List items with a disabled, labelled xvelte Checkbox.                                  |
| Blockquotes                                  | `Typography.Blockquote` with internal block spacing.                                               |
| GitHub Note/Tip/Important/Warning/Caution    | Semantic xvelte Alert variants with localized titles and icons.                                    |
| GFM tables and alignment                     | xvelte Table parts with header cells, body rows, and per-column text alignment.                    |
| Thematic breaks                              | Non-decorative `Separator.Root`.                                                                   |
| Autolinks, reference links, and definitions  | Safe links for relative URLs plus `http`, `https`, `mailto`, and `tel`; definitions do not render. |
| Images and image references                  | Localized `TODO: Image component` placeholder; complete AST data is retained.                      |
| Footnote references and definitions          | Localized `TODO: Footnotes component` placeholder; complete AST data is retained.                  |
| Raw inline or block HTML                     | Localized `TODO: Raw HTML renderer` placeholder; source HTML is never executed.                    |

GFM parsing also preserves source positions. Root does not render YAML frontmatter, math, Mermaid diagrams, GitHub mentions, issue references, emoji shortcodes, or repository-specific URL expansion because those are separate extensions or post-processing features rather than the configured CommonMark/GFM parser.

Code fence languages are forwarded directly to `Code.Root`, which resolves bundled Shiki names and aliases, loads their grammars lazily, caches them, and falls back to plain text for unknown identifiers. Markdown owns no separate language registry.

## Styling and DOM contract

Root is headless and therefore has no root slot. Rendered xvelte parts retain their own documented slots. Markdown adds these stable hooks only where it creates native or internal structure:

| Slot                         | Element or purpose                                         |
| ---------------------------- | ---------------------------------------------------------- |
| `markdown-strong`            | Native `strong`.                                           |
| `markdown-emphasis`          | Native `em`.                                               |
| `markdown-delete`            | Native `del`.                                              |
| `markdown-break`             | Native `br`.                                               |
| `markdown-task-list-item`    | Task checkbox and content row.                             |
| `markdown-task-list-content` | Blocks belonging to one task item.                         |
| `markdown-list-item-content` | Multi-block non-task list content.                         |
| `markdown-unsafe-link`       | Text retained after rejecting an unsafe link destination.  |
| `markdown-unresolved-link`   | Text from a reference without a usable definition.         |
| `markdown-todo`              | Inline or block placeholder for an unimplemented renderer. |

Root adds only structural spacing inside blockquotes and multi-block list items. Surrounding document rhythm belongs to `Typography.Prose` or another app wrapper.

## Accessibility

Root preserves heading levels, native emphasis, links, lists, tables, quotations, and code semantics through the selected xvelte components. Keep the Markdown source's heading hierarchy meaningful and use one appropriate top-level H1 for ordinary documents.

Task-list checkboxes are disabled representations of source state and receive their list item's plain text as an accessible name. Code copy buttons are keyboard reachable. Alert icons are hidden from assistive technology while localized titles identify their type.

Unsafe link protocols are rendered as non-link text. Raw HTML is never passed to `{@html}`. The TODO placeholders make unsupported content visible instead of silently dropping it, but they are not final accessible renderers for images or footnotes.

## Localization

Markdown includes the following reusable copy:

| Message ID           | English default             | Purpose                |
| -------------------- | --------------------------- | ---------------------- |
| `velvet_ibis_turn`   | `Note`                      | Note alert title.      |
| `solar_otter_rest`   | `Tip`                       | Tip alert title.       |
| `misty_yak_glow`     | `Important`                 | Important alert title. |
| `rapid_fern_bloom`   | `Warning`                   | Warning alert title.   |
| `silent_coral_drift` | `Caution`                   | Caution alert title.   |
| `gentle_raven_wait`  | `TODO: Image component`     | Image placeholder.     |
| `lunar_badger_pause` | `TODO: Footnotes component` | Footnote placeholder.  |
| `amber_willow_hold`  | `TODO: Raw HTML renderer`   | Raw HTML placeholder.  |

Document text, code, link titles, image alternatives, and task labels come from the AST and are not translated by Root. The required Code, Checkbox, and other components retain their own localization contracts.

## Dependencies

### Packages

```sh
# Bun
bun add github-slugger mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm shiki @shikijs/langs @shikijs/themes bits-ui tailwind-variants @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss @inlang/paraglide-js

# npm
npm install github-slugger mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm shiki @shikijs/langs @shikijs/themes bits-ui tailwind-variants @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss @inlang/paraglide-js

# pnpm
pnpm add github-slugger mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm shiki @shikijs/langs @shikijs/themes bits-ui tailwind-variants @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss @inlang/paraglide-js
```

### Required xvelte code

Copy `src/lib/hooks/use-markdown.svelte.ts` and the complete folders below, then follow each component README for its transitive files, theme tokens, global styles, localization, and installation details:

- `alert`: `alert-action.svelte`, `alert-description.svelte`, `alert-root.svelte`, `alert-title.svelte`, `index.ts`.
- `checkbox`: `checkbox-root.svelte`, `index.ts`.
- `code`: `code-context.svelte.ts`, `code-copy-button.svelte`, `code-overflow.svelte`, `code-root.svelte`, `shiki.ts`, `index.ts`.
- `list`: `list-item.svelte`, `list-root.svelte`, `index.ts`.
- `separator`: `separator-root.svelte`, `index.ts`.
- `table`: `table-body.svelte`, `table-caption.svelte`, `table-cell.svelte`, `table-footer.svelte`, `table-head.svelte`, `table-header.svelte`, `table-root.svelte`, `table-row.svelte`, `index.ts`.
- `typography`: `typography-blockquote.svelte`, `typography-h1.svelte` through `typography-h6.svelte`, `typography-inline-code.svelte`, `typography-leading.svelte`, `typography-link.svelte`, `typography-p.svelte`, `typography-prose.svelte`, `index.ts`.

Table also requires its documented Scroll Area component. Code and Checkbox require the localization and icon setup documented in their guides.

Markdown imports `AlertErrorIcon`, `AlertInfoIcon`, `AlertSuccessIcon`, and `AlertWarningIcon` from `$lib/icons`:

```ts
export { default as AlertErrorIcon } from "@tabler/icons-svelte/icons/alert-octagon";
export { default as AlertInfoIcon } from "@tabler/icons-svelte/icons/info-circle";
export { default as AlertSuccessIcon } from "@tabler/icons-svelte/icons/circle-check";
export { default as AlertWarningIcon } from "@tabler/icons-svelte/icons/alert-triangle";
```

Markdown itself requires no `$lib/utils` export, context, attachment, image asset, font, CSS variable, keyframe, or additional global stylesheet rule. Its required components have their own documented utility and theme requirements.

## File organization

| File                   | Responsibility                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `markdown-root.svelte` | Headless recursive mdast renderer, safe links, code composition, alerts, and TODO placeholders. |
| `index.ts`             | Public component and props type exports.                                                        |
| `README.md`            | Supported syntax, composition, API, contracts, dependencies, and current limitations.           |

The component's `index.ts`, exported types, mdast types, and `UseMarkdown` parser are the source of truth for the public API.

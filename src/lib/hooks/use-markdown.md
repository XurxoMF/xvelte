# UseMarkdown

`UseMarkdown` reactively converts a replaceable Markdown string into a standard mdast tree. The same file exports the pure `parseMarkdown` function for static, server, build-time, or manually reactive use. Parsing follows CommonMark plus GitHub Flavored Markdown and adds only stable heading IDs and GitHub alert metadata to mdast's open `data` field.

Use this hook when an application needs to inspect, transform, render, index, or derive navigation from Markdown rather than immediately generating HTML. It does not read files, fetch URLs, render components, highlight code, sanitize HTML, or observe headings in the DOM.

<!-- xvelte-example: overview -->

## Contents

- [Installation](#installation)
- [Import](#import)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Reactivity and lifecycle](#reactivity-and-lifecycle)
- [Accessibility and localization](#accessibility-and-localization)
- [Dependencies](#dependencies)
- [File organization](#file-organization)

---

## Installation

Copy `use-markdown.svelte.ts` and install its dependencies:

```sh
# Bun
bun add github-slugger mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm
bun add -D svelte

# npm
npm install github-slugger mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm
npm install -D svelte

# pnpm
pnpm add github-slugger mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm
pnpm add -D svelte
```

---

## Import

```svelte
<script lang="ts">
	import { UseMarkdown, parseMarkdown, type MarkdownAlertKind, type MarkdownAst } from "$lib/hooks/use-markdown.svelte";
</script>
```

The file exports `UseMarkdown`, `parseMarkdown`, `MarkdownAst`, and `MarkdownAlertKind`.

---

## Basic usage

```svelte
<script lang="ts">
	import { UseMarkdown } from "$lib/hooks/use-markdown.svelte";

	let source = $state("# Overview");
	const markdown = new UseMarkdown();

	$effect(() => {
		markdown.source = source;
	});
</script>

<pre>{JSON.stringify(markdown.current, null, 2)}</pre>
```

Assigning `source` reparses the complete string and updates `current` reactively. The hook does not debounce rapid changes; add application-level debouncing for a live editor when required.

For a static value, avoid creating reactive state:

```ts
const ast = parseMarkdown(readmeSource);
```

---

## Examples

### Render with xvelte Markdown

```svelte
<script lang="ts">
	import * as Markdown from "$lib/components/ui/markdown";
	import * as Typography from "$lib/components/ui/typography";
</script>

<Typography.Prose>
	<Markdown.Root ast={markdown.current} />
</Typography.Prose>
```

Markdown.Root is optional. Iterate over `current.children` when the application needs a custom renderer or transformation.

### Replace source loaded from a URL

```ts
const response = await fetch(documentUrl);
if (!response.ok) throw new Error("Unable to load documentation");
markdown.source = await response.text();
```

Fetching, authorization, caching, size limits, error handling, and trust policy belong to the app. The hook accepts only the resulting string.

### Heading IDs and alerts

```md
# Installation

# Installation

> [!WARNING]
> Back up the database first.
```

The headings receive `data.headingId` values `installation` and `installation-1`. The blockquote remains a standard mdast `blockquote` but receives `data.alert="warning"`; its marker is removed from the first text node so renderers do not display it twice.

---

## Public API

### `parseMarkdown(source)`

```ts
function parseMarkdown(source: string): MarkdownAst;
```

| Parameter | Type     | Behavior                                                                    |
| --------- | -------- | --------------------------------------------------------------------------- |
| `source`  | `string` | Parsed synchronously as CommonMark plus the configured official GFM syntax. |

Each call creates a new mdast root and a new GitHub slugger, so duplicate heading suffixes are deterministic per document. The returned tree retains mdast source positions.

### `UseMarkdown`

```ts
const markdown = new UseMarkdown(source?);
```

| Member              | Type                   | Default    | Behavior                                                    |
| ------------------- | ---------------------- | ---------- | ----------------------------------------------------------- |
| `new UseMarkdown()` | `(source?: string)`    | `""`       | Creates the reactive parser with an optional initial value. |
| `source`            | getter/setter `string` | `""`       | Current source; assignment causes a reactive reparse.       |
| `current`           | readonly `MarkdownAst` | Empty root | Current standard mdast tree with xvelte metadata.           |

### Public types and metadata

```ts
type MarkdownAst = Root;

type MarkdownAlertKind = "note" | "tip" | "important" | "warning" | "caution";
```

The hook augments mdast's public `Data` interface with two optional fields:

| Field       | Type                | Nodes        | Purpose                                                   |
| ----------- | ------------------- | ------------ | --------------------------------------------------------- |
| `headingId` | `string`            | `heading`    | Unique GitHub-style slug derived from plain heading text. |
| `alert`     | `MarkdownAlertKind` | `blockquote` | Parsed GitHub alert marker.                               |

All other node shapes come directly from the [mdast specification](https://github.com/syntax-tree/mdast). Exact Markdown parsing behavior follows the [GitHub Flavored Markdown specification](https://github.github.com/gfm/).

---

## Reactivity and lifecycle

`parseMarkdown` is synchronous, deterministic, environment-independent, and non-reactive. `UseMarkdown.current` is a Svelte derived value over `source`; it requires no browser API, effect, cleanup, or `destroy()` call and is safe during SSR.

Parsing work grows with the complete source. Avoid assigning on every keystroke for unusually large live documents without debouncing. Each parse returns new node objects; do not retain object identity across source replacements.

---

## Accessibility and localization

The hook renders no content and contains no human-readable copy. It preserves source text and structure without deciding semantics beyond the AST. Accessibility and localization belong to the chosen renderer and the Markdown source.

GitHub alert keywords and generated IDs are technical syntax and are not translated. A renderer should localize visible alert titles, preserve heading levels, handle image alternatives, produce usable footnotes, and reject unsafe destinations or raw HTML according to its trust model.

---

## Dependencies

Copy `use-markdown.svelte.ts` and install `github-slugger`, `mdast-util-from-markdown`, `mdast-util-gfm`, and `micromark-extension-gfm` using the commands under Installation. `mdast-util-from-markdown` supplies the typed mdast root; the two GFM packages add GitHub extensions; `github-slugger` generates compatible unique heading IDs.

The hook requires Svelte 5 only for the optional `UseMarkdown` class. The pure `parseMarkdown` function has no browser dependency. No Runed package, CSS, icons, `$lib/utils` exports, components, other hooks, attachments, localization setup, or generated files are required.

---

## File organization

| File                     | Responsibility                                            |
| ------------------------ | --------------------------------------------------------- |
| `use-markdown.svelte.ts` | Exported implementation, types, and public API.           |
| `use-markdown.md`        | Installation, usage, API, behavior, and dependency guide. |

`use-markdown.svelte.ts` and its exported declarations are the source of truth for this hook's public API.

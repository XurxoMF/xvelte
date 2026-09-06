# UseToc

`UseToc` builds a reactive nested hierarchy from the headings inside one element and marks an intersecting heading as active. Use it to power an “On this page” navigation for browser-rendered content. It observes DOM structure and visibility; it does not render the navigation, generate heading IDs, scroll links, or manage history.

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
- [Credits](#credits)
- [File organization](#file-organization)

---

## Installation

Copy `use-toc.svelte.ts` and install Svelte 5 if the project does not already provide it:

```sh
# Bun
bun add -D svelte

# npm
npm install -D svelte

# pnpm
pnpm add -D svelte
```

---

## Import

```svelte
<script lang="ts">
	import { INDEX_ATTRIBUTE, TOC_IGNORE_ATTRIBUTE, UseToc, type Heading, type HeadingKind } from "$lib/hooks/use-toc.svelte";
</script>
```

The file exports `UseToc`, `Heading`, `HeadingKind`, `INDEX_ATTRIBUTE`, and `TOC_IGNORE_ATTRIBUTE`.

---

## Basic usage

```svelte
<script lang="ts">
	import * as TableOfContents from "$lib/components/ui/table-of-contents";
	import { UseToc } from "$lib/hooks/use-toc.svelte";

	const headings = new UseToc();
	let article = $state<HTMLElement>();

	$effect(() => {
		headings.ref = article;
		return () => headings.destroy();
	});
</script>

<div class="grid gap-8 lg:grid-cols-[14rem_1fr]">
	<nav aria-label="On this page">
		<TableOfContents.Root toc={headings.current} />
	</nav>

	<article bind:this={article}>
		<h1 id="overview">Overview</h1>
		<p>Introduction.</p>
		<h2 id="installation">Installation</h2>
		<p>Installation instructions.</p>
	</article>
</div>
```

The Table of Contents component is optional. `headings.current` is a normal reactive `Heading[]` that can be rendered with custom markup.

---

## Examples

### Render a custom flat navigation

```svelte
<nav aria-label="On this page">
	<ul>
		{#each headings.current as heading (heading.index)}
			<li>
				{#if heading.id}
					<a href={`#${heading.id}`} aria-current={heading.active ? "location" : undefined}>{heading.label}</a>
				{:else}
					<span>{heading.label}</span>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
```

This example renders only root headings. Traverse `children` recursively when nested navigation is required.

### Ignore preview or embedded content

```svelte
<section data-toc-ignore>
	<h2>Heading inside an embedded preview</h2>
</section>
```

Any heading whose closest matching ancestor has `data-toc-ignore` is excluded. Import `TOC_IGNORE_ATTRIBUTE` when TypeScript code needs the stable attribute name.

### Observe dynamic content

```svelte
{#if showAdvancedOptions}
	<h2 id="advanced-options">Advanced options</h2>
{/if}
```

Child-list and text mutations rebuild the complete hierarchy and reconnect heading observation. Attribute-only changes, including changing `id` or adding `data-toc-ignore`, are not observed. Reassign `ref` or accompany those changes with an observed content mutation when an immediate rebuild is required.

---

## Public API

### `UseToc`

```ts
const headings = new UseToc();
```

| Member      | Type                                     | Behavior                                                                                                                           |
| ----------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ref`       | getter/setter `HTMLElement \| undefined` | Assigning a container disconnects previous observers, rebuilds its heading tree, and begins mutation and intersection observation. |
| `current`   | getter `Heading[]`                       | Current reactive nested hierarchy.                                                                                                 |
| `destroy()` | `() => void`                             | Disconnects both observers, removes retained DOM references, clears `ref`, and replaces `current` with an empty array.             |

Assigning `undefined` to `ref` also disconnects observers and clears the hierarchy. Reassigning the same element forces a fresh rebuild.

### `Heading`

```ts
type HeadingKind = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type Heading = {
	index: number;
	ref: HTMLHeadingElement;
	kind: HeadingKind;
	id?: string | undefined;
	level: number;
	label: string;
	active: boolean;
	children: Heading[];
};
```

| Field      | Behavior                                                                              |
| ---------- | ------------------------------------------------------------------------------------- |
| `index`    | Zero-based document-order index written back to the element through `data-toc-index`. |
| `ref`      | Retained native heading element.                                                      |
| `kind`     | Lowercase heading tag from `h1` through `h6`.                                         |
| `id`       | Existing element ID, or `undefined`; the hook never generates one.                    |
| `level`    | Numeric level from `1` through `6`.                                                   |
| `label`    | Current `innerText` captured during the latest rebuild.                               |
| `active`   | Whether this heading is the selected intersecting heading.                            |
| `children` | Later headings nested beneath this one according to document order and heading level. |

Skipped heading levels are accepted. A heading becomes a child of the most recent preceding heading with a lower level; otherwise it remains at the root.

### Constants

| Export                 | Value               | Purpose                                                                 |
| ---------------------- | ------------------- | ----------------------------------------------------------------------- |
| `INDEX_ATTRIBUTE`      | `"data-toc-index"`  | Attribute written to each included heading for observer lookup.         |
| `TOC_IGNORE_ATTRIBUTE` | `"data-toc-ignore"` | Attribute an app places on a heading or ancestor subtree to exclude it. |

---

## Reactivity and lifecycle

Assigning `ref` creates one `MutationObserver` and one `IntersectionObserver`. The mutation observer watches descendant child-list and text changes, rebuilds the hierarchy, clears saved visibility ratios, and observes every current heading again.

The intersection observer stores the latest ratio for changed headings, keeps entries with a ratio above zero, sorts them by their viewport `top` coordinate, and activates the first result. If no heading is intersecting, the previous active value remains. It uses the browser's default observer root, root margin, and thresholds.

The hook writes `data-toc-index` to included headings. `destroy()` disconnects observers but does not remove those attributes from the DOM. Always call `destroy()` when the owning scope ends. The hook is browser-only once a DOM element is assigned and should be initialized from component code rather than a server module.

---

## Accessibility and localization

The hook renders no markup and provides no navigation semantics. Wrap the rendered links in a labelled `<nav>`, preserve a meaningful document heading hierarchy, use stable unique IDs for linkable headings, and expose active state appropriately when the chosen design needs it.

Labels come from each heading's rendered `innerText`, so translated headings automatically produce translated TOC labels. The hook has no built-in copy or localization messages. The navigation's accessible label and any empty state belong to your app.

Active state does not move focus, update the URL, announce changes, or scroll the page. Standard anchor behavior and any enhanced navigation remain the renderer's responsibility.

---

## Dependencies

Copy `use-toc.svelte.ts` and install Svelte using the shared command under Installation. It uses Svelte's reactive `SvelteMap` plus the browser's `MutationObserver` and `IntersectionObserver`; no polyfill is included.

No Runed package, CSS, theme variables, icons, `$lib/utils` exports, attachments, contexts, or localization setup are required. To use the optional visual renderer, copy `$lib/components/ui/table-of-contents` and follow that component's unit guide for its own installation and API.

---

## Credits

`UseToc` is adapted from [shadcn-svelte-extras UseToc](https://shadcn-svelte-extras.com/docs/hooks/use-toc).

The API, behavior, and limitations in this guide describe the local xvelte implementation.

---

## File organization

| File                | Responsibility                                            |
| ------------------- | --------------------------------------------------------- |
| `use-toc.svelte.ts` | Exported implementation, types, and public API.           |
| `use-toc.md`        | Installation, usage, API, behavior, and dependency guide. |

`use-toc.svelte.ts` and its exported declarations are the source of truth for this hook's public API.

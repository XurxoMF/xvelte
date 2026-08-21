# Table of Contents

A recursive list of document headings with active-heading styling. It is designed to consume the reactive hierarchy produced by the colocated public `UseToc` hook, link headings that have IDs, indent nested levels, and update as observed document content changes.

Use Table of Contents for long structured articles or documentation. Do not add it to short pages, and do not rely on it to repair missing heading hierarchy or IDs in the source document.

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

Import the renderer and hook separately from their public locations:

```svelte
<script lang="ts">
	import * as TableOfContents from "$lib/components/ui/table-of-contents";
	import { UseToc } from "$lib/hooks/use-toc.svelte";
</script>
```

The component's `index.ts` exports `Root` and `RootProps`. The hook file exports `UseToc`, `Heading`, `HeadingKind`, `INDEX_ATTRIBUTE`, and `TOC_IGNORE_ATTRIBUTE`.

---

## Anatomy

`UseToc` observes one content container and produces the hierarchy consumed by Root:

```text
UseToc.ref → article element
UseToc.current → Heading[]
TableOfContents.Root toc={hook.current}
└── recursive ul/li/a markup
```

Root recursively renders itself for `Heading.children`. `isChild` controls indentation and is normally used only by that internal recursion.

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

	<article bind:this={article} class="space-y-6">
		<h1 id="overview">Overview</h1>
		<p>Introduction.</p>
		<h2 id="installation">Installation</h2>
		<p>Installation instructions.</p>
		<h2 id="usage">Usage</h2>
		<p>Usage instructions.</p>
	</article>
</div>
```

Only headings with an `id` become links. All headings still appear as text.

---

## Examples

### Ignore a subtree

```svelte
<section data-toc-ignore>
	<h2>Modal preview heading</h2>
	<p>This heading is not added to the table of contents.</p>
</section>
```

Any heading whose closest ancestor has `data-toc-ignore` is excluded. Import `TOC_IGNORE_ATTRIBUTE` when another helper needs the exact attribute name in TypeScript.

### Dynamic content

```svelte
{#if advanced}
	<h2 id="advanced-options">Advanced options</h2>
{/if}
```

The hook's MutationObserver rebuilds the complete hierarchy when descendant elements or text change. It re-observes all current headings automatically.

### Custom active styling

```svelte
<TableOfContents.Root toc={headings.current} class="[&_li]:text-xs [&_li.text-foreground]:font-semibold" />
```

The root class merges onto each recursive Root only when passed there; internally created child Roots receive only `isChild` and `toc`, so broad descendant selectors are useful for one-pass customization.

### Manual heading data

```svelte
<script lang="ts">
	import type { Heading } from "$lib/hooks/use-toc.svelte";

	const toc: Heading[] = [
		{
			index: 0,
			ref: document.querySelector("#summary") as HTMLHeadingElement,
			kind: "h2",
			id: "summary",
			level: 2,
			label: "Summary",
			active: true,
			children: []
		}
	];
</script>
```

Manual construction is browser-only because `Heading.ref` is a real DOM element. Prefer UseToc for normal use.

---

## Public API

The component and hook are local xvelte code. The component's `index.ts`, exported `RootProps`, and public hook file are the source of truth.

### `TableOfContents.Root`

| Prop      | Type                       | Default  | Behavior                                                              |
| --------- | -------------------------- | -------- | --------------------------------------------------------------------- |
| `toc`     | `Heading[]`                | Required | Reactive heading hierarchy to render.                                 |
| `isChild` | `boolean`                  | `false`  | Adds left padding to a nested recursive list.                         |
| `ref`     | `HTMLUListElement \| null` | `null`   | Bindable current Root list. It does not collect recursive child refs. |
| `class`   | `string`                   | —        | Merges after root list typography and spacing.                        |

Root forwards native `<ul>` attributes. Each Heading renders one `<li>`; an ID produces `<a href="#id">`, while a missing ID produces plain text. Children produce another Root immediately after the heading list item.

### `UseToc`

| Member      | Type                                     | Behavior                                                                                                                                      |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `ref`       | getter/setter `HTMLElement \| undefined` | Assigning a container tears down old observers, rebuilds headings, and begins Mutation/Intersection observation. Clearing it empties the TOC. |
| `current`   | getter `Heading[]`                       | Reactive nested hierarchy for Root.                                                                                                           |
| `destroy()` | method                                   | Disconnects observers, removes retained container state, and clears headings.                                                                 |

The hook queries descendant `h1`–`h6`, ignores excluded subtrees, writes `data-toc-index` to every included heading, derives labels from `innerText`, and nests by heading level/document order. IntersectionObserver marks the currently visible heading closest to the viewport top. If no observed heading is visible, the previously active heading remains active.

### Public types and constants

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

INDEX_ATTRIBUTE = "data-toc-index";
TOC_IGNORE_ATTRIBUTE = "data-toc-ignore";
```

---

## Styling and DOM contract

- Root hook: `data-slot="table-of-contents"` on every recursive `<ul>`.
- Root typography: small medium text with list markers removed.
- Nested Roots: `pl-4` when `isChild=true`.
- Items: top padding, muted text, transition; active Item receives `text-foreground`.
- Links: block layout and foreground hover color.
- Observed headings: hook-owned `data-toc-index="number"` mutation.
- Ignored content: app-owned `data-toc-ignore` marker.

Root classes pass through `cn()`. Items and links do not expose separate props or slots.

---

## Accessibility

Wrap Root in a labelled `<nav>` as shown. Every link target needs a stable unique ID, and the document must maintain a meaningful heading hierarchy independently of the generated navigation.

The current recursive implementation renders each child `<ul>` as a sibling immediately after its parent `<li>`, rather than nesting it inside that `<li>`. That is not strict valid list structure and may be announced inconsistently by assistive technology. If strict nested-list semantics are required, revise the component markup before production use; this README documents rather than conceals the current local behavior.

Active styling is visual only and does not set `aria-current`. Smooth scrolling, focus movement, URL history behavior, and sticky positioning remain app/browser responsibilities.

---

## Localization

Table of Contents and UseToc contain no built-in copy and require no localization messages. Labels are copied directly from rendered heading `innerText`, so translated document headings automatically produce translated entries. The surrounding navigation label must be translated by the app.

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

IntersectionObserver, MutationObserver, and Svelte's reactive collections are platform/framework features; no observer package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted-foreground: var(--muted-foreground);
}
```

Values may be replaced by the app's theme. No keyframe, custom variant, font, or global layout rule is required.

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

### Required public hook

Copy `src/lib/hooks/use-toc.svelte.ts` with its complete content:

```ts
import { SvelteMap } from "svelte/reactivity";

export type HeadingKind = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type Heading = {
	index: number;
	ref: HTMLHeadingElement;
	kind: HeadingKind;
	id?: string | undefined;
	level: number;
	label: string;
	active: boolean;
	children: Heading[];
};

export const INDEX_ATTRIBUTE = "data-toc-index";
export const TOC_IGNORE_ATTRIBUTE = "data-toc-ignore";

/** Builds a reactive heading tree and tracks the first visible heading. */
export class UseToc {
	#ref = $state<HTMLElement>();
	#toc = $state<Heading[]>([]);
	#cleanup?: (() => void) | undefined;

	/** Element whose descendant headings should populate the table of contents. */
	set ref(ref: HTMLElement | undefined) {
		this.#teardown();
		this.#ref = ref;
		if (!ref) {
			this.#toc = [];
			return;
		}

		const visibility = new SvelteMap<Element, number>();

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) visibility.set(entry.target, entry.intersectionRatio);

			const active = [...visibility]
				.filter((entry) => entry[1] > 0)
				.sort((a, b) => a[0].getBoundingClientRect().top - b[0].getBoundingClientRect().top)[0];

			if (!active) return;

			setActive(this.#toc, Number(active[0].getAttribute(INDEX_ATTRIBUTE)));
		});

		const refresh = () => {
			observer.disconnect();
			visibility.clear();
			this.#toc = getToc(ref);
			visit(this.#toc, (heading) => observer.observe(heading.ref));
		};

		const mutations = new MutationObserver(refresh);
		mutations.observe(ref, { childList: true, characterData: true, subtree: true });
		refresh();

		this.#cleanup = () => {
			mutations.disconnect();
			observer.disconnect();
		};
	}

	/** Currently observed heading container. */
	get ref() {
		return this.#ref;
	}

	/** Current reactive heading hierarchy. */
	get current() {
		return this.#toc;
	}

	/** Disconnects observers and clears all retained DOM and heading references. */
	destroy() {
		this.#teardown();
		this.#ref = undefined;
		this.#toc = [];
	}

	/** Disconnects observers created for the previously assigned element. */
	#teardown() {
		this.#cleanup?.();
		this.#cleanup = undefined;
	}
}

function createHeading(element: HTMLHeadingElement, index: number): Heading {
	const kind = element.tagName.toLowerCase() as HeadingKind;
	element.setAttribute(INDEX_ATTRIBUTE, index.toString());
	return {
		index,
		ref: element,
		kind,
		id: element.id || undefined,
		level: Number(kind[1]),
		label: element.innerText,
		active: false,
		children: []
	};
}

function getToc(element: HTMLElement): Heading[] {
	const headings = [...element.querySelectorAll<HTMLHeadingElement>("h1, h2, h3, h4, h5, h6")]
		.filter((heading) => heading.closest(`[${TOC_IGNORE_ATTRIBUTE}]`) === null)
		.map(createHeading);

	const root: Heading[] = [];
	const stack: Heading[] = [];

	for (const heading of headings) {
		while (stack.length > 0 && stack.at(-1)!.level >= heading.level) stack.pop();
		const parent = stack.at(-1);
		(parent?.children ?? root).push(heading);
		stack.push(heading);
	}

	return root;
}

function visit(headings: Heading[], callback: (heading: Heading) => void) {
	for (const heading of headings) {
		callback(heading);
		visit(heading.children, callback);
	}
}

function setActive(headings: Heading[], index: number) {
	visit(headings, (heading) => {
		heading.active = heading.index === index;
	});
}
```

The copied code above is the complete required hook implementation.

### Component files and other integration

```text
table-of-contents/
├── index.ts
└── table-of-contents-root.svelte
```

The hook requires a browser DOM and observers; instantiate it during component initialization and assign its element after mount through reactive binding. No icon, other xvelte component, attachment, context, localization setup, shared style, image, font, or network service is required.

---

## Credits

The component and hook design are adapted from [shadcn-svelte-extras Table of Contents](https://www.shadcn-svelte-extras.com/docs/components/toc).

---

## File organization

| File                            | Responsibility                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `table-of-contents-root.svelte` | Recursive list/link rendering, indentation, active color, native props, and ref.          |
| `index.ts`                      | Public component and props type.                                                          |
| `$lib/hooks/use-toc.svelte.ts`  | Public heading discovery, hierarchy, DOM observation, active state, constants, and types. |
| `README.md`                     | Hook setup, composition, examples, API, limitations, styling, and installation guide.     |

The component's `index.ts`, `RootProps`, and public hook exports are the source of truth.

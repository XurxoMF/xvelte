# Code Block

A composable block for source code, terminal output, logs, and diffs. It supports optional headers and footers, floating actions, clean copy controls, wrapping, line numbers, custom starting lines, highlighted or diff rows, compact sizing, destructive output, streaming-friendly plain text, and optional syntax highlighting through `useHighlightedCode`.

Use Code Block when whitespace, line structure, copying, scrolling, or syntax color matters. Use `Typography.InlineCode` for a short fragment inside prose. Code Block does not execute code, download files, choose a language, or sanitize application-provided snippets.

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
	import * as CodeBlock from "$lib/components/ui/code-block";
</script>
```

The component's `index.ts` exports `Root`, `Header`, `Title`, `Actions`, `CopyButton`, `Content`, `Line`, and `Footer`, with a named props type for every part. It also exports `RootVariants`, `RootSizes`, `LineVariants`, `LineToken`, `rootVariants`, and `lineVariants`.

Syntax highlighting is optional and lives in its own public hook:

```ts
import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";
```

---

## Anatomy

```text
CodeBlock.Root
├── CodeBlock.Header
│   ├── CodeBlock.Title
│   └── CodeBlock.Actions
│       └── CodeBlock.CopyButton
├── CodeBlock.Actions (floating when it is a direct Root child)
├── CodeBlock.Content
│   └── CodeBlock.Line
└── CodeBlock.Footer
```

`Content` accepts one plain `code` string or child `Line` parts. Use the string form for inexpensive streaming or simple output. Use `Line` when individual rows need syntax tokens, highlighting, added/removed states, or custom content.

---

## Basic usage

```svelte
<script lang="ts">
	import * as CodeBlock from "$lib/components/ui/code-block";

	const output = `$ bun run check
Checked 142 files
No errors found`;
</script>

<CodeBlock.Root>
	<CodeBlock.Header>
		<CodeBlock.Title>Terminal</CodeBlock.Title>
		<CodeBlock.Actions>
			<CodeBlock.CopyButton value={output} />
		</CodeBlock.Actions>
	</CodeBlock.Header>

	<CodeBlock.Content code={output} />
</CodeBlock.Root>
```

`Content` is left-to-right and keyboard scrollable. Header content follows the surrounding document direction.

---

## Examples

### Syntax highlighting with any bundled language

`useHighlightedCode` accepts every language and alias included in the installed Shiki version. Each grammar loads only when first requested. Unknown names and `text`, `plaintext`, `txt`, or `plain` remain readable plain text.

```svelte
<script lang="ts">
	import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";

	import * as CodeBlock from "$lib/components/ui/code-block";

	const source = `function greet(name: string) {
	return \`Hello, \${name}!\`;
}`;

	const lines = useHighlightedCode(
		() => source,
		() => "typescript"
	);
</script>

<CodeBlock.Root>
	<CodeBlock.Content lineNumbers>
		{#each lines.current as line, index (index)}
			<CodeBlock.Line code={line} />
		{/each}
	</CodeBlock.Content>
</CodeBlock.Root>
```

Aliases such as `ts`, `js`, `py`, `sh`, and `yml` resolve through Shiki's bundled registry rather than a manually maintained xvelte list. ANSI terminal output is supported with `ansi`.

### Floating copy action

Place `Actions` directly inside Root when there is no Header. It appears on hover, focus within, and coarse-pointer devices.

```svelte
<CodeBlock.Root>
	<CodeBlock.Actions>
		<CodeBlock.CopyButton value={output} />
	</CodeBlock.Actions>
	<CodeBlock.Content code={output} />
</CodeBlock.Root>
```

### Line numbers and a custom start

```svelte
<CodeBlock.Root>
	<CodeBlock.Content code={source} lineNumbers startLine={120} />
</CodeBlock.Root>
```

When `lineNumbers` is true, a plain string is split into `Line` parts so CSS counters can number each row. The counters and diff markers are not part of the selectable code text.

### Highlighted lines and diffs

```svelte
<CodeBlock.Root>
	<CodeBlock.Content lineNumbers>
		<CodeBlock.Line code="const retries = 2;" variant="removed" />
		<CodeBlock.Line code="const retries = 3;" variant="added" />
		<CodeBlock.Line code="await connect();" variant="highlighted" />
	</CodeBlock.Content>
</CodeBlock.Root>
```

`added` and `removed` add visual `+` and `−` markers. Do not rely on those markers or color alone when the distinction must be announced; add a visible or assistive explanation.

### Wrapping, bounded height, and compact output

```svelte
<CodeBlock.Root size="sm" variant="destructive">
	<CodeBlock.Content code={errorOutput} wrap class="max-h-64" />
	<CodeBlock.Footer>Command exited with status 1.</CodeBlock.Footer>
</CodeBlock.Root>
```

Long lines scroll horizontally by default. `wrap` allows the content to wrap and enables vertical scroll fades when a maximum height creates overflow.

### Reactive and streaming source

```svelte
<CodeBlock.Root>
	<CodeBlock.Content code={streamedOutput} />
</CodeBlock.Root>
```

A plain string renders as one text node. With `useHighlightedCode`, complete appended lines reuse their previous tokens and only the active final line is tokenized again.

---

## Public API

The component's `index.ts` and exported types are the source of truth.

### `CodeBlock.Root`

Type: `RootProps`, based on native `div` attributes and `WithElementRef`.

| Prop             | Type                         | Default     | Behavior                                                            |
| ---------------- | ---------------------------- | ----------- | ------------------------------------------------------------------- |
| `variant`        | `"default" \| "destructive"` | `"default"` | Selects the normal or danger-token border and foreground treatment. |
| `size`           | `"default" \| "sm"`          | `"default"` | Changes text, spacing, title, icon, and floating-action density.    |
| `children`       | `Snippet`                    | `undefined` | Renders the composed public parts.                                  |
| `ref`            | `HTMLDivElement \| null`     | `null`      | Bindable outer container.                                           |
| `class`          | `string`                     | `undefined` | Merged after `rootVariants`.                                        |
| Native div props | Varies                       | —           | Remaining attributes and events are forwarded.                      |

`rootVariants` accepts `variant` and an optional `class` and returns only the root classes. `RootVariants` and `RootSizes` expose the corresponding option types.

### `CodeBlock.Header`, `Title`, `Actions`, and `Footer`

Each part accepts native `div` attributes, `children`, `class`, and a bindable `HTMLDivElement` `ref`.

| Part and type              | Local behavior                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `Header` — `HeaderProps`   | Horizontal metadata row with root-aware spacing and destructive text.                      |
| `Title` — `TitleProps`     | Truncated title with fixed icon sizing; may be wrapped in a link.                          |
| `Actions` — `ActionsProps` | Action row; becomes a floating, reveal-on-interaction overlay only as a direct Root child. |
| `Footer` — `FooterProps`   | Muted trailing row with root-aware spacing.                                                |

These parts do not impose headings, labels, links, or buttons. Supply semantic content appropriate to the surrounding interface.

### `CodeBlock.CopyButton`

Type: `CopyButtonProps`, based on xvelte Button props with its click handler adapted.

| Prop         | Type                          | Default     | Behavior                                                |
| ------------ | ----------------------------- | ----------- | ------------------------------------------------------- |
| `value`      | `string`                      | Required    | Exact text written through the Clipboard API.           |
| `variant`    | Button variant                | `"ghost"`   | Forwarded to Button.                                    |
| `size`       | Button size                   | `"icon-xs"` | Forwarded to Button.                                    |
| `onclick`    | `(event: MouseEvent) => void` | `undefined` | Runs before the component starts copying.               |
| `aria-label` | `string`                      | Localized   | Overrides the localized Copy/Code copied state label.   |
| `ref`        | `HTMLButtonElement \| null`   | `null`      | Bindable Button element.                                |
| Button props | Varies                        | —           | Remaining Button and native button props are forwarded. |

Successful copying sets `data-copied` for two seconds, changes CopyIcon to CheckIcon, updates the accessible name, and announces the localized success message through a polite live region. Clipboard failure leaves the normal state unchanged.

### `CodeBlock.Content`

Type: `ContentProps`, based on native `pre` attributes.

| Prop          | Type                     | Default     | Behavior                                                                                   |
| ------------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------ |
| `code`        | `string`                 | `undefined` | Renders plain text and ignores `children`; splits it into lines when numbering is enabled. |
| `children`    | `Snippet`                | `undefined` | Normally renders `Line` parts when `code` is absent.                                       |
| `wrap`        | `boolean`                | `false`     | Wraps long content instead of requiring horizontal scrolling.                              |
| `lineNumbers` | `boolean`                | `false`     | Adds CSS counters without changing copied source.                                          |
| `startLine`   | `number`                 | `1`         | Initial counter value when line numbers are enabled.                                       |
| `tabindex`    | `number`                 | `0`         | Keeps overflow keyboard scrollable; may be overridden.                                     |
| `style`       | Native style value       | `undefined` | Appended after the internal counter reset declaration.                                     |
| `ref`         | `HTMLPreElement \| null` | `null`      | Bindable scrolling `pre` element.                                                          |
| `class`       | `string`                 | `undefined` | Merged after spacing, scrolling, wrapping, and typography classes.                         |

Content always sets `dir="ltr"`; remaining native `pre` attributes and events are forwarded.

### `CodeBlock.Line`

Type: `LineProps`, based on native `span` attributes.

| Prop       | Type                                                 | Default     | Behavior                                                              |
| ---------- | ---------------------------------------------------- | ----------- | --------------------------------------------------------------------- |
| `code`     | `string \| LineToken[]`                              | `undefined` | Plain source or highlighted tokens; ignores `children` when supplied. |
| `variant`  | `"default" \| "added" \| "removed" \| "highlighted"` | `"default"` | Applies ordinary, diff, or highlighted presentation.                  |
| `children` | `Snippet`                                            | `undefined` | Custom line content when `code` is absent.                            |
| `ref`      | `HTMLSpanElement \| null`                            | `null`      | Bindable outer line element.                                          |
| `class`    | `string`                                             | `undefined` | Merged after `lineVariants`.                                          |

An empty string or empty token list renders an internal newline so selected text preserves blank rows. `LineToken` contains `content` plus optional inline `style` and `class`; `HighlightedToken` from `useHighlightedCode` is structurally compatible. `lineVariants` and `LineVariants` expose the styling options.

---

## Styling and DOM contract

| Part        | Stable hook or state                                                        |
| ----------- | --------------------------------------------------------------------------- |
| Root        | `data-slot="code-block"`, `data-variant`, `data-size`                       |
| Header      | `data-slot="code-block-header"`                                             |
| Title       | `data-slot="code-block-title"`                                              |
| Actions     | `data-slot="code-block-actions"`                                            |
| Copy button | `data-slot="code-block-copy-button"`, `data-copied`                         |
| Content     | `data-slot="code-block-content"`, `data-wrap`, `data-numbered`, `dir="ltr"` |
| Inner code  | `data-slot="code-block-code"`                                               |
| Line        | `data-slot="code-block-line"`, `data-variant`                               |
| Line text   | `data-slot="code-block-line-content"`                                       |
| Footer      | `data-slot="code-block-footer"`                                             |

Root uses semantic `input`, `foreground`, `ring`, `danger`, `muted`, `background`, and muted-foreground styling. Supplied classes are merged with `cn()` on every part. The root owns focus-within border and ring treatment because Content suppresses its native outline.

Content uses xvelte's shared `scroll-fade-x` utility and adds `scroll-fade-y` while wrapping. Syntax-token colors are inline Shiki variables switched by the app's `.dark` ancestor. The highlighting hook does not emit HTML or use `{@html}`.

---

## Accessibility

- Content is semantic `pre > code`, left-to-right, selectable, and keyboard scrollable by default.
- Give Header titles enough context to identify the source, command, file, or output. `Title` is a visual `div`, not a heading.
- CopyButton has localized state-dependent names and a polite success announcement. Keep it reachable and visible on focus.
- Line numbers and diff markers are generated outside the selectable line content. They are presentational; add text when line or diff state carries essential meaning.
- Destructive styling does not add an alert role or announcement. Use Alert or an appropriate live region for urgent runtime feedback.
- Preserve whitespace when it is meaningful. Enable wrapping only when horizontal structure is not essential.
- The syntax hook initially returns plain text and enhances it after Shiki loads, so source remains present during SSR and without grammar loading.

---

## Localization

| Message ID          | English default | Used by                                          |
| ------------------- | --------------- | ------------------------------------------------ |
| `early_swan_copy`   | `Copy code`     | Default CopyButton accessible name.              |
| `calm_heron_copied` | `Code copied`   | Success accessible name and polite announcement. |

`aria-label` overrides the state-dependent button name. Applications supply and translate titles, filenames, terminal labels, footer explanations, diff descriptions, and surrounding instructions. Source code, language identifiers, variants, and `data-*` values are technical content.

---

## Dependencies

### Packages

Code Block itself uses Button, Tailwind Variants, Tabler icons, and the shared helpers. The optional syntax hook adds Shiki.

```sh
# Bun
bun add shiki tailwind-variants @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss @inlang/paraglide-js

# npm
npm install shiki tailwind-variants @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss @inlang/paraglide-js

# pnpm
pnpm add shiki tailwind-variants @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss @inlang/paraglide-js
```

Omit `shiki` when the app renders only plain `Content.code` or application-owned `Line` values and does not copy `use-highlighted-code.svelte.ts`.

### Required xvelte component and shared style

Copy the complete Button folder and follow its `button.md` guide:

```text
button/
├── button-root.svelte
├── button.md
└── index.ts
```

Copy `src/lib/styles/scroll-fade.css` and `scroll-fade.md`, follow that guide, and import the style from the global application stylesheet:

```css
@import "../lib/styles/scroll-fade.css";
```

For syntax highlighting, also copy `src/lib/hooks/use-highlighted-code.svelte.ts` and `use-highlighted-code.md` and follow the hook guide. Code Block needs no attachment, context module, image, font, or network service.

### Icons

Add these semantic exports to `$lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as CopyIcon } from "@tabler/icons-svelte/icons/copy";
```

### Shared utilities

Add these exports to `$lib/utils`:

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

### Theme and global focus

The application theme must expose the semantic colors used by Code Block and Button. These are representative light values; replace them with the app's palette and define dark values under its theme selector:

```css
:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--danger: oklch(0.577 0.245 27.325);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-danger: var(--danger);
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

Add the two localization messages listed above to `messages/en.json` and compile Paraglide. The app owns dark-mode activation; the syntax hook reads the existing `.dark` ancestor used by xvelte.

---

## Credits

Code Block is adapted from [shadcn-svelte Code Block](https://www.shadcn-svelte.com/docs/components/code-block). The local implementation adds xvelte namespaces, named props types, semantic danger tokens, Tabler icon aliases, Paraglide copy feedback, the shared Scroll Fade utility, and dynamic access to every bundled Shiki language and alias.

---

## File organization

| File                            | Responsibility                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `code-block-root.svelte`        | Root variants, size and variant state, focus treatment, and composition container. |
| `code-block-header.svelte`      | Optional metadata and action row.                                                  |
| `code-block-title.svelte`       | Truncated title and icon treatment.                                                |
| `code-block-actions.svelte`     | Inline or floating action layout.                                                  |
| `code-block-copy-button.svelte` | Clipboard action, localized state, icons, and live announcement.                   |
| `code-block-content.svelte`     | Semantic pre/code structure, scrolling, wrapping, numbering, and string rendering. |
| `code-block-line.svelte`        | Plain or tokenized lines, blank-line preservation, diff states, and line variants. |
| `code-block-footer.svelte`      | Optional trailing metadata row.                                                    |
| `index.ts`                      | Every public part, props type, option type, and variant helper.                    |
| `code-block.md`                 | Usage, API, contracts, dependencies, accessibility, and installation guide.        |

The component's `index.ts` and exported types are the source of truth for the public API.

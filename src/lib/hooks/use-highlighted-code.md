# UseHighlightedCode

`useHighlightedCode` reactively converts source into plain or syntax-highlighted lines for xvelte Code Block. It resolves every language and alias bundled with the installed Shiki version, loads only the requested grammar, supports ANSI output, preserves readable plain text for unknown names, and reuses complete line tokens while source streams.

Use it when Code Block needs client-side syntax color or incrementally arriving highlighted output. Do not use it when plain Code Block content is sufficient or when highlighted HTML must be generated entirely on the server.

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

Copy `use-highlighted-code.svelte.ts` and install Shiki:

```sh
# Bun
bun add shiki
bun add -D svelte

# npm
npm install shiki
npm install -D svelte

# pnpm
pnpm add shiki
pnpm add -D svelte
```

---

## Import

```ts
import { useHighlightedCode, type HighlightedLine, type HighlightedToken } from "$lib/hooks/use-highlighted-code.svelte";
```

---

## Basic usage

```svelte
<script lang="ts">
	import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";

	import * as CodeBlock from "$lib/components/ui/code-block";

	const source = `const answer: number = 42;`;
	const lines = useHighlightedCode(
		() => source,
		() => "typescript"
	);
</script>

<CodeBlock.Root>
	<CodeBlock.Content>
		{#each lines.current as line, index (index)}
			<CodeBlock.Line code={line} />
		{/each}
	</CodeBlock.Content>
</CodeBlock.Root>
```

`current` initially contains strings so the source remains visible. After the grammar loads, it contains token arrays compatible with `CodeBlock.Line.code`.

---

## Examples

### Reactive language

```svelte
<script lang="ts">
	let language = $state("svelte");
	let source = $state("<h1>Hello</h1>");

	const lines = useHighlightedCode(
		() => source,
		() => language
	);
</script>
```

Changing either getter updates `current`. A previously loaded grammar stays cached in the shared Shiki instance.

### Any bundled language or alias

Pass canonical Shiki names such as `typescript`, `python`, or `rust`, or aliases such as `ts`, `py`, or `rs`. Resolution uses Shiki's bundled registries, so availability follows the installed stable Shiki version instead of a fixed xvelte allow-list.

Unknown identifiers and `text`, `plaintext`, `txt`, or `plain` produce ordinary string lines. The hook never constructs an import path from the requested value.

### ANSI terminal output

```ts
const lines = useHighlightedCode(
	() => terminalOutput,
	() => "ansi"
);
```

ANSI rows are tokenized independently so streamed color sequences do not make earlier rows change.

### Streaming

```ts
let output = $state("");
const lines = useHighlightedCode(
	() => output,
	() => "json"
);

output += chunk;
```

When new text extends the previous value, complete lines retain their existing tokens. Only newly completed lines and the current final line are tokenized. Replacing or editing earlier source resets the incremental cache safely.

---

## Public API

### `useHighlightedCode(value, language)`

```ts
function useHighlightedCode(
	value: () => string,
	language: () => string
): {
	readonly current: HighlightedLine[];
};
```

| Parameter  | Type           | Purpose                                                           |
| ---------- | -------------- | ----------------------------------------------------------------- |
| `value`    | `() => string` | Reactive getter for the complete source or output.                |
| `language` | `() => string` | Reactive Shiki language, alias, `ansi`, or plain-text identifier. |

The returned object's `current` getter is reactive. Each entry corresponds to one displayed source line.

### Public types

```ts
type HighlightedToken = {
	content: string;
	style?: string | undefined;
	class?: string | undefined;
};

type HighlightedLine = string | HighlightedToken[];
```

Tokens carry Shiki's inline CSS variables and a class that selects light or dark token colors. They are structurally compatible with xvelte's `CodeBlock.LineToken`.

---

## Reactivity and lifecycle

The hook uses a Svelte effect to resolve the active grammar and a derived value to tokenize current source. Stale asynchronous loads are ignored after a language change or component destruction.

One module-level Shiki instance is shared by all hook consumers. Grammar loads are cached by normalized requested name, concurrent requests share the same promise, and a failed load is removed so a later render can retry. The JavaScript regular-expression engine uses forgiving mode and does not load WASM.

The server and initial client render return plain strings because grammar loading is asynchronous. Highlighted tokens replace them after initialization without inserting HTML. A trailing newline is omitted as an extra visual row, matching Code Block's rendering contract.

---

## Accessibility and localization

The hook renders no DOM and contains no human-readable copy. It preserves the source as strings before highlighting, so syntax color is progressive decoration rather than the only representation of content.

Do not use token color alone to communicate errors, additions, deletions, or required actions. Code Block or the surrounding application owns semantics, focus, labels, copying, announcements, and translations. Language names, aliases, theme IDs, and token styles are technical values and are not localized.

---

## Dependencies

The hook requires Svelte 5 runes and `shiki`. Shiki supplies its core, JavaScript engine, bundled language loaders and aliases, and the `github-light` and `github-dark` themes through public subpath exports.

No `$lib/utils` export, icon, component, attachment, context module, localization setup, CSS variable, global stylesheet, font, image, WASM file, or network service is required. Code Block is an optional renderer; another component may consume the exported line shape.

---

## Credits

The streaming tokenization approach is adapted from the hook installed by [shadcn-svelte Code Block](https://www.shadcn-svelte.com/docs/components/code-block). xvelte extends its fixed language list to Shiki's complete bundled language and alias registries.

---

## File organization

| File                             | Responsibility                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `use-highlighted-code.svelte.ts` | Language resolution, shared highlighter, lazy grammar loading, streaming tokenization, and exported API. |
| `use-highlighted-code.md`        | Installation, usage, API, lifecycle, dependencies, and limitations.                                      |

`use-highlighted-code.svelte.ts` and its exported declarations are the source of truth for this hook.

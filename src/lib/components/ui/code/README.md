# Code

A composable code block that highlights source with Shiki, automatically resolves bundled languages and aliases, loads each grammar only when requested, and supports light and dark themes, line numbers and highlighted lines, two-axis Scroll Area controls, copying, visual variants, and expandable overflow.

Use Code for examples, documentation, configuration, commands, and other preformatted source. Use plain `<code>` for a short inline fragment, and do not use this client-rendered component when highlighted markup must be present in server-rendered HTML before JavaScript runs.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Code from "$lib/components/ui/code";
</script>
```

Code's `index.ts` exports `Root`, `CopyButton`, `Overflow`, their props types, `LanguageLoader`, `PlainTextLanguage`, `CodeVariant`, and the `codeVariants` styling function.

## Anatomy

`Root` owns the source, language loading, highlighting, Scroll Area, and shared context. Place `CopyButton` inside it so the button can copy the same source:

```svelte
<Code.Root code={source} lang="typescript">
	<Code.CopyButton tabindex={0} />
</Code.Root>
```

`Root` renders Scroll Area's outer root, its viewport, and both scrollbar axes. Highlighted code lives inside the viewport, while `children` render directly under the Scroll Area root so positioned controls such as `CopyButton` remain fixed when code scrolls.

Wrap the root in `Overflow` when a long block should start collapsed:

```svelte
<Code.Overflow>
	<Code.Root code={source} lang="typescript">
		<Code.CopyButton tabindex={0} />
	</Code.Root>
</Code.Overflow>
```

`CopyButton` must be a descendant of `Root`. `Overflow` does not consume Code context and may wrap the complete block.

## Basic usage

```svelte
<script lang="ts">
	import * as Code from "$lib/components/ui/code";

	const source = `function greet(name: string) {
	return \`Hello, \${name}!\`;
}`;
</script>

<Code.Root code={source} lang="typescript" />
```

Code resolves `typescript` through Shiki's lazy bundled registry. The grammar remains a separate chunk, loads on first use, and is reused by later TypeScript blocks. `code` remains required because it is the source passed to Shiki and copied by `CopyButton`.

## Examples

### Any bundled Shiki language

Pass any canonical name or alias from the [Shiki language catalog](https://shiki.style/languages):

```svelte
<script lang="ts">
	import * as Code from "$lib/components/ui/code";

	const source = `def greet(name: str) -> str:
	return f"Hello, {name}!"`;
</script>

<Code.Root code={source} lang="py">
	<Code.CopyButton tabindex={0} />
</Code.Root>
```

Code normalizes `lang` to lowercase, resolves canonical names such as `python` and aliases such as `py`, and dynamically loads the matching grammar. Unknown identifiers safely fall back to plain text.

### Custom grammar or override

Pass `loadLanguage` only when the grammar is not in Shiki's bundled registry or the app needs to override its loader:

```svelte
<Code.Root code={source} lang="custom" loadLanguage={() => import("./custom-language")} />
```

The supplied loader takes precedence over the bundled registry. Its module must register the normalized `lang` name or alias; otherwise Code throws a descriptive runtime error.

### Plain text without a grammar

Omit both language props to use the default `text` mode:

```svelte
<script lang="ts">
	import * as Code from "$lib/components/ui/code";

	const output = `Build completed
12 files generated`;
</script>

<Code.Root code={output} hideLines />
```

`text`, `plaintext`, `txt`, and `plain` are supported without `loadLanguage`. They still use Shiki's themed `<pre><code>` output but perform no syntax highlighting.

### Switch languages dynamically

Change only the language name and source; Code resolves each loader automatically:

```svelte
<script lang="ts">
	import * as Code from "$lib/components/ui/code";

	const examples = {
		typescript: `const answer: number = 42;`,
		python: `answer: int = 42`
	};

	let lang = $state<keyof typeof examples>("typescript");
</script>

<select bind:value={lang} aria-label="Code language">
	<option value="typescript">TypeScript</option>
	<option value="python">Python</option>
</select>

<Code.Root code={examples[lang]} {lang} />
```

Changing the language cancels the stale render result. A grammar that already finished loading remains cached in the shared highlighter.

### Highlight lines and hide line numbers

Line positions are one-based. Pass individual lines or inclusive start/end pairs:

```svelte
<Code.Root code={source} lang="svelte" highlight={[2, [5, 7]]} />

<Code.Root code={source} lang="svelte" hideLines />
```

The first block highlights lines 2 and 5 through 7. Highlighting is visual only and does not change the copied source.

### Secondary variant and collapsed overflow

```svelte
<Code.Overflow bind:collapsed>
	<Code.Root code={longSource} lang="json" variant="secondary">
		<Code.CopyButton tabindex={0} />
	</Code.Root>
</Code.Overflow>
```

`Overflow` starts collapsed at `18.75rem` (`max-h-75`) and provides an Expand button. It does not provide a collapse button; bind `collapsed` if your app needs to reset or control that state.

### Copy result handling

```svelte
<Code.Root code={source} lang="bash">
	<Code.CopyButton
		tabindex={0}
		onCopy={(status) => {
			message = status === "success" ? "Code copied" : "Copy failed";
		}}
	/>
</Code.Root>

<p aria-live="polite">{message}</p>
```

The callback receives `success` or `failure`. Use it to provide an accessible status announcement; the built-in icon change is visual only.

## Public API

### `Code.Root`

`RootProps` is the union of `PlainTextRootProps` and `HighlightedRootProps`, combined with Scroll Area Root props.

| Prop              | Type                             | Default     | xvelte behavior                                                                                              |
| ----------------- | -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `code`            | `string`                         | Required    | Source passed to Shiki after trailing whitespace is removed with `trimEnd()`. Also supplied to `CopyButton`. |
| `lang`            | `string`                         | `"text"`    | Bundled Shiki language name or alias. Values are normalized; unknown identifiers use plain text.             |
| `loadLanguage`    | `LanguageLoader`                 | `undefined` | Optional custom or overriding dynamic import. It takes precedence over the bundled registry.                 |
| `variant`         | `"default" \| "secondary"`       | `"default"` | Selects the root border and surface treatment.                                                               |
| `hideLines`       | `boolean`                        | `false`     | Omits generated CSS line numbers.                                                                            |
| `highlight`       | `(number \| [number, number])[]` | `[]`        | Highlights one-based lines and inclusive ranges without changing the source.                                 |
| `children`        | `Snippet`                        | `undefined` | Renders outside the viewport under the outer root, normally for `CopyButton` or another positioned overlay.  |
| `ref`             | `HTMLDivElement \| null`         | `null`      | Bindable reference to the outer Scroll Area root, not its viewport or Shiki's generated `pre`.               |
| `class`           | `string`                         | `undefined` | Merged after the selected `codeVariants` classes using `cn()`.                                               |
| Scroll Area props | Varies                           | —           | Remaining Root attributes, events, direction, and scrollbar visibility settings are forwarded.               |

`PlainTextRootProps` permits `lang="text"`, `"plaintext"`, `"txt"`, or `"plain"`. `HighlightedRootProps` requires a string `lang` and accepts an optional `loadLanguage` override.

The highlighter uses the JavaScript regular-expression engine and fixed `github-light-default` and `github-dark-default` themes. Themes, transformers, the regex engine, and pre-rendering are not public props. Highlighting begins in a Svelte effect, so server-rendered HTML contains the root but not the generated code markup; it appears after client initialization.

### `LanguageLoader`

`LanguageLoader` matches Shiki's fine-grained dynamic language imports and is needed only for custom grammars or overrides:

```ts
const loadRust: Code.LanguageLoader = () => import("@shikijs/langs/rust");
```

The module may register embedded grammars together with its main language. Caller loaders take precedence over Shiki's bundled registry. Loads are deduplicated by normalized `lang`; failures are removed from the cache so a later render can retry.

### `Code.CopyButton`

Type: `CopyButtonProps`, based on native button attributes plus xvelte Button's `variant` and `size` options.

| Prop                | Type                                       | Default       | xvelte behavior                                                                                            |
| ------------------- | ------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------- |
| `variant`           | Button variant                             | `"ghost"`     | Forwarded to the required Button component.                                                                |
| `size`              | Button size                                | `"icon"`      | Forwarded to Button.                                                                                       |
| `animationDuration` | `number`                                   | `150`         | Duration in milliseconds of the Svelte scale transition when the status icon changes.                      |
| `onCopy`            | `(status: "success" \| "failure") => void` | `undefined`   | Runs after the Clipboard API attempt.                                                                      |
| `onclick`           | Native click handler                       | `undefined`   | Runs after the copy attempt and `onCopy`, receiving the original event.                                    |
| `tabindex`          | `number`                                   | `-1`          | Removed from sequential keyboard focus by default; pass `0` when the control should be keyboard reachable. |
| `aria-label`        | `string`                                   | `"Copy code"` | Localized default that may be overridden.                                                                  |
| `ref`               | `HTMLButtonElement \| null`                | `null`        | Bindable reference to the rendered Button.                                                                 |
| `class`             | `string`                                   | `undefined`   | Merged with the absolute top-right placement.                                                              |

The button copies `Root`'s raw trimmed source through `navigator.clipboard.writeText()`. It displays fixed Copy, Check, or Close icons and resets the result after 500 milliseconds. Its indicator is not replaceable through the current local API.

### `Code.Overflow`

| Prop             | Type                     | Default     | xvelte behavior                                                                         |
| ---------------- | ------------------------ | ----------- | --------------------------------------------------------------------------------------- |
| `collapsed`      | `boolean`                | `true`      | Bindable. Limits height, displays a gradient, and renders the Expand button while true. |
| `children`       | `Snippet`                | `undefined` | Renders the code block before the overlay and Expand button.                            |
| `ref`            | `HTMLDivElement \| null` | `null`      | Bindable reference to the outer overflow container.                                     |
| `class`          | `string`                 | `undefined` | Merged with the relative positioning and overflow classes.                              |
| Native div props | Varies                   | —           | Remaining native `div` attributes and events are forwarded.                             |

Clicking Expand sets `collapsed` to `false`. While collapsed, Overflow temporarily removes the nested Scroll Area viewport and `CopyButton` from sequential keyboard focus, including when their `tabindex` changes after mounting. It restores their previous values when expanded. There is no built-in way to set it back to `true`, no height prop, and no public props for the internal overlay or Expand Button.

### `codeVariants`

The exported Tailwind Variants function accepts `variant` and optional additional classes:

```ts
codeVariants({ variant: "secondary", class: "min-h-64" });
```

It returns classes only and does not load Shiki, render markup, establish context, or add `data-slot`.

The component's `index.ts` and exported types are the source of truth for the public API.

## Styling and DOM contract

Stable xvelte hooks:

| Part                 | Stable hook                                                         | Notable behavior                                        |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| `Root`               | `data-slot="code"`                                                  | Relative Scroll Area root and context owner.            |
| `CopyButton`         | `data-slot="code-copy-button"`                                      | Absolutely positioned in the top-right corner.          |
| `Overflow`           | `data-slot="code-overflow"`, `data-code-overflow`, `data-collapsed` | Controls clipping, gradient, and the expanded state.    |
| Scroll viewport      | `data-slot="scroll-area-viewport"`                                  | Owns native scrolling and its conditional tab stop.     |
| Scrollbars           | `data-slot="scroll-area-scrollbar"`                                 | Bits UI vertical and horizontal scrollbar controls.     |
| Scrollbar thumbs     | `data-slot="scroll-area-thumb"`                                     | Draggable controls inside each visible scrollbar.       |
| Scroll corner        | `data-slot="scroll-area-corner"`                                    | Appears automatically when both axes are registered.    |
| Generated code block | `.shiki`, `.line`                                                   | Shiki's `<pre><code>` markup and individual line spans. |
| Numbered block       | `.line-numbers`                                                     | Enables CSS counters for one-based line numbers.        |
| Highlighted line     | `.line--highlighted`                                                | Applies the semantic secondary background.              |

`Root` removes Shiki's inline background style so the selected xvelte variant controls the surface. Shiki still writes token colors and dark-theme custom properties. Under a `.dark` ancestor, local CSS switches token color, font style, font weight, and text decoration to the `--shiki-dark-*` values.

Generated blocks use a grid of full-width line spans. Scroll Area's viewport provides horizontal and vertical scrolling, with the outer root normally limited to 650 pixels. That maximum is removed when the block is inside `Overflow`, which owns the collapsed height instead. The copy button is a sibling of the viewport, so it stays pinned to the root while code scrolls. Line numbers are generated with CSS counters and are not part of `code` or clipboard output.

Classes supplied to public parts are merged with `cn()`. Root classes can override its variant and sizing utilities; CopyButton and Overflow classes can override their positioning. Preserve the stable hooks and Shiki class names when replacing local styles.

## Accessibility

Shiki generates semantic `<pre><code>` markup and escapes the source before xvelte renders it with `{@html}`. The generated code remains selectable and readable as text.

- Add nearby visible context, such as a heading, caption, or paragraph, when the purpose or language is not obvious.
- `CopyButton` has the localized accessible name “Copy code”, but its local default `tabindex="-1"` removes it from sequential keyboard focus. Pass `tabindex={0}` unless intentionally exposing copying only as a pointer convenience.
- Copy success and failure are represented only by icon changes. Use `onCopy` with an `aria-live` status when the result must be announced.
- The Expand button is a normal keyboard-accessible Button with localized text. While collapsed, the hidden Scroll Area viewport and Copy button are skipped during sequential keyboard navigation; their previous tab order is restored after expansion. Expanded content cannot be collapsed through the built-in UI.
- CSS line numbers and highlighted backgrounds are presentational. Do not rely on them alone to communicate an instruction, error, or code review result.
- Long lines scroll horizontally. Avoid forcing wrapping when whitespace and indentation are meaningful.
- The initial server-rendered root is empty because highlighting runs after client initialization. Use a server-side Shiki integration when code must be available without JavaScript or indexed in its highlighted form.
- User-selected language names are matched only against Shiki's fixed bundled registries; Code never constructs an import path from the input. Keep custom loaders defined in application code.

## Localization

Code includes two localized strings:

| Message ID          | English default | Used by                                          |
| ------------------- | --------------- | ------------------------------------------------ |
| `early_swan_copy`   | `Copy code`     | Default accessible name of `CopyButton`.         |
| `deep_lotus_expand` | `Expand`        | Visible button rendered by collapsed `Overflow`. |

`CopyButton` accepts `aria-label` to override its default. `Overflow` has no prop for overriding the Expand label, so change the message through the app's localization catalog. Your app supplies and translates captions, language selectors, copy-result announcements, and surrounding explanations. Source code, language identifiers, `data-*` values, and Shiki theme names are not translated.

## Dependencies

Code expects a Svelte 5 project using Tailwind CSS 4 and Paraglide. Install its packages with one of the following command groups:

```sh
# bun
bun add shiki @shikijs/langs @shikijs/themes bits-ui tailwind-variants @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss @inlang/paraglide-js

# npm
npm install shiki @shikijs/langs @shikijs/themes bits-ui tailwind-variants @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss @inlang/paraglide-js

# pnpm
pnpm add shiki @shikijs/langs @shikijs/themes bits-ui tailwind-variants @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss @inlang/paraglide-js
```

Use matching stable versions of `shiki`, `@shikijs/langs`, and `@shikijs/themes`. xvelte currently uses 4.0.2 for all three. The implementation follows Shiki's [fine-grained bundle](https://shiki.style/guide/bundles#fine-grained-bundle) and [performance](https://shiki.style/guide/best-performance) guidance.

### Required xvelte component

`CopyButton` and the button rendered by `Overflow` require the Button component. Copy these files with Code:

- `src/lib/components/ui/button/button-root.svelte`
- `src/lib/components/ui/button/index.ts`

Follow the Button component's README to install its complete API, styling, and theme requirements. `Root` itself can render without Button when neither `CopyButton` nor `Overflow` is used.

`Root` requires the complete `src/lib/components/ui/scroll-area` folder. Follow the Scroll Area component's README to install its Root, Viewport, fixed-axis scrollbars, internal context, styling, and Bits UI dependency.

### Global styles

Copy Tailwind's import and the semantic variables and mappings below into the app's global stylesheet. These are xvelte's defaults; replace their values with the app's theme while preserving the names. The required Button README adds the extra tokens used by its controls.

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--card: oklch(1 0 0);
	--secondary: oklch(0.967 0.001 286.375);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--card: oklch(0.216 0.006 56.043);
	--secondary: oklch(0.274 0.006 286.033);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-background: var(--background);
	--color-card: var(--card);
	--color-secondary: var(--secondary);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--radius-lg: var(--radius);
}
```

The app must place `.dark` on an ancestor to activate Shiki's dark token variables. Code requires no global keyframes, animation stylesheet, font, or component-specific stylesheet; its Shiki layout rules are colocated in `code-root.svelte`.

### Icons

Add the semantic exports used by `CopyButton` to `$lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
export { default as CopyIcon } from "@tabler/icons-svelte/icons/copy";
```

All three are backed by `@tabler/icons-svelte`. `Root` and `Overflow` require no icons.

### Utilities

Add these exports to `$lib/utils.ts`. `cn()` depends on `clsx` and `tailwind-merge`; `WithElementRef` types the bindable CopyButton reference.

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

### Internal language loader

Copy `src/lib/components/ui/code/shiki.ts` with the component. It owns automatic bundled-name and alias resolution, custom-loader precedence, the zero-language singleton, language cache, runtime validation, JavaScript regex engine, and two theme imports. Its complete contents are:

```ts
// Follows the best practices established in https://shiki.matsu.io/guide/best-performance
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { createHighlighterCore } from "shiki/core";
import { bundledLanguages, bundledLanguagesAlias } from "shiki/langs";

/** Dynamically imports one Shiki language and its embedded grammars. */
export type LanguageLoader = (typeof bundledLanguages)[keyof typeof bundledLanguages];

/** Language identifiers handled by Shiki without loading a grammar. */
export type PlainTextLanguage = "text" | "plaintext" | "txt" | "plain";

const plainTextLanguages = new Set<PlainTextLanguage>(["text", "plaintext", "txt", "plain"]);
const languageLoads = new Map<string, Promise<void>>();

/** A normalized language plus the optional grammar loader required by Code context. */
export type ResolvedLanguage = {
	lang: string;
	loadLanguage?: LanguageLoader | undefined;
};

/** Finds one language in Shiki's canonical or alias registries. */
function bundledLanguageLoader(lang: string): LanguageLoader | undefined {
	if (lang in bundledLanguages) return bundledLanguages[lang as keyof typeof bundledLanguages];
	if (lang in bundledLanguagesAlias) return bundledLanguagesAlias[lang as keyof typeof bundledLanguagesAlias];
	return undefined;
}

/**
 * Resolves a language name to a custom loader or Shiki's lazy bundled registry.
 *
 * @param language - Requested Shiki language name, alias, or plain-text identifier.
 * @param loadLanguage - Optional caller loader that takes precedence over the bundled registry.
 * @returns A normalized highlighted language, or text when the identifier is empty or unknown.
 */
export function resolveLanguage(language?: string | null | undefined, loadLanguage?: LanguageLoader | undefined): ResolvedLanguage {
	const lang = language?.trim().toLowerCase() || "text";
	if (plainTextLanguages.has(lang as PlainTextLanguage)) return { lang: "text" };

	const resolvedLoader = loadLanguage ?? bundledLanguageLoader(lang);
	return resolvedLoader ? { lang, loadLanguage: resolvedLoader } : { lang: "text" };
}

/** A highlighter instance containing only the two xvelte themes until a component requests a language. */
export const highlighter = createHighlighterCore({
	themes: [import("@shikijs/themes/github-light-default"), import("@shikijs/themes/github-dark-default")],
	langs: [],
	engine: createJavaScriptRegexEngine()
});

/**
 * Returns the shared highlighter after loading the requested grammar once.
 *
 * @param lang - Shiki language name or alias used to highlight the code.
 * @param loadLanguage - Resolved dynamic import for the requested language. Plain text does not require one.
 * @returns The shared highlighter with the requested grammar available.
 */
export async function getHighlighter(lang: string, loadLanguage?: LanguageLoader | undefined) {
	const instance = await highlighter;

	if (plainTextLanguages.has(lang as PlainTextLanguage)) return instance;
	if (instance.getLoadedLanguages().includes(lang)) return instance;

	if (!loadLanguage) {
		throw new Error(`Code.Root could not resolve a loader for "${lang}".`);
	}

	let loading = languageLoads.get(lang);

	if (!loading) {
		loading = instance.loadLanguage(loadLanguage).catch((error) => {
			languageLoads.delete(lang);
			throw error;
		});
		languageLoads.set(lang, loading);
	}

	await loading;

	if (!instance.getLoadedLanguages().includes(lang)) {
		languageLoads.delete(lang);
		throw new Error(`The language loaded for Code.Root does not provide the "${lang}" name or alias.`);
	}

	return instance;
}
```

### Internal context

Copy `src/lib/components/ui/code/code-context.svelte.ts` unchanged with the component. It coordinates reactive loading, stale-render cancellation, highlighted markup, raw source access, and line transformations for the public parts. It is private and must not be imported by application code. Its complete contents are:

```ts
import { createContext } from "svelte";
import type { HighlighterCore } from "shiki";

import type { RootProps } from "./code-root.svelte";
import { getHighlighter } from "./shiki";

type CodeContextOptions = {
	readonly code: string;
	readonly lang: NonNullable<RootProps["lang"]>;
	readonly loadLanguage: RootProps["loadLanguage"];
	readonly hideLines: boolean;
	readonly highlight: RootProps["highlight"];
};

/** Highlights source code and exposes it to nested code parts. */
export class CodeContext {
	#highlighted = $state("");
	#error = $state<unknown>();

	/** @param options - Reactive source, language loader, line-number, and highlight options. */
	constructor(readonly options: CodeContextOptions) {
		$effect(() => {
			const code = options.code;
			const lang = options.lang;
			const loadLanguage = options.loadLanguage;
			const hideLines = options.hideLines;
			const highlight = options.highlight;
			let cancelled = false;

			this.#highlighted = "";
			this.#error = undefined;

			void getHighlighter(lang, loadLanguage)
				.then((highlighter) => {
					if (!cancelled) this.#highlighted = this.highlight(highlighter, code, lang, hideLines, highlight);
				})
				.catch((error: unknown) => {
					if (!cancelled) this.#error = error;
				});

			return () => (cancelled = true);
		});
	}

	/**
	 * Converts source code into themed Shiki markup and annotates selected lines.
	 *
	 * @param highlighter - Shared Shiki instance with the requested grammar loaded.
	 * @param code - Raw source code to highlight.
	 * @param lang - Loaded Shiki language name or alias.
	 * @param hideLines - Whether line numbers should be omitted.
	 * @param highlight - Individual lines and inclusive ranges to emphasize.
	 * @returns Highlighted HTML generated by Shiki.
	 */
	highlight(highlighter: HighlighterCore, code: string, lang: string, hideLines: boolean, highlight: RootProps["highlight"]) {
		return highlighter.codeToHtml(code, {
			lang,
			themes: {
				light: "github-light-default",
				dark: "github-dark-default"
			},
			transformers: [
				{
					pre: (el) => {
						el.properties.style = "";

						if (!hideLines) {
							el.properties.class += " line-numbers";
						}

						return el;
					},
					line: (node, line) => {
						if (within(line, highlight)) {
							node.properties.class = node.properties.class + " line--highlighted";
						}

						return node;
					}
				}
			]
		});
	}

	/** Current raw source code. */
	get code() {
		return this.options.code;
	}

	/** Current highlighted markup, or an error from loading or highlighting the requested language. */
	get highlighted() {
		if (this.#error) throw this.#error;
		return this.#highlighted;
	}
}

/**
 * Determines whether a line belongs to any configured line or inclusive range.
 *
 * @param num - One-based line number.
 * @param range - Individual lines and ranges selected for highlighting.
 */
function within(num: number, range: RootProps["highlight"]) {
	if (!range) return false;

	let within = false;

	for (const r of range) {
		if (typeof r === "number") {
			if (num === r) {
				within = true;
				break;
			}
			continue;
		}

		if (r[0] <= num && num <= r[1]) {
			within = true;
			break;
		}
	}

	return within;
}

const [getCodeContext, provideCodeContext] = createContext<CodeContext>();

/** @param options - Reactive source and highlighting options to provide to nested code parts. */
export function setCodeContext(options: CodeContextOptions) {
	return provideCodeContext(new CodeContext(options));
}

/** @returns The state from the nearest code root. */
export { getCodeContext };
```

### Localization setup

Add the two message IDs and English values listed in [Localization](#localization) to `messages/en.json`, compile the Paraglide output to `src/lib/paraglide`, and keep the existing `$lib/paraglide/messages.js` import path. The localization values are already complete above and are not duplicated here.

No hook, attachment, external context library, global shared style, WebAssembly file, `tw-animate-css`, or browser polyfill is required. Clipboard copying requires the native `navigator.clipboard` API and normally a secure browser context.

## Credits

Code is adapted from the [shadcn-svelte-extras Code component](https://shadcn-svelte-extras.com/docs/components/code). The local automatic language registry, optional custom-loader API, and cache differ from the source component's fixed language configuration.

## File organization

| File                      | Responsibility                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `code-root.svelte`        | Composes Scroll Area around Shiki markup, defines variants, provides context, and owns local CSS.  |
| `code-copy-button.svelte` | Copies the root source and renders copy, success, or failure icons.                                |
| `code-overflow.svelte`    | Collapses long blocks, manages hidden tab stops, and renders the gradient and Expand button.       |
| `code-context.svelte.ts`  | Loads and renders reactive source while sharing it with nested parts.                              |
| `shiki.ts`                | Resolves bundled names and aliases, creates the theme-only singleton, and loads each grammar once. |
| `index.ts`                | Exports all public components, types, and the variant function.                                    |
| `README.md`               | Documents composition, dynamic languages, API, behavior, and installation requirements.            |

The component's `index.ts` and exported types are the source of truth for the public API. `code-context.svelte.ts` and the runtime helpers in `shiki.ts` are internal implementation files; only the types re-exported by `index.ts` are public.

import { SvelteMap } from "svelte/reactivity";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages, bundledLanguagesAlias } from "shiki/langs";

import type { GrammarState, HighlighterCore, ThemedToken } from "shiki/core";

/** One themed token returned for a syntax-highlighted line. */
export type HighlightedToken = {
	content: string;
	style?: string | undefined;
	class?: string | undefined;
};

/** One line before highlighting loads or its list of themed tokens afterward. */
export type HighlightedLine = string | HighlightedToken[];

type LanguageLoader = (typeof bundledLanguages)[keyof typeof bundledLanguages];

type ResolvedLanguage = {
	name: string;
	loader?: LanguageLoader | undefined;
};

type Highlighter = {
	highlight: (code: string, state?: GrammarState | undefined) => { lines: HighlightedLine[]; state?: GrammarState | undefined };
};

const plainTextLanguages = new Set(["text", "plaintext", "txt", "plain"]);
const languageLoads = new SvelteMap<string, Promise<void>>();
let highlighter: Promise<HighlighterCore> | undefined;

/** Returns the shared Shiki instance with xvelte's light and dark code themes. */
function getHighlighter() {
	highlighter ??= createHighlighterCore({
		themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark.mjs")],
		langs: [],
		engine: createJavaScriptRegexEngine({ forgiving: true })
	});

	return highlighter;
}

/** Resolves any bundled Shiki language or alias without constructing an import path from user input. */
function resolveLanguage(language: string): ResolvedLanguage | null {
	const name = language.trim().toLowerCase();

	if (!name || plainTextLanguages.has(name)) return null;
	if (name === "ansi") return { name };
	if (name in bundledLanguages) return { name, loader: bundledLanguages[name as keyof typeof bundledLanguages] };
	if (name in bundledLanguagesAlias) return { name, loader: bundledLanguagesAlias[name as keyof typeof bundledLanguagesAlias] };

	return null;
}

/** Converts Shiki tokens into serializable spans rendered by CodeBlock.Line. */
function toHighlightedLine(tokens: ThemedToken[]): HighlightedToken[] {
	return tokens.map((token) => ({
		content: token.content,
		style: Object.entries(token.htmlStyle ?? {})
			.map(([property, value]) => `${property}:${value}`)
			.join(";"),
		class: "text-(--shiki-light) dark:text-(--shiki-dark)"
	}));
}

/** Loads one bundled grammar once and returns its incremental tokenizer. */
async function loadHighlighter(language: string): Promise<Highlighter | null> {
	const resolved = resolveLanguage(language);
	if (!resolved) return null;

	const shiki = await getHighlighter();

	if (resolved.loader && !shiki.getLoadedLanguages().includes(resolved.name)) {
		let loading = languageLoads.get(resolved.name);

		if (!loading) {
			loading = shiki.loadLanguage(resolved.loader).catch((error) => {
				languageLoads.delete(resolved.name);
				throw error;
			});
			languageLoads.set(resolved.name, loading);
		}

		await loading;
	}

	return {
		/** Tokenizes source from an optional previous grammar state. */
		highlight(code: string, state?: GrammarState | undefined) {
			const tokenize = (text: string) =>
				shiki.codeToTokens(text, {
					lang: resolved.name,
					themes: { light: "github-light", dark: "github-dark" },
					defaultColor: false,
					grammarState: state
				}).tokens;

			// ANSI has no grammar state, so independent lines retain stable colors while output streams.
			const tokens = resolved.name === "ansi" ? code.split("\n").flatMap((line) => tokenize(line)) : tokenize(code);

			return {
				lines: tokens.map((line) => toHighlightedLine(line)),
				state: shiki.getLastGrammarState(tokens)
			};
		}
	};
}

/**
 * Reactively highlights source with any bundled Shiki language or alias.
 *
 * Complete lines are tokenized only once while text is appended, while the active
 * final line is re-tokenized as it streams. Unknown and plain-text languages remain
 * readable strings instead of throwing.
 *
 * @param value Reactive getter for the complete source string.
 * @param language Reactive getter for a Shiki language, alias, `ansi`, or plain-text identifier.
 * @returns A reactive `current` accessor containing strings until highlighting loads and tokens afterward.
 */
export function useHighlightedCode(value: () => string, language: () => string) {
	let loaded = $state.raw<{ language: string; highlighter: Highlighter | null } | null>(null);

	$effect(() => {
		const lang = language();
		let cancelled = false;

		void loadHighlighter(lang)
			.then((next) => {
				if (!cancelled) loaded = { language: lang, highlighter: next };
			})
			.catch(() => {
				if (!cancelled) loaded = { language: lang, highlighter: null };
			});

		return () => {
			cancelled = true;
		};
	});

	let done: {
		highlighter: Highlighter | null;
		text: string;
		lines: HighlightedLine[];
		state?: GrammarState | undefined;
	} = { highlighter: null, text: "", lines: [] };

	const lines = $derived.by((): HighlightedLine[] => {
		const raw = value();
		const code = raw.endsWith("\n") ? raw.slice(0, -1) : raw;
		const lang = language();
		const activeHighlighter = loaded?.language === lang ? loaded.highlighter : null;

		if (!activeHighlighter) return code.split("\n");

		let next = done;

		if (next.highlighter !== activeHighlighter || !code.startsWith(next.text)) {
			next = { highlighter: activeHighlighter, text: "", lines: [] };
		}

		const end = code.lastIndexOf("\n") + 1;

		if (end > next.text.length) {
			const result = activeHighlighter.highlight(code.slice(next.text.length, end - 1), next.state);
			next = {
				highlighter: activeHighlighter,
				text: code.slice(0, end),
				lines: [...next.lines, ...result.lines],
				state: result.state
			};
		}

		done = next;
		const tail = activeHighlighter.highlight(code.slice(end), next.state).lines[0] ?? "";

		return [...next.lines, tail];
	});

	return {
		/** Current plain or tokenized lines. */
		get current() {
			return lines;
		}
	};
}

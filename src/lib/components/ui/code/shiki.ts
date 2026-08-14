// Follows the best practices established in https://shiki.matsu.io/guide/best-performance
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { createHighlighterCore } from "shiki/core";
import type { bundledLanguages } from "shiki/langs";

/** Dynamically imports one Shiki language and its embedded grammars. */
export type LanguageLoader = (typeof bundledLanguages)[keyof typeof bundledLanguages];

/** Language identifiers handled by Shiki without loading a grammar. */
export type PlainTextLanguage = "text" | "plaintext" | "txt" | "plain";

const plainTextLanguages = new Set<PlainTextLanguage>(["text", "plaintext", "txt", "plain"]);
const languageLoads = new Map<string, Promise<void>>();

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
 * @param loadLanguage - Dynamic import for the requested language. Plain-text identifiers do not require one.
 * @returns The shared highlighter with the requested grammar available.
 */
export async function getHighlighter(lang: string, loadLanguage?: LanguageLoader | undefined) {
	const instance = await highlighter;

	if (plainTextLanguages.has(lang as PlainTextLanguage)) return instance;
	if (instance.getLoadedLanguages().includes(lang)) return instance;

	if (!loadLanguage) {
		throw new Error(`Code.Root requires loadLanguage to highlight "${lang}".`);
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

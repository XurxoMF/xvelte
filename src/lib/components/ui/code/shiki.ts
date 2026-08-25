// Follows the best practices established in https://shiki.matsu.io/guide/best-performance
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

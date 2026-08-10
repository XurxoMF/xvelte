import { createContext } from "svelte";
import type { HighlighterCore } from "shiki";

import type { RootProps } from "./code-root.svelte";
import { highlighter } from "./shiki";

type CodeContextOptions = {
	readonly code: string;
	readonly lang: NonNullable<RootProps["lang"]>;
	readonly hideLines: boolean;
	readonly highlight: RootProps["highlight"];
};

/** Highlights source code and exposes it to nested code parts. */
export class CodeContext {
	highlighter: HighlighterCore | null = $state(null);

	/** @param options - Reactive source, language, line-number, and highlight options. */
	constructor(readonly options: CodeContextOptions) {
		highlighter.then((hl) => (this.highlighter = hl));
	}

	/**
	 * Converts source code into themed Shiki markup and annotates selected lines.
	 *
	 * @param code - Raw source code to highlight.
	 */
	highlight(code: string) {
		return this.highlighter?.codeToHtml(code, {
			lang: this.options.lang,
			themes: {
				light: "github-light-default",
				dark: "github-dark-default"
			},
			transformers: [
				{
					pre: (el) => {
						el.properties.style = "";

						if (!this.options.hideLines) {
							el.properties.class += " line-numbers";
						}

						return el;
					},
					line: (node, line) => {
						if (within(line, this.options.highlight)) {
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

	highlighted = $derived(this.highlight(this.code) ?? "");
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

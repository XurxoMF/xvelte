import { Context } from "runed";
import type { HighlighterCore } from "shiki";
import type { ReadableBoxedValues, WritableBoxedValues } from "svelte-toolbelt";

import type { RootProps } from "./code-root.svelte";
import { highlighter } from "./shiki";

type CodeOverflowStateProps = WritableBoxedValues<{
	collapsed: boolean;
}>;

/** Controls whether an overflow-enabled code block is collapsed. */
class CodeOverflowState {
	/** @param opts - Boxed collapsed state owned by the overflow component. */
	constructor(readonly opts: CodeOverflowStateProps) {
		this.toggleCollapsed = this.toggleCollapsed.bind(this);
	}

	/** Toggles the collapsed state. */
	toggleCollapsed() {
		this.opts.collapsed.current = !this.opts.collapsed.current;
	}

	/** Current reactive collapsed state. */
	get collapsed() {
		return this.opts.collapsed.current;
	}
}

type CodeRootStateProps = ReadableBoxedValues<{
	code: string;
	lang: NonNullable<RootProps["lang"]>;
	hideLines: boolean;
	highlight: RootProps["highlight"];
}>;

/** Highlights source code and exposes it to nested code parts. */
class CodeRootState {
	highlighter: HighlighterCore | null = $state(null);

	/**
	 * @param opts - Boxed source, language, line-number, and highlight options.
	 * @param overflow - Optional enclosing overflow state.
	 */
	constructor(
		readonly opts: CodeRootStateProps,
		readonly overflow?: CodeOverflowState
	) {
		highlighter.then((hl) => (this.highlighter = hl));
	}

	/**
	 * Converts source code into themed Shiki markup and annotates selected lines.
	 *
	 * @param code - Raw source code to highlight.
	 */
	highlight(code: string) {
		return this.highlighter?.codeToHtml(code, {
			lang: this.opts.lang.current,
			themes: {
				light: "github-light-default",
				dark: "github-dark-default"
			},
			transformers: [
				{
					pre: (el) => {
						el.properties.style = "";

						if (!this.opts.hideLines.current) {
							el.properties.class += " line-numbers";
						}

						return el;
					},
					line: (node, line) => {
						if (within(line, this.opts.highlight.current)) {
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
		return this.opts.code.current;
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

/** Exposes the nearest code root's raw source to a copy button. */
class CodeCopyButtonState {
	/** @param root - Code root whose source should be copied. */
	constructor(readonly root: CodeRootState) {}

	/** Current raw source code from the associated root. */
	get code() {
		return this.root.opts.code.current;
	}
}

const overflowCtx = new Context<CodeOverflowState>("code-overflow-state");

const ctx = new Context<CodeRootState>("code-root-state");

/** @param props - Boxed collapsed state to provide to a nested code root. */
export function useCodeOverflow(props: CodeOverflowStateProps) {
	return overflowCtx.set(new CodeOverflowState(props));
}

/** @param props - Boxed source and highlighting options for the code root. */
export function useCode(props: CodeRootStateProps) {
	return ctx.set(new CodeRootState(props, overflowCtx.getOr(undefined)));
}

/** @returns Copy-button state connected to the nearest code root. */
export function useCodeCopyButton() {
	return new CodeCopyButtonState(ctx.get());
}

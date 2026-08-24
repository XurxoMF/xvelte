import GithubSlugger from "github-slugger";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import type { Blockquote, Heading, Root } from "mdast";
import type { Node, Parent } from "unist";

declare module "mdast" {
	interface Data {
		/** Stable GitHub-style identifier generated for a heading. */
		headingId?: string | undefined;
		/** GitHub alert kind detected on a blockquote. */
		alert?: MarkdownAlertKind | undefined;
	}
}

/** GitHub blockquote alert kinds recognized by the parser. */
export type MarkdownAlertKind = "note" | "tip" | "important" | "warning" | "caution";

/** The standard mdast document returned after xvelte metadata is added. */
export type MarkdownAst = Root;

const alertPattern = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\n|$)/i;

/** Returns whether a unist node owns child nodes. */
function isParent(node: Node): node is Parent {
	return "children" in node && Array.isArray(node.children);
}

/** Extracts plain text recursively for heading slugs and accessible labels. */
function nodeText(node: Node): string {
	if ("value" in node && typeof node.value === "string") return node.value;
	if (!isParent(node)) return "";
	return node.children.map(nodeText).join("");
}

/** Detects GitHub's blockquote alert marker and removes it from visible content. */
function annotateAlert(node: Blockquote) {
	const firstBlock = node.children[0];
	if (firstBlock?.type !== "paragraph") return;

	const firstInline = firstBlock.children[0];
	if (firstInline?.type !== "text") return;

	const match = firstInline.value.match(alertPattern);
	if (!match) return;

	node.data = { ...node.data, alert: match[1]?.toLowerCase() as MarkdownAlertKind };
	firstInline.value = firstInline.value.slice(match[0].length);

	if (!firstInline.value) firstBlock.children.shift();
	if (firstBlock.children.length === 0) node.children.shift();
}

/** Adds stable heading IDs and GitHub alert metadata throughout one mdast tree. */
function annotateAst(ast: Root) {
	const slugger = new GithubSlugger();

	const visit = (node: Node) => {
		if (node.type === "heading") {
			const heading = node as Heading;
			heading.data = { ...heading.data, headingId: slugger.slug(nodeText(heading)) };
		} else if (node.type === "blockquote") {
			annotateAlert(node as Blockquote);
		}

		if (isParent(node)) node.children.forEach(visit);
	};

	visit(ast);
	return ast;
}

/**
 * Parses CommonMark plus GitHub Flavored Markdown into a standard mdast tree.
 *
 * @param source - Markdown source loaded from any string-producing source.
 * @returns The parsed mdast root with stable heading IDs and GitHub alert metadata.
 */
export function parseMarkdown(source: string): MarkdownAst {
	return annotateAst(
		fromMarkdown(source, {
			extensions: [gfm()],
			mdastExtensions: [gfmFromMarkdown()]
		})
	);
}

/** Reactively parses a replaceable Markdown source into mdast. */
export class UseMarkdown {
	#source = $state("");
	#current = $derived(parseMarkdown(this.#source));

	/**
	 * Creates a reactive Markdown parser.
	 *
	 * @param source - Initial Markdown source.
	 */
	constructor(source = "") {
		this.#source = source;
	}

	/** Current Markdown source. Assigning a new string reparses the AST. */
	get source() {
		return this.#source;
	}

	set source(source: string) {
		this.#source = source;
	}

	/** Current reactive mdast root. */
	get current() {
		return this.#current;
	}
}

export type MarkdownInline =
	| { type: "text"; value: string }
	| { type: "strong"; children: MarkdownInline[] }
	| { type: "emphasis"; children: MarkdownInline[] }
	| { type: "delete"; children: MarkdownInline[] }
	| { type: "code"; value: string }
	| { type: "link"; href: string; title?: string | undefined; children: MarkdownInline[] };

export type MarkdownBlock =
	| { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; id: string; children: MarkdownInline[] }
	| { type: "paragraph"; children: MarkdownInline[] }
	| { type: "code"; language: string; value: string }
	| { type: "list"; ordered: boolean; items: MarkdownBlock[][] }
	| { type: "blockquote"; children: MarkdownBlock[] }
	| { type: "table"; headers: MarkdownInline[][]; rows: MarkdownInline[][][] }
	| { type: "separator" };

function text(value: string): MarkdownInline {
	return { type: "text", value };
}

function appendText(nodes: MarkdownInline[], value: string) {
	if (!value) return;

	const previous = nodes.at(-1);
	if (previous?.type === "text") previous.value += value;
	else nodes.push(text(value));
}

function closingMarker(source: string, marker: string, start: number) {
	const index = source.indexOf(marker, start);
	return index === -1 ? undefined : index;
}

export function parseInline(source: string): MarkdownInline[] {
	const nodes: MarkdownInline[] = [];
	let index = 0;

	while (index < source.length) {
		const remaining = source.slice(index);
		const escaped = remaining.match(/^\\([\\`*_[\]~])/);
		if (escaped) {
			appendText(nodes, escaped[1] ?? "");
			index += escaped[0].length;
			continue;
		}

		if (remaining.startsWith("`")) {
			const end = closingMarker(source, "`", index + 1);
			if (end !== undefined) {
				nodes.push({ type: "code", value: source.slice(index + 1, end) });
				index = end + 1;
				continue;
			}
		}

		const link = remaining.match(/^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/);
		if (link) {
			nodes.push({ type: "link", href: link[2] ?? "", title: link[3], children: parseInline(link[1] ?? "") });
			index += link[0].length;
			continue;
		}

		const pairedMarkers: { marker: "**" | "__" | "~~"; type: "strong" | "delete" }[] = [
			{ marker: "**", type: "strong" },
			{ marker: "__", type: "strong" },
			{ marker: "~~", type: "delete" }
		];
		const paired = pairedMarkers.find(({ marker }) => remaining.startsWith(marker));
		if (paired) {
			const end = closingMarker(source, paired.marker, index + paired.marker.length);
			if (end !== undefined) {
				nodes.push({ type: paired.type, children: parseInline(source.slice(index + paired.marker.length, end)) });
				index = end + paired.marker.length;
				continue;
			}
		}

		if (remaining.startsWith("*")) {
			const end = closingMarker(source, "*", index + 1);
			if (end !== undefined) {
				nodes.push({ type: "emphasis", children: parseInline(source.slice(index + 1, end)) });
				index = end + 1;
				continue;
			}
		}

		const nextToken = remaining.slice(1).search(/[\\`*_[\]~]/);
		const length = nextToken === -1 ? remaining.length : nextToken + 1;
		appendText(nodes, remaining.slice(0, length));
		index += length;
	}

	return nodes;
}

function inlineText(nodes: MarkdownInline[]): string {
	return nodes
		.map((node) => {
			if (node.type === "text" || node.type === "code") return node.value;
			return inlineText(node.children);
		})
		.join("");
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function cells(line: string) {
	const source = line.replace(/^\s*\||\|\s*$/g, "");
	const result: string[] = [];
	let cell = "";

	for (let index = 0; index < source.length; index++) {
		const character = source[index];
		if (character === "\\" && source[index + 1] === "|") {
			cell += "|";
			index++;
		} else if (character === "|") {
			result.push(cell.trim());
			cell = "";
		} else {
			cell += character;
		}
	}

	result.push(cell.trim());
	return result;
}

function isTableDivider(line: string) {
	return cells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function fenceStart(line: string) {
	const match = line.match(/^ {0,3}(`{3,}|~{3,})\s*([^\s]*)?.*$/);
	if (!match) return undefined;

	const sequence = match[1] ?? "```";
	return { marker: sequence[0] ?? "`", length: sequence.length, language: match[2] ?? "" };
}

function closesFence(line: string, fence: { marker: string; length: number }) {
	const match = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
	const sequence = match?.[1] ?? "";
	return sequence.startsWith(fence.marker) && sequence.length >= fence.length;
}

function startsBlock(lines: string[], index: number) {
	const line = lines[index] ?? "";
	return (
		fenceStart(line) !== undefined ||
		/^#{1,6}\s/.test(line) ||
		/^\s*(?:[-*_]\s*){3,}$/.test(line) ||
		/^>\s?/.test(line) ||
		/^\s*[-+*]\s+/.test(line) ||
		/^\s*\d+\.\s+/.test(line) ||
		(Boolean(lines[index + 1]) && isTableDivider(lines[index + 1] ?? ""))
	);
}

export function parseMarkdown(source: string): MarkdownBlock[] {
	const lines = source.replaceAll("\r\n", "\n").split("\n");
	const blocks: MarkdownBlock[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index] ?? "";

		if (!line.trim()) {
			index++;
			continue;
		}

		const fence = fenceStart(line);
		if (fence) {
			const body: string[] = [];
			index++;
			while (index < lines.length && !closesFence(lines[index] ?? "", fence)) body.push(lines[index++] ?? "");
			if (index < lines.length) index++;
			blocks.push({ type: "code", language: fence.language.toLowerCase(), value: body.join("\n") });
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			const children = parseInline(heading[2] ?? "");
			blocks.push({ type: "heading", level: (heading[1]?.length ?? 2) as 1 | 2 | 3 | 4 | 5 | 6, id: slugify(inlineText(children)), children });
			index++;
			continue;
		}

		if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
			blocks.push({ type: "separator" });
			index++;
			continue;
		}

		if (lines[index + 1] && isTableDivider(lines[index + 1] ?? "")) {
			const headers = cells(line).map(parseInline);
			index += 2;
			const rows: MarkdownInline[][][] = [];
			while (index < lines.length && (lines[index] ?? "").includes("|") && (lines[index] ?? "").trim()) {
				rows.push(cells(lines[index++] ?? "").map(parseInline));
			}
			blocks.push({ type: "table", headers, rows });
			continue;
		}

		if (/^>\s?/.test(line)) {
			const body: string[] = [];
			while (index < lines.length && /^>\s?/.test(lines[index] ?? "")) body.push((lines[index++] ?? "").replace(/^>\s?/, ""));
			blocks.push({ type: "blockquote", children: parseMarkdown(body.join("\n")) });
			continue;
		}

		const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
		const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
		if (unordered || ordered) {
			const expression = unordered ? /^\s*[-+*]\s+(.+)$/ : /^\s*\d+\.\s+(.+)$/;
			const items: MarkdownBlock[][] = [];
			while (index < lines.length) {
				const match = (lines[index] ?? "").match(expression);
				if (!match) break;
				items.push([{ type: "paragraph", children: parseInline(match[1] ?? "") }]);
				index++;
			}
			blocks.push({ type: "list", ordered: ordered !== null, items });
			continue;
		}

		const paragraph = [line.trim()];
		index++;
		while (index < lines.length && (lines[index] ?? "").trim() && !startsBlock(lines, index)) paragraph.push((lines[index++] ?? "").trim());
		blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) });
	}

	return blocks;
}

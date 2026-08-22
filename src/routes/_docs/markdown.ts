function escapeHtml(value: string) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/<[^>]+>/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function inline(source: string) {
	const code: string[] = [];
	let value = source.replace(/`([^`]+)`/g, (_, contents: string) => {
		code.push(`<code>${escapeHtml(contents)}</code>`);
		return `%%CODE${code.length - 1}%%`;
	});

	value = escapeHtml(value)
		.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]+)&quot;)?\)/g, '<a href="$2" title="$3">$1</a>')
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/__([^_]+)__/g, "<strong>$1</strong>")
		.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
		.replace(/~~([^~]+)~~/g, "<del>$1</del>");

	return value.replace(/%%CODE(\d+)%%/g, (_, index: string) => code[Number(index)] ?? "");
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

function startsBlock(lines: string[], index: number) {
	const line = lines[index] ?? "";
	return (
		/^```/.test(line) ||
		/^#{1,6}\s/.test(line) ||
		/^\s*(?:[-*_]\s*){3,}$/.test(line) ||
		/^>\s?/.test(line) ||
		/^\s*[-+*]\s+/.test(line) ||
		/^\s*\d+\.\s+/.test(line) ||
		(Boolean(lines[index + 1]) && isTableDivider(lines[index + 1] ?? ""))
	);
}

export function renderMarkdown(source: string) {
	const lines = source.replaceAll("\r\n", "\n").split("\n");
	const output: string[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index] ?? "";

		if (!line.trim()) {
			index++;
			continue;
		}

		const fence = line.match(/^```([^\s]*)/);
		if (fence) {
			const language = fence[1] ?? "";
			const body: string[] = [];
			index++;
			while (index < lines.length && !/^```\s*$/.test(lines[index] ?? "")) body.push(lines[index++] ?? "");
			index++;
			output.push(`<pre><code class="language-${escapeHtml(language)}">${escapeHtml(body.join("\n"))}</code></pre>`);
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			const level = heading[1]?.length ?? 2;
			const label = inline(heading[2] ?? "");
			output.push(`<h${level} id="${slugify(heading[2] ?? "")}">${label}</h${level}>`);
			index++;
			continue;
		}

		if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
			output.push("<hr>");
			index++;
			continue;
		}

		if (lines[index + 1] && isTableDivider(lines[index + 1] ?? "")) {
			const headings = cells(line);
			index += 2;
			const rows: string[][] = [];
			while (index < lines.length && (lines[index] ?? "").includes("|") && (lines[index] ?? "").trim()) rows.push(cells(lines[index++] ?? ""));
			output.push(
				`<div class="docs-table"><table><thead><tr>${headings.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
			);
			continue;
		}

		if (/^>\s?/.test(line)) {
			const body: string[] = [];
			while (index < lines.length && /^>\s?/.test(lines[index] ?? "")) body.push((lines[index++] ?? "").replace(/^>\s?/, ""));
			output.push(`<blockquote><p>${inline(body.join(" "))}</p></blockquote>`);
			continue;
		}

		const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
		const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
		if (unordered || ordered) {
			const tag = unordered ? "ul" : "ol";
			const expression = unordered ? /^\s*[-+*]\s+(.+)$/ : /^\s*\d+\.\s+(.+)$/;
			const items: string[] = [];
			while (index < lines.length) {
				const match = (lines[index] ?? "").match(expression);
				if (!match) break;
				items.push(`<li>${inline(match[1] ?? "")}</li>`);
				index++;
			}
			output.push(`<${tag}>${items.join("")}</${tag}>`);
			continue;
		}

		const paragraph = [line.trim()];
		index++;
		while (index < lines.length && (lines[index] ?? "").trim() && !startsBlock(lines, index)) paragraph.push((lines[index++] ?? "").trim());
		output.push(`<p>${inline(paragraph.join(" "))}</p>`);
	}

	return output.join("\n");
}

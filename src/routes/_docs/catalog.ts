export type DocKind = "component" | "hook" | "attachment";

export type DocUnit = {
	kind: DocKind;
	slug: string;
	title: string;
	description: string;
	href: string;
	markdown: string;
};

const componentReadmes = import.meta.glob("/src/lib/components/ui/*/README.md", {
	eager: true,
	import: "default",
	query: "?raw"
}) as Record<string, string>;

const sharedReadmes = import.meta.glob("/src/lib/{hooks,attachments}/README.md", {
	eager: true,
	import: "default",
	query: "?raw"
}) as Record<string, string>;

function titleFromSlug(slug: string) {
	const labels: Record<string, string> = {
		ipv4: "IPv4",
		ipv6: "IPv6",
		otp: "OTP",
		qr: "QR"
	};

	return slug
		.split("-")
		.map((part, index) => labels[part] ?? (part === "of" && index > 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
		.join(" ");
}

function metadata(markdown: string, fallbackTitle: string) {
	const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallbackTitle;
	const afterTitle = markdown.replace(/^#\s+.+\n+/, "");
	const description =
		afterTitle
			.split(/\n\s*\n/)[0]
			?.replace(/\s+/g, " ")
			.trim() ?? "";

	return { title, description };
}

function promoteSectionHeadings(markdown: string) {
	let fence: { marker: "`" | "~"; length: number } | undefined;

	// Shared README sections become standalone pages, but fenced examples must keep their source headings verbatim.
	return markdown
		.split("\n")
		.map((line) => {
			const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);

			if (fenceMatch) {
				const sequence = fenceMatch[1] ?? "";
				const marker = sequence.startsWith("`") ? "`" : "~";

				if (!fence) {
					fence = { marker, length: sequence.length };
				} else if (marker === fence.marker && sequence.length >= fence.length && fenceMatch[2]?.trim() === "") {
					fence = undefined;
				}

				return line;
			}

			if (fence) return line;

			return line.replace(/^( {0,3})#{3,6}(?=\s|$)/, (heading) => heading.slice(0, -1));
		})
		.join("\n");
}

function section(markdown: string, heading: string) {
	const marker = `## ${heading}`;
	const start = markdown.indexOf(marker);
	if (start === -1) return markdown;

	const bodyStart = start + marker.length;
	const nextHeading = markdown.slice(bodyStart).search(/^## /m);
	const body = nextHeading === -1 ? markdown.slice(bodyStart) : markdown.slice(bodyStart, bodyStart + nextHeading);
	return `# ${heading}\n${promoteSectionHeadings(body.trim())}\n`;
}

function slugFromTitle(title: string) {
	return title
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
}

function sharedReadmeUnits(kind: "hook" | "attachment", directory: "hooks" | "attachments"): DocUnit[] {
	const readmePath = `/src/lib/${directory}/README.md`;
	const readme = sharedReadmes[readmePath];

	if (!readme) throw new Error(`Missing shared documentation file: ${readmePath}`);

	const headings = [...readme.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]?.trim()).filter((heading) => heading !== undefined);
	const installationIndex = headings.indexOf("Installation");
	const creditsIndex = headings.indexOf("Credits");

	if (installationIndex === -1 || creditsIndex <= installationIndex + 1) {
		throw new Error(`${readmePath} must place at least one public unit section between "## Installation" and "## Credits"`);
	}

	return headings
		.slice(installationIndex + 1, creditsIndex)
		.map((heading) => {
			const slug = slugFromTitle(heading);
			const markdown = section(readme, heading);
			const { title, description } = metadata(markdown, heading);

			return { kind, slug, title, description, href: `/${directory}/${slug}`, markdown };
		})
		.sort((a, b) => a.title.localeCompare(b.title));
}

export const components: DocUnit[] = Object.entries(componentReadmes)
	.map(([path, markdown]) => {
		const slug = path.split("/").at(-2) ?? "component";
		const title = titleFromSlug(slug);
		const { description } = metadata(markdown, title);
		const normalizedMarkdown = markdown.replace(/^#\s+.+$/m, `# ${title}`);

		return { kind: "component" as const, slug, title, description, href: `/components/${slug}`, markdown: normalizedMarkdown };
	})
	.sort((a, b) => a.title.localeCompare(b.title));

export const hooks = sharedReadmeUnits("hook", "hooks");
export const attachments = sharedReadmeUnits("attachment", "attachments");

export const units = [...components, ...hooks, ...attachments];

export function getUnit(kind: DocKind, slug: string) {
	return units.find((unit) => unit.kind === kind && unit.slug === slug);
}

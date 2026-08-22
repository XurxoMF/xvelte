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

const hooksReadme = import.meta.glob("/src/lib/hooks/README.md", {
	eager: true,
	import: "default",
	query: "?raw"
}) as Record<string, string>;

const attachmentsReadme = import.meta.glob("/src/lib/attachments/README.md", {
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

function section(markdown: string, heading: string) {
	const marker = `## ${heading}`;
	const start = markdown.indexOf(marker);
	if (start === -1) return markdown;

	const bodyStart = start + marker.length;
	const nextHeading = markdown.slice(bodyStart).search(/^## /m);
	const body = nextHeading === -1 ? markdown.slice(bodyStart) : markdown.slice(bodyStart, bodyStart + nextHeading);
	return `# ${heading}\n${body.trim()}\n`;
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

const hookSource = Object.values(hooksReadme)[0] ?? "";
const hookDefinitions = [
	{ slug: "is-mobile", heading: "IsMobile" },
	{ slug: "use-frecency", heading: "UseFrecency" },
	{ slug: "use-ramp", heading: "useRamp" },
	{ slug: "use-toc", heading: "UseToc" }
];

export const hooks: DocUnit[] = hookDefinitions.map(({ slug, heading }) => {
	const markdown = section(hookSource, heading);
	const { title, description } = metadata(markdown, heading);
	return { kind: "hook", slug, title, description, href: `/hooks/${slug}`, markdown };
});

const attachmentSource = section(Object.values(attachmentsReadme)[0] ?? "", "shortcut");
const attachmentMeta = metadata(attachmentSource, "shortcut");

export const attachments: DocUnit[] = [
	{
		kind: "attachment",
		slug: "shortcut",
		title: attachmentMeta.title,
		description: attachmentMeta.description,
		href: "/attachments/shortcut",
		markdown: attachmentSource
	}
];

export const units = [...components, ...hooks, ...attachments];

export function getUnit(kind: DocKind, slug: string) {
	return units.find((unit) => unit.kind === kind && unit.slug === slug);
}

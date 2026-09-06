export type DocKind = "component" | "hook" | "attachment";

export type DocUnit = {
	kind: DocKind;
	slug: string;
	title: string;
	description: string;
	href: string;
	markdown: string;
};

const unitGuides = import.meta.glob(["/src/lib/components/ui/*/*.md", "/src/lib/hooks/*.md", "/src/lib/attachments/*.md", "!/src/lib/**/README.md"], {
	eager: true,
	import: "default",
	query: "?raw"
}) as Record<string, string>;

function metadata(markdown: string, path: string) {
	const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
	if (!title) throw new Error(`Missing level-one title in unit guide: ${path}`);

	const afterTitle = markdown.replace(/^#\s+.+\n+/, "");
	const description =
		afterTitle
			.split(/\n\s*\n/)[0]
			?.replace(/\s+/g, " ")
			.trim() ?? "";

	return { title, description };
}

function unitFromGuide(path: string, markdown: string): DocUnit {
	const slug = path.split("/").at(-1)?.replace(/\.md$/, "");
	if (!slug) throw new Error(`Cannot derive unit slug from guide path: ${path}`);

	const componentMatch = path.match(/^\/src\/lib\/components\/ui\/([^/]+)\/([^/]+)\.md$/);
	if (componentMatch) {
		const directorySlug = componentMatch[1];
		if (directorySlug !== slug) throw new Error(`Component guide must match its directory name: ${path}`);

		const { title, description } = metadata(markdown, path);
		return { kind: "component", slug, title, description, href: `/components/${slug}`, markdown };
	}

	const standaloneMatch = path.match(/^\/src\/lib\/(hooks|attachments)\/([^/]+)\.md$/);
	if (!standaloneMatch) throw new Error(`Unsupported unit guide path: ${path}`);

	const directory = standaloneMatch[1] as "hooks" | "attachments";
	const kind = directory === "hooks" ? "hook" : "attachment";
	const { title, description } = metadata(markdown, path);

	return { kind, slug, title, description, href: `/${directory}/${slug}`, markdown };
}

export const units = Object.entries(unitGuides)
	.map(([path, markdown]) => unitFromGuide(path, markdown))
	.sort((a, b) => a.title.localeCompare(b.title));

export const components = units.filter((unit) => unit.kind === "component");
export const hooks = units.filter((unit) => unit.kind === "hook");
export const attachments = units.filter((unit) => unit.kind === "attachment");

export function getUnit(kind: DocKind, slug: string) {
	return units.find((unit) => unit.kind === kind && unit.slug === slug);
}

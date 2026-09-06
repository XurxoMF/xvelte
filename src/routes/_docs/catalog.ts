/** The library scope in which a documented resource belongs. */
export type DocScope = "shared" | "tauri";

/** The resource categories available within either scope. */
export type DocKind = "component" | "hook" | "attachment" | "class" | "type" | "utility";

/** A documented resource and its independent scope, category, and destination. */
export type DocUnit = {
	scope: DocScope;
	kind: DocKind;
	slug: string;
	title: string;
	description: string;
	href: string;
	markdown: string;
};

export const scopes: { value: DocScope; label: string }[] = [
	{ value: "shared", label: "Shared" },
	{ value: "tauri", label: "Tauri" }
];

export const categories: { kind: DocKind; directory: string; label: string }[] = [
	{ kind: "component", directory: "components", label: "Components" },
	{ kind: "hook", directory: "hooks", label: "Hooks" },
	{ kind: "attachment", directory: "attachments", label: "Attachments" },
	{ kind: "class", directory: "classes", label: "Classes" },
	{ kind: "type", directory: "types", label: "Types" },
	{ kind: "utility", directory: "utils", label: "Utilities" }
];

const unitGuides = import.meta.glob(
	[
		"/src/lib/components/ui/*/*.md",
		"/src/lib/{hooks,attachments,classes,types,interfaces,utils}/*.md",
		"/src/lib/*.md",
		"/src/lib/tauri/**/*.md",
		"!/src/lib/**/README.md"
	],
	{
		eager: true,
		import: "default",
		query: "?raw"
	}
) as Record<string, string>;

/**
 * Reads the title and description from a guide's introduction.
 * @param markdown - Complete guide text.
 * @param path - Source path used for invalid-guide diagnostics.
 * @returns The visible title and catalog description.
 */
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

/**
 * Classifies a guide by its scope and folder and builds its category-based page URL.
 * @param path - Absolute Vite source path.
 * @param markdown - Complete guide text.
 * @returns The catalog entry; unsupported folders fail rather than silently disappearing.
 */
function unitFromGuide(path: string, markdown: string): DocUnit {
	const relativePath = path.replace(/^\/src\/lib\//, "");
	const scope: DocScope = relativePath.startsWith("tauri/") ? "tauri" : "shared";
	const parts = relativePath.replace(/^tauri\//, "").split("/");
	const slug = parts.at(-1)?.replace(/\.md$/, "");
	if (!slug) throw new Error(`Cannot derive unit slug from guide path: ${path}`);

	// Root modules are utilities; interfaces share the Types category.
	const directory = parts.length === 1 ? "utils" : parts[0] === "interfaces" ? "types" : parts[0];
	const category = categories.find((category) => category.directory === directory);
	if (!category) throw new Error(`Unsupported unit guide path: ${path}`);
	if (category.kind === "component" && parts.at(-2) !== slug) {
		throw new Error(`Component guide must match its directory name: ${path}`);
	}

	const { title, description } = metadata(markdown, path);
	const href = scope === "tauri" ? `/tauri/${category.directory}/${slug}` : `/${category.directory}/${slug}`;
	return { scope, kind: category.kind, slug, title, description, href, markdown };
}

export const units = Object.entries(unitGuides)
	.map(([path, markdown]) => unitFromGuide(path, markdown))
	.sort((a, b) => a.title.localeCompare(b.title));

// Category-based URLs require every guide to resolve to a unique destination.
if (new Set(units.map((unit) => unit.href)).size !== units.length) {
	throw new Error("Documentation guides must have unique destinations.");
}

export const components = units.filter((unit) => unit.scope === "shared" && unit.kind === "component");
export const hooks = units.filter((unit) => unit.scope === "shared" && unit.kind === "hook");
export const attachments = units.filter((unit) => unit.scope === "shared" && unit.kind === "attachment");
export const tauri = units.filter((unit) => unit.scope === "tauri");

export const navigation = scopes.map((scope) => ({
	...scope,
	categories: categories
		.map((category) => ({
			...category,
			id: `${scope.value}:${category.kind}`,
			units: units.filter((unit) => unit.scope === scope.value && unit.kind === category.kind)
		}))
		.filter((category) => category.units.length > 0)
}));

/**
 * Finds the documentation associated with an existing page URL.
 * @param href - Canonical documentation destination.
 * @returns The matching entry, or undefined for an unknown page.
 */
export function getUnit(href: string) {
	return units.find((unit) => unit.href === href);
}

import type { Component } from "svelte";

/** A compiled preview and its source, associated with one documentation destination. */
export type DocExample = {
	href: string;
	slug: string;
	name: string;
	title: string;
	load: () => Promise<{ component: Component; source: string }>;
};

const exampleComponents = import.meta.glob("/src/routes/_examples/{components,hooks,attachments,tauri}/**/*.svelte", {
	import: "default"
}) as Record<string, () => Promise<Component>>;

const exampleSources = import.meta.glob("/src/routes/_examples/{components,hooks,attachments,tauri}/**/*.svelte", {
	import: "default",
	query: "?raw"
}) as Record<string, () => Promise<string>>;

/**
 * Formats an example filename for its visible title.
 * @param name - Kebab-case example name without an extension.
 * @returns A title with each word capitalized.
 */
function titleFromName(name: string) {
	return name
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export const examples: DocExample[] = Object.entries(exampleComponents).flatMap(([path, loadComponent]) => {
	const match = path.match(/\/_examples\/(components|hooks|attachments|tauri)\/([^/]+)\/([^/]+)\.svelte$/);
	if (!match) return [];

	const [, category, slug, name] = match;
	const href = `/${category}/${slug}`;

	return [
		{
			href,
			slug: slug ?? "",
			name: name ?? "example",
			title: titleFromName(name ?? "example"),
			load: async () => {
				const [component, source] = await Promise.all([loadComponent(), exampleSources[path]?.() ?? Promise.resolve("")]);
				return { component, source };
			}
		}
	];
});

/**
 * Finds the preview requested by a documentation marker.
 * @param href - Canonical documentation destination.
 * @param name - Example name from the guide marker.
 * @returns The matching preview, or undefined when no example is registered.
 */
export function getExample(href: string, name: string) {
	return examples.find((example) => example.href === href && example.name === name);
}

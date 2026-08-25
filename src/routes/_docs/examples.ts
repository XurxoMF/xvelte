import type { Component } from "svelte";
import type { DocKind } from "./catalog";

export type DocExample = {
	kind: DocKind;
	slug: string;
	name: string;
	title: string;
	load: () => Promise<{ component: Component; source: string }>;
};

const exampleComponents = import.meta.glob("/src/routes/_examples/{components,hooks,attachments}/**/*.svelte", {
	import: "default"
}) as Record<string, () => Promise<Component>>;

const exampleSources = import.meta.glob("/src/routes/_examples/{components,hooks,attachments}/**/*.svelte", {
	import: "default",
	query: "?raw"
}) as Record<string, () => Promise<string>>;

function titleFromName(name: string) {
	return name
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export const examples: DocExample[] = Object.entries(exampleComponents).flatMap(([path, loadComponent]) => {
	const match = path.match(/\/_examples\/(components|hooks|attachments)\/([^/]+)\/([^/]+)\.svelte$/);
	if (!match) return [];

	const [, category, slug, name] = match;
	const kind: DocKind = category === "components" ? "component" : category === "hooks" ? "hook" : "attachment";

	return [
		{
			kind,
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

export function getExample(kind: DocKind, slug: string, name: string) {
	return examples.find((example) => example.kind === kind && example.slug === slug && example.name === name);
}

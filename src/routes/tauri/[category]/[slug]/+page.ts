import { categories, tauri } from "../../../_docs/catalog";

export const entries = () =>
	tauri.flatMap(({ kind, slug }) => {
		const category = categories.find((category) => category.kind === kind);
		return category ? [{ category: category.directory, slug }] : [];
	});

export const load = ({ params }) => ({ category: params.category, slug: params.slug });

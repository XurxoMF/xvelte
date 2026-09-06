import { categories, tauri } from "../../_docs/catalog";

export const entries = () =>
	categories.filter((category) => tauri.some((unit) => unit.kind === category.kind)).map(({ directory }) => ({ category: directory }));

export const load = ({ params }) => ({ category: params.category });

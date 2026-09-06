import { tauri } from "../../_docs/catalog";

export const entries = () => tauri.map(({ slug }) => ({ slug }));
export const load = ({ params }) => ({ slug: params.slug });

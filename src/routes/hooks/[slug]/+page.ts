import { hooks } from "../../_docs/catalog";

export const entries = () => hooks.map(({ slug }) => ({ slug }));
export const load = ({ params }) => ({ slug: params.slug });

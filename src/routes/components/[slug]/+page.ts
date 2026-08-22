import { components } from "../../_docs/catalog";

export const entries = () => components.map(({ slug }) => ({ slug }));
export const load = ({ params }) => ({ slug: params.slug });

import { styles } from "../../_docs/catalog";

export const entries = () => styles.map(({ slug }) => ({ slug }));
export const load = ({ params }) => ({ slug: params.slug });

import { attachments } from "../../_docs/catalog";

export const entries = () => attachments.map(({ slug }) => ({ slug }));
export const load = ({ params }) => ({ slug: params.slug });

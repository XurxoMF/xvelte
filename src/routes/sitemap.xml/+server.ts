import type { RequestHandler } from "./$types";

import { navigation, units } from "../_docs/catalog";

const siteOrigin = "https://xvelte.xurxomf.xyz";

const categoryPaths = navigation.flatMap((scope) =>
	scope.categories.map((category) => `${scope.value === "tauri" ? "/tauri" : ""}/${category.directory}`)
);
const paths = ["/", "/installation", "/tauri", ...categoryPaths, ...units.map((unit) => unit.href)];

export const prerender = true;

/** Returns the canonical documentation URLs as a prerendered XML sitemap. */
export const GET: RequestHandler = () => {
	const urls = [...new Set(paths)].map((path) => `\t<url><loc>${new URL(path, siteOrigin).href}</loc></url>`).join("\n");

	return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
		headers: {
			"Cache-Control": "public, max-age=0, s-maxage=86400",
			"Content-Type": "application/xml"
		}
	});
};

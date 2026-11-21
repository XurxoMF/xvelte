export const installationGuides = [
	{
		slug: "web-ssr",
		title: "Web SSR",
		description: "Render complete HTML for every request, including query-dependent pages, using an official Bun or Node server adapter.",
		badge: "Dynamic SEO",
		server: "Required",
		html: "Per request"
	},
	{
		slug: "web-ssg",
		title: "Web SSG",
		description: "Generate complete static HTML during the build for websites whose public URLs and content are known ahead of deployment.",
		badge: "Static SEO",
		server: "Not required",
		html: "At build time"
	},
	{
		slug: "web-spa",
		title: "Web SPA",
		description:
			"Ship a static application shell and render everything in the browser for dashboards and tools that do not depend on search indexing.",
		badge: "Browser only",
		server: "Not required",
		html: "Application shell"
	},
	{
		slug: "web-tauri",
		title: "Web SPA + Tauri SPA",
		description: "Install one client-rendered application for both a static website and a Tauri desktop shell in a single workflow.",
		badge: "Web + native",
		server: "Not required",
		html: "Application shell"
	}
] as const;

export type InstallationGuideSlug = (typeof installationGuides)[number]["slug"];

/** Returns the installation metadata for a stable guide slug. */
export function getInstallationGuide(slug: InstallationGuideSlug) {
	return installationGuides.find((guide) => guide.slug === slug)!;
}

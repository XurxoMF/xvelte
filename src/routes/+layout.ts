import { dev } from "$app/environment";

const isTauriBuild = import.meta.env.MODE === "tauri";

// Static prerendering emits complete HTML for the documentation host.
// A separate 200.html fallback keeps client-side navigation available without replacing the prerendered home page.
export const prerender = true;

// Development and Tauri stay client-rendered; only the public website needs HTML for crawlers.
export const ssr = !dev && !isTauriBuild;

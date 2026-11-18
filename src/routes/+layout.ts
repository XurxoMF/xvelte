const isTauriBuild = import.meta.env.MODE === "tauri";

// The public website is fully prerendered for SEO. Tauri receives a client-rendered SPA instead.
export const prerender = !isTauriBuild;
export const ssr = !isTauriBuild;

import { browser } from "$app/environment";
import { isTauri } from "@tauri-apps/api/core";

/** The execution environments supported by xvelte's shared SvelteKit frontend. */
export type Runtime = "tauri" | "web";

/**
 * Reports whether the current browser context belongs to a Tauri webview.
 *
 * The SvelteKit browser guard keeps the check safe during prerendering and SSR.
 *
 * @returns `true` inside Tauri and `false` in a normal browser or on the server.
 */
export function isTauriRuntime(): boolean {
	return browser && isTauri();
}

/**
 * Returns the stable runtime name used when a preview needs separate web and native behavior.
 *
 * @returns `"tauri"` inside a Tauri webview, otherwise `"web"`.
 */
export function getRuntime(): Runtime {
	return isTauriRuntime() ? "tauri" : "web";
}

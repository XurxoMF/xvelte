import { browser } from "$app/environment";
import { isTauri as isTauriWebview } from "@tauri-apps/api/core";

/**
 * Identifies the current environment for runtime names and explicit equality checks.
 *
 * The browser guard keeps Tauri detection safe during SSR and prerendering.
 *
 * @returns `"tauri"` inside a Tauri webview, otherwise `"web"`, including on the server.
 */
export function isTauri(): "tauri" | "web" {
	return browser && isTauriWebview() ? "tauri" : "web";
}

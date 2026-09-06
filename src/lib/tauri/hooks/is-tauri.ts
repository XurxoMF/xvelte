import { browser } from "$app/environment";
import { isTauri as isTauriWebview } from "@tauri-apps/api/core";

/** Identifies the current environment for runtime names and explicit equality checks. */
export class IsTauri {
	/** `"tauri"` inside a Tauri webview, otherwise `"web"`, including on the server. */
	readonly current: "tauri" | "web";

	/** Creates an SSR-safe snapshot of the current runtime. */
	constructor() {
		this.current = browser && isTauriWebview() ? "tauri" : "web";
	}
}

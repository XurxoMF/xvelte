import { toast as sonnerToast } from "svelte-sonner";

import Root, { type RootProps } from "./sonner-root.svelte";

/**
 * Creates and manages notifications through xvelte while forwarding the complete installed `svelte-sonner` toast API.
 *
 * @param args - Toast content and options accepted by the underlying toast function.
 * @returns The created or updated toast identifier.
 */
export const toast = Object.assign((...args: Parameters<typeof sonnerToast>): ReturnType<typeof sonnerToast> => sonnerToast(...args), sonnerToast);

export {
	Root,
	//
	type RootProps
};

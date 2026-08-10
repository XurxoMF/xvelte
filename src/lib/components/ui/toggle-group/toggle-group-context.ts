import { createContext } from "svelte";

import type { RootSizes, RootVariants } from "$lib/components/ui/toggle";

export type ToggleGroupContext = {
	variant?: RootVariants | undefined;
	size?: RootSizes | undefined;
	spacing?: number | undefined;
	orientation?: "horizontal" | "vertical" | undefined;
};

const [getToggleGroupState, setToggleGroupState] = createContext<ToggleGroupContext>();

/**
 * Provides styling and orientation to descendant toggle-group items.
 *
 * @param context - Reactive variant, size, spacing, and orientation values.
 */
export function setToggleGroupContext(context: ToggleGroupContext) {
	return setToggleGroupState(context);
}

/** @returns Styling and orientation from the nearest toggle-group root. */
export function getToggleGroupContext() {
	return getToggleGroupState();
}

import { getContext, setContext } from "svelte";

const COMPARE_KEY = Symbol("compare-slider");

type CompareContext = {
	position: () => number;
	orientation: () => "horizontal" | "vertical";
	isDragging: () => boolean;
};

/**
 * Provides compare-slider position, orientation, and dragging state.
 *
 * @param props - Reactive getters owned by the slider root.
 */
export function setCompareContext(props: CompareContext) {
	setContext(COMPARE_KEY, props);
}

/** @returns The nearest compare-slider context. */
export function getCompareContext() {
	return getContext<CompareContext>(COMPARE_KEY);
}

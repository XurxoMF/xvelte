import { createContext } from "svelte";

type CompareContext = {
	readonly position: number;
	readonly orientation: "horizontal" | "vertical";
	readonly isDragging: boolean;
};

const [getCompareState, setCompareState] = createContext<CompareContext>();

/**
 * Provides compare-slider position, orientation, and dragging state.
 *
 * @param props - Reactive values owned by the slider root.
 */
export function setCompareContext(props: CompareContext) {
	return setCompareState(props);
}

/** @returns The nearest compare-slider context. */
export function getCompareContext() {
	return getCompareState();
}

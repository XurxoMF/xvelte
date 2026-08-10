import { createContext } from "svelte";

type ScrubbableContext = {
	value: () => number;
	isDragging: () => boolean;
};

const [getScrubbableState, setScrubbableState] = createContext<ScrubbableContext>();

/**
 * Provides the current value and dragging state to scrubbable parts.
 *
 * @param props - Reactive getters owned by the scrubbable root.
 */
export function setScrubbableContext(props: ScrubbableContext) {
	return setScrubbableState(props);
}

/** @returns The nearest scrubbable context. */
export function getScrubbableContext() {
	return getScrubbableState();
}

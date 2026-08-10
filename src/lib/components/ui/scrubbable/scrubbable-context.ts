import { getContext, setContext } from "svelte";

const SCRUBBABLE_KEY = Symbol("scrubbable");

type ScrubbableContext = {
	value: () => number;
	isDragging: () => boolean;
};

/**
 * Provides the current value and dragging state to scrubbable parts.
 *
 * @param props - Reactive getters owned by the scrubbable root.
 */
export function setScrubbableContext(props: ScrubbableContext) {
	setContext(SCRUBBABLE_KEY, props);
}

/** @returns The nearest scrubbable context. */
export function getScrubbableContext() {
	return getContext<ScrubbableContext>(SCRUBBABLE_KEY);
}

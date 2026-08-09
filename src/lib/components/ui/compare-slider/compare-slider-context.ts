import { getContext, setContext } from "svelte";

const COMPARE_KEY = Symbol("compare-slider");

type CompareContext = {
	position: () => number;
	orientation: () => "horizontal" | "vertical";
	isDragging: () => boolean;
};

export function setCompareContext(props: CompareContext) {
	setContext(COMPARE_KEY, props);
}

export function getCompareContext() {
	return getContext<CompareContext>(COMPARE_KEY);
}

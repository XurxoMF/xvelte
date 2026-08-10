import { getContext, setContext } from "svelte";

const WALKTHROUGH_KEY = Symbol("walkthrough");

export type Step = {
	target: string;
	title: string;
	description: string;
	position?: "top" | "bottom" | "left" | "right";
};

export type WalkthroughContext = {
	isOpen: () => boolean;
	currentStepIndex: () => number;
	currentStep: () => Step | undefined;
	isLastStep: () => boolean;
	next: () => void;
	prev: () => void;
	close: () => void;
};

/**
 * Provides walkthrough state and navigation controls to descendant parts.
 *
 * @param ctx - Reactive step state and navigation callbacks.
 */
export function setWalkthroughContext(ctx: WalkthroughContext) {
	setContext(WALKTHROUGH_KEY, ctx);
}

/** @returns The nearest walkthrough context. */
export function getWalkthroughContext() {
	return getContext<WalkthroughContext>(WALKTHROUGH_KEY);
}

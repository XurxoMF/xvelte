import { MediaQuery } from "svelte/reactivity";

const DEFAULT_MOBILE_BREAKPOINT = 768;

/** Reactive media query that matches viewport widths below a mobile breakpoint. */
export class IsMobile extends MediaQuery {
	/**
	 * @param breakpoint - First viewport width considered non-mobile, in pixels.
	 */
	constructor(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		super(`max-width: ${breakpoint - 1}px`);
	}
}

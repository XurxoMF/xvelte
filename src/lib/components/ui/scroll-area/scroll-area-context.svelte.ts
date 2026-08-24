import { createContext } from "svelte";

/** Fixed axis owned by one Scroll Area scrollbar part. */
export type ScrollbarOrientation = "vertical" | "horizontal";

/** Tracks mounted scrollbar parts so Root can derive whether it needs a corner. */
export class ScrollAreaContext {
	#verticalScrollbars = $state(0);
	#horizontalScrollbars = $state(0);

	/** @returns Whether at least one scrollbar exists on each axis. */
	get hasCorner() {
		return this.#verticalScrollbars > 0 && this.#horizontalScrollbars > 0;
	}

	/**
	 * Registers one mounted scrollbar part.
	 *
	 * @param orientation - Fixed axis rendered by the part.
	 * @returns A cleanup function that unregisters that exact mount.
	 */
	registerScrollbar(orientation: ScrollbarOrientation) {
		if (orientation === "vertical") this.#verticalScrollbars++;
		else this.#horizontalScrollbars++;

		let registered = true;

		return () => {
			if (!registered) return;
			registered = false;

			if (orientation === "vertical") this.#verticalScrollbars--;
			else this.#horizontalScrollbars--;
		};
	}
}

const [getScrollAreaContext, provideScrollAreaContext] = createContext<ScrollAreaContext>();

/** Creates and provides the state shared by one Scroll Area composition. */
export function setScrollAreaContext() {
	return provideScrollAreaContext(new ScrollAreaContext());
}

/** Returns the state from the nearest Scroll Area Root. */
export { getScrollAreaContext };

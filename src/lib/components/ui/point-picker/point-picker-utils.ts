/** Two-dimensional coordinate published by Point Picker. */
export type Point = {
	x: number;
	y: number;
};

/** Corner where both coordinate axes begin at their minimum values. */
export type PointOrigin = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Native event with Point Picker Root as its current target. */
export type RootEvent<T extends Event> = T & { currentTarget: HTMLDivElement };

/**
 * Constrains a number to an inclusive range.
 *
 * @param number - Value to constrain.
 * @param min - Lowest permitted value.
 * @param max - Highest permitted value.
 */
export function clamp(number: number, min: number, max: number) {
	return Math.max(min, Math.min(max, number));
}

/**
 * Snaps a number to the closest step measured from a minimum value.
 *
 * @param number - Value to snap.
 * @param min - Origin from which steps are measured.
 * @param step - Distance between valid values; non-positive values disable snapping.
 */
export function quantize(number: number, min: number, step: number) {
	return step > 0 ? min + Math.round((number - min) / step) * step : number;
}

/**
 * Calculates internal grid-line positions for one coordinate axis.
 *
 * @param min - Inclusive axis minimum from which intervals are measured.
 * @param max - Inclusive axis maximum.
 * @param interval - Coordinate distance between lines; non-positive values hide the axis grid.
 * @param reversed - Whether the minimum is displayed at the far edge.
 * @returns Percentage positions between the two outer axis edges.
 */
export function getGridPositions(min: number, max: number, interval: number, reversed: boolean) {
	const span = max - min;
	if (span <= 0 || interval <= 0 || !Number.isFinite(span) || !Number.isFinite(interval)) return [];

	const lineCount = Math.max(0, Math.ceil(span / interval) - 1);
	return Array.from({ length: lineCount }, (_, index) => {
		const progress = ((index + 1) * interval) / span;
		return 100 * (reversed ? 1 - progress : progress);
	});
}

/**
 * Applies directional, page, or boundary keyboard navigation to a point.
 *
 * @param key - Keyboard key reported by the event.
 * @param value - Current point.
 * @param bounds - Coordinate limits, step sizes, and visual origin.
 * @param horizontalPage - Whether page keys move along the horizontal axis.
 * @returns The requested point, or undefined when the key is not handled.
 */
export function getKeyboardValue(
	key: string,
	value: Point,
	bounds: { minX: number; maxX: number; minY: number; maxY: number; stepX: number; stepY: number; origin: PointOrigin },
	horizontalPage = false
): Point | undefined {
	const { x, y } = value;
	const { minX, maxX, minY, maxY, stepX, stepY, origin } = bounds;
	const horizontalDirection = origin.endsWith("left") ? 1 : -1;
	const verticalDirection = origin.startsWith("top") ? 1 : -1;

	switch (key) {
		case "ArrowRight":
			return { x: x + stepX * horizontalDirection, y };
		case "ArrowLeft":
			return { x: x - stepX * horizontalDirection, y };
		case "ArrowUp":
			return { x, y: y - stepY * verticalDirection };
		case "ArrowDown":
			return { x, y: y + stepY * verticalDirection };
		case "PageUp":
			if (horizontalPage) return { x: x - stepX * horizontalDirection * 10, y };
			return { x, y: y - stepY * verticalDirection * 10 };
		case "PageDown":
			if (horizontalPage) return { x: x + stepX * horizontalDirection * 10, y };
			return { x, y: y + stepY * verticalDirection * 10 };
		case "Home":
			return { x: minX, y: minY };
		case "End":
			return { x: maxX, y: maxY };
	}
}

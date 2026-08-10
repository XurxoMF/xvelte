export type Point = {
	x: number;
	y: number;
};

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
 * Applies directional, page, or boundary keyboard navigation to a point.
 *
 * @param key - Keyboard key reported by the event.
 * @param value - Current point.
 * @param bounds - Coordinate limits and step sizes.
 * @returns The requested point, or undefined when the key is not handled.
 */
export function getKeyboardValue(
	key: string,
	value: Point,
	bounds: { minX: number; maxX: number; minY: number; maxY: number; stepX: number; stepY: number }
): Point | undefined {
	const { x, y } = value;
	const { minX, maxX, minY, maxY, stepX, stepY } = bounds;

	switch (key) {
		case "ArrowRight":
			return { x: x + stepX, y };
		case "ArrowLeft":
			return { x: x - stepX, y };
		case "ArrowUp":
			return { x, y: y + stepY };
		case "ArrowDown":
			return { x, y: y - stepY };
		case "PageUp":
			return { x, y: y + stepY * 10 };
		case "PageDown":
			return { x, y: y - stepY * 10 };
		case "Home":
			return { x: minX, y: maxY };
		case "End":
			return { x: maxX, y: minY };
	}
}

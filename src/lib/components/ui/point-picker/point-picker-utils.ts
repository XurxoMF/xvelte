import type { Point } from "./point-picker-types";

export type RootEvent<T extends Event> = T & { currentTarget: HTMLDivElement };

export function clamp(number: number, min: number, max: number) {
	return Math.max(min, Math.min(max, number));
}

export function quantize(number: number, min: number, step: number) {
	return step > 0 ? min + Math.round((number - min) / step) * step : number;
}

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

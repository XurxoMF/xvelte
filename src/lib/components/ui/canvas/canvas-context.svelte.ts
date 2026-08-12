import { createContext } from "svelte";

/** A point expressed in canvas-space coordinates. */
export type CanvasPoint = { x: number; y: number };

/** A rectangular node boundary expressed in canvas-space coordinates. */
export type CanvasRect = { x: number; y: number; width: number; height: number };

/** Supported connector path algorithms. */
export type EdgePathType = "bezier" | "smoothstep" | "straight";

/** Shared reactive state and actions provided by a canvas root. */
export type CanvasContext = {
	readonly x: number;
	readonly y: number;
	readonly zoom: number;
	readonly minZoom: number;
	readonly maxZoom: number;
	readonly snap: number;
	readonly panning: boolean;
	readonly viewport: HTMLDivElement | null;
	readonly overlay: HTMLDivElement | null;
	readonly nodes: Record<string, CanvasRect>;
	toCanvas: (clientX: number, clientY: number) => CanvasPoint;
	toScreen: (point: CanvasPoint) => CanvasPoint;
	panBy: (dx: number, dy: number) => void;
	panTo: (x: number, y: number) => void;
	zoomBy: (factor: number, origin?: CanvasPoint | undefined) => void;
	zoomTo: (zoom: number, origin?: CanvasPoint | undefined) => void;
	fitView: (padding?: number | undefined) => void;
	reset: () => void;
	registerNode: (id: string, rect: CanvasRect) => void;
	unregisterNode: (id: string) => void;
};

const [getCanvasContextValue, provideCanvasContext] = createContext<CanvasContext>();

/**
 * Provides canvas state to compound descendants.
 *
 * @param context - Reactive canvas state and actions.
 * @returns The provided context.
 */
export function setCanvasContext(context: CanvasContext) {
	return provideCanvasContext(context);
}

/**
 * Gets state from the nearest canvas root.
 *
 * @param component - Component name included in the missing-context error.
 * @returns The shared canvas context.
 */
export function getCanvasContext(component = "This component") {
	try {
		return getCanvasContextValue();
	} catch {
		throw new Error(`${component} must be used inside a Canvas.Root`);
	}
}

/**
 * Restricts a number to an inclusive range.
 *
 * @param value - Number to restrict.
 * @param min - Inclusive lower boundary.
 * @param max - Inclusive upper boundary.
 * @returns The restricted number.
 */
export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a coordinate to a grid interval.
 *
 * @param value - Coordinate to align.
 * @param step - Grid interval, or zero to disable snapping.
 * @returns The aligned coordinate.
 */
export function snapTo(value: number, step: number) {
	return step > 0 ? Math.round(value / step) * step : value;
}

/**
 * Computes the union of every registered node boundary.
 *
 * @param nodes - Node boundaries keyed by node identifier.
 * @returns The union rectangle, or null when no nodes are registered.
 */
export function nodeBounds(nodes: Record<string, CanvasRect>): CanvasRect | null {
	const list = Object.values(nodes);
	if (list.length === 0) return null;

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const node of list) {
		minX = Math.min(minX, node.x);
		minY = Math.min(minY, node.y);
		maxX = Math.max(maxX, node.x + node.width);
		maxY = Math.max(maxY, node.y + node.height);
	}

	return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Builds a connector path between two canvas points.
 *
 * @param from - Source point.
 * @param to - Target point.
 * @param type - Connector path algorithm.
 * @returns An SVG path-data string.
 */
export function edgePath(from: CanvasPoint, to: CanvasPoint, type: EdgePathType = "bezier") {
	/** @param value - Coordinate to round for stable SVG output. */
	const round = (value: number) => Math.round(value * 10) / 10;
	const x1 = round(from.x);
	const y1 = round(from.y);
	const x2 = round(to.x);
	const y2 = round(to.y);

	if (type === "straight") return `M${x1} ${y1} L${x2} ${y2}`;

	if (type === "smoothstep") {
		const midX = round((x1 + x2) / 2);
		const radius = Math.min(12, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2);
		if (radius < 1) return `M${x1} ${y1} L${x2} ${y2}`;

		const directionY = y2 > y1 ? 1 : -1;
		const directionX = x2 > x1 ? 1 : -1;
		return [
			`M${x1} ${y1}`,
			`L${round(midX - radius * directionX)} ${y1}`,
			`Q${midX} ${y1} ${midX} ${round(y1 + radius * directionY)}`,
			`L${midX} ${round(y2 - radius * directionY)}`,
			`Q${midX} ${y2} ${round(midX + radius * directionX)} ${y2}`,
			`L${x2} ${y2}`
		].join(" ");
	}

	const curve = Math.max(40, Math.abs(x2 - x1) * 0.5);
	return `M${x1} ${y1} C${round(x1 + curve)} ${y1}, ${round(x2 - curve)} ${y2}, ${x2} ${y2}`;
}

<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	import type { CanvasPoint } from "./canvas-context.svelte.js";

	/** Background pattern rendered by the canvas viewport. */
	export type CanvasGrid = "dots" | "lines" | "none";

	/** Props for the pannable and zoomable canvas root. */
	export type RootProps = WithElementRef<WithoutChildren<HTMLAttributes<HTMLDivElement>>, HTMLDivElement> & {
		x?: number | undefined;
		y?: number | undefined;
		zoom?: number | undefined;
		minZoom?: number | undefined;
		maxZoom?: number | undefined;
		zoomSpeed?: number | undefined;
		grid?: CanvasGrid | undefined;
		gridSize?: number | undefined;
		snap?: number | undefined;
		pannable?: boolean | undefined;
		zoomable?: boolean | undefined;
		panOnMiddleClick?: boolean | undefined;
		onpan?: ((offset: CanvasPoint) => void) | undefined;
		onzoom?: ((zoom: number) => void) | undefined;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";

	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

	import { clamp, nodeBounds, setCanvasContext, type CanvasRect } from "./canvas-context.svelte.js";

	let {
		ref = $bindable(null),
		x = $bindable(0),
		y = $bindable(0),
		zoom = $bindable(1),
		minZoom = 0.2,
		maxZoom = 3,
		zoomSpeed = 0.0015,
		grid = "dots",
		gridSize = 24,
		snap = 0,
		pannable = true,
		zoomable = true,
		panOnMiddleClick = true,
		class: className,
		onpan,
		onzoom,
		children,
		onwheel,
		onpointerdown,
		onpointermove,
		onpointerup,
		onpointercancel,
		...restProps
	}: RootProps = $props();

	let overlay = $state<HTMLDivElement | null>(null);
	let panning = $state(false);
	let spaceHeld = $state(false);
	let nodes = $state<Record<string, CanvasRect>>({});
	let panStart: { x: number; y: number; originX: number; originY: number } | null = null;

	/** @returns Client coordinates converted to canvas space. */
	function toCanvas(clientX: number, clientY: number): CanvasPoint {
		const rect = ref?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		return { x: (clientX - rect.left - x) / zoom, y: (clientY - rect.top - y) / zoom };
	}

	/** @returns A canvas point converted to viewport-relative screen coordinates. */
	function toScreen(point: CanvasPoint): CanvasPoint {
		return { x: point.x * zoom + x, y: point.y * zoom + y };
	}

	/** Moves the viewport by a screen-space delta. */
	function panBy(deltaX: number, deltaY: number) {
		panTo(x + deltaX, y + deltaY);
	}

	/** Moves the viewport to an absolute screen-space offset. */
	function panTo(nextX: number, nextY: number) {
		x = nextX;
		y = nextY;
		onpan?.({ x, y });
	}

	/** Scales around a viewport-relative point, defaulting to the viewport center. */
	function zoomTo(next: number, origin?: CanvasPoint | undefined) {
		const rect = ref?.getBoundingClientRect();
		const target = clamp(next, minZoom, maxZoom);
		if (target === zoom) return;

		const pivot = origin ?? { x: (rect?.width ?? 0) / 2, y: (rect?.height ?? 0) / 2 };
		const ratio = target / zoom;
		x = pivot.x - (pivot.x - x) * ratio;
		y = pivot.y - (pivot.y - y) * ratio;
		zoom = target;
		onzoom?.(zoom);
		onpan?.({ x, y });
	}

	/** Scales the viewport by a multiplier around an optional point. */
	function zoomBy(factor: number, origin?: CanvasPoint | undefined) {
		zoomTo(zoom * factor, origin);
	}

	/** Fits all registered nodes inside the viewport. */
	function fitView(padding = 48) {
		const rect = ref?.getBoundingClientRect();
		const bounds = nodeBounds(nodes);
		if (!rect || !bounds || bounds.width === 0 || bounds.height === 0) return;

		const next = clamp(Math.min((rect.width - padding * 2) / bounds.width, (rect.height - padding * 2) / bounds.height), minZoom, maxZoom);
		zoom = next;
		x = rect.width / 2 - (bounds.x + bounds.width / 2) * next;
		y = rect.height / 2 - (bounds.y + bounds.height / 2) * next;
		onzoom?.(zoom);
		onpan?.({ x, y });
	}

	/** Restores the initial pan and zoom. */
	function reset() {
		zoom = 1;
		panTo(0, 0);
		onzoom?.(zoom);
	}

	setCanvasContext({
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get zoom() {
			return zoom;
		},
		get minZoom() {
			return minZoom;
		},
		get maxZoom() {
			return maxZoom;
		},
		get snap() {
			return snap;
		},
		get panning() {
			return panning;
		},
		get viewport() {
			return ref;
		},
		get overlay() {
			return overlay;
		},
		get nodes() {
			return nodes;
		},
		toCanvas,
		toScreen,
		panBy,
		panTo,
		zoomBy,
		zoomTo,
		fitView,
		reset,
		registerNode: (id, rect) => {
			nodes = { ...untrack(() => nodes), [id]: rect };
		},
		unregisterNode: (id) => {
			const remaining = { ...untrack(() => nodes) };
			delete remaining[id];
			nodes = remaining;
		}
	});

	/** Handles cursor-centered wheel zoom. */
	function handleWheel(event: WheelEvent) {
		if (!zoomable || !ref) return;
		event.preventDefault();
		const rect = ref.getBoundingClientRect();
		zoomTo(zoom * Math.exp(-event.deltaY * zoomSpeed), { x: event.clientX - rect.left, y: event.clientY - rect.top });
	}

	/** Starts a background or middle-button pan gesture. */
	function handlePointerDown(event: PointerEvent) {
		if (!pannable) return;

		const middle = panOnMiddleClick && event.button === 1;
		const left = event.button === 0;
		if (!middle && !left) return;
		if (left && event.target !== event.currentTarget && !spaceHeld) return;

		event.preventDefault();
		panning = true;
		panStart = { x: event.clientX, y: event.clientY, originX: x, originY: y };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	/** Updates an active pan gesture. */
	function handlePointerMove(event: PointerEvent) {
		if (!panning || !panStart) return;
		panTo(panStart.originX + event.clientX - panStart.x, panStart.originY + event.clientY - panStart.y);
	}

	/** Finishes an active pan gesture. */
	function handlePointerUp(event: PointerEvent) {
		if (!panning) return;
		panning = false;
		panStart = null;
		(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
	}

	/** Enables space-modified panning. */
	function handleKeydown(event: KeyboardEvent) {
		if (event.code === "Space" && !spaceHeld) {
			spaceHeld = true;
			event.preventDefault();
		}
	}

	const gridStyle = $derived.by(() => {
		if (grid === "none") return "";

		const step = gridSize * zoom;
		const position = `${x}px ${y}px`;
		if (grid === "lines") {
			return [
				"background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
				`background-size: ${step}px ${step}px`,
				`background-position: ${position}`
			].join(";");
		}

		const dot = clamp(zoom, 0.5, 2);
		return [
			`background-image: radial-gradient(currentColor ${dot}px, transparent ${dot}px)`,
			`background-size: ${step}px ${step}px`,
			`background-position: ${position}`
		].join(";");
	});
</script>

<svelte:window
	onkeydown={handleKeydown}
	onkeyup={(event) => {
		if (event.code === "Space") spaceHeld = false;
	}}
/>

<div
	bind:this={ref}
	data-slot="canvas"
	role="application"
	aria-label={m.keen_spruce_canvas()}
	tabindex="-1"
	class={cn(
		"relative size-full touch-none overflow-hidden overscroll-none bg-background select-none",
		pannable && (panning ? "cursor-grabbing" : spaceHeld ? "cursor-grab" : "cursor-default"),
		className
	)}
	{...restProps}
	onwheel={(event) => {
		handleWheel(event);
		onwheel?.(event);
	}}
	onpointerdown={(event) => {
		handlePointerDown(event);
		onpointerdown?.(event);
	}}
	onpointermove={(event) => {
		handlePointerMove(event);
		onpointermove?.(event);
	}}
	onpointerup={(event) => {
		handlePointerUp(event);
		onpointerup?.(event);
	}}
	onpointercancel={(event) => {
		handlePointerUp(event);
		onpointercancel?.(event);
	}}
>
	{#if grid !== "none"}
		<div data-slot="canvas-grid" class="pointer-events-none absolute inset-0 text-border" style={gridStyle}></div>
	{/if}

	<div
		data-slot="canvas-content"
		class="pointer-events-none absolute top-0 left-0 origin-top-left"
		style:transform="translate({x}px, {y}px) scale({zoom})"
	>
		{@render children()}
	</div>

	<div bind:this={overlay} data-slot="canvas-overlay" class="pointer-events-none absolute inset-0 z-20"></div>
</div>

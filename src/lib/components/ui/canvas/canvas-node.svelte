<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	import type { CanvasPoint } from "./canvas-context.svelte.js";

	/** Props for a positioned and optionally draggable canvas node. */
	export type NodeProps = WithElementRef<WithoutChildren<HTMLAttributes<HTMLDivElement>>, HTMLDivElement> & {
		id?: string | undefined;
		x?: number | undefined;
		y?: number | undefined;
		selected?: boolean | undefined;
		draggable?: boolean | undefined;
		selectable?: boolean | undefined;
		width?: number | undefined;
		height?: number | undefined;
		ondragstart?: ((position: CanvasPoint) => void) | undefined;
		ondrag?: ((position: CanvasPoint) => void) | undefined;
		ondragend?: ((position: CanvasPoint) => void) | undefined;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	import { cn } from "$lib/utils";

	import { getCanvasContext, snapTo } from "./canvas-context.svelte.js";

	const uid = $props.id();
	let {
		ref = $bindable(null),
		id = uid,
		x = $bindable(0),
		y = $bindable(0),
		selected = $bindable(false),
		draggable = true,
		selectable = true,
		width,
		height,
		class: className,
		ondragstart,
		ondrag,
		ondragend,
		children,
		onpointerdown,
		onpointermove,
		onpointerup,
		onpointercancel,
		onkeydown,
		...restProps
	}: NodeProps = $props();

	const canvas = getCanvasContext("Canvas.Node");
	let measuredWidth = $state(0);
	let measuredHeight = $state(0);
	let dragging = $state(false);
	let start: { pointerX: number; pointerY: number; x: number; y: number } | null = null;

	$effect(() => {
		canvas.registerNode(id, { x, y, width: width ?? measuredWidth, height: height ?? measuredHeight });
	});

	onDestroy(() => canvas.unregisterNode(id));

	const interactiveSelector = 'button, a, input, textarea, select, [contenteditable="true"], [data-no-drag]';

	/** Starts selection and an optional node drag gesture. */
	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) return;

		const hit = (event.target as HTMLElement | null)?.closest(interactiveSelector);
		if (hit && hit !== event.currentTarget) return;
		if (selectable) selected = true;
		if (!draggable) return;

		event.stopPropagation();
		event.preventDefault();
		dragging = true;
		start = { pointerX: event.clientX, pointerY: event.clientY, x, y };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		ondragstart?.({ x, y });
	}

	/** Updates an active node drag in canvas coordinates. */
	function handlePointerMove(event: PointerEvent) {
		if (!dragging || !start) return;

		x = snapTo(start.x + (event.clientX - start.pointerX) / canvas.zoom, canvas.snap);
		y = snapTo(start.y + (event.clientY - start.pointerY) / canvas.zoom, canvas.snap);
		ondrag?.({ x, y });
	}

	/** Finishes an active node drag. */
	function handlePointerUp(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		start = null;
		(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
		ondragend?.({ x, y });
	}

	/** Moves a draggable node with the arrow keys. */
	function handleKeydown(event: KeyboardEvent) {
		if (!draggable) return;

		const step = event.shiftKey ? 10 : canvas.snap || 1;
		const moves: Record<string, CanvasPoint> = {
			ArrowLeft: { x: -step, y: 0 },
			ArrowRight: { x: step, y: 0 },
			ArrowUp: { x: 0, y: -step },
			ArrowDown: { x: 0, y: step }
		};
		const move = moves[event.key];
		if (!move) return;

		event.preventDefault();
		x += move.x;
		y += move.y;
		ondrag?.({ x, y });
	}
</script>

<div
	bind:this={ref}
	bind:clientWidth={measuredWidth}
	bind:clientHeight={measuredHeight}
	data-slot="canvas-node"
	role="button"
	tabindex="0"
	aria-pressed={selected}
	style:transform="translate({x}px, {y}px)"
	style:width={width === undefined ? undefined : `${width}px`}
	style:height={height === undefined ? undefined : `${height}px`}
	class={cn(
		"pointer-events-auto absolute top-0 left-0 touch-none",
		draggable && (dragging ? "cursor-grabbing" : "cursor-grab"),
		selected && "z-10",
		className
	)}
	{...restProps}
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
	onkeydown={(event) => {
		handleKeydown(event);
		onkeydown?.(event);
	}}
>
	{@render children()}
</div>

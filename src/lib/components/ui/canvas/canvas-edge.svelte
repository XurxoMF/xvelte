<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { SVGAttributes } from "svelte/elements";

	import type { WithoutChildren } from "$lib/utils";

	import type { CanvasPoint, EdgePathType } from "./canvas-context.svelte.js";

	/** Props for a connector between points or registered canvas nodes. */
	export type EdgeProps = WithoutChildren<SVGAttributes<SVGSVGElement>> & {
		ref?: SVGSVGElement | null | undefined;
		from?: CanvasPoint | undefined;
		to?: CanvasPoint | undefined;
		fromNode?: string | undefined;
		toNode?: string | undefined;
		type?: EdgePathType | undefined;
		strokeWidth?: number | undefined;
		animated?: boolean | undefined;
		arrow?: boolean | undefined;
		selected?: boolean | undefined;
		label?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { edgePath, getCanvasContext } from "./canvas-context.svelte.js";

	const uid = $props.id();
	const markerId = `canvas-edge-arrow-${uid}`;
	let {
		ref = $bindable(null),
		from,
		to,
		fromNode,
		toNode,
		type = "bezier",
		strokeWidth = 2,
		animated = false,
		arrow = true,
		selected = false,
		class: className,
		label,
		...restProps
	}: EdgeProps = $props();

	const canvas = getCanvasContext("Canvas.Edge");

	/** Returns a left- or right-edge anchor for a registered node. */
	function anchor(id: string | undefined, side: "source" | "target") {
		if (!id) return null;
		const rect = canvas.nodes[id];
		if (!rect) return null;
		return { x: side === "source" ? rect.x + rect.width : rect.x, y: rect.y + rect.height / 2 };
	}

	const start = $derived(anchor(fromNode, "source") ?? from ?? { x: 0, y: 0 });
	const end = $derived(anchor(toNode, "target") ?? to ?? { x: 0, y: 0 });
	const path = $derived(edgePath(start, end, type));
	const midpoint = $derived({ x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 });
</script>

<svg
	bind:this={ref}
	data-slot="canvas-edge"
	width="1"
	height="1"
	class={cn("pointer-events-none absolute top-0 left-0 overflow-visible", className)}
	aria-hidden="true"
	{...restProps}
>
	{#if arrow}
		<defs>
			<marker
				id={markerId}
				viewBox="0 0 10 10"
				refX="9"
				refY="5"
				markerWidth="6"
				markerHeight="6"
				markerUnits="strokeWidth"
				orient="auto-start-reverse"
			>
				<path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
			</marker>
		</defs>
	{/if}

	<path
		d={path}
		fill="none"
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		marker-end={arrow ? `url(#${markerId})` : undefined}
		class={cn("text-muted-foreground/60 transition-colors", selected && "text-primary", animated && "canvas-edge-animated")}
	/>
</svg>

{#if label}
	<div
		data-slot="canvas-edge-label"
		class="pointer-events-auto absolute top-0 left-0"
		style:transform="translate({midpoint.x}px, {midpoint.y}px) translate(-50%, -50%)"
	>
		<span class="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
			{@render label()}
		</span>
	</div>
{/if}

<style>
	.canvas-edge-animated {
		stroke-dasharray: 6 4;
		animation: canvas-edge-dash 1s linear infinite;
	}

	@keyframes canvas-edge-dash {
		to {
			stroke-dashoffset: -10;
		}
	}
</style>

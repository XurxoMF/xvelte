<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	import type { CanvasPosition } from "./canvas-controls.svelte";

	/** Props for the fixed overview map of canvas nodes and viewport. */
	export type MinimapProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		position?: CanvasPosition | undefined;
		width?: number | undefined;
		height?: number | undefined;
		padding?: number | undefined;
		interactive?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { Portal } from "bits-ui";

	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

	import { getCanvasContext, nodeBounds } from "./canvas-context.svelte.js";

	let {
		ref = $bindable(null),
		position = "bottom-right",
		width = 160,
		height = 110,
		padding = 12,
		interactive = true,
		class: className,
		onclick,
		onkeydown,
		...restProps
	}: MinimapProps = $props();

	const canvas = getCanvasContext("Canvas.Minimap");
	const positions: Record<CanvasPosition, string> = {
		"bottom-left": "bottom-3 left-3",
		"bottom-right": "right-3 bottom-3",
		"top-left": "top-3 left-3",
		"top-right": "top-3 right-3"
	};

	const viewRect = $derived.by(() => {
		const rect = canvas.viewport?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0, width: 0, height: 0 };
		return { x: -canvas.x / canvas.zoom, y: -canvas.y / canvas.zoom, width: rect.width / canvas.zoom, height: rect.height / canvas.zoom };
	});

	const world = $derived.by(() => {
		const bounds = nodeBounds(canvas.nodes);
		const view = viewRect;
		if (!bounds) return view.width ? view : { x: 0, y: 0, width: 1, height: 1 };

		const minX = Math.min(bounds.x, view.x);
		const minY = Math.min(bounds.y, view.y);
		const maxX = Math.max(bounds.x + bounds.width, view.x + view.width);
		const maxY = Math.max(bounds.y + bounds.height, view.y + view.height);
		return { x: minX, y: minY, width: maxX - minX || 1, height: maxY - minY || 1 };
	});

	const scale = $derived(Math.min((width - padding * 2) / world.width, (height - padding * 2) / world.height));

	/** Projects a canvas coordinate into minimap coordinates. */
	function project(x: number, y: number) {
		return { x: (x - world.x) * scale + padding, y: (y - world.y) * scale + padding };
	}

	const viewPoint = $derived(project(viewRect.x, viewRect.y));

	/** Centers the main viewport on the clicked minimap position. */
	function handleClick(event: MouseEvent) {
		if (!interactive) return;

		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const viewportRect = canvas.viewport?.getBoundingClientRect();
		if (!viewportRect) return;

		const target = {
			x: (event.clientX - rect.left - padding) / scale + world.x,
			y: (event.clientY - rect.top - padding) / scale + world.y
		};
		canvas.panTo(viewportRect.width / 2 - target.x * canvas.zoom, viewportRect.height / 2 - target.y * canvas.zoom);
	}
</script>

{#if canvas.overlay}
	<Portal to={canvas.overlay}>
		<div
			bind:this={ref}
			data-slot="canvas-minimap"
			class={cn(
				"pointer-events-auto absolute z-20 overflow-hidden rounded-lg border bg-popover/90 shadow-sm backdrop-blur",
				positions[position],
				interactive && "cursor-pointer",
				className
			)}
			style:width="{width}px"
			style:height="{height}px"
			role="button"
			aria-label={m.light_cobra_map()}
			aria-disabled={!interactive}
			tabindex={interactive ? 0 : -1}
			{...restProps}
			onclick={(event) => {
				handleClick(event);
				onclick?.(event);
			}}
			onkeydown={(event) => {
				if (event.key === "Enter") canvas.fitView();
				onkeydown?.(event);
			}}
		>
			<svg {width} {height} class="block">
				{#each Object.entries(canvas.nodes) as [id, node] (id)}
					{@const point = project(node.x, node.y)}
					<rect
						x={point.x}
						y={point.y}
						width={Math.max(node.width * scale, 2)}
						height={Math.max(node.height * scale, 2)}
						rx="2"
						class="fill-muted-foreground/40"
					/>
				{/each}

				<rect
					x={viewPoint.x}
					y={viewPoint.y}
					width={viewRect.width * scale}
					height={viewRect.height * scale}
					rx="2"
					class="fill-primary/10 stroke-primary"
					stroke-width="1"
				/>
			</svg>
		</div>
	</Portal>
{/if}

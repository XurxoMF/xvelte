<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Corner positions available for fixed canvas chrome. */
	export type CanvasPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

	/** Props for the canvas zoom and viewport controls. */
	export type ControlsProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		position?: CanvasPosition | undefined;
		step?: number | undefined;
		showZoom?: boolean | undefined;
		showFit?: boolean | undefined;
		showReset?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { Portal } from "bits-ui";

	import { FullscreenIcon, MinusIcon, PlusIcon, ResetIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";

	import { getCanvasContext } from "./canvas-context.svelte.js";

	let {
		ref = $bindable(null),
		position = "bottom-left",
		step = 1.25,
		showZoom = true,
		showFit = true,
		showReset = true,
		class: className,
		...restProps
	}: ControlsProps = $props();

	const canvas = getCanvasContext("Canvas.Controls");
	const positions: Record<CanvasPosition, string> = {
		"bottom-left": "bottom-3 left-3",
		"bottom-right": "right-3 bottom-3",
		"top-left": "top-3 left-3",
		"top-right": "top-3 right-3"
	};
</script>

{#if canvas.overlay}
	<Portal to={canvas.overlay}>
		<div
			bind:this={ref}
			data-slot="canvas-controls"
			role="group"
			aria-label="Canvas controls"
			class={cn(
				"pointer-events-auto absolute z-20 flex items-center gap-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-sm",
				positions[position],
				className
			)}
			{...restProps}
		>
			{#if showZoom}
				<Button.Root
					variant="ghost"
					size="icon-sm"
					aria-label="Zoom out"
					title="Zoom out"
					disabled={canvas.zoom <= canvas.minZoom}
					onclick={() => canvas.zoomBy(1 / step)}
				>
					<MinusIcon />
				</Button.Root>

				<span class="w-12 text-center font-mono text-xs text-muted-foreground tabular-nums">{Math.round(canvas.zoom * 100)}%</span>

				<Button.Root
					variant="ghost"
					size="icon-sm"
					aria-label="Zoom in"
					title="Zoom in"
					disabled={canvas.zoom >= canvas.maxZoom}
					onclick={() => canvas.zoomBy(step)}
				>
					<PlusIcon />
				</Button.Root>
			{/if}

			{#if showFit}
				<Button.Root variant="ghost" size="icon-sm" aria-label="Fit to content" title="Fit to content" onclick={() => canvas.fitView()}>
					<FullscreenIcon />
				</Button.Root>
			{/if}

			{#if showReset}
				<Button.Root variant="ghost" size="icon-sm" aria-label="Reset view" title="Reset view" onclick={() => canvas.reset()}>
					<ResetIcon />
				</Button.Root>
			{/if}
		</div>
	</Portal>
{/if}

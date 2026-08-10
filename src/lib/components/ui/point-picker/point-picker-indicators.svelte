<script lang="ts">
	import type { Snippet } from "svelte";

	import type { Point } from "./point-picker-utils";

	type Props = {
		value: Point;
		xPercent: number;
		yPercent: number;
		formattedValue: string;
		showGrid: boolean;
		showCrosshair: boolean;
		showCursor: boolean;
		showValue: boolean;
		cursor?: Snippet<[Point]> | undefined;
	};

	let { value, xPercent, yPercent, formattedValue, showGrid, showCrosshair, showCursor, showValue, cursor }: Props = $props();

	const gridPositions = [20, 40, 60, 80];
</script>

{#if showGrid}
	<div data-slot="point-picker-grid" aria-hidden="true" class="pointer-events-none absolute inset-0 z-10">
		{#each gridPositions as position (position)}
			<span data-slot="point-picker-grid-line" class="absolute inset-y-0 w-px bg-border/30" style:left={`${position}%`}></span>
			<span data-slot="point-picker-grid-line" class="absolute inset-x-0 h-px bg-border/30" style:top={`${position}%`}></span>
		{/each}
	</div>
{/if}

{#if showCrosshair}
	<div
		data-slot="point-picker-crosshair"
		aria-hidden="true"
		class="pointer-events-none absolute inset-y-0 z-10 w-px bg-primary/50"
		style:left={`${xPercent}%`}
	></div>
	<div
		data-slot="point-picker-crosshair"
		aria-hidden="true"
		class="pointer-events-none absolute inset-x-0 z-10 h-px bg-primary/50"
		style:top={`${yPercent}%`}
	></div>
{/if}

{#if showCursor}
	<div
		data-slot="point-picker-cursor"
		aria-hidden="true"
		class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
		style:left={`${xPercent}%`}
		style:top={`${yPercent}%`}
	>
		{#if cursor}
			{@render cursor(value)}
		{:else}
			<div class="relative size-5">
				<span data-slot="point-picker-cursor-glow" class="absolute inset-0 rounded-full bg-primary/30 blur-lg"></span>
				<span data-slot="point-picker-cursor-dot" class="absolute inset-1 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
				<span data-slot="point-picker-cursor-highlight" class="absolute inset-2 rounded-full bg-primary-foreground/30"></span>
			</div>
		{/if}
	</div>
{/if}

{#if showValue}
	<div
		data-slot="point-picker-value"
		aria-live="polite"
		class="pointer-events-none absolute top-1.5 right-1.5 z-20 rounded-sm border border-border bg-background/80 px-2 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm"
	>
		{formattedValue}
	</div>
{/if}

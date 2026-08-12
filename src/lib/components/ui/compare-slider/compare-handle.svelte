<script lang="ts" module>
	import type { Snippet } from "svelte";
	export type HandleProps = { class?: string | undefined; children?: Snippet | undefined };
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { getCompareContext } from "./compare-slider-context";
	import { DragHandleIcon, DragHorizontalIcon } from "$lib/icons";

	let { class: className, children }: HandleProps = $props();

	const ctx = getCompareContext();
	let isHorizontal = $derived(ctx.orientation === "horizontal");
</script>

<div
	data-slot="compare-slider-handle"
	class={cn(
		"pointer-events-none absolute z-2 flex items-center justify-center text-primary-foreground",
		isHorizontal ? "top-0 bottom-0 left-(--pos) -ml-0.5 w-1" : "top-(--pos) right-0 left-0 -mt-0.5 h-1",
		className
	)}
>
	<div class={cn("absolute bg-accent shadow-[0_0_10px_rgba(0,0,0,0.5)]", isHorizontal ? "h-full w-0.5" : "h-0.5 w-full")}></div>

	<div class="relative z-1 flex h-5 w-5 items-center justify-center rounded-xs border border-black/10 bg-accent text-primary shadow-md">
		{#if children}
			{@render children()}
		{:else if isHorizontal}
			<DragHandleIcon class="h-4 w-4 opacity-50" />
		{:else}
			<DragHorizontalIcon class="h-4 w-4 opacity-50" />
		{/if}
	</div>
</div>

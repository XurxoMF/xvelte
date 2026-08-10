<script lang="ts" module>
	import type { Snippet } from "svelte";
	export type ItemProps = { target?: "first" | "second" | undefined; class?: string | undefined; children: Snippet };
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { getCompareContext } from "./compare-slider-context";

	let { target = "first", class: className, children }: ItemProps = $props();

	const ctx = getCompareContext();
	let isHorizontal = $derived(ctx.orientation() === "horizontal");
</script>

<div
	data-slot="compare-slider-item"
	class={cn("absolute inset-0 h-full w-full select-none", className)}
	style:clip-path={target === "second" ? (isHorizontal ? "inset(0 calc(100% - var(--pos)) 0 0)" : "inset(0 0 calc(100% - var(--pos)) 0)") : undefined}
>
	{@render children()}
</div>

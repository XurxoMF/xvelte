<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type SeparatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { class: className, children, ref = $bindable(null), ...restProps }: SeparatorProps = $props();
</script>

<div
	bind:this={ref}
	class={cn("relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm", className)}
	data-slot="timeline-separator"
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
	{/if}
</div>

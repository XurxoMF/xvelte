<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type ContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { class: className, children, ref = $bindable(null), ...restProps }: ContentProps = $props();
</script>

<div bind:this={ref} class={cn("ml-4 flex flex-1 flex-col gap-1 pt-0.5", className)} data-slot="timeline-content" {...restProps}>
	{@render children?.()}
</div>

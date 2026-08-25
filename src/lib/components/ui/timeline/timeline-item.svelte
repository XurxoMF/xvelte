<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type ItemProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { class: className, children, ref = $bindable(null), ...restProps }: ItemProps = $props();
</script>

<div bind:this={ref} class={cn("group relative flex items-start pb-8 last:pb-0", className)} data-slot="timeline-item" {...restProps}>
	{@render children?.()}
</div>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ItemProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ItemProps = $props();
</script>

<div bind:this={ref} class={cn("flex items-center gap-2", className)} data-slot="sortable-list-item" {...restProps}>
	{@render children?.()}
</div>

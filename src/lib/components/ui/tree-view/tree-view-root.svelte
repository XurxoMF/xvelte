<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), children, class: className, ...restProps }: RootProps = $props();
</script>

<div bind:this={ref} role="tree" data-slot="tree-view" class={cn("flex flex-col", className)} {...restProps}>
	{@render children?.()}
</div>

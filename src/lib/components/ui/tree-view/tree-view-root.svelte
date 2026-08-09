<script lang="ts" module>
	import type { TreeViewRootProps } from "./types";

	export type RootProps = TreeViewRootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), children, class: className, ...restProps }: RootProps = $props();
</script>

<div bind:this={ref} role="tree" data-slot="tree-view" class={cn("flex flex-col", className)} {...restProps}>
	{@render children?.()}
</div>

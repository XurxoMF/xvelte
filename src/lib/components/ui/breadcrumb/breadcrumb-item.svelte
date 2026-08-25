<script lang="ts" module>
	import type { HTMLLiAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type ItemProps = WithElementRef<HTMLLiAttributes>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ItemProps = $props();
</script>

<li bind:this={ref} data-slot="breadcrumb-item" class={cn("inline-flex items-center gap-1", className)} {...restProps}>
	{@render children?.()}
</li>

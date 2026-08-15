<script lang="ts" module>
	/** Props for one native list item. */
	export type ItemProps = WithElementRef<HTMLLiAttributes, HTMLLIElement>;
</script>

<script lang="ts">
	import type { HTMLLiAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ItemProps = $props();
</script>

<li bind:this={ref} data-slot="list-item" class={cn("leading-7", className)} {...restProps}>
	{@render children?.()}
</li>

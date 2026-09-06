<script lang="ts" module>
	import type { HTMLLiAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for one footnote definition in the ordered list. */
	export type ItemProps = WithElementRef<HTMLLiAttributes, HTMLLIElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ItemProps = $props();
</script>

<li bind:this={ref} data-slot="footnote-item" class={cn("ps-1 leading-6", className)} {...restProps}>
	{@render children?.()}
</li>

<script lang="ts" module>
	import type { HTMLOlAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for the ordered list of footnote definitions. */
	export type ListProps = WithElementRef<HTMLOlAttributes, HTMLOListElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ListProps = $props();
</script>

<ol bind:this={ref} data-slot="footnote-list" class={cn("ms-6 list-decimal space-y-2", className)} {...restProps}>
	{@render children?.()}
</ol>

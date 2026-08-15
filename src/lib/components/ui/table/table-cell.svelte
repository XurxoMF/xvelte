<script lang="ts" module>
	import type { HTMLTdAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type CellProps = WithElementRef<HTMLTdAttributes>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: CellProps = $props();
</script>

<td bind:this={ref} data-slot="table-cell" class={cn("p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0", className)} {...restProps}>
	{@render children?.()}
</td>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type FooterProps = WithElementRef<HTMLAttributes<HTMLTableSectionElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: FooterProps = $props();
</script>

<tfoot bind:this={ref} data-slot="table-footer" class={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...restProps}>
	{@render children?.()}
</tfoot>

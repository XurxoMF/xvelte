<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type RowProps = WithElementRef<HTMLAttributes<HTMLTableRowElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: RowProps = $props();
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
	{...restProps}
>
	{@render children?.()}
</tr>

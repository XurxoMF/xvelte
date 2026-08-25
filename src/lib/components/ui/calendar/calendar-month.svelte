<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type MonthProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: MonthProps = $props();
</script>

<div {...restProps} bind:this={ref} data-slot="calendar-month" class={cn("flex min-w-[calc(var(--cell-size)*7)] flex-1 flex-col gap-4", className)}>
	{@render children?.()}
</div>

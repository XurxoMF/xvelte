<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type MonthsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: MonthsProps = $props();
</script>

<div bind:this={ref} data-slot="calendar-months" class={cn("relative flex w-full flex-col gap-4 md:flex-row", className)} {...restProps}>
	{@render children?.()}
</div>

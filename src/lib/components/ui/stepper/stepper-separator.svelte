<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type SeparatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { getStepperItemContext } from "./stepper-context.svelte.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: SeparatorProps = $props();

	const item = getStepperItemContext();
</script>

<div
	bind:this={ref}
	data-slot="stepper-separator"
	data-state={item.state}
	class={cn(
		"absolute shrink-0 bg-muted transition-colors data-[state=completed]:bg-primary",
		"group-data-[orientation=horizontal]/stepper-nav:top-3 group-data-[orientation=horizontal]/stepper-nav:h-1 group-data-[orientation=horizontal]/stepper-nav:w-full",
		"group-data-[orientation=vertical]/stepper-nav:top-7 group-data-[orientation=vertical]/stepper-nav:left-3 group-data-[orientation=vertical]/stepper-nav:h-full group-data-[orientation=vertical]/stepper-nav:w-1",
		{
			hidden: item.isLast
		},
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

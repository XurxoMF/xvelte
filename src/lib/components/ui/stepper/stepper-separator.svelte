<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type SeparatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { useStepperSeparator } from "./stepper.svelte.js";

	let { ref = $bindable(null), class: className, children, ...rest }: SeparatorProps = $props();

	const separatorState = useStepperSeparator();
</script>

<div
	bind:this={ref}
	data-slot="stepper-separator"
	class={cn(
		"absolute shrink-0 bg-muted transition-colors data-[state=completed]:bg-primary",
		"group-data-[orientation=horizontal]/stepper-nav:top-[12px] group-data-[orientation=horizontal]/stepper-nav:h-1 group-data-[orientation=horizontal]/stepper-nav:w-full",
		"group-data-[orientation=vertical]/stepper-nav:top-[28px] group-data-[orientation=vertical]/stepper-nav:left-[12px] group-data-[orientation=vertical]/stepper-nav:h-full group-data-[orientation=vertical]/stepper-nav:w-1",
		{
			hidden: separatorState.itemState.isLast
		},
		className
	)}
	{...separatorState.props}
	{...rest}
>
	{@render children?.()}
</div>

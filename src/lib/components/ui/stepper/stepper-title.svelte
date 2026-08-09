<script lang="ts">
	import { cn } from "$lib/utils";

	import type { StepperTitleProps } from "./types";

	let { ref = $bindable(null), class: className, children, ...rest }: StepperTitleProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="stepper-title"
	class={cn(
		"text-lg font-medium",
		"group-data-[orientation=vertical]/stepper-nav:text-left",
		"group-data-[orientation=horizontal]/stepper-nav:text-center",
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>

<script lang="ts">
	import { cn } from "$lib/utils";

	import type { StepperDescriptionProps } from "./types";

	let { ref = $bindable(null), class: className, children, ...rest }: StepperDescriptionProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="stepper-description"
	class={cn(
		"text-sm text-muted-foreground",
		"group-data-[orientation=vertical]/stepper-nav:text-left",
		"group-data-[orientation=horizontal]/stepper-nav:text-center",
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>

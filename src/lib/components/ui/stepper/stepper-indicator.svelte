<script lang="ts">
	import { cn } from "$lib/utils";

	import type { StepperIndicatorProps } from "./types";

	let { ref = $bindable(null), class: className, children, ...rest }: StepperIndicatorProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="stepper-indicator"
	class={cn(
		"z-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground ring-3 transition-colors select-none [&_svg]:size-4",
		"ring-background group-data-[state=inactive]/stepper-trigger:bg-muted group-data-[state=inactive]/stepper-trigger:text-muted-foreground",
		"group-focus-visible/stepper-trigger:ring-ring/50",
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>

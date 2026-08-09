<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";

	import { useStepperItemTrigger } from "./stepper.svelte.js";
	import type { StepperTriggerProps } from "./types";

	let { ref = $bindable(null), disabled = false, onclick, onkeydown, class: className, children, ...restProps }: StepperTriggerProps = $props();

	const triggerState = useStepperItemTrigger({
		ref: box.with(() => ref),
		disabled: box.with(() => disabled ?? false),
		onclick: box.with(() => onclick),
		onkeydown: box.with(() => onkeydown)
	});
</script>

<button
	bind:this={ref}
	data-slot="stepper-trigger"
	class={cn(
		"group/stepper-trigger z-1 flex outline-none",
		"group-data-[orientation=horizontal]/stepper-nav:flex-col",
		"group-data-[orientation=vertical]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:gap-4",
		className
	)}
	{...triggerState.props}
	{...restProps}
>
	{@render children?.()}
</button>

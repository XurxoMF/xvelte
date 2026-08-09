<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";

	import { useStepperNav } from "./stepper.svelte.js";
	import type { StepperNavProps } from "./types";

	let { ref = $bindable(null), orientation = "horizontal", class: className, children, ...rest }: StepperNavProps = $props();

	const stepperNavState = useStepperNav({
		orientation: box.with(() => orientation)
	});
</script>

<div
	bind:this={ref}
	data-slot="stepper-nav"
	class={cn(
		"group/stepper-nav flex",
		{
			"flex-row justify-between": orientation === "horizontal",
			"flex-col gap-2": orientation === "vertical"
		},
		className
	)}
	{...stepperNavState.props}
	{...rest}
>
	{@render children?.()}
</div>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type NavProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { getStepperContext } from "./stepper-context.svelte.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: NavProps = $props();

	const stepper = getStepperContext();
</script>

<div
	bind:this={ref}
	data-slot="stepper-nav"
	aria-orientation={stepper.orientation}
	data-orientation={stepper.orientation}
	class={cn(
		"group/stepper-nav flex",
		{
			"flex-row justify-between": stepper.orientation === "horizontal",
			"flex-col gap-2": stepper.orientation === "vertical"
		},
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

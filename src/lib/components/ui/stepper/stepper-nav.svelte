<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type NavProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		orientation?: "horizontal" | "vertical";
	};
</script>

<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";

	import { useStepperNav } from "./stepper.svelte.js";

	let { ref = $bindable(null), orientation = "horizontal", class: className, children, ...rest }: NavProps = $props();

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

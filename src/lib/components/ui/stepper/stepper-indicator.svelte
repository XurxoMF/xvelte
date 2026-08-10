<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type IndicatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...rest }: IndicatorProps = $props();
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

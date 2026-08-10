<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type DescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...rest }: DescriptionProps = $props();
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

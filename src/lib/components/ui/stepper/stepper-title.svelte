<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type TitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: TitleProps = $props();
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
	{...restProps}
>
	{@render children?.()}
</div>

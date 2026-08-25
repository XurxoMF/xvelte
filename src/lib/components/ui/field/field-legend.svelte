<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type LegendProps = WithElementRef<HTMLAttributes<HTMLLegendElement>> & {
		variant?: "legend" | "label" | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "legend", children, ...restProps }: LegendProps = $props();
</script>

<legend
	bind:this={ref}
	data-slot="field-legend"
	data-variant={variant}
	class={cn("mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base", className)}
	{...restProps}
>
	{@render children?.()}
</legend>

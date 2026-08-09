<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ControlBarVariant = "compact" | "stacked";
	export type ControlBarProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: ControlBarVariant;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), variant = "compact", class: className, children, ...restProps }: ControlBarProps = $props();

	const variantClass = $derived(variant === "stacked" ? "flex-col" : "flex-row");
</script>

<div
	bind:this={ref}
	class={cn("group/audio-control-bar flex w-full min-w-0 items-center gap-1.5", variantClass, className)}
	data-slot="audio-control-bar"
	data-variant={variant}
	{...restProps}
>
	{@render children?.()}
</div>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ControlGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ControlGroupProps = $props();
</script>

<div bind:this={ref} class={cn("flex w-full items-center gap-1.5", className)} data-slot="audio-control-group" {...restProps}>
	{@render children?.()}
</div>

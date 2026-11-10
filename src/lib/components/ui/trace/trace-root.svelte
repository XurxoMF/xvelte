<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props accepted by the Trace list container. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: RootProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="trace"
	class={cn(
		"flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-md *:has-[>[data-slot=trace-line]]:text-left",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

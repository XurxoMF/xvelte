<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props accepted by a decorative Trace icon wrapper. */
	export type IconProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: IconProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="trace-icon"
	aria-hidden="true"
	class={cn(
		"flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ms-1",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>

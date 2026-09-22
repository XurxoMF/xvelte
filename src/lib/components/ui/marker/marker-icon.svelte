<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for a decorative Marker icon wrapper. */
	export type IconProps = WithElementRef<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: IconProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="marker-icon"
	aria-hidden="true"
	class={cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
	{...restProps}
>
	{@render children?.()}
</span>

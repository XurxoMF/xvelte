<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for Marker text or inline content. */
	export type ContentProps = WithElementRef<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ContentProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="marker-content"
	class={cn(
		"min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>

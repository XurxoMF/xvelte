<script lang="ts" module>
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";

	/** Props for the manually composed scrolling viewport. */
	export type ViewportProps = ScrollAreaPrimitive.ViewportProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ViewportProps = $props();
</script>

<ScrollAreaPrimitive.Viewport
	bind:ref
	data-slot="scroll-area-viewport"
	class={cn("size-full rounded-[inherit] transition-[color,box-shadow]", className)}
	{...restProps}
>
	{@render children?.()}
</ScrollAreaPrimitive.Viewport>

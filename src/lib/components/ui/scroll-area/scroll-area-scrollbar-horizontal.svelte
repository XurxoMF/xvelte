<script lang="ts" module>
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	/** Props forwarded to the built-in horizontal scrollbar thumb. */
	export type HorizontalThumbProps = Omit<WithoutChildrenOrChild<ScrollAreaPrimitive.ThumbProps>, "ref">;

	/** Props for the fixed-axis horizontal Scroll Area scrollbar. */
	export type ScrollbarHorizontalProps = Omit<WithoutChildrenOrChild<ScrollAreaPrimitive.ScrollbarProps>, "orientation"> & {
		/** Bindable reference to the built-in thumb. */
		thumbRef?: HTMLDivElement | null | undefined;
		/** Props forwarded to the built-in thumb. */
		thumbProps?: HorizontalThumbProps | undefined;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	import { cn } from "$lib/utils";

	import { getScrollAreaContext } from "./scroll-area-context.svelte";

	let { ref = $bindable(null), thumbRef = $bindable(null), class: className, thumbProps = {}, ...restProps }: ScrollbarHorizontalProps = $props();

	const context = getScrollAreaContext();
	onDestroy(context.registerScrollbar("horizontal"));
</script>

<ScrollAreaPrimitive.Scrollbar
	bind:ref
	{...restProps}
	data-slot="scroll-area-scrollbar"
	data-orientation="horizontal"
	orientation="horizontal"
	class={cn(
		"flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent",
		className
	)}
>
	<ScrollAreaPrimitive.Thumb
		bind:ref={thumbRef}
		{...thumbProps}
		data-slot="scroll-area-thumb"
		class={cn("relative flex-1 rounded-full bg-border", thumbProps.class)}
	/>
</ScrollAreaPrimitive.Scrollbar>

<script lang="ts" module>
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	/** Props forwarded to the built-in vertical scrollbar thumb. */
	export type VerticalThumbProps = Omit<WithoutChildrenOrChild<ScrollAreaPrimitive.ThumbProps>, "ref">;

	/** Props for the fixed-axis vertical Scroll Area scrollbar. */
	export type ScrollbarVerticalProps = Omit<WithoutChildrenOrChild<ScrollAreaPrimitive.ScrollbarProps>, "orientation"> & {
		/** Bindable reference to the built-in thumb. */
		thumbRef?: HTMLDivElement | null | undefined;
		/** Props forwarded to the built-in thumb. */
		thumbProps?: VerticalThumbProps | undefined;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	import { getScrollAreaContext } from "./scroll-area-context.svelte";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), thumbRef = $bindable(null), class: className, thumbProps = {}, ...restProps }: ScrollbarVerticalProps = $props();

	const context = getScrollAreaContext();
	onDestroy(context.registerScrollbar("vertical"));
</script>

<ScrollAreaPrimitive.Scrollbar
	bind:ref
	{...restProps}
	data-slot="scroll-area-scrollbar"
	data-orientation="vertical"
	orientation="vertical"
	class={cn(
		"flex touch-none p-px transition-colors select-none data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
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

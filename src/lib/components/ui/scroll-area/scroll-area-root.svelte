<script lang="ts" module>
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";

	import type { WithoutChild } from "$lib/utils";

	export type RootProps = WithoutChild<ScrollAreaPrimitive.RootProps> & {
		orientation?: "vertical" | "horizontal" | "both" | undefined;
		scrollbarXClasses?: string | undefined;
		scrollbarYClasses?: string | undefined;
		viewportRef?: HTMLElement | null | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import * as ScrollArea from ".";

	let {
		ref = $bindable(null),
		viewportRef = $bindable(null),
		class: className,
		orientation = "vertical",
		scrollbarXClasses = "",
		scrollbarYClasses = "",
		children,
		...restProps
	}: RootProps = $props();
</script>

<ScrollAreaPrimitive.Root bind:ref data-slot="scroll-area" class={cn("relative", className)} {...restProps}>
	<ScrollAreaPrimitive.Viewport
		bind:ref={viewportRef}
		data-slot="scroll-area-viewport"
		class="size-full rounded-[inherit] transition-[color,box-shadow]"
	>
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>

	{#if orientation === "vertical" || orientation === "both"}
		<ScrollArea.Scrollbar orientation="vertical" class={scrollbarYClasses} />
	{/if}

	{#if orientation === "horizontal" || orientation === "both"}
		<ScrollArea.Scrollbar orientation="horizontal" class={scrollbarXClasses} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>

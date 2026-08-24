<script lang="ts" module>
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";

	import type { WithoutChild } from "$lib/utils";

	/** Props for the Scroll Area state and outer container. */
	export type RootProps = WithoutChild<ScrollAreaPrimitive.RootProps>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { setScrollAreaContext } from "./scroll-area-context.svelte";

	let { ref = $bindable(null), class: className, children, ...restProps }: RootProps = $props();

	const context = setScrollAreaContext();
</script>

<ScrollAreaPrimitive.Root bind:ref data-slot="scroll-area" class={cn("relative", className)} {...restProps}>
	{@render children?.()}

	{#if context.hasCorner}
		<ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
	{/if}
</ScrollAreaPrimitive.Root>

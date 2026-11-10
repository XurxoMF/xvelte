<script lang="ts" module>
	import { MessageScroller as MessageScrollerPrimitive } from "@shadcn-svelte/primitives/message-scroller";

	/** Props accepted by one measurable Message Scroller transcript row. */
	export type ItemProps = MessageScrollerPrimitive.ItemProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, scrollAnchor = false, ...restProps }: ItemProps = $props();
</script>

<MessageScrollerPrimitive.Item
	bind:ref
	data-slot="message-scroller-item"
	{scrollAnchor}
	class={cn("min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]", className)}
	{...restProps}
/>

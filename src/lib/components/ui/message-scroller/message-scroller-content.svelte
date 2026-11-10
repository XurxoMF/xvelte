<script lang="ts" module>
	import { MessageScroller as MessageScrollerPrimitive } from "@shadcn-svelte/primitives/message-scroller";

	/** Props accepted by the Message Scroller transcript container. */
	export type ContentProps = MessageScrollerPrimitive.ContentProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ContentProps = $props();
</script>

<MessageScrollerPrimitive.Content
	bind:ref
	data-slot="message-scroller-content"
	class={cn("flex h-max min-h-full flex-col", className)}
	{...restProps}
/>

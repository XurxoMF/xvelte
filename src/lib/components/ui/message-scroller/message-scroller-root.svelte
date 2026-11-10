<script lang="ts" module>
	import { MessageScroller as MessageScrollerPrimitive } from "@shadcn-svelte/primitives/message-scroller";

	/** Props accepted by the styled Message Scroller frame. */
	export type RootProps = MessageScrollerPrimitive.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: RootProps = $props();
</script>

<MessageScrollerPrimitive.Root
	bind:ref
	data-slot="message-scroller"
	class={cn("group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden", className)}
	{...restProps}
/>

<script lang="ts" module>
	import { MessageScroller as MessageScrollerPrimitive } from "@shadcn-svelte/primitives/message-scroller";

	/** Props accepted by the Message Scroller's keyboard-scrollable viewport. */
	export type ViewportProps = MessageScrollerPrimitive.ViewportProps;
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, "aria-label": ariaLabel = m.brave_quail_messages(), ...restProps }: ViewportProps = $props();
</script>

<MessageScrollerPrimitive.Viewport
	bind:ref
	data-slot="message-scroller-viewport"
	aria-label={ariaLabel}
	class={cn(
		"size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin [scrollbar-gutter:stable] overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible",
		className
	)}
	{...restProps}
/>

<script lang="ts" module>
	import { MessageScroller as MessageScrollerPrimitive } from "@shadcn-svelte/primitives/message-scroller";

	/** Props accepted by the headless Message Scroller state provider. */
	export type ProviderProps = MessageScrollerPrimitive.ProviderProps;
</script>

<script lang="ts">
	let { ...restProps }: ProviderProps = $props();
</script>

<MessageScrollerPrimitive.Provider {...restProps} />

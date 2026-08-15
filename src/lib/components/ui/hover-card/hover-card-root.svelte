<script lang="ts" module>
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";

	export type RootProps = HoverCardPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: RootProps = $props();
</script>

<HoverCardPrimitive.Root bind:open {...restProps} />

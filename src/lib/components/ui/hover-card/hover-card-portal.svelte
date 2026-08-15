<script lang="ts" module>
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";

	export type PortalProps = HoverCardPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<HoverCardPrimitive.Portal {...restProps} />

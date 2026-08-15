<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	export type PortalProps = TooltipPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<TooltipPrimitive.Portal {...restProps} />

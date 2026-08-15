<script lang="ts" module>
	import { Popover as PopoverPrimitive } from "bits-ui";

	export type PortalProps = PopoverPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<PopoverPrimitive.Portal {...restProps} />

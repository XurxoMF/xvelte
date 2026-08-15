<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type PortalProps = SheetPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<SheetPrimitive.Portal {...restProps} />

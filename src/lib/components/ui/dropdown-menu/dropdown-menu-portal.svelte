<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	export type PortalProps = DropdownMenuPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<DropdownMenuPrimitive.Portal {...restProps} />

<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type PortalProps = MenubarPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<MenubarPrimitive.Portal {...restProps} />

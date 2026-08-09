<script lang="ts" module>
	type PrimitivePortalProps = ComponentProps<InstanceType<typeof DrawerPrimitive.Portal>>;
	export type PortalProps = PrimitivePortalProps & { children?: Snippet | undefined };
</script>

<script lang="ts">
	import type { ComponentProps, Snippet } from "svelte";
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	let { children, ...restProps }: PortalProps = $props();
</script>

<DrawerPrimitive.Portal {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Portal>

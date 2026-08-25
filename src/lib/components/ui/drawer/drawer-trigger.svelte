<script lang="ts" module>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	import type { ComponentProps, Snippet } from "svelte";

	type PrimitiveTriggerProps = ComponentProps<InstanceType<typeof DrawerPrimitive.Trigger>>;
	export type TriggerProps = Omit<PrimitiveTriggerProps, "el"> & {
		ref?: HTMLButtonElement | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	let { ref = $bindable(undefined), children, ...restProps }: TriggerProps = $props();
</script>

<DrawerPrimitive.Trigger bind:el={ref} data-slot="drawer-trigger" {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Trigger>

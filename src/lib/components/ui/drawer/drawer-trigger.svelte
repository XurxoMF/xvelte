<script lang="ts" module>
	type PrimitiveTriggerProps = ComponentProps<InstanceType<typeof DrawerPrimitive.Trigger>>;
	export type TriggerProps = Omit<PrimitiveTriggerProps, "el"> & {
		ref?: HTMLButtonElement | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import type { ComponentProps, Snippet } from "svelte";
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	let { ref = $bindable(undefined), children, ...restProps }: TriggerProps = $props();
</script>

<DrawerPrimitive.Trigger bind:el={ref} data-slot="drawer-trigger" {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Trigger>

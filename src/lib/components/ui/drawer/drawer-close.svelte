<script lang="ts" module>
	import type { Snippet } from "svelte";

	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	export type CloseProps = Omit<DrawerPrimitive.CloseProps, "el"> & {
		ref?: HTMLButtonElement | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	let { ref = $bindable(undefined), children, ...restProps }: CloseProps = $props();
</script>

<DrawerPrimitive.Close bind:el={ref} data-slot="drawer-close" {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Close>

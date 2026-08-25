<script lang="ts" module>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	import type { Snippet } from "svelte";

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

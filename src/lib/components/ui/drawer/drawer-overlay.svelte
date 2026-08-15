<script lang="ts" module>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	export type OverlayProps = Omit<DrawerPrimitive.OverlayProps, "el"> & { ref?: HTMLDivElement | undefined };
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(undefined), class: className, ...restProps }: OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay
	bind:el={ref}
	data-slot="drawer-overlay"
	class={cn(
		"fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
		className
	)}
	{...restProps}
/>

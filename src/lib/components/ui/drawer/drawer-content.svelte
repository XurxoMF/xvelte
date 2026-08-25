<script lang="ts" module>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	import type { Snippet } from "svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils";

	import * as Drawer from ".";

	export type ContentProps = Omit<DrawerPrimitive.ContentProps, "el"> & {
		ref?: HTMLDivElement | undefined;
		portalProps?: WithoutChildrenOrChild<Drawer.PortalProps> | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(undefined), class: className, portalProps, children, ...restProps }: ContentProps = $props();
</script>

<Drawer.Portal {...portalProps}>
	<Drawer.Overlay />
	<DrawerPrimitive.Content
		bind:el={ref}
		data-slot="drawer-content"
		class={cn(
			"group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm",
			className
		)}
		{...restProps}
	>
		<div class="mx-auto mt-4 hidden h-1 w-25 shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
		{@render children?.()}
	</DrawerPrimitive.Content>
</Drawer.Portal>

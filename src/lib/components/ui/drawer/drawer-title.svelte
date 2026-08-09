<script lang="ts" module>
	export type TitleProps = Omit<DrawerPrimitive.TitleProps, "el"> & {
		ref?: HTMLHeadingElement | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	import { cn } from "$lib/utils";

	let { ref = $bindable(undefined), class: className, children, ...restProps }: TitleProps = $props();
</script>

<DrawerPrimitive.Title bind:el={ref} data-slot="drawer-title" class={cn("text-base font-medium text-foreground", className)} {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Title>

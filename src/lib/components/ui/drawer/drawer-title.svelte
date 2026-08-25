<script lang="ts" module>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	import type { Snippet } from "svelte";

	export type TitleProps = Omit<DrawerPrimitive.TitleProps, "el"> & {
		ref?: HTMLHeadingElement | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(undefined), class: className, children, ...restProps }: TitleProps = $props();
</script>

<DrawerPrimitive.Title bind:el={ref} data-slot="drawer-title" class={cn("text-base font-medium text-foreground", className)} {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Title>

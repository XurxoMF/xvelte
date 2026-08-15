<script lang="ts" module>
	import type { Snippet } from "svelte";

	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	export type DescriptionProps = Omit<DrawerPrimitive.DescriptionProps, "el"> & {
		ref?: HTMLDivElement | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(undefined), class: className, children, ...restProps }: DescriptionProps = $props();
</script>

<DrawerPrimitive.Description bind:el={ref} data-slot="drawer-description" class={cn("text-sm text-muted-foreground", className)} {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Description>

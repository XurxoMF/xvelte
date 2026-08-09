<script lang="ts" module>
	export type RootProps = DrawerPrimitive.Props & { children?: Snippet | undefined };
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	let { shouldScaleBackground = true, open = $bindable(false), activeSnapPoint = $bindable(null), children, ...restProps }: RootProps = $props();
</script>

<DrawerPrimitive.Root {shouldScaleBackground} bind:open bind:activeSnapPoint {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Root>

<script lang="ts" module>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	import type { Snippet } from "svelte";

	export type RootProps = DrawerPrimitive.Props & { children?: Snippet | undefined };
</script>

<script lang="ts">
	let { shouldScaleBackground = true, open = $bindable(false), activeSnapPoint = $bindable(null), children, ...restProps }: RootProps = $props();
</script>

<DrawerPrimitive.Root {shouldScaleBackground} bind:open bind:activeSnapPoint {...restProps}>
	{@render children?.()}
</DrawerPrimitive.Root>

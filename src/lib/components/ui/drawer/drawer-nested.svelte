<script lang="ts" module>
	import type { Snippet } from "svelte";

	import { Drawer as DrawerPrimitive } from "vaul-svelte";

	export type NestedProps = DrawerPrimitive.Props & { children?: Snippet | undefined };
</script>

<script lang="ts">
	let { shouldScaleBackground = true, open = $bindable(false), activeSnapPoint = $bindable(null), children, ...restProps }: NestedProps = $props();
</script>

<DrawerPrimitive.NestedRoot {shouldScaleBackground} bind:open bind:activeSnapPoint {...restProps}>
	{@render children?.()}
</DrawerPrimitive.NestedRoot>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type MenuItemProps = WithElementRef<HTMLAttributes<HTMLLIElement>, HTMLLIElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: MenuItemProps = $props();
</script>

<li bind:this={ref} data-slot="sidebar-menu-item" data-sidebar="menu-item" class={cn("group/menu-item relative", className)} {...restProps}>
	{@render children?.()}
</li>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type MenuProps = WithElementRef<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: MenuProps = $props();
</script>

<ul bind:this={ref} data-slot="sidebar-menu" data-sidebar="menu" class={cn("flex w-full min-w-0 flex-col gap-0", className)} {...restProps}>
	{@render children?.()}
</ul>

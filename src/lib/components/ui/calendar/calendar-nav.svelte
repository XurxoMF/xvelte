<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type NavProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: NavProps = $props();
</script>

<nav
	{...restProps}
	bind:this={ref}
	data-slot="calendar-nav"
	class={cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", className)}
>
	{@render children?.()}
</nav>

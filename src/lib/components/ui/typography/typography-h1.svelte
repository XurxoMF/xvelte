<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type H1Props = WithElementRef<HTMLAttributes<HTMLHeadingElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: H1Props = $props();
</script>

<h1 class={cn("scroll-m-20 text-4xl font-semibold tracking-tight lg:text-5xl", className)} bind:this={ref} {...restProps}>
	{@render children?.()}
</h1>

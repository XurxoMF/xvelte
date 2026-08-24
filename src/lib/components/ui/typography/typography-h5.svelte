<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type H5Props = WithElementRef<HTMLAttributes<HTMLHeadingElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: H5Props = $props();
</script>

<h5 data-slot="typography-h5" class={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)} bind:this={ref} {...restProps}>
	{@render children?.()}
</h5>

<script lang="ts" module>
	import type { HTMLBlockquoteAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type BlockquoteProps = WithElementRef<HTMLBlockquoteAttributes>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: BlockquoteProps = $props();
</script>

<blockquote class={cn("border-s-2 ps-6 italic", className)} bind:this={ref} {...restProps}>
	{@render children?.()}
</blockquote>

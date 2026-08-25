<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type PProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: PProps = $props();
</script>

<p data-slot="typography-p" class={cn("leading-7", className)} bind:this={ref} {...restProps}>
	{@render children?.()}
</p>

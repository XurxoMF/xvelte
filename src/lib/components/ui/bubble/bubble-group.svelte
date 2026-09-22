<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for a stack of consecutive bubbles from one sender. */
	export type GroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: GroupProps = $props();
</script>

<div bind:this={ref} data-slot="bubble-group" class={cn("flex min-w-0 flex-col gap-2", className)} {...restProps}>
	{@render children?.()}
</div>

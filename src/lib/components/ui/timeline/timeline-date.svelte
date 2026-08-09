<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";
	export type DateProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: DateProps = $props();
</script>

<p bind:this={ref} class={cn("mb-0.5 text-xs text-muted-foreground", className)} data-slot="timeline-date" {...restProps}>
	{@render children?.()}
</p>

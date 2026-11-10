<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props accepted by secondary Trace line metadata. */
	export type DescriptionProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: DescriptionProps = $props();
</script>

<span bind:this={ref} data-slot="trace-description" class={cn("shrink-0 text-muted-foreground/70 tabular-nums", className)} {...restProps}>
	{@render children?.()}
</span>

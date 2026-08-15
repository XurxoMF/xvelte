<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type DescriptionProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: DescriptionProps = $props();
</script>

<p bind:this={ref} class={cn("mt-1 text-sm text-muted-foreground", className)} data-slot="timeline-description" {...restProps}>
	{@render children?.()}
</p>

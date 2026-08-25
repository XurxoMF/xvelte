<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type DescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: DescriptionProps = $props();
</script>

<div bind:this={ref} data-slot="popover-description" class={cn("text-muted-foreground", className)} {...restProps}>
	{@render children?.()}
</div>

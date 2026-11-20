<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "#lib/utils.ts";

	export type LabelProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {};
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, children, ...restProps }: LabelProps = $props();
</script>

<div bind:this={ref} data-slot="select-label" class={cn("px-1.5 py-1 text-xs text-muted-foreground", className)} {...restProps}>
	{@render children?.()}
</div>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";
	export type LabelProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	let { ref = $bindable(null), class: className, children, ...restProps }: LabelProps = $props();
</script>

<span bind:this={ref} class={cn("pointer-events-none mr-2 text-xs font-medium opacity-70", className)} data-slot="scrubbable-label" {...restProps}>
	{@render children?.()}
</span>

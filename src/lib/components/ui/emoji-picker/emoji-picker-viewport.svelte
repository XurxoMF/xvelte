<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ViewportProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...rest }: ViewportProps = $props();
</script>

<div bind:this={ref} {...rest} data-slot="emoji-picker-viewport" class={cn("rounded-md border border-border", className)}>
	{@render children?.()}
</div>

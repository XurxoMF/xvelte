<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: RootProps = $props();
</script>

<div bind:this={ref} class={cn("w-full rounded-lg border bg-card p-1.5", className)} data-slot="audio-player" role="presentation" {...restProps}>
	{@render children?.()}
</div>

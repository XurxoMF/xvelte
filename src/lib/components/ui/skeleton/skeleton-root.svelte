<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	export type RootProps = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: RootProps = $props();
</script>

<div bind:this={ref} data-slot="skeleton" class={cn("animate-pulse rounded-md bg-muted", className)} {...restProps}></div>

<script lang="ts" module>
	export type SeparatorProps = WithElementRef<HTMLLiAttributes>;
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils";
	import type { HTMLLiAttributes } from "svelte/elements";
	import { ChevronRightIcon } from "$lib/icons";

	let { ref = $bindable(null), class: className, children, ...restProps }: SeparatorProps = $props();
</script>

<li bind:this={ref} data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class={cn("[&>svg]:size-3.5", className)} {...restProps}>
	{#if children}
		{@render children?.()}
	{:else}
		<ChevronRightIcon />
	{/if}
</li>

<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type GroupLabelProps = WithElementRef<HTMLAttributes<HTMLElement>> & {
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), children, child, class: className, ...restProps }: GroupLabelProps = $props();

	const mergedProps = $derived({
		class: cn(
			"text-sidebar-foreground/70 h-8 rounded-md px-2 text-xs font-medium transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 flex shrink-0 items-center [&>svg]:shrink-0",
			className
		),
		"data-slot": "sidebar-group-label",
		"data-sidebar": "group-label",
		...restProps
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}

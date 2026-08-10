<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithChildren, WithoutChildren } from "bits-ui";

	export type OverflowProps = WithChildren<{
		collapsed?: boolean;
	}> &
		WithoutChildren<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";
	import { Root as Button } from "$lib/components/ui/button";

	import { useCodeOverflow } from "./code.svelte.js";

	let { collapsed = $bindable(true), class: className, children, ...restProps }: OverflowProps = $props();

	const state = useCodeOverflow({
		collapsed: box.with(
			() => collapsed,
			(v) => (collapsed = v)
		)
	});
</script>

<div
	{...restProps}
	data-slot="code-overflow"
	data-code-overflow
	data-collapsed={collapsed}
	class={cn("relative overflow-y-hidden data-[collapsed=true]:max-h-75", className)}
>
	{@render children?.()}
	{#if collapsed}
		<div class="absolute bottom-0 left-0 z-10 h-full w-full bg-linear-to-t from-background to-transparent"></div>
	{/if}
	{#if collapsed}
		<Button variant="secondary" size="sm" class="absolute bottom-2 left-1/2 z-20 w-fit -translate-x-1/2" onclick={state.toggleCollapsed}>
			Expand
		</Button>
	{/if}
</div>

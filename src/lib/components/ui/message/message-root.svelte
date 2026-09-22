<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Available logical Message alignments. */
	export type RootAlignments = "start" | "end";
	/** Props for the Message row. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: RootAlignments | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, align = "start", children, ...restProps }: RootProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="message"
	data-align={align}
	class={cn("group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse", className)}
	{...restProps}
>
	{@render children?.()}
</div>

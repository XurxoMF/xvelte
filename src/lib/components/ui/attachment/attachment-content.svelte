<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for the Attachment title-and-description wrapper. */
	export type ContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ContentProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="attachment-content"
	class={cn("max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1", className)}
	{...restProps}
>
	{@render children?.()}
</div>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for the Attachment title. */
	export type TitleProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: TitleProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="attachment-title"
	class={cn(
		"block max-w-full min-w-0 truncate font-medium group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>

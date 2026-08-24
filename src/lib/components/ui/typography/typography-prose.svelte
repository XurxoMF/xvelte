<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props for the vertical-rhythm container used around document content. */
	export type ProseProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ProseProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="typography-prose"
	class={cn("flex flex-col gap-4 [&>[data-slot^=typography-h]:not(:first-child)]:mt-4", className)}
	{...restProps}
>
	{@render children?.()}
</div>

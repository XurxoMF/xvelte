<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for Message status, timestamp, or action metadata. */
	export type FooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: FooterProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="message-footer"
	class={cn(
		"flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

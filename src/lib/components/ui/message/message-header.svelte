<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for Message sender or leading metadata. */
	export type HeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: HeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="message-header"
	class={cn(
		"flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

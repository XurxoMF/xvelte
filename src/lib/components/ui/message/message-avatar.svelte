<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for a Message avatar position. */
	export type AvatarProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: AvatarProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="message-avatar"
	class={cn(
		"flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

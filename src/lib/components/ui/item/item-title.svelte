<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type TitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: TitleProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="item-title"
	class={cn("line-clamp-1 flex w-full items-center gap-2 text-sm leading-snug font-medium underline-offset-4", className)}
	{...restProps}
>
	{@render children?.()}
</div>

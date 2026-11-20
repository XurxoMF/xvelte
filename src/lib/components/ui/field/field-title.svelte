<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "#lib/utils.ts";

	export type TitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, children, ...restProps }: TitleProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="field-label"
	class={cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-disabled/field:opacity-50", className)}
	{...restProps}
>
	{@render children?.()}
</div>

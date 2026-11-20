<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "#lib/utils.ts";

	export type TitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, children, ...restProps }: TitleProps = $props();
</script>

<div bind:this={ref} data-slot="popover-title" class={cn("font-medium", className)} {...restProps}>
	{@render children?.()}
</div>

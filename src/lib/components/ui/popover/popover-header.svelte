<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type HeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: HeaderProps = $props();
</script>

<div bind:this={ref} data-slot="popover-header" class={cn("flex flex-col gap-0.5 text-sm", className)} {...restProps}>
	{@render children?.()}
</div>

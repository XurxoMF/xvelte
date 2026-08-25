<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type FooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: FooterProps = $props();
</script>

<div bind:this={ref} data-slot="drawer-footer" class={cn("mt-auto flex flex-col gap-2 p-4", className)} {...restProps}>
	{@render children?.()}
</div>

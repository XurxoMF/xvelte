<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type ActionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ActionProps = $props();
</script>

<div bind:this={ref} data-slot="alert-action" class={cn("absolute top-2 right-2", className)} {...restProps}>
	{@render children?.()}
</div>

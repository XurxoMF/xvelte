<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type GroupProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: GroupProps = $props();
</script>

<kbd bind:this={ref} data-slot="kbd-group" class={cn("inline-flex items-center gap-1", className)} {...restProps}>
	{@render children?.()}
</kbd>

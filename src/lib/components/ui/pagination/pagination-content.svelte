<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ContentProps = WithElementRef<HTMLAttributes<HTMLUListElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ContentProps = $props();
</script>

<ul bind:this={ref} data-slot="pagination-content" class={cn("flex items-center gap-0.5", className)} {...restProps}>
	{@render children?.()}
</ul>

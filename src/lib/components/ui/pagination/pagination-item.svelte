<script lang="ts" module>
	import type { HTMLLiAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ItemProps = WithElementRef<HTMLLiAttributes>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: ItemProps = $props();
</script>

<li bind:this={ref} data-slot="pagination-item" {...restProps}>
	{@render children?.()}
</li>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "#lib/utils.ts";

	export type HeaderProps = WithElementRef<HTMLAttributes<HTMLTableSectionElement>>;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, children, ...restProps }: HeaderProps = $props();
</script>

<thead bind:this={ref} data-slot="table-header" class={cn("[&_tr]:border-b", className)} {...restProps}>
	{@render children?.()}
</thead>

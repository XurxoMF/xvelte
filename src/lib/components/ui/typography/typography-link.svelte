<script lang="ts" module>
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type LinkProps = WithElementRef<HTMLAnchorAttributes>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: LinkProps = $props();
</script>

<a data-slot="typography-link" class={cn("font-medium text-primary", className)} bind:this={ref} {...restProps}>
	{@render children?.()}
</a>

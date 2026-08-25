<script lang="ts" module>
	import type { HTMLOlAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type ListProps = WithElementRef<HTMLOlAttributes>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ListProps = $props();
</script>

<ol
	bind:this={ref}
	data-slot="breadcrumb-list"
	class={cn("flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</ol>

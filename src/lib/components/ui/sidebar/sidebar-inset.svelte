<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type InsetProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: InsetProps = $props();
</script>

<main
	bind:this={ref}
	data-slot="sidebar-inset"
	class={cn(
		"@container/main relative flex min-h-0 w-full flex-1 flex-col bg-background md:peer-data-[position=viewport]:h-auto md:peer-data-[position=viewport]:min-h-svh md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[position=viewport]:peer-data-[variant=inset]:min-h-[calc(100svh-var(--spacing(2*2)))] md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</main>

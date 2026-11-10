<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props accepted by the Code Block header. */
	export type HeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: HeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="code-block-header"
	class={cn(
		"flex min-w-0 shrink-0 items-center gap-2 px-4 pt-4 text-muted-foreground group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:pt-3 group-data-[variant=destructive]/code-block:text-danger *:has-[>[data-slot=code-block-title]]:min-w-0",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

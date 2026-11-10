<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Execution states that change a Trace line's visual treatment. */
	export type LineStatus = "running" | "error" | "pending";

	/** Props accepted by one Trace row. */
	export type LineProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		status?: LineStatus | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, status, children, ...restProps }: LineProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="trace-line"
	data-status={status}
	class={cn(
		"flex w-fit max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground data-[status=error]:text-danger data-[status=error]:in-[a:hover,button:hover]:text-danger data-[status=pending]:opacity-60 data-[status=running]:*:data-[slot=trace-title]:shimmer",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>

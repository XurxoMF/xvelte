<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "#lib/utils.ts";

	/** Props accepted by the primary Trace line text. */
	export type TitleProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, children, ...restProps }: TitleProps = $props();
</script>

<span bind:this={ref} data-slot="trace-title" class={cn("min-w-0 truncate motion-reduce:shimmer-none", className)} {...restProps}>
	{@render children?.()}
</span>

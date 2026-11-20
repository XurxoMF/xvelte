<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "#lib/utils.ts";

	export type TitleProps = WithElementRef<HTMLAttributes<HTMLHeadingElement>>;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, children, ...restProps }: TitleProps = $props();
</script>

<h3 bind:this={ref} class={cn("text-sm leading-none font-semibold tracking-tight", className)} data-slot="timeline-title" {...restProps}>
	{@render children?.()}
</h3>

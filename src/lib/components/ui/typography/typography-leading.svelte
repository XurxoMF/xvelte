<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type LeadingProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: LeadingProps = $props();
</script>

<p data-slot="typography-leading" class={cn("text-xl text-muted-foreground", className)} bind:this={ref} {...restProps}>
	{@render children?.()}
</p>

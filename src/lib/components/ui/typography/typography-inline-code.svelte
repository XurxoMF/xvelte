<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type InlineCodeProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: InlineCodeProps = $props();
</script>

<code
	data-slot="typography-inline-code"
	class={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}
	bind:this={ref}
	{...restProps}
>
	{@render children?.()}
</code>

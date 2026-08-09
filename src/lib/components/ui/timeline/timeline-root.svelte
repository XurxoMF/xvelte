<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { class: className, children, ref = $bindable(null), ...restProps }: RootProps = $props();
</script>

<div bind:this={ref} class={cn("relative flex flex-col", className)} data-slot="timeline" {...restProps}>
	<div class="absolute top-0 bottom-0 left-[11.5px] w-px bg-border"></div>
	{@render children?.()}
</div>

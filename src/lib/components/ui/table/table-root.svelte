<script lang="ts" module>
	import type { HTMLTableAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithElementRef<HTMLTableAttributes>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import * as ScrollArea from "$lib/components/ui/scroll-area";

	let { ref = $bindable(null), class: className, children, ...restProps }: RootProps = $props();
</script>

<ScrollArea.Root data-slot="table-container" class="relative w-full">
	<ScrollArea.Viewport>
		<table bind:this={ref} data-slot="table" class={cn("w-full caption-bottom text-sm", className)} {...restProps}>
			{@render children?.()}
		</table>
	</ScrollArea.Viewport>

	<ScrollArea.ScrollbarHorizontal />
</ScrollArea.Root>

<script lang="ts" module>
	import type { HTMLButtonAttributes } from "svelte/elements";

	import type { RootSizes as ButtonSize, RootVariants as ButtonVariant } from "$lib/components/ui/button";
	import type { WithElementRef } from "$lib/utils";

	export type DragHandleProps = WithElementRef<HTMLButtonAttributes> & {
		size?: ButtonSize;
		variant?: ButtonVariant;
	};
</script>

<script lang="ts">
	import { dragHandle } from "svelte-dnd-action";

	import { rootVariants as buttonVariants } from "$lib/components/ui/button";
	import { DragHandleIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		size = "icon-sm",
		variant = "ghost",
		type = "button",
		"aria-label": ariaLabel = "Drag to reorder",
		...restProps
	}: DragHandleProps = $props();
</script>

<button
	bind:this={ref}
	use:dragHandle
	class={cn(buttonVariants({ size, variant }), "cursor-grab touch-none active:cursor-grabbing", className)}
	aria-label={ariaLabel}
	data-slot="sortable-list-drag-handle"
	{type}
	{...restProps}
>
	<DragHandleIcon class="size-4" />
</button>

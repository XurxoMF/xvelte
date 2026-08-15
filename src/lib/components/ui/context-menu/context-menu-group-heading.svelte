<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	export type GroupHeadingProps = ContextMenuPrimitive.GroupHeadingProps & {
		inset?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, inset, ...restProps }: GroupHeadingProps = $props();
</script>

<ContextMenuPrimitive.GroupHeading
	bind:ref
	data-slot="context-menu-group-heading"
	data-inset={inset}
	class={cn("px-2 py-1.5 text-sm font-medium text-foreground data-inset:ps-8", className)}
	{...restProps}
/>

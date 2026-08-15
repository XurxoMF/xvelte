<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	export type SeparatorProps = ContextMenuPrimitive.SeparatorProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: SeparatorProps = $props();
</script>

<ContextMenuPrimitive.Separator bind:ref data-slot="context-menu-separator" class={cn("-mx-1 my-1 h-px bg-border", className)} {...restProps} />

<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	export type TriggerProps = ContextMenuPrimitive.TriggerProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: TriggerProps = $props();
</script>

<ContextMenuPrimitive.Trigger bind:ref data-slot="context-menu-trigger" class={cn("cn-context-menu-trigger select-none", className)} {...restProps} />

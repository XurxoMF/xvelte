<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	export type GroupProps = ContextMenuPrimitive.GroupProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: GroupProps = $props();
</script>

<ContextMenuPrimitive.Group bind:ref data-slot="context-menu-group" {...restProps} />

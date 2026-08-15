<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	export type SubProps = ContextMenuPrimitive.SubProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: SubProps = $props();
</script>

<ContextMenuPrimitive.Sub bind:open {...restProps} />

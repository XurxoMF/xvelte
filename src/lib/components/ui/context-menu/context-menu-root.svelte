<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	export type RootProps = ContextMenuPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: RootProps = $props();
</script>

<ContextMenuPrimitive.Root bind:open {...restProps} />

<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type RootProps = SheetPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: RootProps = $props();
</script>

<SheetPrimitive.Root bind:open {...restProps} />

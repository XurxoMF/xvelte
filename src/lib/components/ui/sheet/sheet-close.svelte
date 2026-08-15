<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type CloseProps = SheetPrimitive.CloseProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: CloseProps = $props();
</script>

<SheetPrimitive.Close bind:ref data-slot="sheet-close" {...restProps} />

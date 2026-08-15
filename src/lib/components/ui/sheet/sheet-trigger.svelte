<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type TriggerProps = SheetPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: TriggerProps = $props();
</script>

<SheetPrimitive.Trigger bind:ref data-slot="sheet-trigger" {...restProps} />

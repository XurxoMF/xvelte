<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	export type TriggerProps = AlertDialogPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: TriggerProps = $props();
</script>

<AlertDialogPrimitive.Trigger bind:ref data-slot="alert-dialog-trigger" {...restProps} />

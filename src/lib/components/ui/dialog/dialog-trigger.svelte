<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";

	export type TriggerProps = DialogPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), type = "button", ...restProps }: TriggerProps = $props();
</script>

<DialogPrimitive.Trigger bind:ref data-slot="dialog-trigger" {type} {...restProps} />

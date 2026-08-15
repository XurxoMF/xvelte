<script lang="ts" module>
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";

	export type TriggerProps = CollapsiblePrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: TriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger bind:ref data-slot="collapsible-trigger" {...restProps} />

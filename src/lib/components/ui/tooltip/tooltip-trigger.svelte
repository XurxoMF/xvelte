<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	export type TriggerProps<T = never> = TooltipPrimitive.TriggerProps<T>;
</script>

<script lang="ts" generics="T = never">
	let { ref = $bindable(null), ...restProps }: TriggerProps<T> = $props();
</script>

<TooltipPrimitive.Trigger bind:ref data-slot="tooltip-trigger" {...restProps} />

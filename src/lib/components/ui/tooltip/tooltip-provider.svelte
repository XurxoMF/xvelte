<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	export type ProviderProps = TooltipPrimitive.ProviderProps;
</script>

<script lang="ts">
	let { delayDuration = 0, ...restProps }: ProviderProps = $props();
</script>

<TooltipPrimitive.Provider {delayDuration} {...restProps} />

<script lang="ts" module>
	export type RootProps<T = never> = TooltipPrimitive.RootProps<T>;
</script>

<script lang="ts" generics="T = never">
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	let { open = $bindable(false), ...restProps }: RootProps<T> = $props();
</script>

<TooltipPrimitive.Root bind:open {...restProps} />

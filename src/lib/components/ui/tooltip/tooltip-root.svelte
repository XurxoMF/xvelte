<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	export type RootProps<T = never> = TooltipPrimitive.RootProps<T>;
</script>

<script lang="ts" generics="T = never">
	let { open = $bindable(false), ...restProps }: RootProps<T> = $props();
</script>

<TooltipPrimitive.Root bind:open {...restProps} />

<script lang="ts" module>
	import { Popover as PopoverPrimitive } from "bits-ui";

	export type RootProps = PopoverPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: RootProps = $props();
</script>

<PopoverPrimitive.Root bind:open {...restProps} />

<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	export type SubProps = DropdownMenuPrimitive.SubProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: SubProps = $props();
</script>

<DropdownMenuPrimitive.Sub bind:open {...restProps} />

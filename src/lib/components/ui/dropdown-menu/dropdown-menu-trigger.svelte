<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	export type TriggerProps = DropdownMenuPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: TriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger bind:ref data-slot="dropdown-menu-trigger" {...restProps} />

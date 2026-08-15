<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type SubProps = MenubarPrimitive.SubProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: SubProps = $props();
</script>

<MenubarPrimitive.Sub bind:open {...restProps} />

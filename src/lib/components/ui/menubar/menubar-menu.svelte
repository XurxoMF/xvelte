<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type MenuProps = MenubarPrimitive.MenuProps;
</script>

<script lang="ts">
	let { ...restProps }: MenuProps = $props();
</script>

<MenubarPrimitive.Menu {...restProps} />

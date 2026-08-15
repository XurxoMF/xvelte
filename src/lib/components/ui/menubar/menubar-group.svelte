<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type GroupProps = MenubarPrimitive.GroupProps & {
		inset?: boolean | undefined;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: GroupProps = $props();
</script>

<MenubarPrimitive.Group bind:ref data-slot="menubar-group" {...restProps} />

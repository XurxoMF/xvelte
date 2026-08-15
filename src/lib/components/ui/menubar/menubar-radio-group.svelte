<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type RadioGroupProps = MenubarPrimitive.RadioGroupProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), value = $bindable(""), ...restProps }: RadioGroupProps = $props();
</script>

<MenubarPrimitive.RadioGroup bind:ref bind:value data-slot="menubar-radio-group" {...restProps} />

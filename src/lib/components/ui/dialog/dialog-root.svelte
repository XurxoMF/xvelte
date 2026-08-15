<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";

	export type RootProps = DialogPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: RootProps = $props();
</script>

<DialogPrimitive.Root bind:open {...restProps} />

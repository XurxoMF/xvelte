<script lang="ts" module>
	import { AspectRatio as AspectRatioPrimitive } from "bits-ui";

	export type RootProps = AspectRatioPrimitive.RootProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: RootProps = $props();
</script>

<AspectRatioPrimitive.Root bind:ref data-slot="aspect-ratio" {...restProps} />

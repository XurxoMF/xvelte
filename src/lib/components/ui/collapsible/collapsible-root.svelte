<script lang="ts" module>
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";

	export type RootProps = CollapsiblePrimitive.RootProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), open = $bindable(false), ...restProps }: RootProps = $props();
</script>

<CollapsiblePrimitive.Root bind:ref bind:open data-slot="collapsible" {...restProps} />

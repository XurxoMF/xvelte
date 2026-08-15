<script lang="ts" module>
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";

	export type ContentProps = CollapsiblePrimitive.ContentProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: ContentProps = $props();
</script>

<CollapsiblePrimitive.Content bind:ref data-slot="collapsible-content" {...restProps} />

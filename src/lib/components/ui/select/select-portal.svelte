<script lang="ts" module>
	import { Select as SelectPrimitive } from "bits-ui";

	export type PortalProps = SelectPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<SelectPrimitive.Portal {...restProps} />

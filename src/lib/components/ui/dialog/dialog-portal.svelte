<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";

	export type PortalProps = DialogPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PortalProps = $props();
</script>

<DialogPrimitive.Portal {...restProps} />

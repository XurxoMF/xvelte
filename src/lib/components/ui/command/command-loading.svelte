<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type LoadingProps = CommandPrimitive.LoadingProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: LoadingProps = $props();
</script>

<CommandPrimitive.Loading bind:ref data-slot="command-loading" {...restProps} />

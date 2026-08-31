<script lang="ts" module>
	import * as Command from "$lib/components/ui/command";

	/** Props for loading content inside the Combobox result list. */
	export type LoadingProps = Command.LoadingProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: LoadingProps = $props();
</script>

<Command.Loading bind:ref data-slot="combobox-loading" {...restProps} />

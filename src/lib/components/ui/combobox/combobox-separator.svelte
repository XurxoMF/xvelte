<script lang="ts" module>
	import * as Command from "$lib/components/ui/command";

	/** Props for a visual separator between Combobox results. */
	export type SeparatorProps = Command.SeparatorProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: SeparatorProps = $props();
</script>

<Command.Separator bind:ref data-slot="combobox-separator" {...restProps} />

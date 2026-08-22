<script lang="ts">
	import * as ToggleGroup from "$lib/components/ui/toggle-group";

	let alignment = $state("left");
</script>

<ToggleGroup.Root type="single" bind:value={alignment} aria-label="Text alignment">
	<ToggleGroup.Item value="left">Left</ToggleGroup.Item>
	<ToggleGroup.Item value="center">Center</ToggleGroup.Item>
	<ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup.Root>

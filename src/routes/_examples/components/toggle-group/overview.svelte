<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as ToggleGroup from "$lib/components/ui/toggle-group";

	let alignment = $state("left");
</script>

<Field.Field>
	<Field.Title id="text-alignment-label">Text alignment</Field.Title>

	<ToggleGroup.Root type="single" bind:value={alignment} aria-labelledby="text-alignment-label" aria-describedby="text-alignment-description">
		<ToggleGroup.Item value="left" class="flex-1">Left</ToggleGroup.Item>
		<ToggleGroup.Item value="center" class="flex-1">Center</ToggleGroup.Item>
		<ToggleGroup.Item value="right" class="flex-1">Right</ToggleGroup.Item>
	</ToggleGroup.Root>

	<Field.Description id="text-alignment-description">Selected alignment: {alignment}.</Field.Description>
</Field.Field>

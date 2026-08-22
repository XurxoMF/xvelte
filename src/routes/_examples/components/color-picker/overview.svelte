<script lang="ts">
	import * as ColorPicker from "$lib/components/ui/color-picker";
	import * as Field from "$lib/components/ui/field";

	let color = $state("#7C3AED");
</script>

<Field.Field>
	<Field.Title>Brand color</Field.Title>

	<ColorPicker.Root bind:value={color} allowOpacity />

	<Field.Description>Selected color: {color}.</Field.Description>
</Field.Field>

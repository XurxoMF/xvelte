<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as RadioGroup from "$lib/components/ui/radio-group";

	let density = $state("comfortable");
</script>

<Field.Set>
	<Field.Legend>Interface density</Field.Legend>
	<Field.Description id="density-description">Choose how much space appears between interface elements.</Field.Description>

	<RadioGroup.Root bind:value={density} aria-describedby="density-description">
		<Field.Field orientation="horizontal">
			<RadioGroup.Item id="density-default" value="default" />
			<Field.Label for="density-default">Default</Field.Label>
		</Field.Field>

		<Field.Field orientation="horizontal">
			<RadioGroup.Item id="density-comfortable" value="comfortable" />
			<Field.Label for="density-comfortable">Comfortable</Field.Label>
		</Field.Field>

		<Field.Field orientation="horizontal">
			<RadioGroup.Item id="density-compact" value="compact" />
			<Field.Label for="density-compact">Compact</Field.Label>
		</Field.Field>
	</RadioGroup.Root>

	<Field.Description>Selected: {density}</Field.Description>
</Field.Set>

<script lang="ts">
	import * as Checkbox from "$lib/components/ui/checkbox";
	import * as Field from "$lib/components/ui/field";

	let accepted = $state(false);
</script>

<Field.Field orientation="horizontal">
	<Field.Content>
		<Field.Label for="terms">Accept the terms and conditions</Field.Label>
		<Field.Description id="terms-description">{accepted ? "Terms accepted." : "You must accept the terms before continuing."}</Field.Description>
	</Field.Content>

	<Checkbox.Root id="terms" name="terms" required bind:checked={accepted} aria-describedby="terms-description" />
</Field.Field>

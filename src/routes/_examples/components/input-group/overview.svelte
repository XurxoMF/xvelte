<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as InputGroup from "$lib/components/ui/input-group";

	let domain = $state("");
</script>

<Field.Field>
	<Field.Label for="website-domain">Website</Field.Label>

	<InputGroup.Root>
		<InputGroup.Addon>
			<InputGroup.Text>https://</InputGroup.Text>
		</InputGroup.Addon>

		<InputGroup.Input id="website-domain" name="domain" placeholder="example.com" bind:value={domain} aria-describedby="website-domain-description" />
	</InputGroup.Root>

	<Field.Description id="website-domain-description">Enter the domain without the protocol.</Field.Description>
</Field.Field>

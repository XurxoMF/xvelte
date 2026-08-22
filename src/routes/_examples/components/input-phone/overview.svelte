<script lang="ts">
	import * as ButtonGroup from "$lib/components/ui/button-group";
	import * as Field from "$lib/components/ui/field";
	import * as InputPhone from "$lib/components/ui/input-phone";

	let value = $state("");
	let valid = $state(true);
</script>

<Field.Field data-invalid={!valid}>
	<Field.Label for="contact-phone">Phone number</Field.Label>

	<InputPhone.Root defaultCountry="ES" bind:value bind:valid required>
		<ButtonGroup.Root class="w-full">
			<InputPhone.CountrySelector />
			<InputPhone.Input
				id="contact-phone"
				name="phone"
				placeholder="Phone number"
				aria-describedby={valid ? "contact-phone-description" : "contact-phone-description contact-phone-error"}
			/>
		</ButtonGroup.Root>
	</InputPhone.Root>

	<Field.Description id="contact-phone-description">Choose a country and enter the complete phone number.</Field.Description>

	{#if !valid}
		<Field.Error id="contact-phone-error">Enter a valid phone number.</Field.Error>
	{/if}
</Field.Field>

<script lang="ts">
	import * as ButtonGroup from "$lib/components/ui/button-group";
	import * as InputPhone from "$lib/components/ui/input-phone";
	import * as Label from "$lib/components/ui/label";

	let value = $state("");
	let valid = $state(true);
</script>

<div class="grid max-w-sm gap-1.5">
	<Label.Root for="contact-phone">Phone number</Label.Root>

	<InputPhone.Root defaultCountry="ES" bind:value bind:valid required>
		<ButtonGroup.Root class="w-full">
			<InputPhone.CountrySelector />
			<InputPhone.Input id="contact-phone" name="phone" placeholder="Phone number" aria-describedby="contact-phone-help" />
		</ButtonGroup.Root>
	</InputPhone.Root>

	<p id="contact-phone-help" class="text-sm text-muted-foreground">Choose a country and enter the complete phone number.</p>

	{#if !valid}
		<p class="text-sm text-destructive" role="alert">Enter a valid phone number.</p>
	{/if}
</div>

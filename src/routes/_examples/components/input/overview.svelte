<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Input from "$lib/components/ui/input";

	let email = $state("");
</script>

<Field.Field>
	<Field.Label for="account-email">Email address</Field.Label>

	<Input.Root
		id="account-email"
		name="email"
		type="email"
		autocomplete="email"
		placeholder="name@example.com"
		bind:value={email}
		aria-describedby="account-email-description"
		required
	/>

	<Field.Description id="account-email-description">Enter your email address.</Field.Description>
</Field.Field>

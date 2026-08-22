<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Input from "$lib/components/ui/input";

	let username = $state("");
</script>

<Field.Field>
	<Field.Label for="profile-username">Username</Field.Label>

	<Input.Root id="profile-username" name="username" type="text" bind:value={username} aria-describedby="profile-username-description" />

	<Field.Description id="profile-username-description">Choose a unique name between 3 and 30 characters.</Field.Description>
</Field.Field>

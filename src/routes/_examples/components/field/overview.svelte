<script lang="ts">
	import * as Field from "$lib/components/ui/field";

	let username = $state("");
</script>

<Field.Field>
	<Field.Label for="profile-username">Username</Field.Label>
	<input
		id="profile-username"
		name="username"
		type="text"
		bind:value={username}
		aria-describedby="profile-username-description"
		class="h-8 rounded-lg border px-2.5"
	/>
	<Field.Description id="profile-username-description">Choose a unique name between 3 and 30 characters.</Field.Description>
</Field.Field>

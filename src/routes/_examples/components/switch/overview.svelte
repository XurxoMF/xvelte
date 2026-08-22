<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Switch from "$lib/components/ui/switch";

	let enabled = $state(false);
</script>

<Field.Field orientation="horizontal">
	<Field.Content>
		<Field.Label for="email-notifications">Email notifications</Field.Label>
		<Field.Description id="email-notifications-description">Receive important account and security updates.</Field.Description>
	</Field.Content>

	<Switch.Root id="email-notifications" bind:checked={enabled} aria-describedby="email-notifications-description" />
</Field.Field>

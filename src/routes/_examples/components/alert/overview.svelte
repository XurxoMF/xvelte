<script lang="ts">
	import * as Alert from "$lib/components/ui/alert";
</script>

<div class="grid gap-3">
	<Alert.Root variant="info">
		<Alert.Title>New version available</Alert.Title>
		<Alert.Description>Refresh when you are ready to use the latest features.</Alert.Description>
	</Alert.Root>

	<Alert.Root variant="success">
		<Alert.Title>Profile updated</Alert.Title>
		<Alert.Description>Your public profile changes have been saved.</Alert.Description>
	</Alert.Root>

	<Alert.Root variant="warning">
		<Alert.Title>Storage almost full</Alert.Title>
		<Alert.Description>Remove unused files to keep uploads working.</Alert.Description>
	</Alert.Root>

	<Alert.Root variant="danger">
		<Alert.Title>Payment failed</Alert.Title>
		<Alert.Description>Check the card details and try again.</Alert.Description>
	</Alert.Root>

	<Alert.Root variant="important">
		<Alert.Title>Action required</Alert.Title>
		<Alert.Description>Review the updated terms before Friday.</Alert.Description>
	</Alert.Root>
</div>

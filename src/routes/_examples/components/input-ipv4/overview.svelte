<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as InputIPv4 from "$lib/components/ui/input-ipv4";

	let address = $state<string | null>(null);
	let valid = $state(false);
</script>

<Field.Field>
	<Field.Title id="server-ipv4-label">Server IPv4 address</Field.Title>

	<InputIPv4.Root
		aria-labelledby="server-ipv4-label"
		aria-describedby="server-ipv4-description"
		name="serverAddress"
		bind:value={address}
		bind:valid
	/>

	<Field.Description id="server-ipv4-description">{valid ? `Address: ${address}` : "Enter a complete IPv4 address."}</Field.Description>
</Field.Field>

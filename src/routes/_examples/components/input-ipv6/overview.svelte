<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as InputIPv6 from "$lib/components/ui/input-ipv6";

	let address = $state<string | null>(null);
	let valid = $state(false);
</script>

<Field.Field>
	<Field.Title id="server-ipv6-label">Server IPv6 address</Field.Title>

	<InputIPv6.Root
		aria-labelledby="server-ipv6-label"
		aria-describedby="server-ipv6-description"
		name="serverAddress"
		bind:value={address}
		bind:valid
	/>

	<Field.Description id="server-ipv6-description">{valid ? `Address: ${address}` : "Enter a complete IPv6 address."}</Field.Description>
</Field.Field>

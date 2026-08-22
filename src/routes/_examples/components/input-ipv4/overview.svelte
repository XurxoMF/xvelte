<script lang="ts">
	import * as InputIPv4 from "$lib/components/ui/input-ipv4";

	let address = $state<string | null>(null);
	let valid = $state(false);
</script>

<span id="server-address-label">Server IPv4 address</span>
<InputIPv4.Root aria-labelledby="server-address-label" name="serverAddress" bind:value={address} bind:valid />

<p>{valid ? `Address: ${address}` : "Enter a complete IPv4 address."}</p>

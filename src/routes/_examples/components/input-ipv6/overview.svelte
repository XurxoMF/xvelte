<script lang="ts">
	import * as InputIPv6 from "$lib/components/ui/input-ipv6";

	let address = $state<string | null>(null);
	let valid = $state(false);
</script>

<span id="server-address-label">Server IPv6 address</span>
<InputIPv6.Root aria-labelledby="server-address-label" name="serverAddress" bind:value={address} bind:valid />

<p>{valid ? `Address: ${address}` : "Enter a complete IPv6 address."}</p>

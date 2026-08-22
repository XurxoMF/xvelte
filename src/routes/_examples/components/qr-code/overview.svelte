<script lang="ts">
	import * as QrCode from "$lib/components/ui/qr-code";

	const destination = "https://example.com/account/setup";
</script>

<div class="flex items-center justify-center">
	<QrCode.Root value={destination} size={192} class="rounded-md" />
</div>

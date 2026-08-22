<script lang="ts">
	import * as QrCode from "$lib/components/ui/qr-code";

	const destination = "https://example.com/account/setup";
</script>

<figure class="grid w-fit gap-2">
	<QrCode.Root value={destination} size={192} />
	<figcaption class="max-w-48 text-sm break-all">Open {destination}</figcaption>
</figure>

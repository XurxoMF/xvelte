<script lang="ts">
	import * as ButtonHold from "$lib/components/ui/button-hold";

	let confirmed = $state(false);
</script>

<ButtonHold.Root duration={1500} variant="destructive" fillColor="bg-black/20" onComplete={() => (confirmed = true)}>
	Hold for 1.5 seconds to delete
</ButtonHold.Root>

{#if confirmed}
	<p role="status">The item was deleted.</p>
{/if}

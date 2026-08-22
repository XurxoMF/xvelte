<script lang="ts">
	import * as ButtonHold from "$lib/components/ui/button-hold";
	import * as Typography from "$lib/components/ui/typography";

	let confirmed = $state(false);
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<ButtonHold.Root duration={1500} variant="destructive" fillColor="bg-black/20" onComplete={() => (confirmed = true)}>
		Hold for 1.5 seconds to delete
	</ButtonHold.Root>

	{#if confirmed}
		<Typography.P role="status">The item was deleted.</Typography.P>
	{/if}
</div>

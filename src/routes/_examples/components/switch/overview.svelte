<script lang="ts">
	import * as Label from "$lib/components/ui/label";
	import * as Switch from "$lib/components/ui/switch";

	let enabled = $state(false);
</script>

<div class="flex items-center gap-3">
	<Switch.Root id="email-notifications" bind:checked={enabled} />
	<Label.Root for="email-notifications">Email notifications</Label.Root>
</div>

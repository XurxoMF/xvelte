<script lang="ts">
	import * as Knob from "$lib/components/ui/knob";

	let volume = $state(40);
</script>

<Knob.Root label="Volume" bind:value={volume} />

<p>Current volume: {volume}%</p>

<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Knob from "$lib/components/ui/knob";

	let volume = $state(40);
</script>

<Field.Field>
	<Knob.Root label="Volume" bind:value={volume} />

	<Field.Description class="text-center">Current volume: {volume}%.</Field.Description>
</Field.Field>

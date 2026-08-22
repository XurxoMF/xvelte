<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Slider from "$lib/components/ui/slider";

	let volume = $state(40);
</script>

<Field.Field>
	<Field.Title id="volume-label">Volume</Field.Title>

	<Slider.Root type="single" bind:value={volume} min={0} max={100} step={1} aria-labelledby="volume-label" aria-describedby="volume-description" />

	<Field.Description id="volume-description">Current volume: {volume}%.</Field.Description>
</Field.Field>

<script lang="ts">
	import * as Label from "$lib/components/ui/label";
	import * as Slider from "$lib/components/ui/slider";

	let volume = $state(40);
</script>

<div class="grid w-full max-w-sm gap-2">
	<Label.Root for="volume">Volume: {volume}%</Label.Root>
	<Slider.Root id="volume" type="single" bind:value={volume} min={0} max={100} step={1} aria-label="Volume" />
</div>

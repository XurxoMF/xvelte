<script lang="ts">
	import * as AudioPlayer from "$lib/components/ui/audio-player";
</script>

<AudioPlayer.Root
	src="https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3"
	role="group"
	aria-label="Audio player: Outfoxing"
	class="w-full max-w-xl p-4"
>
	<div class="flex items-center gap-4">
		<AudioPlayer.PlayButton aria-label="Play or pause audio" />

		<div class="grid min-w-0 flex-1 gap-2">
			<AudioPlayer.Slider />
			<AudioPlayer.Time aria-live="off" />
		</div>

		<AudioPlayer.Volume aria-label="Mute or unmute audio" />
	</div>
</AudioPlayer.Root>

<script lang="ts" module>
	import type { RootProps as SliderProps } from "$lib/components/ui/slider";

	export type SeekBarProps = Omit<Extract<SliderProps, { type: "single" }>, "bufferValue" | "disabled" | "onValueChange" | "step" | "type" | "value">;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Slider from "$lib/components/ui/slider";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, ...restProps }: SeekBarProps = $props();

	const isLiveStream = $derived(audioStore.isLive);

	const progress = $derived(() => {
		if (isLiveStream) return 100;
		if (!audioStore.duration) return 0;
		return (audioStore.currentTime / audioStore.duration) * 100;
	});

	const bufferedProgress = $derived(() => {
		if (isLiveStream) return 100;
		if (!audioStore.duration) return 0;
		return (audioStore.bufferedTime / audioStore.duration) * 100;
	});

	function handleValueChange(value: number) {
		if (!isLiveStream && audioStore.duration > 0) {
			audioStore.seek((value / 100) * audioStore.duration);
		}
	}
</script>

<Slider.Root
	type="single"
	class={cn("min-w-20 flex-1", className)}
	disabled={isLiveStream}
	value={progress()}
	bufferValue={bufferedProgress()}
	step={0.1}
	onValueChange={handleValueChange}
	{...restProps}
/>

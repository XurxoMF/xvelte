<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	/** Props for the audio player's mute button and volume slider. */
	export type VolumeProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Slider from "$lib/components/ui/slider";
	import { VolumeIcon, VolumeLowIcon, VolumeMutedIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	import { getAudioPlayerContext } from "./audio-player-context.svelte";

	let { ref = $bindable(null), class: className, onclick, onkeydown, ...restProps }: VolumeProps = $props();
	const ctx = getAudioPlayerContext();
	const effectiveVolume = $derived(ctx.muted ? 0 : ctx.volume);

	/** @param value - Next volume percentage between 0 and 100. */
	function handleVolumeChange(value: number) {
		ctx.setVolume(value / 100);
	}

	/** Adjusts volume by one percentage point from the currently audible level. */
	function adjustVolume(direction: 1 | -1) {
		handleVolumeChange(Math.round(effectiveVolume * 100) + direction);
	}

	/** Toggles mute before forwarding the public click callback. */
	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		ctx.toggleMute();
		onclick?.(event);
	}

	/** Handles volume arrow keys before forwarding the public keyboard callback. */
	function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			adjustVolume(event.key === "ArrowUp" ? 1 : -1);
		}

		onkeydown?.(event);
	}
</script>

<div class="group/volume relative" data-slot="audio-player-volume-control">
	<Button.Root
		bind:ref
		{...restProps}
		variant="ghost"
		size="icon"
		class={cn("size-8 text-muted-foreground hover:text-foreground", className)}
		data-slot="audio-player-volume"
		aria-pressed={ctx.muted}
		onclick={handleClick}
		onkeydown={handleKeydown}
	>
		{#if effectiveVolume === 0}
			<VolumeMutedIcon class="size-4" />
		{:else if effectiveVolume < 0.5}
			<VolumeLowIcon class="size-4" />
		{:else}
			<VolumeIcon class="size-4" />
		{/if}
	</Button.Root>

	<div
		class="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md border bg-popover p-3 text-popover-foreground opacity-0 shadow-md transition-opacity group-focus-within/volume:pointer-events-auto group-focus-within/volume:visible group-focus-within/volume:opacity-100 group-hover/volume:pointer-events-auto group-hover/volume:visible group-hover/volume:opacity-100"
	>
		<Slider.Root
			type="single"
			value={effectiveVolume * 100}
			onValueChange={handleVolumeChange}
			orientation="vertical"
			min={0}
			max={100}
			step={1}
			class="h-24 min-h-0"
		/>
	</div>
</div>

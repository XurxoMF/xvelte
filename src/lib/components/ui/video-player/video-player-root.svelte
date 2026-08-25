<script lang="ts" module>
	/** Props for the self-contained video player. */
	export type RootProps = {
		/** Media URL loaded by the native video element. */
		src: string;
		/** URL for the default WebVTT captions track. */
		captions: string;
		/** Poster image shown before playback begins. */
		poster?: string | undefined;
		/** Classes merged onto the player container. */
		class?: string | undefined;
		/** Whether playback should be requested after mounting. */
		autoplay?: boolean | undefined;
		/** Whether native playback should loop. */
		loop?: boolean | undefined;
		/** Whether playback should start muted. */
		muted?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { onMount, untrack } from "svelte";

	import { ExitFullscreenIcon, FullscreenIcon, LoaderIcon, PauseIcon, PlayIcon, VolumeIcon, VolumeLowIcon, VolumeMutedIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	import * as Slider from "$lib/components/ui/slider";

	let { src, poster, class: className, autoplay = false, loop = false, muted = false, captions }: RootProps = $props();

	let video: HTMLVideoElement;
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(1);
	let isMuted = $state(untrack(() => muted));
	let isFullscreen = $state(false);
	let showControls = $state(false);
	let controlsTimeout: ReturnType<typeof setTimeout>;
	let isLoading = $state(true);
	let lastVolume = $state(1);
	let effectiveVolume = $derived(isMuted ? 0 : volume);

	/** Toggles playback on the native video element. */
	function togglePlay() {
		if (video.paused) {
			video.play();
		} else {
			video.pause();
		}
	}

	/** Synchronizes UI state when native playback starts. */
	function handlePlay() {
		isPlaying = true;
		isLoading = false;
		showControlsTemporarily();
	}

	/** Synchronizes UI state and reveals controls when playback pauses. */
	function handlePause() {
		isPlaying = false;
		showControls = true;
	}

	/** Copies the native playback position into reactive state. */
	function handleTimeUpdate() {
		currentTime = video.currentTime;
	}

	/** Copies the loaded media duration into reactive state. */
	function handleDurationChange() {
		duration = video.duration;
	}

	/** @param value - Next volume percentage between 0 and 100. */
	function handleVolumeChange(value: number) {
		const newVolume = Math.max(0, Math.min(1, value / 100));
		volume = newVolume;
		video.volume = newVolume;
		isMuted = newVolume === 0;
		video.muted = isMuted;
		if (newVolume > 0) lastVolume = newVolume;
	}

	/** Toggles mute while remembering the last audible volume. */
	function toggleMute() {
		if (isMuted || volume === 0) {
			isMuted = false;
			volume = lastVolume > 0 ? lastVolume : 1;
			video.muted = false;
			video.volume = volume;
		} else {
			isMuted = true;
			lastVolume = volume;
			video.muted = true;
		}
	}

	/** Adjusts volume by one percentage point from the currently audible level. */
	function adjustVolume(direction: 1 | -1) {
		handleVolumeChange(Math.round(effectiveVolume * 100) + direction);
	}

	/** Handles volume changes from the arrow keys while the mute button is focused. */
	function handleVolumeKeydown(event: KeyboardEvent) {
		if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

		event.preventDefault();
		adjustVolume(event.key === "ArrowUp" ? 1 : -1);
	}

	/** Enters or exits fullscreen for the video container. */
	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			video.parentElement?.requestFullscreen();
			isFullscreen = true;
		} else {
			document.exitFullscreen();
			isFullscreen = false;
		}
	}

	/** @param seconds - Duration to format as zero-padded minutes and seconds. */
	function formatTime(seconds: number) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	/** Reveals controls and restarts their automatic hide timer. */
	function showControlsTemporarily() {
		showControls = true;
		clearTimeout(controlsTimeout);
		controlsTimeout = setTimeout(() => {
			showControls = false;
		}, 2500);
	}

	/** Keeps controls visible while the pointer is moving over the player. */
	function handleMouseMove() {
		showControlsTemporarily();
	}

	/** Shows the loading indicator while playback is buffering. */
	function handleWaiting() {
		isLoading = true;
	}

	/** Hides the loading indicator once playback can continue. */
	function handleCanPlay() {
		isLoading = false;
	}

	onMount(() => {
		video.volume = volume;
		video.muted = isMuted;

		if (autoplay) {
			video.play().catch(() => {
				isMuted = true;
				video.muted = true;
				video.play();
			});
		}
	});
</script>

<div
	data-slot="video-player"
	class={cn("group relative flex aspect-video w-full min-w-75 items-center justify-center overflow-hidden rounded-xl bg-black shadow-lg", className)}
	onmousemove={handleMouseMove}
	onmouseleave={() => isPlaying && (showControls = false)}
	role="application"
>
	<video
		bind:this={video}
		{src}
		{poster}
		{loop}
		class="h-full w-full object-cover"
		onplay={handlePlay}
		onpause={handlePause}
		ontimeupdate={handleTimeUpdate}
		ondurationchange={handleDurationChange}
		onwaiting={handleWaiting}
		oncanplay={handleCanPlay}
		onclick={togglePlay}
	>
		<track kind="captions" src={captions} default />
	</video>

	{#if isLoading}
		<div class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
			<LoaderIcon class="h-10 w-10 animate-spin text-white/80" />
		</div>
	{/if}

	{#if !isPlaying && !isLoading}
		<button
			type="button"
			onclick={togglePlay}
			class="group/play absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity hover:bg-black/20 focus-visible:rounded-none focus-visible:ring-0"
		>
			<div
				class="flex size-16 items-center justify-center rounded-full bg-white/10 text-white ring-white/50 backdrop-blur-sm transition-[transform,box-shadow] group-hover/play:scale-110 group-focus-visible/play:ring-3"
			>
				<PlayIcon class="ml-1 h-8 w-8 fill-white" />
			</div>
		</button>
	{/if}

	<div
		class={cn(
			"absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-4 pt-12 pb-4 transition-opacity duration-300",
			showControls ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100"
		)}
	>
		<!-- The invisible native range sits above the visual track and thumb. -->
		<div class="group/slider relative mb-4 flex h-4 w-full items-center rounded-sm has-focus-visible:ring-3 has-focus-visible:ring-white/50">
			<input
				type="range"
				min="0"
				max={duration || 0}
				bind:value={currentTime}
				oninput={(e) => {
					const el = e.currentTarget as HTMLInputElement;
					const t = parseFloat(el.value);
					currentTime = t;
					video.currentTime = t;
				}}
				class="absolute z-20 h-full w-full cursor-pointer opacity-0"
			/>

			<div class="absolute h-1 w-full rounded-full bg-white/20 transition-all group-hover/slider:h-1.5"></div>

			<div class="absolute h-1 rounded-full bg-white group-hover/slider:h-1.5" style="width: {(currentTime / duration) * 100}%"></div>

			<div
				class="absolute h-3 w-3 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/slider:opacity-100"
				style="left: {(currentTime / duration) * 100}%; transform: translateX(-50%)"
			></div>
		</div>

		<!-- Playback and volume controls stay grouped opposite fullscreen. -->
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<button
					type="button"
					onclick={togglePlay}
					class="flex size-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:border-white/50 focus-visible:bg-white/10 focus-visible:ring-white/50"
				>
					{#if isPlaying}
						<PauseIcon class="h-5 w-5 fill-white/90" />
					{:else}
						<PlayIcon class="h-5 w-5 fill-white/90" />
					{/if}
				</button>

				<div class="group/volume flex items-center gap-1">
					<button
						type="button"
						onclick={toggleMute}
						onkeydown={handleVolumeKeydown}
						aria-pressed={isMuted}
						class="flex size-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:border-white/50 focus-visible:bg-white/10 focus-visible:ring-white/50"
					>
						{#if effectiveVolume === 0}
							<VolumeMutedIcon class="h-5 w-5" />
						{:else if effectiveVolume < 0.5}
							<VolumeLowIcon class="h-5 w-5" />
						{:else}
							<VolumeIcon class="h-5 w-5" />
						{/if}
					</button>

					<div
						class="flex h-10 w-0 items-center justify-center overflow-hidden px-2 transition-[width] duration-300 group-focus-within/volume:w-24 group-hover/volume:w-24"
					>
						<Slider.Root
							type="single"
							value={effectiveVolume * 100}
							onValueChange={handleVolumeChange}
							min={0}
							max={100}
							step={1}
							class="**:data-[slot=slider-range]:bg-white **:data-[slot=slider-thumb]:border-white **:data-[slot=slider-thumb]:ring-white/50 **:data-[slot=slider-track]:bg-white/20"
						/>
					</div>
				</div>

				<div class="text-xs font-medium text-white/90">
					{formatTime(currentTime)} / {formatTime(duration || 0)}
				</div>
			</div>

			<button
				type="button"
				onclick={toggleFullscreen}
				class="flex size-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:border-white/50 focus-visible:bg-white/10 focus-visible:ring-white/50"
			>
				{#if isFullscreen}
					<ExitFullscreenIcon class="h-5 w-5" />
				{:else}
					<FullscreenIcon class="h-5 w-5" />
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	input[type="range"] {
		appearance: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		height: 0;
		width: 0;
		border: none;
	}

	input[type="range"]::-moz-range-thumb {
		height: 0;
		width: 0;
		border: none;
		background: transparent;
	}
</style>

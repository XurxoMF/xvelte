<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type VolumeProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Slider from "$lib/components/ui/slider";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { VolumeHighIcon, VolumeIcon, VolumeLowIcon, VolumeMutedIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "outline", ...restProps }: VolumeProps = $props();

	let volumePercent = $derived(Math.round(audioStore.volume * 100));

	const CurrentVolumeIcon = $derived.by(() => {
		if (audioStore.isMuted || audioStore.volume === 0) return VolumeMutedIcon;
		if (volumePercent < 33) return VolumeIcon;
		if (volumePercent < 66) return VolumeLowIcon;
		return VolumeHighIcon;
	});

	const tooltipLabel = $derived(audioStore.isMuted ? "Muted" : `Volume ${volumePercent}%`);

	function handleSliderChange(value: number) {
		audioStore.setVolume({ volume: value / 100 });
		if (value === 0 && !audioStore.isMuted) audioStore.toggleMute();
		if (value > 0 && audioStore.isMuted) audioStore.toggleMute();
	}
</script>

<DropdownMenu.Root>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props: tooltipProps })}
				<DropdownMenu.Trigger {...tooltipProps}>
					{#snippet child({ props: dropdownProps })}
						<Button.Root class={cn("hidden md:flex", className)} data-slot="audio-volume-button" {size} {variant} {...restProps} {...dropdownProps}>
							<CurrentVolumeIcon class={cn(audioStore.isMuted && "opacity-40", "text-primary")} />
						</Button.Root>
					{/snippet}
				</DropdownMenu.Trigger>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content sideOffset={4}>{tooltipLabel}</Tooltip.Content>
	</Tooltip.Root>

	<DropdownMenu.Content class="flex w-48 flex-col gap-1.5 p-1.5" data-slot="audio-volume-content">
		<div class="flex items-center justify-between">
			<span class="text-sm">Volume</span>
			<span class="font-mono text-sm tabular-nums">{volumePercent}%</span>
		</div>
		<div class="flex items-center gap-2">
			<button
				type="button"
				aria-label={audioStore.isMuted ? "Unmute" : "Mute"}
				class={cn("size-4 shrink-0 cursor-pointer", audioStore.isMuted ? "opacity-40" : "opacity-60")}
				onclick={() => audioStore.toggleMute()}
			>
				<VolumeMutedIcon class="size-4" />
			</button>

			<Slider.Root type="single" max={100} min={0} bind:value={volumePercent} onValueChange={handleSliderChange} />

			<VolumeHighIcon aria-hidden="true" class="size-4 shrink-0 opacity-60" />
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

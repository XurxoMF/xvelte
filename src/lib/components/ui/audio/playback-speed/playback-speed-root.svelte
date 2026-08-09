<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type SpeedOption = {
		value: number;
		label: string;
	};

	export type RootProps = WithoutChildren<ButtonProps> & {
		speeds?: SpeedOption[];
	};
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { PlaybackSpeedIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	const DEFAULT_SPEEDS = [
		{ value: 0.5, label: "0.5x" },
		{ value: 0.75, label: "0.75x" },
		{ value: 1, label: "1x" },
		{ value: 1.25, label: "1.25x" },
		{ value: 1.5, label: "1.5x" },
		{ value: 2, label: "2x" }
	] as const;

	let { speeds = [...DEFAULT_SPEEDS], class: className, size = "sm", variant = "outline", ...restProps }: RootProps = $props();

	const isLiveStream = $derived(audioStore.isLive);
	const currentSpeed = $derived(
		speeds.find((speed) => speed.value === audioStore.playbackRate) ?? speeds.find((speed) => speed.value === 1) ?? speeds[0]
	);
	const tooltipLabel = $derived(isLiveStream ? "Not available for live streams" : "Playback speed");
	const isIconSize = $derived(size === "icon");

	function handleSelect(value: string) {
		if (isLiveStream) return;
		audioStore.setPlaybackRate(parseFloat(value));
	}
</script>

<DropdownMenu.Root>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props: tooltipProps })}
				<DropdownMenu.Trigger disabled={isLiveStream} {...tooltipProps}>
					{#snippet child({ props: dropdownProps })}
						{#if isLiveStream}
							<span class="inline-block" {...dropdownProps}>
								<Button.Root class={cn(className)} data-slot="audio-playback-speed-button" disabled {size} {variant} {...restProps}>
									{#if !isIconSize}<PlaybackSpeedIcon class="size-4" />{/if}
									<span class="font-mono text-xs">{currentSpeed?.label}</span>
								</Button.Root>
							</span>
						{:else}
							<Button.Root class={cn(className)} data-slot="audio-playback-speed-button" {size} {variant} {...restProps} {...dropdownProps}>
								{#if !isIconSize}<PlaybackSpeedIcon class="size-4" />{/if}
								<span class="font-mono text-xs">{currentSpeed?.label}</span>
							</Button.Root>
						{/if}
					{/snippet}
				</DropdownMenu.Trigger>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content sideOffset={4}>{tooltipLabel}</Tooltip.Content>
	</Tooltip.Root>

	<DropdownMenu.Content align="end" class="w-40" data-slot="audio-playback-speed-content">
		<DropdownMenu.Label class="text-muted-foreground">Playback Speed</DropdownMenu.Label>
		<DropdownMenu.RadioGroup value={String(audioStore.playbackRate)} onValueChange={handleSelect}>
			{#each speeds as speed (speed.value)}
				<DropdownMenu.RadioItem value={String(speed.value)}>
					{speed.label}
				</DropdownMenu.RadioItem>
			{/each}
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>

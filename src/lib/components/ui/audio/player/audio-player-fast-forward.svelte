<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type FastForwardProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { FastForwardIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "ghost", onclick, ...restProps }: FastForwardProps = $props();

	const isLiveStream = $derived(audioStore.isLive);
	const isDisabled = $derived(() => {
		if (!audioStore.currentTrack || isLiveStream) return true;
		return audioStore.duration > 0 && audioStore.currentTime >= audioStore.duration;
	});
	const tooltipLabel = $derived(isLiveStream ? "Not available for live streams" : "Skip forward");

	function handleClick(e: Parameters<NonNullable<FastForwardProps["onclick"]>>[0]) {
		onclick?.(e);
		if (!isLiveStream) {
			audioStore.seek(Math.min(audioStore.currentTime + 10, audioStore.duration));
		}
	}
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				class={cn(className)}
				data-slot="audio-fast-forward-button"
				disabled={isDisabled()}
				{size}
				{variant}
				{...restProps}
				{...props}
				onclick={(e) => {
					(props.onclick as ((event: MouseEvent) => void) | undefined)?.(e);
					handleClick(e);
				}}
			>
				<FastForwardIcon fill="currentColor" />
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={4}>{tooltipLabel}</Tooltip.Content>
</Tooltip.Root>

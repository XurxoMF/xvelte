<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type RewindProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { RewindIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "ghost", onclick, ...restProps }: RewindProps = $props();

	const isLiveStream = $derived(audioStore.isLive);
	const isDisabled = $derived(!audioStore.currentTrack || audioStore.currentTime <= 0 || isLiveStream);
	const tooltipLabel = $derived(isLiveStream ? "Not available for live streams" : "Skip backward");

	function handleClick(e: Parameters<NonNullable<RewindProps["onclick"]>>[0]) {
		onclick?.(e);
		if (!isLiveStream) {
			audioStore.seek(Math.max(audioStore.currentTime - 10, 0));
		}
	}
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				class={cn(className)}
				data-slot="audio-rewind-button"
				disabled={isDisabled}
				{size}
				{variant}
				{...restProps}
				{...props}
				onclick={(e) => {
					(props.onclick as ((event: MouseEvent) => void) | undefined)?.(e);
					handleClick(e);
				}}
			>
				<RewindIcon fill="currentColor" />
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={4}>{tooltipLabel}</Tooltip.Content>
</Tooltip.Root>

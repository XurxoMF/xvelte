<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type PlayProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { onMount } from "svelte";

	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { LoaderIcon, PauseIcon, PlayIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "ghost", onclick, ...restProps }: PlayProps = $props();

	const showSpinner = $derived(audioStore.isLoading || audioStore.isBuffering);
	const isDisabled = $derived(showSpinner || !audioStore.currentTrack);
	const tooltipLabel = $derived(audioStore.isPlaying ? "Pause" : "Play");

	function handleClick(e: Parameters<NonNullable<PlayProps["onclick"]>>[0]) {
		onclick?.(e);
		audioStore.togglePlay();
	}

	onMount(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.code === "Space" && e.target === document.body) {
				e.preventDefault();
				audioStore.togglePlay();
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	});
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				aria-label={tooltipLabel}
				class={cn(className)}
				data-slot="audio-play-button"
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
				{#if showSpinner}
					<LoaderIcon class="animate-spin" />
				{:else if audioStore.isPlaying}
					<PauseIcon fill="currentColor" />
				{:else}
					<PlayIcon fill="currentColor" />
				{/if}
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={4}>{tooltipLabel}</Tooltip.Content>
</Tooltip.Root>

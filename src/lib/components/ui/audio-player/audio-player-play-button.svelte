<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";
	import type { RootProps as ButtonProps } from "$lib/components/ui/button";
	export type PlayButtonProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import { PauseIcon, PlayIcon } from "$lib/icons";
	import { cn } from "$lib/utils";
	import { getAudioPlayerContext } from "./audio-player-context";

	let { class: className, ...restProps }: PlayButtonProps = $props();
	const ctx = getAudioPlayerContext();
</script>

<Button.Root
	variant="secondary"
	size="icon"
	class={cn("size-12 rounded-full shadow-sm", className)}
	data-slot="audio-player-play-button"
	onclick={ctx.togglePlay}
	{...restProps}
>
	{#if ctx.isPlaying.value}
		<PauseIcon class="h-5 w-5 fill-current" />
	{:else}
		<PlayIcon class="ml-0.5 h-5 w-5 fill-current" />
	{/if}
</Button.Root>

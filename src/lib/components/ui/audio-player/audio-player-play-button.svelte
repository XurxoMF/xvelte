<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	export type PlayButtonProps = WithoutChildren<Button.RootProps>;
</script>

<script lang="ts">
	import { getAudioPlayerContext } from "./audio-player-context.svelte";

	import { PauseIcon, PlayIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

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
	{#if ctx.isPlaying}
		<PauseIcon class="h-5 w-5 fill-current" />
	{:else}
		<PlayIcon class="ml-0.5 h-5 w-5 fill-current" />
	{/if}
</Button.Root>

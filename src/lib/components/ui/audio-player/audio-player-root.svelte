<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & { src: string };
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { AudioPlayerState, setAudioPlayerContext } from "./audio-player-context.svelte";

	let { ref = $bindable(null), src, class: className, children, ...restProps }: RootProps = $props();

	const player = setAudioPlayerContext(new AudioPlayerState());
</script>

<div
	bind:this={ref}
	class={cn("relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm", className)}
	data-slot="audio-player"
	{...restProps}
>
	<audio
		bind:this={player.audio}
		{src}
		bind:paused={player.paused}
		bind:currentTime={player.currentTime}
		bind:duration={player.duration}
		bind:volume={player.volume}
		bind:muted={player.muted}
	></audio>

	{@render children?.()}
</div>

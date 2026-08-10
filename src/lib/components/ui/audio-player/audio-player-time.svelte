<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type TimeProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { getAudioPlayerContext } from "./audio-player-context";

	let { ref = $bindable(null), class: className, ...restProps }: TimeProps = $props();
	const ctx = getAudioPlayerContext();

	function formatTime(seconds: number) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}
</script>

<span bind:this={ref} class={cn("text-xs font-medium text-muted-foreground tabular-nums", className)} data-slot="audio-player-time" {...restProps}>
	{formatTime(ctx.currentTime.value)} / {formatTime(ctx.duration.value)}
</span>

<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type TimeDisplayProps = WithElementRef<HTMLAttributes<HTMLTimeElement>> & {
		remaining?: boolean;
	};
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import { formatDuration } from "$lib/components/ui/audio/html-audio";
	import { LiveIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { ref = $bindable(null), remaining = false, class: className, ...restProps }: TimeDisplayProps = $props();

	const isLiveStream = $derived(audioStore.isLive);

	const formattedCurrentTime = $derived(formatDuration(audioStore.currentTime));
	const formattedRemaining = $derived(formatDuration(audioStore.duration - audioStore.currentTime));

	const timeValue = $derived(() => {
		if (isLiveStream && remaining) return "LIVE";
		if (isLiveStream && !remaining) return formattedCurrentTime;
		return remaining ? formattedRemaining : formattedCurrentTime;
	});

	const showLiveIcon = $derived(isLiveStream && remaining);
</script>

<time
	bind:this={ref}
	class={cn(
		"min-w-12 shrink-0 px-1.5 text-left font-mono text-sm tabular-nums",
		remaining && "text-right",
		showLiveIcon && "flex items-center gap-1 text-xs text-red-500",
		className
	)}
	data-live={isLiveStream ? "true" : undefined}
	data-remaining={remaining ? "true" : undefined}
	data-slot="audio-time-display"
	{...restProps}
>
	{#if showLiveIcon}
		<LiveIcon class="size-3 animate-pulse" />
	{/if}
	{timeValue()}
</time>

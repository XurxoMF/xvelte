<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithoutChildren } from "bits-ui";

	import type { Track } from "$lib/components/ui/audio/html-audio";
	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		track?: Track;
		trackId?: string | number;
		index?: number;
		onRemove?: (trackId: string) => void;
		showRemove?: boolean;
		showPlayPause?: boolean;
		showDragHandle?: boolean;
		showCover?: boolean;
	};
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import { formatDuration } from "$lib/components/ui/audio/html-audio";
	import * as SortableList from "$lib/components/ui/sortable-list";
	import { CloseIcon, LiveIcon, PauseIcon, PlayIcon, TrackIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let {
		ref = $bindable(null),
		track: externalTrack,
		trackId,
		index,
		onclick,
		onRemove,
		showRemove = false,
		showPlayPause = true,
		showDragHandle = false,
		showCover = true,
		class: className,
		...restProps
	}: RootProps = $props();

	const resolvedTrack = $derived<Track | undefined>(
		externalTrack ?? (trackId ? audioStore.queue.find((t) => String(t.id) === String(trackId)) : undefined)
	);

	const isCurrent = $derived(audioStore.currentTrack?.id === resolvedTrack?.id);
	const actualIsPlaying = $derived(audioStore.isPlaying && isCurrent);
	const trackDuration = $derived(isCurrent && audioStore.duration > 0 ? audioStore.duration : resolvedTrack?.duration);
	const isLiveTrack = $derived(
		resolvedTrack?.live === true || (trackDuration !== undefined && trackDuration !== null && audioStore.htmlAudio.isLive(trackDuration))
	);

	const coverImage = $derived(resolvedTrack?.artwork ?? resolvedTrack?.images?.[0]);

	function handleRowClick(e: Parameters<NonNullable<RootProps["onclick"]>>[0]) {
		e.stopPropagation();
		e.preventDefault();
		onclick?.(e);
	}

	function handlePlayPause(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		if (!resolvedTrack) return;
		if (isCurrent) {
			audioStore.togglePlay();
		} else {
			const idx = audioStore.queue.findIndex((t) => t.id === resolvedTrack.id);
			if (idx >= 0) audioStore.setQueueAndPlay(audioStore.queue, idx);
		}
	}

	function handleRemove(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		if (resolvedTrack?.id) onRemove?.(String(resolvedTrack.id));
	}

	function getPlayTitle() {
		if (!isCurrent) return "Play this track";
		return actualIsPlaying ? "Pause" : "Play";
	}
</script>

{#if resolvedTrack}
	<div
		bind:this={ref}
		role="button"
		tabindex="0"
		data-slot="audio-track"
		class={cn(
			"flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
			"transition-all hover:bg-secondary/50",
			isCurrent && "bg-secondary/80 ring-1 ring-border backdrop-blur-sm",
			className
		)}
		onclick={handleRowClick}
		onkeydown={(e) => e.key === "Enter" && e.currentTarget.click()}
		{...restProps}
	>
		<div class="flex shrink-0 items-center gap-2">
			{#if showDragHandle}
				<SortableList.DragHandle />
			{/if}

			{#if showCover}
				<div class="size-8 shrink-0 overflow-hidden rounded-sm bg-muted">
					{#if coverImage}
						<img src={coverImage} alt={resolvedTrack.title} class="size-full object-cover" />
					{:else}
						<div class="flex size-full items-center justify-center">
							<TrackIcon class="size-4 text-muted-foreground" />
						</div>
					{/if}
				</div>
			{:else if index !== undefined}
				<span class="w-5 text-center text-xs text-muted-foreground/60">{index + 1}</span>
			{/if}
		</div>

		<div class="min-w-0 flex-1 overflow-hidden">
			<div class="flex items-center gap-1.5">
				<span class="truncate text-sm leading-tight font-medium">
					{resolvedTrack.title ?? "Unknown"}
				</span>
				{#if isLiveTrack}
					<span
						class="inline-flex shrink-0 items-center gap-0.5 rounded-sm bg-destructive/10
                   px-1 py-0.5 text-[10px] leading-none font-medium text-destructive uppercase"
					>
						<LiveIcon class="size-2.5" />
						Live
					</span>
				{/if}
			</div>
			{#if resolvedTrack.artist}
				<p class="truncate text-xs leading-tight text-muted-foreground">
					{resolvedTrack.artist}
				</p>
			{/if}
		</div>

		{#if !isLiveTrack && trackDuration !== undefined}
			<span class="shrink-0 text-xs text-muted-foreground tabular-nums">
				{formatDuration(trackDuration)}
			</span>
		{/if}

		<div class="flex shrink-0 items-center gap-0.5">
			{#if showRemove && !isCurrent && onRemove}
				<button
					type="button"
					title="Remove"
					class="inline-flex h-6 w-6 items-center justify-center rounded-sm
                 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
					onclick={handleRemove}
				>
					<CloseIcon class="size-3.5" />
				</button>
			{/if}

			{#if showPlayPause}
				<button
					type="button"
					title={getPlayTitle()}
					class="inline-flex h-6 w-6 items-center justify-center rounded-sm
                 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
					onclick={handlePlayPause}
				>
					{#if actualIsPlaying}
						<PauseIcon class="size-3.5 fill-current" />
					{:else}
						<PlayIcon class="size-3.5 fill-current" />
					{/if}
				</button>
			{/if}
		</div>
	</div>
{/if}

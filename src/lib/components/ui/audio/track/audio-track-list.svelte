<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithoutChildren } from "bits-ui";

	import type { WithElementRef } from "$lib/utils";

	export type ListVariant = "default" | "grid";
	export type ListProps = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		tracks?: Track[];
		onTrackSelect?: (index: number, track?: Track) => void;
		onTrackRemove?: (trackId: string) => void;
		sortable?: boolean;
		showCover?: boolean;
		variant?: ListVariant;
		emptyLabel?: string;
		emptyDescription?: string;
		filterQuery?: string;
		filterFn?: (track: Track) => boolean;
	};
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import type { Track } from "$lib/components/ui/audio/html-audio";
	import * as SortableList from "$lib/components/ui/sortable-list";
	import { QueueIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	import * as AudioTrack from ".";

	const audioStore = getAudioContext();

	let {
		ref = $bindable(null),
		tracks: externalTracks,
		onTrackSelect,
		onTrackRemove,
		sortable = false,
		showCover = true,
		variant = "default",
		emptyLabel = "No tracks found",
		emptyDescription = "Try adding some tracks",
		filterQuery = "",
		filterFn,
		class: className,
		...restProps
	}: ListProps = $props();

	const isExternalTracks = $derived(externalTracks !== undefined);

	const displayTracks = $derived.by<Track[]>(() => {
		let base: Track[] = externalTracks ?? audioStore.queue;

		if (filterFn) {
			base = base.filter(filterFn);
		} else if (filterQuery.trim()) {
			const q = filterQuery.toLowerCase();
			base = base.filter((t) => t.title?.toLowerCase().includes(q) || t.artist?.toLowerCase().includes(q));
		}
		return base;
	});

	const isFiltered = $derived(filterQuery.trim().length > 0 || !!filterFn);

	const listClass = $derived(variant === "grid" ? "grid grid-cols-1 gap-2 xl:grid-cols-2" : "space-y-0.5");

	let wrappersMap: Record<string, { id: string | number; _track: Track }> = {};
	let sortableItems = $state<{ id: string | number; _track: Track }[]>([]);

	$effect.pre(() => {
		const newItems = displayTracks
			.filter((t: Track) => t.id !== undefined)
			.map((t: Track) => {
				const id = String(t.id);
				if (!wrappersMap[id]) {
					wrappersMap[id] = { id, _track: t };
				} else {
					wrappersMap[id]._track = t;
				}
				return wrappersMap[id];
			});

		const currentIds = new Set(newItems.map((w) => w.id));
		for (const id in wrappersMap) {
			if (!currentIds.has(id)) delete wrappersMap[id];
		}

		const isSame = sortableItems.length === newItems.length && sortableItems.every((item, i) => String(item.id) === String(newItems[i]?.id));

		if (!isSame) {
			sortableItems = newItems;
		}
	});

	function handleTrackClick(track: Track, index: number) {
		if (isExternalTracks) {
			onTrackSelect?.(index, track);
			return;
		}
		const queueIndex = audioStore.queue.findIndex((t) => t.id === track.id);
		if (queueIndex >= 0) {
			if (audioStore.currentTrack?.id === track.id) {
				audioStore.togglePlay();
			} else {
				audioStore.setQueueAndPlay(audioStore.queue, queueIndex);
			}
			onTrackSelect?.(queueIndex, audioStore.queue[queueIndex]);
		} else {
			onTrackSelect?.(index, track);
		}
	}

	function handleReorder(reordered: { id: string | number; _track?: Track }[]) {
		if (isFiltered || isExternalTracks) return;

		const reorderedTracks = reordered.map((r) => displayTracks.find((t) => String(t.id) === String(r.id))).filter((t): t is Track => t !== undefined);

		const newCurrentIndex =
			audioStore.currentTrack?.id !== undefined ? reorderedTracks.findIndex((t) => String(t.id) === String(audioStore.currentTrack!.id)) : -1;

		const finalIndex = newCurrentIndex >= 0 ? newCurrentIndex : Math.max(0, Math.min(audioStore.currentQueueIndex, reorderedTracks.length - 1));

		audioStore.setQueue(reorderedTracks, finalIndex);
	}
</script>

{#if displayTracks.length === 0}
	<div
		bind:this={ref}
		class={cn("mx-auto flex size-full flex-col items-center justify-center gap-3", "rounded-lg border bg-muted/30 p-8 text-center", className)}
		data-slot="audio-track-list"
		{...restProps}
	>
		<div class="flex size-10 items-center justify-center rounded-full bg-muted">
			<QueueIcon class="size-5 text-muted-foreground" />
		</div>
		<div class="space-y-1">
			<p class="text-sm font-medium">{emptyLabel}</p>
			<p class="text-xs/relaxed text-muted-foreground">{emptyDescription}</p>
		</div>
	</div>
{:else if sortable && !isFiltered}
	<div bind:this={ref} class={cn("no-scrollbar w-full overflow-y-auto", className)} data-slot="audio-track-list" {...restProps}>
		<!--
			No bind:items here — SortableList owns its internal DnD state.
			Writing back through a binding would trigger $effect.pre mid-drag,
			which strips svelte-dnd-action's shadow items and causes the
			"Cannot read properties of undefined (reading 'parentElement')" crash.
			Results flow out exclusively through onDrop → handleReorder.
		-->
		<SortableList.Root items={sortableItems} onDrop={handleReorder} class={variant === "grid" ? "grid grid-cols-1 gap-2 xl:grid-cols-2" : "gap-0.5"}>
			{#snippet item(row)}
				{@const track = (row as { _track: Track })._track}
				{@const idx = displayTracks.findIndex((t: Track) => t.id === track.id)}
				<AudioTrack.Root
					{track}
					index={idx >= 0 ? idx : undefined}
					{showCover}
					showDragHandle={true}
					showRemove={!!onTrackRemove}
					onRemove={onTrackRemove}
					onclick={() => handleTrackClick(track, idx >= 0 ? idx : 0)}
				/>
			{/snippet}
		</SortableList.Root>
	</div>
{:else}
	<div bind:this={ref} class={cn("no-scrollbar w-full overflow-y-auto", className)} data-slot="audio-track-list" {...restProps}>
		<div class={cn("w-full", listClass)}>
			{#each displayTracks as track, idx (track.id)}
				<AudioTrack.Root
					{track}
					index={idx}
					{showCover}
					showDragHandle={false}
					showRemove={!!onTrackRemove}
					onRemove={onTrackRemove}
					onclick={() => handleTrackClick(track, idx)}
				/>
			{/each}
		</div>
	</div>
{/if}

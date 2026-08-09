<script lang="ts" module>
	export type RootProps = {
		onTrackSelect?: (index: number) => void;
		searchPlaceholder?: string;
		emptyLabel?: string;
		emptyDescription?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import type { Track } from "$lib/components/ui/audio/html-audio";
	import * as AudioTrack from "$lib/components/ui/audio/track";
	import * as Button from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { DeleteIcon, QueueIcon, SearchIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let {
		onTrackSelect,
		searchPlaceholder = "Search for a track...",
		emptyLabel = "No tracks found",
		emptyDescription = "Try searching for a different track",
		class: className
	}: RootProps = $props();

	let dialogOpen = $state(false);
	let searchQuery = $state("");

	const isFiltered = $derived(searchQuery.trim().length > 0);

	function handleOpenChange(open: boolean) {
		dialogOpen = open;
		if (!open) searchQuery = "";
	}

	function handleTrackSelect(index: number) {
		const filteredTracks = filterTracks(audioStore.queue, searchQuery);
		const selected = filteredTracks[index];
		if (!selected) return;

		const queueIndex = audioStore.queue.findIndex((t) => t.id === selected.id);
		if (queueIndex < 0) return;

		if (audioStore.currentTrack?.id === selected.id) {
			audioStore.togglePlay();
		} else if (audioStore.queue.length > 0) {
			audioStore.setQueueAndPlay(audioStore.queue, queueIndex);
		}

		onTrackSelect?.(queueIndex);
		dialogOpen = false;
		searchQuery = "";
	}

	function handleTrackRemove(trackId: string) {
		audioStore.removeFromQueue(trackId);
	}

	function handleClear() {
		audioStore.clearQueue();
		dialogOpen = false;
	}

	function filterTracks(tracks: Track[], query: string): Track[] {
		if (!query.trim()) return tracks;
		const q = query.toLowerCase();
		return tracks.filter((t) => t.title?.toLowerCase().includes(q) || t.artist?.toLowerCase().includes(q));
	}
</script>

<Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
	<Tooltip.Root>
		<Tooltip.Trigger onclick={() => (dialogOpen = true)}>
			{#snippet child({ props })}
				<Button.Root {...props} size="icon" variant="outline" aria-label="Open queue" class={cn(className)} data-slot="audio-queue-trigger">
					<QueueIcon class="size-4" />
				</Button.Root>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content sideOffset={4}>Queue</Tooltip.Content>
	</Tooltip.Root>

	<Dialog.Content
		class="rounded-xl border-none bg-background bg-clip-padding p-0 shadow-2xl ring-4 ring-border/80 sm:max-w-md"
		data-slot="audio-queue"
	>
		<Dialog.Header class="sr-only">
			<Dialog.Title>Audio Queue</Dialog.Title>
			<Dialog.Description>Select a track from the queue to play</Dialog.Description>
		</Dialog.Header>

		<div class="relative border-b border-border px-2 py-2">
			<SearchIcon class="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
			<input
				type="text"
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				class="h-9 w-full rounded-md border border-input bg-input/50 py-0 pr-3 pl-9 text-sm placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-ring focus:outline-none"
			/>
		</div>

		<div class="max-h-[60vh] min-h-50 overflow-hidden px-2 py-2 pb-12">
			<AudioTrack.List
				filterQuery={searchQuery}
				sortable={!isFiltered}
				{emptyLabel}
				{emptyDescription}
				onTrackSelect={handleTrackSelect}
				onTrackRemove={handleTrackRemove}
				class="h-full"
			/>
		</div>

		<div class="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 rounded-b-xl border-t border-border bg-muted p-1">
			<Button.Root class="w-full" size="sm" variant="destructive" title="Clear queue" onclick={handleClear}>
				<DeleteIcon class="size-4" />
				Clear
			</Button.Root>
		</div>
	</Dialog.Content>
</Dialog.Root>

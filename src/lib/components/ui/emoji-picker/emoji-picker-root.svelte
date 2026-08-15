<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	import type { Emoji, EmojiSkinTone } from "./emoji-data";

	/** Props for the self-contained Emoji Picker component. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		/** Bindable native emoji selected most recently. */
		value?: string | undefined;
		/** Bindable base tone or Fitzpatrick skin-tone index. */
		skinTone?: EmojiSkinTone | undefined;
		/** Bindable base emoji characters ordered from newest to oldest. */
		recents?: string[] | undefined;
		/** Number of emoji columns in the grid. */
		columns?: number | undefined;
		/** Maximum number of recent emoji to keep. */
		maxRecents?: number | undefined;
		/** Whether to render the search input. */
		showSearch?: boolean | undefined;
		/** Whether to render category navigation. */
		showCategories?: boolean | undefined;
		/** Whether to render the skin-tone selector. */
		showSkinTones?: boolean | undefined;
		/** Whether selections are recorded and shown in a recent section. */
		showRecents?: boolean | undefined;
		/** Whether to render the hovered or keyboard-active emoji preview. */
		showPreview?: boolean | undefined;
		/** Local-storage namespace, or `null` to disable persistence. */
		persistKey?: string | null | undefined;
		/** Search input placeholder. */
		searchPlaceholder?: string | undefined;
		/** Called after a person selects an emoji. */
		onSelect?: ((emoji: string, data: Emoji) => void) | undefined;
	};
</script>

<script lang="ts">
	import { tick } from "svelte";

	import {
		CloseIcon,
		EmojiActivityIcon,
		EmojiFlagsIcon,
		EmojiFoodIcon,
		EmojiNatureIcon,
		EmojiObjectsIcon,
		EmojiPeopleIcon,
		EmojiRecentIcon,
		EmojiSmileysIcon,
		EmojiSymbolsIcon,
		EmojiTravelIcon,
		SearchIcon
	} from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

	import { applySkinTone, emojiCategories, SKIN_TONES, type EmojiCategoryId } from "./emoji-data";

	type PickerSection = {
		id: EmojiCategoryId;
		label: string;
		emojis: Emoji[];
	};

	let {
		ref = $bindable(null),
		value = $bindable(""),
		skinTone = $bindable(0),
		recents = $bindable([]),
		columns = 9,
		maxRecents = 18,
		showSearch = true,
		showCategories = true,
		showSkinTones = true,
		showRecents = true,
		showPreview = true,
		persistKey = "xvelte:emoji-picker",
		searchPlaceholder = m.gentle_mole_scan(),
		class: className,
		onSelect,
		...restProps
	}: RootProps = $props();

	const categoryIcons: Record<EmojiCategoryId, typeof EmojiSmileysIcon> = {
		recent: EmojiRecentIcon,
		smileys: EmojiSmileysIcon,
		people: EmojiPeopleIcon,
		nature: EmojiNatureIcon,
		food: EmojiFoodIcon,
		activity: EmojiActivityIcon,
		travel: EmojiTravelIcon,
		objects: EmojiObjectsIcon,
		symbols: EmojiSymbolsIcon,
		flags: EmojiFlagsIcon
	};
	const componentId = $props.id();

	// Base characters are persisted so the active skin tone can be applied when they are selected again.
	const emojiByCharacter = new Map<string, Emoji>(emojiCategories.flatMap((category) => category.emojis.map((emoji) => [emoji.e, emoji] as const)));

	let query = $state("");
	let hovered = $state<Emoji | null>(null);
	let activeIndex = $state(-1);
	let activeCategory = $state<EmojiCategoryId>("smileys");
	let tonesOpen = $state(false);
	let hydrated = $state(false);
	let scrollRef = $state<HTMLDivElement | null>(null);
	let sectionRefs: Partial<Record<EmojiCategoryId, HTMLElement>> = {};

	const normalizedColumns = $derived(Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 9);
	const normalizedMaxRecents = $derived(Number.isFinite(maxRecents) ? Math.max(0, Math.floor(maxRecents)) : 18);
	const recentEmojis = $derived(
		recents
			.slice(0, normalizedMaxRecents)
			.map((character) => emojiByCharacter.get(character))
			.filter((emoji): emoji is Emoji => Boolean(emoji))
	);

	const sections = $derived.by<PickerSection[]>(() => {
		const needle = query.trim().toLowerCase();

		if (needle) {
			const matches = emojiCategories.flatMap((category) =>
				category.emojis.filter((emoji) => emoji.n.includes(needle) || emoji.k?.includes(needle) || emoji.e === needle)
			);
			return [{ id: "smileys", label: m.plum_otter_results(), emojis: matches }];
		}

		const visibleSections = emojiCategories.map((category) => ({
			id: category.id,
			label: getCategoryLabel(category.id),
			emojis: category.emojis
		}));

		if (showRecents && recentEmojis.length > 0) {
			visibleSections.unshift({
				id: "recent",
				label: m.jolly_fern_recent(),
				emojis: recentEmojis
			});
		}

		return visibleSections;
	});

	const flatEmojis = $derived(sections.flatMap((section) => section.emojis));

	// Recents reuse category records, so keyboard positions must come from section offsets rather than object identity.
	const sectionOffsets = $derived.by(() => {
		let running = 0;

		return sections.map((section) => {
			const offset = running;
			running += section.emojis.length;
			return offset;
		});
	});

	const categoryTabs = $derived([
		...(showRecents && recentEmojis.length > 0 ? (["recent"] as EmojiCategoryId[]) : []),
		...emojiCategories.map((category) => category.id)
	]);

	/** Returns the localized label for a category identifier. */
	function getCategoryLabel(id: EmojiCategoryId): string {
		switch (id) {
			case "recent":
				return m.jolly_fern_recent();
			case "smileys":
				return m.opal_finch_smileys();
			case "people":
				return m.green_vole_people();
			case "nature":
				return m.honey_fir_nature();
			case "food":
				return m.icy_marten_foods();
			case "activity":
				return m.juniper_bear_activity();
			case "travel":
				return m.khaki_whale_places();
			case "objects":
				return m.lilac_eagle_objects();
			case "symbols":
				return m.marine_rabbit_symbols();
			case "flags":
				return m.noble_peach_flags();
		}
	}

	/** Returns the localized label for a skin-tone identifier. */
	function getSkinToneLabel(tone: EmojiSkinTone): string {
		switch (tone) {
			case 0:
				return m.sunny_badger_default();
			case 1:
				return m.tidy_heron_light();
			case 2:
				return m.umber_koala_medium_light();
			case 3:
				return m.violet_panda_medium();
			case 4:
				return m.willow_raven_medium_dark();
			case 5:
				return m.xenon_wren_dark();
		}
	}

	/** Reads one value from this picker's local-storage namespace. */
	function storageGet(key: string): string | null {
		if (persistKey === null || typeof window === "undefined") return null;

		try {
			return window.localStorage.getItem(`${persistKey}:${key}`);
		} catch {
			return null;
		}
	}

	/** Writes one value to this picker's local-storage namespace when storage is available. */
	function storageSet(key: string, storedValue: string): void {
		if (persistKey === null || typeof window === "undefined") return;

		try {
			window.localStorage.setItem(`${persistKey}:${key}`, storedValue);
		} catch {
			// Persistence is optional, so in-memory bindings continue to work when storage is blocked.
		}
	}

	$effect(() => {
		if (hydrated) return;
		hydrated = true;

		const storedRecents = storageGet("recents");
		if (storedRecents) {
			try {
				const parsed: unknown = JSON.parse(storedRecents);
				if (Array.isArray(parsed))
					recents = parsed.filter((character): character is string => typeof character === "string" && emojiByCharacter.has(character));
			} catch {
				// Malformed app storage is ignored and replaced after the next selection.
			}
		}

		const storedTone = storageGet("skin-tone");
		if (storedTone !== null) {
			const parsedTone = Number(storedTone);
			if (SKIN_TONES.some((tone) => tone.id === parsedTone)) skinTone = parsedTone as EmojiSkinTone;
		}
	});

	/** Moves an emoji to the front of the bounded recent list. */
	function pushRecent(emoji: Emoji): void {
		const next = [emoji.e, ...recents.filter((character) => character !== emoji.e)].slice(0, normalizedMaxRecents);
		recents = next;
		storageSet("recents", JSON.stringify(next));
	}

	/** Commits one emoji with the active tone and notifies the caller. */
	function pick(emoji: Emoji | undefined): void {
		if (!emoji) return;

		const character = applySkinTone(emoji, skinTone);
		value = character;
		if (showRecents) pushRecent(emoji);
		onSelect?.(character, emoji);
	}

	/** Applies and persists a skin tone, then closes the selector. */
	function setTone(tone: EmojiSkinTone): void {
		skinTone = tone;
		tonesOpen = false;
		storageSet("skin-tone", String(tone));
	}

	/** Scrolls the requested category into view. */
	function scrollToCategory(id: EmojiCategoryId): void {
		activeCategory = id;
		sectionRefs[id]?.scrollIntoView({ block: "start", behavior: "smooth" });
	}

	/** Tracks the last category heading that has crossed the scroll container's top edge. */
	function handleScroll(): void {
		if (!scrollRef || query) return;

		const top = scrollRef.scrollTop;
		for (const section of sections) {
			const element = sectionRefs[section.id];
			if (element && element.offsetTop - 8 <= top) activeCategory = section.id;
		}
	}

	/** Moves DOM focus and the visual cursor to a rendered emoji button. */
	async function focusCell(index: number): Promise<void> {
		activeIndex = Math.max(0, Math.min(index, flatEmojis.length - 1));
		hovered = flatEmojis[activeIndex] ?? null;
		await tick();

		const cell = scrollRef?.querySelector<HTMLButtonElement>(`[data-emoji-index="${activeIndex}"]`);
		cell?.focus({ preventScroll: true });
		cell?.scrollIntoView({ block: "nearest" });
	}

	/** Handles keyboard movement and selection while focus is in the emoji results. */
	function handleGridKeydown(event: KeyboardEvent): void {
		if (flatEmojis.length === 0) return;

		switch (event.key) {
			case "ArrowRight":
				event.preventDefault();
				focusCell(activeIndex + 1);
				break;
			case "ArrowLeft":
				event.preventDefault();
				focusCell(activeIndex < 0 ? 0 : activeIndex - 1);
				break;
			case "ArrowDown":
				event.preventDefault();
				focusCell(activeIndex < 0 ? 0 : activeIndex + normalizedColumns);
				break;
			case "ArrowUp":
				event.preventDefault();
				focusCell(activeIndex < 0 ? 0 : Math.max(0, activeIndex - normalizedColumns));
				break;
			case "Enter":
				if (event.target === scrollRef) {
					event.preventDefault();
					pick(flatEmojis[Math.max(activeIndex, 0)]);
				}
				break;
			case "Escape":
				if (query) {
					event.preventDefault();
					query = "";
					activeIndex = -1;
				}
				break;
		}
	}

	/** Moves from the search field into results or clears the current query. */
	function handleSearchKeydown(event: KeyboardEvent): void {
		if (event.key === "ArrowDown" && flatEmojis.length > 0) {
			event.preventDefault();
			focusCell(0);
		} else if (event.key === "Escape" && query) {
			event.preventDefault();
			query = "";
		}
	}

	$effect(() => {
		void query;
		activeIndex = -1;
	});
</script>

<div
	bind:this={ref}
	{...restProps}
	data-slot="emoji-picker"
	class={cn("flex w-88 max-w-full flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md", className)}
	style:--emoji-columns={normalizedColumns}
>
	{#if showSearch || showSkinTones}
		<div data-slot="emoji-picker-toolbar" class="flex items-center gap-2 border-b p-2">
			{#if showSearch}
				<div data-slot="emoji-picker-search" class="relative flex-1">
					<SearchIcon aria-hidden="true" class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						bind:value={query}
						onkeydown={handleSearchKeydown}
						placeholder={searchPlaceholder}
						aria-label={m.gentle_mole_scan()}
						class="h-9 w-full rounded-md border border-input bg-background pr-8 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
					/>
					{#if query}
						<button
							type="button"
							onclick={() => (query = "")}
							aria-label={m.quartz_lynx_clear()}
							class="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<CloseIcon aria-hidden="true" class="size-4" />
						</button>
					{/if}
				</div>
			{/if}

			{#if showSkinTones}
				<div data-slot="emoji-picker-skin-tones" class="relative">
					<button
						type="button"
						onclick={() => (tonesOpen = !tonesOpen)}
						aria-label={m.river_marten_tone()}
						aria-expanded={tonesOpen}
						aria-haspopup="listbox"
						class="flex size-9 items-center justify-center rounded-md border text-lg transition-colors hover:bg-accent"
					>
						{SKIN_TONES[skinTone]?.swatch ?? SKIN_TONES[0].swatch}
					</button>

					{#if tonesOpen}
						<div
							role="listbox"
							aria-label={m.river_marten_tone()}
							class="absolute top-full right-0 z-10 mt-1 flex gap-0.5 rounded-md border bg-popover p-1 shadow-md"
						>
							{#each SKIN_TONES as tone (tone.id)}
								{@const toneLabel = getSkinToneLabel(tone.id)}
								<button
									type="button"
									role="option"
									onclick={() => setTone(tone.id)}
									title={toneLabel}
									aria-label={toneLabel}
									aria-selected={skinTone === tone.id}
									class={cn(
										"flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent",
										skinTone === tone.id && "bg-accent"
									)}
								>
									{tone.swatch}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	{#if showCategories && !query}
		<nav data-slot="emoji-picker-categories" aria-label={m.young_maple_emoji()} class="flex items-center gap-0.5 border-b px-1.5 py-1">
			{#each categoryTabs as id (id)}
				{@const Icon = categoryIcons[id]}
				<button
					type="button"
					onclick={() => scrollToCategory(id)}
					aria-label={getCategoryLabel(id)}
					aria-pressed={activeCategory === id}
					class={cn(
						"flex flex-1 items-center justify-center rounded-md py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
						activeCategory === id && "bg-accent text-foreground"
					)}
				>
					<Icon aria-hidden="true" class="size-4" />
				</button>
			{/each}
		</nav>
	{/if}

	<div
		bind:this={scrollRef}
		data-slot="emoji-picker-list"
		onscroll={handleScroll}
		onkeydown={handleGridKeydown}
		role="grid"
		tabindex="0"
		aria-label={m.young_maple_emoji()}
		class="relative h-70 overflow-y-auto overscroll-contain px-1.5 pb-1.5 outline-none"
	>
		{#each sections as section, sectionIndex (section.id + sectionIndex)}
			<section bind:this={sectionRefs[section.id]} aria-labelledby={`${componentId}-${section.id}-heading`}>
				<div
					id={`${componentId}-${section.id}-heading`}
					data-slot="emoji-picker-category-heading"
					class="sticky top-0 z-10 -mx-1.5 bg-popover px-2.5 pt-2 pb-1 text-xs font-medium text-muted-foreground"
				>
					{section.label}
				</div>
				<div data-slot="emoji-picker-grid" class="grid gap-0.5" style="grid-template-columns: repeat(var(--emoji-columns), minmax(0, 1fr))">
					{#each section.emojis as emoji, emojiIndex (section.id + emoji.e)}
						{@const index = sectionOffsets[sectionIndex] + emojiIndex}
						{@const character = applySkinTone(emoji, skinTone)}
						<button
							type="button"
							data-slot="emoji-picker-item"
							data-emoji-index={index}
							data-active={activeIndex === index ? "" : undefined}
							tabindex={activeIndex === index ? 0 : -1}
							onclick={() => pick(emoji)}
							onfocus={() => {
								hovered = emoji;
								activeIndex = index;
							}}
							onmouseenter={() => {
								hovered = emoji;
								activeIndex = index;
							}}
							onmouseleave={() => (hovered = null)}
							title={emoji.n}
							aria-label={emoji.n}
							aria-pressed={value === character}
							class={cn(
								"flex aspect-square items-center justify-center rounded-md text-xl leading-none transition-colors hover:bg-accent",
								activeIndex === index && "bg-accent"
							)}
						>
							{character}
						</button>
					{/each}
				</div>
			</section>
		{/each}

		{#if flatEmojis.length === 0}
			<div data-slot="emoji-picker-empty" role="status" class="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
				<span aria-hidden="true" class="text-2xl">🔍</span>
				<span class="text-sm">{m.ivory_crane_empty()}</span>
			</div>
		{/if}
	</div>

	{#if showPreview}
		<div data-slot="emoji-picker-preview" class="flex h-11 items-center gap-2 border-t px-3">
			{#if hovered}
				<span aria-hidden="true" class="text-xl leading-none">{applySkinTone(hovered, skinTone)}</span>
				<span class="truncate text-xs text-muted-foreground">{hovered.n}</span>
			{:else}
				<span class="text-xs text-muted-foreground">{m.zesty_cedar_pick()}</span>
			{/if}
		</div>
	{/if}
</div>

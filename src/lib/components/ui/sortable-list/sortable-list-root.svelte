<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithoutChildren } from "bits-ui";

	import type { WithElementRef } from "$lib/utils";

	export type SortableItem = {
		id: string | number;
	};

	export type SortableRenderState = {
		index: number;
		dragging: boolean;
	};

	export type RootProps<Item extends SortableItem = SortableItem> = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		items: Item[];
		item: Snippet<[Item, SortableRenderState]>;
		disabled?: boolean | undefined;
		onDragStart?: ((item: Item, index: number) => void) | undefined;
		onConsider?: ((items: Item[]) => void) | undefined;
		onDrop?: ((items: Item[]) => void) | undefined;
		flipDuration?: number | undefined;
	};
</script>

<script lang="ts" generics="Item extends SortableItem">
	import { tick } from "svelte";
	import { SvelteSet } from "svelte/reactivity";

	import { SHADOW_ITEM_MARKER_PROPERTY_NAME, SOURCES, TRIGGERS, dragHandleZone, type DndEvent } from "svelte-dnd-action";

	let {
		ref = $bindable(null),
		class: className,
		items,
		item,
		disabled = false,
		onDragStart,
		onConsider,
		onDrop,
		flipDuration = 150,
		...restProps
	}: RootProps<Item> = $props();

	let isDragging = $state(false);
	let dndItems = $state<Item[]>([]);
	let draggedItem = $state<Item>();

	$effect(() => {
		if (isDragging) return;
		const needsSync = dndItems.length !== items.length || dndItems.some((item, i) => item.id !== items[i]?.id);
		if (needsSync) {
			dndItems = [...items];
		}
	});

	/** @param value - DnD item to test for the library's temporary shadow marker. */
	function isShadowItem(value: Item) {
		return SHADOW_ITEM_MARKER_PROPERTY_NAME in value && value[SHADOW_ITEM_MARKER_PROPERTY_NAME] === true;
	}

	/**
	 * Replaces the temporary shadow with the dragged item and removes duplicate identifiers.
	 *
	 * @param values - Current item array emitted by the DnD action.
	 */
	function cleanItems(values: Item[]) {
		const clean: Item[] = [];
		const ids = new SvelteSet<string | number>();

		for (const value of values) {
			const candidate = isShadowItem(value) ? draggedItem : value;
			if (!candidate || ids.has(candidate.id)) continue;
			ids.add(candidate.id);
			clean.push(candidate);
		}

		return clean;
	}

	/** @param event - Drag-start event used to identify and publish the source item. */
	function startDrag(event: CustomEvent<DndEvent<Item>>) {
		const clean = cleanItems(dndItems);
		const index = clean.findIndex((entry) => entry.id === event.detail.info.id);
		draggedItem = clean[index];
		if (draggedItem) onDragStart?.(draggedItem, index);
	}

	/** @param finalItems - Clean ordered items to commit after the DOM settles. */
	async function finishDrag(finalItems: Item[]) {
		dndItems = finalItems;
		onDrop?.(finalItems);
		await tick();
		isDragging = false;
		draggedItem = undefined;
	}

	/** @param event - Provisional DnD ordering event, including drag start and stop. */
	function handleConsider(event: CustomEvent<DndEvent<Item>>) {
		if (event.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
			void finishDrag(cleanItems(event.detail.items));
			return;
		}

		if (event.detail.info.trigger === TRIGGERS.DRAG_STARTED) startDrag(event);
		isDragging = true;
		dndItems = event.detail.items;
		onConsider?.(cleanItems(event.detail.items));
	}

	/** @param event - Final pointer or keyboard ordering event. */
	function handleFinalize(event: CustomEvent<DndEvent<Item>>) {
		const clean = cleanItems(event.detail.items);
		dndItems = event.detail.items;

		if (event.detail.info.source === SOURCES.KEYBOARD) {
			onConsider?.(clean);
			return;
		}

		void finishDrag(clean);
	}
</script>

<div
	bind:this={ref}
	use:dragHandleZone={{ items: dndItems, flipDurationMs: flipDuration, dragDisabled: disabled, dropTargetStyle: {} }}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
	class={className}
	data-slot="sortable-list"
	{...restProps}
>
	<!-- Render the action-owned order so provisional drag positions appear immediately. -->
	{#each dndItems as entry, index (entry.id)}
		{@render item(entry, { index, dragging: isShadowItem(entry) || entry.id === draggedItem?.id })}
	{/each}
</div>

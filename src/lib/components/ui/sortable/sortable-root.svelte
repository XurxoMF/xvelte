<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	import type { SortableItemState, SortableOrder } from "./sortable-types";

	/** Props for the declarative sortable drag-handle zone. */
	export type RootProps = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		/** Bindable authoritative identifier order; initialize it with persisted IDs before rendering. */
		order?: SortableOrder | undefined;
		/** Prevents pointer and keyboard reordering. */
		disabled?: boolean | undefined;
		/** Runs when a pointer or keyboard drag starts. */
		onDragStart?: ((state: SortableItemState, states: SortableItemState[]) => void) | undefined;
		/** Reports provisional ordering throughout a pointer or keyboard drag. */
		onDragging?: ((state: SortableItemState, states: SortableItemState[]) => void) | undefined;
		/** Reports committed ordering when the drag ends. */
		onDragEnd?: ((state: SortableItemState, states: SortableItemState[]) => void) | undefined;
		/** Position-transition coordination duration in milliseconds. */
		flipDuration?: number | undefined;
		/** Declarative Sortable Items. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";

	import { SOURCES, TRIGGERS, dragHandleZone, type DndEvent } from "svelte-dnd-action";

	import { setSortableContext } from "./sortable-context.svelte";

	let {
		ref = $bindable(null),
		class: className,
		order = $bindable([]),
		disabled = false,
		onDragStart,
		onDragging,
		onDragEnd,
		flipDuration = 150,
		children,
		...restProps
	}: RootProps = $props();

	const attachmentKey = createAttachmentKey();
	const sortable = setSortableContext({
		get order() {
			return order;
		},
		set order(value) {
			order = value;
		},
		get disabled() {
			return disabled;
		},
		get onDragStart() {
			return onDragStart;
		},
		get onDragging() {
			return onDragging;
		},
		get onDragEnd() {
			return onDragEnd;
		}
	});

	$effect(() => sortable.syncOrder(order));

	/** @param event - Provisional DnD ordering event, including drag start and keyboard stop. */
	function handleConsider(event: CustomEvent<DndEvent<{ id: string | number }>>) {
		if (event.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
			sortable.finish(event.detail.items);
			return;
		}

		if (event.detail.info.trigger === TRIGGERS.DRAG_STARTED) sortable.start(event.detail.info.id, event.detail.info.source);
		sortable.move(event.detail.items);
	}

	/** @param event - Final pointer ordering or provisional keyboard movement event. */
	function handleFinalize(event: CustomEvent<DndEvent<{ id: string | number }>>) {
		if (event.detail.info.source === SOURCES.KEYBOARD) {
			sortable.move(event.detail.items);
			return;
		}

		sortable.finish(event.detail.items);
	}

	/**
	 * Exposes the action-owned Root element.
	 *
	 * @param node - Rendered drag-handle zone.
	 */
	function sortableRoot(node: HTMLDivElement) {
		ref = node;
		sortable.mount();
		return () => {
			sortable.destroy();
			if (ref === node) ref = null;
		};
	}

	const rootProps = $derived({
		...restProps,
		class: className,
		"data-slot": "sortable",
		"data-dragging": sortable.dragging ? "true" : undefined,
		"data-disabled": disabled ? "true" : undefined,
		[attachmentKey]: sortableRoot
	});
</script>

<div
	{...rootProps}
	use:dragHandleZone={{ items: sortable.dndItems, flipDurationMs: flipDuration, dragDisabled: disabled, dropTargetStyle: {} }}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
>
	{@render children?.()}
</div>

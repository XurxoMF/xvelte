<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { SortableItemState } from "./sortable-types";
	import type { WithElementRef } from "$lib/utils";

	/** Props for one declaratively registered sortable item. */
	export type ItemProps = Omit<WithElementRef<HTMLAttributes<HTMLDivElement>>, "children" | "id"> & {
		/** Stable persistence identifier; a hydration-stable local ID is generated when omitted. */
		id?: string | number | undefined;
		/** Runs when this Item starts being dragged. */
		onDragStart?: ((state: SortableItemState) => void) | undefined;
		/** Runs when this Item moves to a provisional position. */
		onDragging?: ((state: SortableItemState) => void) | undefined;
		/** Runs when this Item is dropped. */
		onDragEnd?: ((state: SortableItemState) => void) | undefined;
		/** Delegates the visible item element while preserving all supplied props. */
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		/** Item content, including its required descendant DragHandle. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";
	import { createAttachmentKey } from "svelte/attachments";

	import { setSortableItemContext } from "./sortable-context.svelte";

	const generatedId = $props.id();
	let {
		ref = $bindable(null),
		class: className,
		id = generatedId,
		onDragStart,
		onDragging,
		onDragEnd,
		child,
		children,
		...restProps
	}: ItemProps = $props();

	const item = setSortableItemContext({
		get id() {
			return id;
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
	const attachmentKey = createAttachmentKey();

	$effect(() => {
		void id;
		item.sync();
	});

	onDestroy(() => item.destroy());

	/**
	 * Exposes the visible Item element through its bindable ref.
	 *
	 * @param node - Default or delegated Item element.
	 */
	function sortableItem(node: HTMLElement) {
		ref = node;
		const unregister = item.registerElement(node);
		return () => {
			unregister();
			if (ref === node) ref = null;
		};
	}

	const itemProps = $derived({
		...restProps,
		class: className,
		"aria-disabled": item.sortable.options.disabled || undefined,
		"data-slot": "sortable-item",
		"data-dragging": item.dragging ? "true" : undefined,
		"data-disabled": item.sortable.options.disabled ? "true" : undefined,
		[attachmentKey]: sortableItem
	});
</script>

{#key item.renderVersion}
	{#if child}
		{@render child({ props: itemProps })}
	{:else}
		<div {...itemProps}>
			{@render children?.()}
		</div>
	{/if}
{/key}

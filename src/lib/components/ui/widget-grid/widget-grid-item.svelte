<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	import type { WidgetGridItemState } from "./widget-grid-types";

	/** Props for one declaratively registered WidgetGrid item. */
	export type ItemProps = Omit<WithElementRef<HTMLAttributes<HTMLDivElement>>, "children" | "id"> &
		Omit<WidgetGridItemState, "id"> & {
			/** Stable persistence identifier; a hydration-stable local ID is generated when omitted. */
			id?: string | number | undefined;
			/** Runs when direct movement starts. */
			onMoveStart?: ((state: WidgetGridItemState) => void) | undefined;
			/** Runs during direct movement. */
			onMoving?: ((state: WidgetGridItemState) => void) | undefined;
			/** Runs when direct movement ends. */
			onMoveEnd?: ((state: WidgetGridItemState) => void) | undefined;
			/** Runs when direct resizing starts. */
			onResizeStart?: ((state: WidgetGridItemState) => void) | undefined;
			/** Runs during direct resizing. */
			onResizing?: ((state: WidgetGridItemState) => void) | undefined;
			/** Runs when direct resizing ends. */
			onResizeEnd?: ((state: WidgetGridItemState) => void) | undefined;
			/** Item content, including any explicit interaction handles. */
			children?: Snippet | undefined;
			/** Replaces the default Card-like surface while preserving structural props. */
			child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { createAttachmentKey } from "svelte/attachments";

	import { cn } from "$lib/utils";
	import * as Card from "$lib/components/ui/card";

	import { setWidgetGridItemContext } from "./widget-grid-context.svelte";

	const generatedId = $props.id();
	let {
		ref = $bindable(null),
		class: className,
		id = generatedId,
		x,
		y,
		width = 1,
		height = 1,
		minWidth,
		maxWidth,
		minHeight,
		maxHeight,
		draggable,
		resizable,
		static: isStatic,
		onMoveStart,
		onMoving,
		onMoveEnd,
		onResizeStart,
		onResizing,
		onResizeEnd,
		children,
		child,
		...restProps
	}: ItemProps = $props();

	const state = $derived<WidgetGridItemState>({
		id,
		x,
		y,
		width,
		height,
		minWidth,
		maxWidth,
		minHeight,
		maxHeight,
		draggable,
		resizable,
		static: isStatic
	});
	const item = setWidgetGridItemContext({
		get state() {
			return state;
		},
		get onMoveStart() {
			return onMoveStart;
		},
		get onMoving() {
			return onMoving;
		},
		get onMoveEnd() {
			return onMoveEnd;
		},
		get onResizeStart() {
			return onResizeStart;
		},
		get onResizing() {
			return onResizing;
		},
		get onResizeEnd() {
			return onResizeEnd;
		}
	});
	const gridAttachmentKey = createAttachmentKey();
	const contentAttachmentKey = createAttachmentKey();

	onMount(() => item.mount());

	$effect(() => item.sync(state));

	/**
	 * Registers the hidden engine wrapper as a direct Root child.
	 *
	 * @param node - Grid-positioned wrapper element.
	 */
	function widgetGridItem(node: HTMLElement) {
		return item.registerElement(node);
	}

	/**
	 * Exposes the default or delegated public item element.
	 *
	 * @param node - Visible item surface element.
	 */
	function widgetGridItemContent(node: HTMLElement) {
		ref = node;
		const unregister = item.registerContent(node);
		return () => {
			unregister();
			if (ref === node) ref = null;
		};
	}

	const structuralClass = $derived(cn("relative size-full", className));
	const itemProps = $derived({
		...restProps,
		class: structuralClass,
		"aria-disabled": item.grid.options.disabled || undefined,
		"data-slot": "widget-grid-item",
		"data-moving": item.moving ? "true" : undefined,
		"data-resizing": item.resizing ? "true" : undefined,
		"data-disabled": item.grid.options.disabled ? "true" : undefined,
		"data-static": isStatic ? "true" : undefined,
		[contentAttachmentKey]: widgetGridItemContent
	});
</script>

<div class="grid-stack-item" {...{ [gridAttachmentKey]: widgetGridItem }}>
	<div class="grid-stack-item-content">
		{#if child}
			{@render child({ props: itemProps })}
		{:else}
			<Card.Root {...itemProps}>
				{@render children?.()}
			</Card.Root>
		{/if}
	</div>
</div>

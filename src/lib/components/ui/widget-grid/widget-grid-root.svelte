<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	import type { WidgetGridBreakpoint, WidgetGridItemState, WidgetGridMode } from "./widget-grid-types";

	/** Props for the responsive WidgetGrid layout root. */
	export type RootProps = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		/** Fixed columns or container-width responsive column counts. */
		columns?: number | Partial<Record<WidgetGridBreakpoint, number>> | undefined;
		/** Uniform horizontal and vertical gap in pixels. */
		gap?: number | undefined;
		/** Compacted dashboard or position-preserving layout behavior. */
		mode?: WidgetGridMode | undefined;
		/** Disables all direct move and resize interaction. */
		disabled?: boolean | undefined;
		/** Global draggable default overridden by each Item. */
		draggable?: boolean | undefined;
		/** Global resizable default overridden by each Item. */
		resizable?: boolean | undefined;
		/** Runs when direct movement starts. */
		onMoveStart?: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
		/** Runs during direct movement. */
		onMoving?: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
		/** Runs when direct movement ends and is suitable for persistence. */
		onMoveEnd?: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
		/** Runs when direct resizing starts. */
		onResizeStart?: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
		/** Runs during direct resizing. */
		onResizing?: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
		/** Runs when direct resizing ends and is suitable for persistence. */
		onResizeEnd?: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
		/** Declarative WidgetGrid Items. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";

	import "gridstack/dist/gridstack.css";

	import { cn } from "$lib/utils";

	import { setWidgetGridContext } from "./widget-grid-context.svelte";

	let {
		ref = $bindable(null),
		class: className,
		columns = 12,
		gap = 16,
		mode = "stack",
		disabled = false,
		draggable = true,
		resizable = true,
		onMoveStart,
		onMoving,
		onMoveEnd,
		onResizeStart,
		onResizing,
		onResizeEnd,
		children,
		...restProps
	}: RootProps = $props();

	const attachmentKey = createAttachmentKey();
	const grid = setWidgetGridContext({
		get columns() {
			return columns;
		},
		get gap() {
			return gap;
		},
		get mode() {
			return mode;
		},
		get disabled() {
			return disabled;
		},
		get draggable() {
			return draggable;
		},
		get resizable() {
			return resizable;
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

	$effect(() => {
		void columns;
		void gap;
		void mode;
		void disabled;
		void draggable;
		void resizable;
		grid.sync();
	});

	/**
	 * Initializes and exposes the Root DOM element through a Svelte attachment.
	 *
	 * @param node - Rendered grid element.
	 */
	function widgetGrid(node: HTMLDivElement) {
		ref = node;
		grid.mount(node);

		return () => {
			grid.destroy();
			if (ref === node) ref = null;
		};
	}

	const rootProps = $derived({
		...restProps,
		class: cn("grid-stack", className),
		"data-slot": "widget-grid",
		"data-moving": grid.moving ? "true" : undefined,
		"data-resizing": grid.resizing ? "true" : undefined,
		"data-disabled": disabled ? "true" : undefined,
		[attachmentKey]: widgetGrid
	});
</script>

<div {...rootProps}>
	{@render children?.()}
</div>

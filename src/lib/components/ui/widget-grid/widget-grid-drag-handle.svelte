<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	/** Props for the explicit element that initiates WidgetGrid movement. */
	export type DragHandleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
		/** Bindable rendered handle element. */
		ref?: HTMLElement | null | undefined;
		/** Replaces the default ghost Button while preserving behavior and accessibility props. */
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		/** Optional visible handle content; the default is a grip icon. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";

	import { getWidgetGridItemContext } from "./widget-grid-context.svelte";

	import { DragHandleIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";

	let {
		ref = $bindable(null),
		class: className,
		child,
		children,
		"aria-label": ariaLabel = m.blue_heron_move(),
		...restProps
	}: DragHandleProps = $props();
	const item = getWidgetGridItemContext();
	const attachmentKey = createAttachmentKey();
	const disabled = $derived(item.grid.options.disabled || item.state.static === true || !(item.state.draggable ?? item.grid.options.draggable));
	const keyboardActive = $derived(item.keyboardInteraction === "move");

	/**
	 * Registers and exposes the rendered explicit drag handle.
	 *
	 * @param node - Handle element discovered by the internal adapter.
	 */
	function widgetGridDragHandle(node: HTMLElement) {
		ref = node;
		const unregister = item.registerDragHandle(node);

		/** @param event - Keyboard command used to start, step, finish, or cancel movement. */
		function handleKeydown(event: KeyboardEvent) {
			const isToggle = event.key === "Enter" || event.key === " ";
			const horizontal = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
			const vertical = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
			if (disabled || (!isToggle && !keyboardActive)) return;

			if (isToggle) {
				event.preventDefault();
				event.stopPropagation();
				if (!event.repeat) item.toggleKeyboardInteraction("move");
				return;
			}
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				item.finishKeyboardInteraction(true);
				return;
			}
			if (horizontal === 0 && vertical === 0) return;
			event.preventDefault();
			event.stopPropagation();
			item.stepKeyboardInteraction("move", horizontal, vertical);
		}

		/** Commits keyboard movement when focus or pointer interaction leaves the keyboard workflow. */
		function finishKeyboardMovement() {
			if (keyboardActive) item.finishKeyboardInteraction(false);
		}

		node.addEventListener("keydown", handleKeydown);
		node.addEventListener("blur", finishKeyboardMovement);
		node.addEventListener("mousedown", finishKeyboardMovement, true);
		node.addEventListener("touchstart", finishKeyboardMovement, true);
		return () => {
			finishKeyboardMovement();
			node.removeEventListener("keydown", handleKeydown);
			node.removeEventListener("blur", finishKeyboardMovement);
			node.removeEventListener("mousedown", finishKeyboardMovement, true);
			node.removeEventListener("touchstart", finishKeyboardMovement, true);
			unregister();
			if (ref === node) ref = null;
		};
	}

	$effect(() => {
		if (disabled && keyboardActive) item.finishKeyboardInteraction(false);
	});

	const handleProps = $derived({
		...restProps,
		class: cn("cursor-move touch-none", item.moving && "cursor-grabbing", className),
		role: "button",
		tabindex: disabled ? -1 : 0,
		"aria-label": ariaLabel,
		"aria-disabled": disabled,
		"aria-pressed": keyboardActive,
		"aria-keyshortcuts": "Enter Space ArrowUp ArrowDown ArrowLeft ArrowRight Escape",
		"data-slot": "widget-grid-drag-handle",
		"data-disabled": disabled ? "true" : undefined,
		"data-keyboard-active": keyboardActive ? "true" : undefined,
		[attachmentKey]: widgetGridDragHandle
	});
</script>

{#if child}
	{@render child({ props: handleProps })}
{:else}
	<Button.Root {...handleProps} type="button" variant="ghost" size="icon-sm" {disabled}>
		{#if children}
			{@render children()}
		{:else}
			<DragHandleIcon />
		{/if}
	</Button.Root>
{/if}

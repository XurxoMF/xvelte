<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	/** Props for the element that initiates pointer and keyboard dragging. */
	export type DragHandleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
		/** Bindable rendered handle element. */
		ref?: HTMLElement | null | undefined;
		/** Delegates rendering while applying every supplied prop to the replacement element. */
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		/** Visible handle content. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";
	import { dragHandle } from "svelte-dnd-action";

	import { getSortableItemContext } from "./sortable-context.svelte";

	import { DragHandleIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";

	let {
		ref = $bindable(null),
		class: className,
		child,
		children,
		"aria-label": ariaLabel = m.merry_finch_drag(),
		...restProps
	}: DragHandleProps = $props();

	const item = getSortableItemContext();
	const attachmentKey = createAttachmentKey();
	const disabled = $derived(item.sortable.options.disabled);

	/**
	 * Connects an explicit handle element to the DnD action.
	 *
	 * @param node - Handle element to register and expose through `ref`.
	 */
	function sortableDragHandle(node: HTMLElement) {
		ref = node;
		const action = dragHandle(node);

		/**
		 * Re-dispatches a pointer start from the direct Item because the dependency ignores events targeted at native controls.
		 *
		 * @param event - Mouse input received by the explicit handle.
		 */
		function forwardMouseDrag(event: MouseEvent) {
			if (disabled || !item.element) return;
			event.stopPropagation();
			item.element.dispatchEvent(
				new MouseEvent("mousedown", {
					bubbles: true,
					cancelable: true,
					button: event.button,
					buttons: event.buttons,
					clientX: event.clientX,
					clientY: event.clientY,
					screenX: event.screenX,
					screenY: event.screenY
				})
			);
		}

		/**
		 * Re-dispatches a touch start from the direct Item for the same native-control adaptation.
		 *
		 * @param event - Touch input received by the explicit handle.
		 */
		function forwardTouchDrag(event: TouchEvent) {
			if (disabled || !item.element) return;
			event.stopPropagation();
			item.element.dispatchEvent(
				new TouchEvent("touchstart", {
					bubbles: true,
					cancelable: true,
					touches: Array.from(event.touches),
					targetTouches: Array.from(event.targetTouches),
					changedTouches: Array.from(event.changedTouches)
				})
			);
		}

		/**
		 * The dependency ignores bubbled keyboard events whose target is a native button. Re-dispatch supported keys from the direct Item instead.
		 *
		 * @param event - Keyboard input received by the explicit handle.
		 */
		function forwardKeyboardDrag(event: KeyboardEvent) {
			const isTrigger = event.key === "Enter" || event.key === " ";
			const isMovement = event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowLeft";
			if (disabled || (!isTrigger && !(item.dragging && isMovement)) || !item.element) return;

			event.preventDefault();
			event.stopPropagation();
			item.element.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: event.key,
					code: event.code,
					bubbles: true,
					cancelable: true,
					repeat: event.repeat
				})
			);
		}

		node.addEventListener("mousedown", forwardMouseDrag);
		node.addEventListener("touchstart", forwardTouchDrag);
		node.addEventListener("keydown", forwardKeyboardDrag);

		return () => {
			node.removeEventListener("mousedown", forwardMouseDrag);
			node.removeEventListener("touchstart", forwardTouchDrag);
			node.removeEventListener("keydown", forwardKeyboardDrag);
			action.destroy();
			if (ref === node) ref = null;
		};
	}

	const handleProps = $derived({
		...restProps,
		class: cn("cursor-grab touch-none active:cursor-grabbing", className),
		role: "button",
		tabindex: disabled ? -1 : 0,
		"aria-label": ariaLabel,
		"aria-disabled": disabled,
		"data-slot": "sortable-drag-handle",
		"data-disabled": disabled ? "true" : undefined,
		[attachmentKey]: sortableDragHandle
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

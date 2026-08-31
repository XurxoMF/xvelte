<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	/** Props for the single bottom-right WidgetGrid resize handle. */
	export type ResizeHandleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
		/** Bindable rendered handle element. */
		ref?: HTMLElement | null | undefined;
		/** Replaces the default lightweight handle while preserving positioning and behavior. */
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		/** Optional visible handle content; the default is a resize icon. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";

	import { getWidgetGridItemContext } from "./widget-grid-context.svelte";

	import { ResizeHandleIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";

	let { ref = $bindable(null), class: className, child, children, "aria-label": ariaLabel, ...restProps }: ResizeHandleProps = $props();
	const item = getWidgetGridItemContext();
	const attachmentKey = createAttachmentKey();
	const disabled = $derived(item.grid.options.disabled || item.state.static === true || !(item.state.resizable ?? item.grid.options.resizable));
	const keyboardActive = $derived(item.keyboardInteraction === "resize");

	/**
	 * Registers and exposes the single native bottom-right resize handle.
	 *
	 * @param node - Rendered handle element connected to pointer resizing.
	 */
	function widgetGridResizeHandle(node: HTMLElement) {
		ref = node;
		const unregister = item.registerResizeHandle(node);

		/** @param event - Keyboard command used to start, step, finish, or cancel resizing. */
		function handleKeydown(event: KeyboardEvent) {
			const isToggle = event.key === "Enter" || event.key === " ";
			const horizontal = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
			const vertical = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
			if (disabled || (!isToggle && !keyboardActive)) return;

			if (isToggle) {
				event.preventDefault();
				event.stopPropagation();
				if (!event.repeat) item.toggleKeyboardInteraction("resize");
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
			item.stepKeyboardInteraction("resize", horizontal, vertical);
		}

		/** Commits keyboard resizing when focus or pointer interaction leaves the keyboard workflow. */
		function finishKeyboardResize() {
			if (keyboardActive) item.finishKeyboardInteraction(false);
		}

		node.addEventListener("keydown", handleKeydown);
		node.addEventListener("blur", finishKeyboardResize);
		node.addEventListener("mousedown", finishKeyboardResize, true);
		node.addEventListener("touchstart", finishKeyboardResize, true);
		return () => {
			finishKeyboardResize();
			node.removeEventListener("keydown", handleKeydown);
			node.removeEventListener("blur", finishKeyboardResize);
			node.removeEventListener("mousedown", finishKeyboardResize, true);
			node.removeEventListener("touchstart", finishKeyboardResize, true);
			unregister();
			if (ref === node) ref = null;
		};
	}

	$effect(() => {
		if (disabled && keyboardActive) item.finishKeyboardInteraction(false);
	});

	const structuralClass = $derived(
		cn(
			"absolute right-1 bottom-1 z-20 flex size-7 touch-none cursor-se-resize items-center justify-center select-none after:absolute after:-inset-2",
			className
		)
	);

	const handleProps = $derived({
		...restProps,
		class: structuralClass,
		role: "button",
		tabindex: disabled ? -1 : 0,
		"aria-label": ariaLabel ?? m.green_otter_resize_bottom_right(),
		"aria-disabled": disabled,
		"aria-pressed": keyboardActive,
		"aria-keyshortcuts": "Enter Space ArrowUp ArrowDown ArrowLeft ArrowRight Escape",
		"data-slot": "widget-grid-resize-handle",
		"data-disabled": disabled ? "true" : undefined,
		"data-keyboard-active": keyboardActive ? "true" : undefined,
		[attachmentKey]: widgetGridResizeHandle
	});
</script>

{#if child}
	{@render child({ props: handleProps })}
{:else}
	<Button.Root {...handleProps} type="button" variant="ghost" size="icon-sm" {disabled}>
		{#if children}
			{@render children()}
		{:else}
			<ResizeHandleIcon />
		{/if}
	</Button.Root>
{/if}

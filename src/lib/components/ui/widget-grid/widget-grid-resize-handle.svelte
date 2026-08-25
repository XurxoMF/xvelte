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

	/**
	 * Registers and exposes the single native bottom-right resize handle.
	 *
	 * @param node - Rendered handle element connected to pointer resizing.
	 */
	function widgetGridResizeHandle(node: HTMLElement) {
		ref = node;
		const unregister = item.registerResizeHandle(node);
		return () => {
			unregister();
			if (ref === node) ref = null;
		};
	}

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
		"data-slot": "widget-grid-resize-handle",
		"data-disabled": disabled ? "true" : undefined,
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

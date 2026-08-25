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

	/**
	 * Registers and exposes the rendered explicit drag handle.
	 *
	 * @param node - Handle element discovered by the internal adapter.
	 */
	function widgetGridDragHandle(node: HTMLElement) {
		ref = node;
		const unregister = item.registerDragHandle(node);
		return () => {
			unregister();
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
		"data-slot": "widget-grid-drag-handle",
		"data-disabled": disabled ? "true" : undefined,
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

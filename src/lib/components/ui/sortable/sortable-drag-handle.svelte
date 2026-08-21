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

	import * as m from "$lib/paraglide/messages.js";

	let {
		ref = $bindable(null),
		class: className,
		child,
		children,
		"aria-label": ariaLabel = m.merry_finch_drag(),
		...restProps
	}: DragHandleProps = $props();

	const attachmentKey = createAttachmentKey();

	/**
	 * Connects an explicit handle element to the DnD action.
	 *
	 * @param node - Handle element to register and expose through `ref`.
	 */
	function sortableDragHandle(node: HTMLElement) {
		ref = node;
		const action = dragHandle(node);

		return () => {
			action.destroy();
			if (ref === node) ref = null;
		};
	}

	const mergedProps = $derived({
		...restProps,
		class: className,
		"aria-label": ariaLabel,
		"data-slot": "sortable-drag-handle",
		[attachmentKey]: sortableDragHandle
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}

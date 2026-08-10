<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type DragHandleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
		ref?: HTMLElement | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";
	import { dragHandle } from "svelte-dnd-action";

	let {
		ref = $bindable(null),
		class: className,
		child,
		children,
		"aria-label": ariaLabel = "Drag to reorder",
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
		"data-slot": "sortable-list-drag-handle",
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

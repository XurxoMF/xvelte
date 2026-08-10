<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type ItemProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
		ref?: HTMLElement | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";
	import { dragHandle } from "svelte-dnd-action";

	let { ref = $bindable(null), class: className, child, children, "aria-label": ariaLabel = "Drag to reorder", ...restProps }: ItemProps = $props();

	const attachmentKey = createAttachmentKey();

	/**
	 * Makes the whole item draggable only while no dedicated drag handle exists.
	 *
	 * @param node - Item element to observe and connect to the DnD action.
	 */
	function sortableItem(node: HTMLElement) {
		ref = node;
		let action: ReturnType<typeof dragHandle> | undefined;
		let destroyed = false;

		/** Reconnects the item-level action when a handle is added or removed. */
		const sync = () => {
			if (destroyed) return;
			const hasDedicatedHandle = node.querySelector('[data-slot="sortable-list-drag-handle"]') !== null;
			if (hasDedicatedHandle) {
				action?.destroy();
				action = undefined;
			} else if (!action) action = dragHandle(node);
		};

		queueMicrotask(sync);
		const observer = new MutationObserver(sync);
		observer.observe(node, { attributes: true, attributeFilter: ["data-slot"], childList: true, subtree: true });

		return () => {
			destroyed = true;
			observer.disconnect();
			action?.destroy();
			if (ref === node) ref = null;
		};
	}

	const mergedProps = $derived({
		...restProps,
		class: className,
		"aria-label": ariaLabel,
		"data-slot": "sortable-list-item",
		[attachmentKey]: sortableItem
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}

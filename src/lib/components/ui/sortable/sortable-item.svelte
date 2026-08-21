<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	/** Props for a sortable item container that does not itself initiate dragging. */
	export type ItemProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
		/** Bindable rendered item element. */
		ref?: HTMLElement | null | undefined;
		/** Delegates rendering while applying every supplied prop to the replacement element. */
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		/** Item content, including its required descendant DragHandle. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";

	let { ref = $bindable(null), class: className, child, children, ...restProps }: ItemProps = $props();
	const attachmentKey = createAttachmentKey();

	/**
	 * Exposes the rendered item without registering it as a drag handle.
	 *
	 * @param node - Item element assigned to the public ref.
	 */
	function sortableItem(node: HTMLElement) {
		ref = node;

		return () => {
			if (ref === node) ref = null;
		};
	}

	const mergedProps = $derived({
		...restProps,
		class: className,
		"data-slot": "sortable-item",
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

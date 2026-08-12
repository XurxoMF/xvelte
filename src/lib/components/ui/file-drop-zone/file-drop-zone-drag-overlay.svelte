<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { PortalProps, WithChildren } from "bits-ui";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	/** Props for the page-level file drag overlay. */
	export type DragOverlayProps = WithChildren<{
		/** Bindable reference to the rendered overlay element. */
		ref?: HTMLDivElement | null | undefined;
		/** Prevents the overlay from appearing or accepting dropped files. */
		disabled?: boolean | undefined;
		/** Props forwarded to the portal; disable it to render inside the parent container. */
		portalProps?: WithoutChildrenOrChild<PortalProps> | undefined;
	}> &
		Omit<HTMLAttributes<HTMLDivElement>, "children">;
</script>

<script lang="ts">
	import { Portal } from "bits-ui";

	import { UploadIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	import { FileDropZoneDragOverlayState, getFileDropZoneContext } from "./file-drop-zone-context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		disabled = false,
		portalProps,
		children,
		ondragover,
		ondrop,
		...restProps
	}: DragOverlayProps = $props();

	const dragOverlay = new FileDropZoneDragOverlayState(
		{
			get disabled() {
				return disabled;
			}
		},
		getFileDropZoneContext()
	);
</script>

<svelte:window
	ondragenter={dragOverlay.ondragenter}
	ondragleave={dragOverlay.ondragleave}
	ondragover={dragOverlay.ondragover}
	ondragend={dragOverlay.reset}
	ondrop={dragOverlay.reset}
/>

{#if dragOverlay.show}
	<Portal {...portalProps}>
		<div
			bind:this={ref}
			data-slot="file-drop-zone-drag-overlay"
			class={cn(
				"fixed inset-0 z-50 flex animate-in place-items-center justify-center bg-background/80 p-6 text-foreground duration-100 fade-in-0 supports-backdrop-filter:backdrop-blur-xs",
				className
			)}
			ondragover={(event) => {
				dragOverlay.ondragover(event);
				ondragover?.(event);
			}}
			ondrop={(event) => {
				dragOverlay.ondrop(event);
				ondrop?.(event);
			}}
			{...restProps}
		>
			{#if children}
				{@render children()}
			{:else}
				<div class="flex flex-col place-items-center justify-center gap-3">
					<UploadIcon class="size-8" />
					<span class="text-lg font-medium">Drop files here to upload</span>
				</div>
			{/if}
		</div>
	</Portal>
{/if}

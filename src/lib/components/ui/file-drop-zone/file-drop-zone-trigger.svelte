<script lang="ts" module>
	import type { HTMLLabelAttributes } from "svelte/elements";

	import type { WithChildren } from "bits-ui";

	export type TriggerProps = WithChildren<{ ref?: HTMLLabelElement | null | undefined }> & Omit<HTMLLabelAttributes, "for">;
</script>

<script lang="ts">
	import { UploadIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

	import { getFileDropZoneContext } from "./file-drop-zone-context.svelte.js";
	import { displaySize } from "./file-drop-zone-utils";

	let { ref = $bindable(null), class: className, children, ondragover, ondrop, ...restProps }: TriggerProps = $props();

	const fileDropZone = getFileDropZoneContext();
</script>

<label
	bind:this={ref}
	data-slot="file-drop-zone-trigger"
	for={fileDropZone.options.id}
	aria-disabled={!fileDropZone.canUploadFiles}
	ondragover={(event) => {
		event.preventDefault();
		ondragover?.(event);
	}}
	ondrop={(event) => {
		fileDropZone.ondrop(event);
		ondrop?.(event);
	}}
	class={cn("group/file-drop-zone-trigger", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<div
			class="flex h-48 flex-col place-items-center justify-center gap-2 rounded-lg border border-dashed p-6 transition-all group-aria-disabled/file-drop-zone-trigger:opacity-50 hover:cursor-pointer hover:bg-accent/25 group-aria-disabled/file-drop-zone-trigger:hover:cursor-not-allowed"
		>
			<div class="flex size-14 place-items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
				<UploadIcon class="size-7" />
			</div>
			<div class="flex flex-col gap-0.5 text-center">
				<span class="font-medium text-muted-foreground">{m.gold_gecko_choose()}</span>
				{#if fileDropZone.options.maxFiles || fileDropZone.options.maxFileSize}
					<span class="text-sm text-muted-foreground/75">
						{#if fileDropZone.options.maxFiles}
							<span>
								{m.happy_birch_count({ count: fileDropZone.options.maxFiles })}
							</span>
						{/if}
						{#if fileDropZone.options.maxFiles && fileDropZone.options.maxFileSize}
							<span>
								{m.indigo_mouse_limit({ size: displaySize(fileDropZone.options.maxFileSize) })}
							</span>
						{/if}
						{#if fileDropZone.options.maxFileSize && !fileDropZone.options.maxFiles}
							<span>
								{m.jade_tiger_maximum({ size: displaySize(fileDropZone.options.maxFileSize) })}
							</span>
						{/if}
					</span>
				{/if}
			</div>
		</div>
	{/if}
</label>

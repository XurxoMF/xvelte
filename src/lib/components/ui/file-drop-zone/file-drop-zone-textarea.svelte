<script lang="ts" module>
	import type { HTMLTextareaAttributes } from "svelte/elements";

	import type { WithChild } from "bits-ui";

	export type TextareaProps = WithChild & HTMLTextareaAttributes;
</script>

<script lang="ts">
	import { getFileDropZoneContext } from "./file-drop-zone-context.svelte.js";

	let { onpaste, ondragover, ondrop, child, ...restProps }: TextareaProps = $props();

	const fileDropZone = getFileDropZoneContext();

	const textareaProps = $derived({
		...restProps,
		"data-slot": "file-drop-zone-textarea",
		ondragover: (event: Parameters<NonNullable<TextareaProps["ondragover"]>>[0]) => {
			event.preventDefault();
			ondragover?.(event);
		},
		ondrop: (event: Parameters<NonNullable<TextareaProps["ondrop"]>>[0]) => {
			fileDropZone.ondrop(event);
			ondrop?.(event);
		},
		onpaste: (event: Parameters<NonNullable<TextareaProps["onpaste"]>>[0]) => {
			const files = Array.from(event.clipboardData?.items ?? [])
				.map((item) => item.getAsFile())
				.filter((file) => file !== null);

			if (files.length > 0) fileDropZone.upload(files);
			onpaste?.(event);
		}
	});
</script>

{#if child}
	{@render child({ props: textareaProps })}
{:else}
	<textarea {...textareaProps}></textarea>
{/if}

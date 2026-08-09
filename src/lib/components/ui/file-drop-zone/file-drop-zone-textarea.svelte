<script lang="ts" module>
	import type { HTMLTextareaAttributes } from "svelte/elements";

	import type { WithChild } from "bits-ui";

	export type TextareaProps = WithChild & HTMLTextareaAttributes;
</script>

<script lang="ts">
	import { box, mergeProps } from "svelte-toolbelt";

	import { useFileDropZoneTextarea } from "./file-drop-zone.svelte.js";

	let { onpaste, ondragover, ondrop, child, ...rest }: TextareaProps = $props();

	const fileDropZoneTextareaState = useFileDropZoneTextarea({
		onpaste: box.with(() => onpaste),
		ondragover: box.with(() => ondragover),
		ondrop: box.with(() => ondrop)
	});

	const mergedProps = $derived(mergeProps(fileDropZoneTextareaState.props, rest));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<textarea data-slot="file-drop-zone-textarea" {...mergedProps}></textarea>
{/if}

<script lang="ts" module>
	import type { FileDropZoneRootProps } from "./types";

	export type RootProps = FileDropZoneRootProps;
</script>

<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { useFileDropZone } from "./file-drop-zone.svelte.js";

	const uid = $props.id();
	let {
		id = uid,
		maxFiles,
		maxFileSize,
		fileCount,
		disabled = false,
		onUpload,
		onFileRejected,
		accept,
		children,
		ref = $bindable(null),
		...rest
	}: RootProps = $props();

	const rootState = useFileDropZone({
		id: box.with(() => id),
		disabled: box.with(() => disabled ?? false),
		onUpload: box.with(() => onUpload),
		maxFiles: box.with(() => maxFiles),
		fileCount: box.with(() => fileCount),
		maxFileSize: box.with(() => maxFileSize),
		onFileRejected: box.with(() => onFileRejected),
		accept: box.with(() => accept)
	});
</script>

<input bind:this={ref} data-slot="file-drop-zone" class="hidden" {...rootState.props} {...rest} />

{@render children?.()}

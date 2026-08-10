<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	import type { WithChildren } from "bits-ui";

	import type { FileRejectedReason } from "./file-drop-zone-context.svelte.js";

	type RootPropsWithoutHTML = WithChildren<{
		ref?: HTMLInputElement | null | undefined;
		id?: string | undefined;
		onUpload: (files: File[]) => Promise<void>;
		maxFiles?: number | undefined;
		fileCount?: number | undefined;
		maxFileSize?: number | undefined;
		onFileRejected?: ((opts: { reason: FileRejectedReason; file: File }) => void) | undefined;
		accept?: string | undefined;
	}>;

	export type RootProps = RootPropsWithoutHTML & Omit<HTMLInputAttributes, "multiple" | "files" | "id" | "class">;
</script>

<script lang="ts">
	import { setFileDropZoneContext } from "./file-drop-zone-context.svelte.js";

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
		...restProps
	}: RootProps = $props();

	const fileDropZone = setFileDropZoneContext({
		get id() {
			return id;
		},
		get disabled() {
			return disabled ?? false;
		},
		get onUpload() {
			return onUpload;
		},
		get maxFiles() {
			return maxFiles;
		},
		get fileCount() {
			return fileCount;
		},
		get maxFileSize() {
			return maxFileSize;
		},
		get onFileRejected() {
			return onFileRejected;
		},
		get accept() {
			return accept;
		}
	});
</script>

<input bind:this={ref} data-slot="file-drop-zone" class="hidden" {...fileDropZone.props} {...restProps} />

{@render children?.()}

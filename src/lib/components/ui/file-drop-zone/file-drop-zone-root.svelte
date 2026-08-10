<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	import type { WithChildren } from "bits-ui";

	import type { FileRejectedReason } from "./file-drop-zone.svelte.js";

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
		...restProps
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

<input bind:this={ref} data-slot="file-drop-zone" class="hidden" {...rootState.props} {...restProps} />

{@render children?.()}

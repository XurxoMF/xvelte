<script lang="ts">
	import * as FileDropZone from "$lib/components/ui/file-drop-zone";

	let files = $state<File[]>([]);
	let inputRef = $state<HTMLInputElement | null>(null);
	let error = $state("");

	async function receiveFiles(nextFiles: File[]) {
		error = "";
		files = [...files, ...nextFiles];
	}

	function openPickerFromKeyboard(event: KeyboardEvent) {
		if (event.key !== "Enter" && event.key !== " ") return;

		event.preventDefault();
		inputRef?.click();
	}
</script>

<FileDropZone.Root
	bind:ref={inputRef}
	onUpload={receiveFiles}
	maxFiles={5}
	fileCount={files.length}
	maxFileSize={10 * FileDropZone.MEGABYTE}
	accept={[FileDropZone.ACCEPT_IMAGE, "application/pdf"].join(",")}
	onFileRejected={({ file, reason }) => (error = file.name + ": " + reason)}
>
	<FileDropZone.Trigger role="button" tabindex={0} onkeydown={openPickerFromKeyboard} />
</FileDropZone.Root>

{#if error}
	<p role="alert">{error}</p>
{/if}

<ul>
	{#each files as file (file.name + file.lastModified)}
		<li>{file.name} — {FileDropZone.displaySize(file.size)}</li>
	{/each}
</ul>

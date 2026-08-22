<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as FileDropZone from "$lib/components/ui/file-drop-zone";
	import * as List from "$lib/components/ui/list";

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

<Field.Field data-invalid={Boolean(error)}>
	<Field.Label for="project-files">Project files</Field.Label>

	<FileDropZone.Root
		id="project-files"
		bind:ref={inputRef}
		onUpload={receiveFiles}
		maxFiles={5}
		fileCount={files.length}
		maxFileSize={10 * FileDropZone.MEGABYTE}
		accept={[FileDropZone.ACCEPT_IMAGE, "application/pdf"].join(",")}
		aria-invalid={Boolean(error)}
		aria-describedby={error ? "project-files-description project-files-error" : "project-files-description"}
		onFileRejected={({ file, reason }) => (error = file.name + ": " + reason)}
	>
		<FileDropZone.Trigger role="button" tabindex={0} onkeydown={openPickerFromKeyboard} class="w-full" />
	</FileDropZone.Root>

	<Field.Description id="project-files-description">Add up to five images or PDF files, with a maximum size of 10 MB each.</Field.Description>

	{#if error}
		<Field.Error id="project-files-error">{error}</Field.Error>
	{/if}

	{#if files.length >= 1}
		<List.Root variant="ordered">
			{#each files as file (file.name + file.lastModified)}
				<List.Item>{file.name} — {FileDropZone.displaySize(file.size)}</List.Item>
			{/each}
		</List.Root>
	{/if}
</Field.Field>

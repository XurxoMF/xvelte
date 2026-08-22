<script lang="ts">
	import * as TreeView from "$lib/components/ui/tree-view";

	let selectedFile = $state("No file selected");

	function openFile(path: string) {
		selectedFile = path;
	}
</script>

<TreeView.Root aria-label="Project files">
	<TreeView.Folder name="src">
		<TreeView.Folder name="components">
			<TreeView.File name="Header.svelte" onclick={() => openFile("src/components/Header.svelte")} />
		</TreeView.Folder>
		<TreeView.File name="app.css" onclick={() => openFile("src/app.css")} />
	</TreeView.Folder>
	<TreeView.File name="package.json" onclick={() => openFile("package.json")} />
</TreeView.Root>

<p class="mt-3 text-sm text-muted-foreground">{selectedFile}</p>

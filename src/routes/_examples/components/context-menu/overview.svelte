<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";

	function renameFile() {
		console.info("Rename file");
	}

	function deleteFile() {
		console.info("Delete file");
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="mx-auto flex h-60 w-full items-center justify-center rounded-lg border border-dashed text-sm">
		Right-click the selected file
	</ContextMenu.Trigger>

	<ContextMenu.Content class="w-52">
		<ContextMenu.Item onSelect={renameFile}>
			Rename
			<ContextMenu.Shortcut>F2</ContextMenu.Shortcut>
		</ContextMenu.Item>

		<ContextMenu.Item disabled>Share</ContextMenu.Item>
		<ContextMenu.Separator />
		<ContextMenu.Item variant="destructive" onSelect={deleteFile}>Delete</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>

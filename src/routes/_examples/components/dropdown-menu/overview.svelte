<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	function renameFile() {
		console.info("Rename file");
	}

	function deleteFile() {
		console.info("Delete file");
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="rounded-md border px-3 py-2 text-sm">File actions</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Item onSelect={renameFile}>
			Rename
			<DropdownMenu.Shortcut>F2</DropdownMenu.Shortcut>
		</DropdownMenu.Item>

		<DropdownMenu.Item disabled>Share</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item variant="destructive" onSelect={deleteFile}>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

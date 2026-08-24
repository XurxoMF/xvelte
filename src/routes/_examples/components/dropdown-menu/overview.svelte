<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	function renameFile() {
		console.info("Rename file");
	}

	function deleteFile() {
		console.info("Delete file");
	}
</script>

<div class="flex items-center justify-center">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={Button.rootVariants({ variant: "outline" })}>File actions</DropdownMenu.Trigger>

		<DropdownMenu.Content>
			<DropdownMenu.Item onSelect={renameFile}>
				Rename
				<DropdownMenu.Shortcut>F2</DropdownMenu.Shortcut>
			</DropdownMenu.Item>

			<DropdownMenu.Item disabled>Share</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item variant="danger" onSelect={deleteFile}>Delete</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<script lang="ts">
	import * as Menubar from "$lib/components/ui/menubar";

	function createDocument() {
		// Create the document.
	}
</script>

<Menubar.Root>
	<Menubar.Menu value="file">
		<Menubar.Trigger>File</Menubar.Trigger>

		<Menubar.Content>
			<Menubar.Item onSelect={createDocument}>
				New document
				<Menubar.Shortcut>⌘N</Menubar.Shortcut>
			</Menubar.Item>

			<Menubar.Item disabled>Export</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu value="help">
		<Menubar.Trigger>Help</Menubar.Trigger>

		<Menubar.Content>
			<Menubar.Item>Keyboard shortcuts</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>

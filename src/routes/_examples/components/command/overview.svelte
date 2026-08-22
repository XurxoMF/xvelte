<script lang="ts">
	import * as Command from "$lib/components/ui/command";

	function runCommand(command: string) {
		console.info("Run command", command);
	}
</script>

<Command.Root label="Workspace commands" class="max-w-md border shadow-md">
	<Command.Input placeholder="Search workspace commands..." />

	<Command.List aria-label="Workspace commands">
		<Command.Empty>No commands found.</Command.Empty>

		<Command.Group heading="Workspace">
			<Command.Item value="create-project" onSelect={() => runCommand("create-project")}>Create project</Command.Item>
			<Command.Item value="open-project" onSelect={() => runCommand("open-project")}>Open project</Command.Item>
			<Command.Item value="archive-project" disabled>Archive project</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Root>

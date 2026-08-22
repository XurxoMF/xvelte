<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Empty from "$lib/components/ui/empty";

	function createProject() {
		console.info("Create project");
	}
</script>

<Empty.Root class="border">
	<Empty.Header>
		<Empty.Media variant="icon">
			<span aria-hidden="true">📂</span>
		</Empty.Media>

		<Empty.Title role="heading" aria-level={2}>No projects yet</Empty.Title>
		<Empty.Description>Create your first project to keep files, tasks, and collaborators together.</Empty.Description>
	</Empty.Header>

	<Empty.Content>
		<Button.Root onclick={createProject}>Create project</Button.Root>
	</Empty.Content>
</Empty.Root>

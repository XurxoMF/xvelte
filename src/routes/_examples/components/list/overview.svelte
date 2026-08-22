<script lang="ts">
	import * as List from "$lib/components/ui/list";
</script>

<div class="flex flex-wrap items-center justify-center gap-4">
	<List.Root class="flex-1">
		<List.Item>Create a project.</List.Item>
		<List.Item>Invite the team.</List.Item>
		<List.Item>Publish the first release.</List.Item>
	</List.Root>

	<List.Root variant="ordered" class="flex-1">
		<List.Item>Create a project.</List.Item>
		<List.Item>Invite the team.</List.Item>
		<List.Item>Publish the first release.</List.Item>
	</List.Root>
</div>

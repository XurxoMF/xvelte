<script lang="ts">
	import { UseFrecency } from "$lib/hooks/use-frecency.svelte";

	import * as Button from "$lib/components/ui/button";
	import * as Typography from "$lib/components/ui/typography";

	const recentProjects = new UseFrecency("recent-projects", {}, { maxItems: 5 });
	const projects = [
		{ id: "atlas", name: "Atlas" },
		{ id: "harbor", name: "Harbor" },
		{ id: "northstar", name: "Northstar" }
	];

	function openProject(id: string) {
		recentProjects.use(id);
		// Navigate to the selected project.
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each projects as project (project.id)}
		<Button.Root variant="outline" onclick={() => openProject(project.id)}>Open {project.name}</Button.Root>
	{/each}
</div>

<Typography.P>Ranked by recent use</Typography.P>
<ul>
	{#each recentProjects.items as id (id)}
		{@const project = projects.find((item) => item.id === id)}
		{#if project}
			<li><Button.Root variant="link" onclick={() => openProject(id)}>{project.name}</Button.Root></li>
		{/if}
	{/each}
</ul>

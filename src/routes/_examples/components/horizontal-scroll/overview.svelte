<script lang="ts">
	import * as HorizontalScroll from "$lib/components/ui/horizontal-scroll";

	const projects = [
		{ name: "Storefront", status: "Ready for review" },
		{ name: "Documentation", status: "In progress" },
		{ name: "Design system", status: "Planned" },
		{ name: "Analytics", status: "Ready for review" }
	];
</script>

<HorizontalScroll.Root class="gap-4 pb-2" role="region" aria-label="Projects" tabindex={0}>
	{#each projects as project (project.name)}
		<article class="w-72 shrink-0 rounded-lg border p-4">
			<h3 class="font-medium">{project.name}</h3>
			<p class="text-sm text-muted-foreground">{project.status}</p>
		</article>
	{/each}
</HorizontalScroll.Root>

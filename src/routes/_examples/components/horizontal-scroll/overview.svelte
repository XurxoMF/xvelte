<script lang="ts">
	import * as HorizontalScroll from "$lib/components/ui/horizontal-scroll";
	import * as Card from "$lib/components/ui/card";

	const projects = [
		{ name: "Storefront", status: "Ready for review" },
		{ name: "Documentation", status: "In progress" },
		{ name: "Design system", status: "Planned" },
		{ name: "Analytics", status: "Ready for review" }
	];
</script>

<HorizontalScroll.Root class="gap-4" aria-label="Projects" tabindex={0}>
	{#each projects as project (project.name)}
		<Card.Root class="w-90 shrink-0">
			<Card.Header>
				<Card.Title>{project.name}</Card.Title>
				<Card.Description>{project.status}</Card.Description>
			</Card.Header>
		</Card.Root>
	{/each}
</HorizontalScroll.Root>

<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import type { DocUnit } from "./catalog";
	import * as Card from "$lib/components/ui/card";
	import * as Typography from "$lib/components/ui/typography";

	let { title, description, units }: { title: string; description: string; units: DocUnit[] } = $props();
</script>

<svelte:head><title>{title} — xvelte</title></svelte:head>

<main class="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
	<Typography.P class="text-primary">Library</Typography.P>
	<Typography.H1>{title}</Typography.H1>
	<Typography.P class="text-muted-foreground">{description}</Typography.P>

	<div class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each units as unit (unit.href)}
			<a href={resolve(unit.href as Pathname)} class="group block">
				<Card.Root size="sm" class="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
					<Card.Header>
						<Card.Title>{unit.title}</Card.Title>
						<Card.Description class="line-clamp-3">{unit.description}</Card.Description>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>
</main>

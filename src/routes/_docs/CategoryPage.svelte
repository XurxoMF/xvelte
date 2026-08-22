<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import type { DocUnit } from "./catalog";
	import * as Card from "$lib/components/ui/card";

	let { title, description, units }: { title: string; description: string; units: DocUnit[] } = $props();
</script>

<svelte:head><title>{title} — xvelte</title></svelte:head>

<main class="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
	<p class="text-sm font-semibold tracking-[0.16em] text-primary uppercase">Library</p>
	<h1 class="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
	<p class="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>

	<div class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each units as unit (unit.href)}
			<a href={resolve(unit.href as Pathname)} class="group block">
				<Card.Root size="sm" class="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
					<Card.Header><Card.Title>{unit.title}</Card.Title><Card.Description class="line-clamp-3">{unit.description}</Card.Description></Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>
</main>

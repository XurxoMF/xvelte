<script lang="ts">
	import { resolve } from "$app/paths";

	import type { Pathname } from "$app/types";

	import { navigation } from "../_docs/catalog";

	import * as Card from "$lib/components/ui/card";
	import * as Typography from "$lib/components/ui/typography";

	const sections = navigation.find((scope) => scope.value === "tauri")?.categories ?? [];
</script>

<svelte:head>
	<title>Tauri — xvelte</title>
	<meta
		name="description"
		content="Browse xvelte hooks and classes for runtime detection, native integrations, and stateful workflows in Tauri applications."
	/>
	<meta property="og:title" content="Tauri — xvelte" />
	<meta
		property="og:description"
		content="Browse xvelte hooks and classes for runtime detection, native integrations, and stateful workflows in Tauri applications."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
	<Typography.P class="text-primary">Native library</Typography.P>
	<Typography.H1>Tauri</Typography.H1>
	<Typography.P class="max-w-3xl text-muted-foreground">
		Platform-aware hooks and stateful classes for SvelteKit desktop applications. Each section documents both the frontend API and the native
		packages, permissions, capabilities, and platform constraints required to use it safely.
	</Typography.P>

	<div class="mt-10 grid gap-4 sm:grid-cols-2">
		{#each sections as section (section.id)}
			<a href={resolve(`/tauri/${section.directory}` as Pathname)} class="group block">
				<Card.Root
					class="h-full transition-all group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5"
				>
					<Card.Header>
						<span class="text-4xl font-bold text-primary">{section.units.length}</span>
						<Card.Title>{section.label}</Card.Title>
						<Card.Description>{section.description}</Card.Description>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>
</main>

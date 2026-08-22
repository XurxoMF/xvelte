<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import { attachments, components, hooks } from "./_docs/catalog";
	import { rootVariants } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
</script>

<svelte:head
	><title>xvelte — Svelte 5 components and utilities</title><meta
		name="description"
		content="A practical collection of Svelte 5 components, hooks and attachments."
	/></svelte:head
>

<main>
	<section class="relative overflow-hidden border-b px-5 py-20 sm:px-8 sm:py-28">
		<div class="docs-grid-mask pointer-events-none absolute inset-0"></div>
		<div class="relative mx-auto max-w-5xl">
			<p class="mb-5 text-sm font-semibold tracking-[0.2em] text-primary uppercase">Svelte 5 · local-first · composable</p>
			<h1 class="max-w-4xl text-5xl font-bold tracking-[-0.045em] text-balance sm:text-7xl">Useful interface pieces, shaped by real projects.</h1>
			<p class="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
				xvelte is a personal collection of accessible components, reactive hooks, and focused attachments for building SvelteKit interfaces without
				starting from zero.
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<a href={resolve("/components")} class={rootVariants({ size: "lg" })}>Browse components</a>
				<a href={resolve("/components/button")} class={rootVariants({ variant: "outline", size: "lg" })}>Start with Button</a>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-5 py-16 sm:px-8">
		<div class="grid gap-4 md:grid-cols-3">
			{#each [{ href: "/components", value: components.length, title: "Components", copy: "Primitives and larger patterns with documented composition and accessible behavior." }, { href: "/hooks", value: hooks.length, title: "Hooks", copy: "Small reactive tools for responsive state, ranking, ramps, and tables of contents." }, { href: "/attachments", value: attachments.length, title: "Attachment", copy: "Focused DOM behavior that composes directly with ordinary Svelte markup." }] as item (item.href)}
				<a href={resolve(item.href as Pathname)} class="group block">
					<Card.Root
						class="h-full transition-all group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5"
					>
						<Card.Header
							><span class="text-4xl font-bold text-primary">{item.value}</span><Card.Title>{item.title}</Card.Title><Card.Description
								>{item.copy}</Card.Description
							></Card.Header
						>
					</Card.Root>
				</a>
			{/each}
		</div>

		<div class="mt-20 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
			<div>
				<p class="text-sm font-semibold text-primary">A living reference</p>
				<h2 class="mt-2 text-3xl font-semibold tracking-tight">The docs follow the code.</h2>
			</div>
			<div class="space-y-5 text-base leading-7 text-muted-foreground">
				<p>
					Every reference page is sourced from the README beside its implementation. That keeps installation notes, public API, accessibility details,
					and examples in one place.
				</p>
				<p>The site itself is built with xvelte: its sidebar, cards, buttons, tabs, and code blocks double as a practical showcase.</p>
			</div>
		</div>
	</section>
</main>

<script lang="ts">
	import { resolve } from "$app/paths";

	import type { Pathname } from "$app/types";

	import { navigation } from "./_docs/catalog";

	import * as Button from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Typography from "$lib/components/ui/typography";

	const sharedSections = navigation.find((scope) => scope.value === "shared")?.categories ?? [];
	const tauriSections = navigation.find((scope) => scope.value === "tauri")?.categories ?? [];
</script>

<svelte:head>
	<title>xvelte — Svelte, Tailwind CSS and Tauri toolkit</title>
	<meta
		name="description"
		content="A practical SvelteKit toolkit with accessible components, hooks, attachments, Tailwind CSS styles, and Tauri utilities."
	/>
	<meta property="og:title" content="xvelte — Svelte, Tailwind CSS and Tauri toolkit" />
	<meta
		property="og:description"
		content="Accessible components, hooks, attachments, Tailwind CSS styles, and Tauri utilities for real SvelteKit projects."
	/>
</svelte:head>

<div>
	<section class="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28">
		<div class="docs-grid-mask pointer-events-none absolute inset-0"></div>
		<div class="relative mx-auto max-w-5xl">
			<Typography.P class="text-primary">Svelte 5 · Tailwind CSS · Tauri</Typography.P>
			<Typography.H1>Useful interface pieces, shaped by real projects.</Typography.H1>
			<Typography.P class="text-muted-foreground">
				xvelte is a personal toolkit of accessible components, reactive hooks, focused attachments, reusable styles, and Tauri utilities for building
				SvelteKit applications without starting from zero.
			</Typography.P>
			<div class="mt-8 flex flex-wrap gap-3">
				<a href={resolve("/installation")} class={Button.rootVariants({ size: "lg" })}>Installation</a>
				<a href={resolve("/components")} class={Button.rootVariants({ variant: "outline", size: "lg" })}>Browse components</a>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-5 py-16 sm:px-8">
		<div>
			<Typography.P class="text-primary">Shared library</Typography.P>
			<Typography.H2>Building blocks for every SvelteKit project.</Typography.H2>
			<Typography.P class="max-w-3xl text-muted-foreground">
				These parts depend only on the web application and can be copied independently into browser, server-rendered, static, or Tauri-backed
				projects.
			</Typography.P>

			<div class="mt-8 grid gap-4 sm:grid-cols-2">
				{#each sharedSections as section (section.id)}
					<a href={resolve(`/${section.directory}` as Pathname)} class="group block">
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
		</div>

		<div class="mt-16 pt-16">
			<Typography.P class="text-primary">Tauri library</Typography.P>
			<Typography.H2>Native capabilities behind an explicit boundary.</Typography.H2>
			<Typography.P class="max-w-3xl text-muted-foreground">
				These sections target SvelteKit applications embedded in Tauri and document the frontend API together with its native setup, permissions, and
				platform constraints.
			</Typography.P>

			<div class="mt-8 grid gap-4 sm:grid-cols-2">
				{#each tauriSections as section (section.id)}
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
		</div>

		<div class="mt-20 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
			<div>
				<Typography.P class="text-primary">A living reference</Typography.P>
				<Typography.H2>The docs follow the code.</Typography.H2>
			</div>
			<div class="space-y-5 text-base leading-7 text-muted-foreground">
				<Typography.P>
					Every reference page is sourced from the unit-named Markdown guide beside its implementation. That keeps installation notes, public API,
					accessibility details, and examples in one place.
				</Typography.P>
				<Typography.P
					>The site itself is built with xvelte: its sidebar, cards, buttons, tabs, and code blocks double as a practical showcase.</Typography.P
				>
			</div>
		</div>

		<div class="mt-20 grid gap-10 pt-16 lg:grid-cols-[0.85fr_1.15fr]">
			<div>
				<Typography.P class="text-primary">Built in the open</Typography.P>
				<Typography.H2>Inspired, adapted, and made local.</Typography.H2>
			</div>
			<div class="space-y-5 text-base leading-7 text-muted-foreground">
				<Typography.P>
					Many parts of xvelte are inspired by, adapted from, or built with approaches and code from other open-source projects. They are reshaped to
					match this collection's APIs, styling, accessibility, and real-world needs rather than kept as upstream-compatible copies.
				</Typography.P>
				<Typography.P>
					Important sources include <a class="text-foreground underline underline-offset-4" href="https://ui.shadcn.com/">shadcn/ui</a>,
					<a class="text-foreground underline underline-offset-4" href="https://www.shadcn-svelte.com/">shadcn-svelte</a>,
					<a class="text-foreground underline underline-offset-4" href="https://github.com/kevwpl/more-shadcn-svelte">more-shadcn-svelte</a>,
					<a class="text-foreground underline underline-offset-4" href="https://github.com/ieedan/shadcn-svelte-extras">shadcn-svelte-extras</a>, and
					<a class="text-foreground underline underline-offset-4" href="https://github.com/Wombosvideo/tw-animate-css">tw-animate-css</a>.
				</Typography.P>
			</div>
		</div>
	</section>
</div>

<style>
	.docs-grid-mask {
		background-image:
			linear-gradient(to right, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px),
			linear-gradient(to bottom, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px);
		background-size: 42px 42px;
		mask-image: linear-gradient(to bottom right, black, transparent 80%);
	}
</style>

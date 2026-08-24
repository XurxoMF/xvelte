<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import { attachments, components, hooks } from "./_docs/catalog";
	import { rootVariants } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Typography from "$lib/components/ui/typography";
</script>

<svelte:head
	><title>xvelte — Svelte 5 components and utilities</title><meta
		name="description"
		content="A practical collection of Svelte 5 components, hooks and attachments."
	/></svelte:head
>

<div>
	<section class="relative overflow-hidden border-b px-5 py-20 sm:px-8 sm:py-28">
		<div class="docs-grid-mask pointer-events-none absolute inset-0"></div>
		<div class="relative mx-auto max-w-5xl">
			<Typography.P class="text-primary">Svelte 5 · local-first · composable</Typography.P>
			<Typography.H1>Useful interface pieces, shaped by real projects.</Typography.H1>
			<Typography.P class="text-muted-foreground">
				xvelte is a personal collection of accessible components, reactive hooks, and focused attachments for building SvelteKit interfaces without
				starting from zero.
			</Typography.P>
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
				<Typography.P class="text-primary">A living reference</Typography.P>
				<Typography.H2>The docs follow the code.</Typography.H2>
			</div>
			<div class="space-y-5 text-base leading-7 text-muted-foreground">
				<Typography.P>
					Every reference page is sourced from the README beside its implementation. That keeps installation notes, public API, accessibility details,
					and examples in one place.
				</Typography.P>
				<Typography.P
					>The site itself is built with xvelte: its sidebar, cards, buttons, tabs, and code blocks double as a practical showcase.</Typography.P
				>
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

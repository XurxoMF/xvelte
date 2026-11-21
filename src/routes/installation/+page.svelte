<script lang="ts">
	import { resolve } from "$app/paths";

	import { installationGuides } from "./_data";

	import { ChevronRightIcon } from "#lib/icons.ts";

	import * as Button from "#lib/components/ui/button/index.ts";
	import * as Card from "#lib/components/ui/card/index.ts";
	import * as Typography from "#lib/components/ui/typography/index.ts";
</script>

<svelte:head>
	<title>Installation - xvelte</title>
	<meta name="description" content="Choose an SSR, SSG, browser SPA, or combined web and Tauri SPA installation for xvelte." />
</svelte:head>

<main class="mx-auto w-full max-w-6xl px-5 pt-10 pb-28 sm:px-8 sm:pt-14">
	<header class="max-w-3xl">
		<Typography.P class="font-medium text-primary">Choose the rendering model first</Typography.P>
		<Typography.H1>Install xvelte</Typography.H1>
		<Typography.Leading>
			Start with the guide that matches how the application will render and deploy. Each path contains only the packages, files, and commands it
			needs.
		</Typography.Leading>
	</header>

	<div class="mt-12 grid gap-5 md:grid-cols-2">
		{#each installationGuides as guide (guide.slug)}
			<Card.Root class="h-full">
				<Card.Header>
					<div class="mb-2 w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{guide.badge}</div>
					<Card.Title>{guide.title}</Card.Title>
					<Card.Description>{guide.description}</Card.Description>
				</Card.Header>

				<Card.Content class="grid grid-cols-2 gap-3 text-sm">
					<div class="rounded-lg bg-muted/60 p-3">
						<span class="block text-xs text-muted-foreground">Production server</span>
						<strong>{guide.server}</strong>
					</div>
					<div class="rounded-lg bg-muted/60 p-3">
						<span class="block text-xs text-muted-foreground">Initial HTML</span>
						<strong>{guide.html}</strong>
					</div>
				</Card.Content>

				<Card.Footer class="mt-auto">
					<a
						href={guide.slug === "web-ssr"
							? resolve("/installation/web-ssr")
							: guide.slug === "web-ssg"
								? resolve("/installation/web-ssg")
								: guide.slug === "web-spa"
									? resolve("/installation/web-spa")
									: resolve("/installation/web-tauri")}
						class={Button.rootVariants({ variant: "outline" })}
					>
						Open guide
						<ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
					</a>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>

	<section class="mt-12 rounded-2xl border bg-muted/30 p-6 sm:p-8" aria-labelledby="add-tauri-title">
		<Typography.P class="font-medium text-primary">Already installed?</Typography.P>
		<Typography.H2 id="add-tauri-title">Move an existing web project to Web SPA + Tauri SPA</Typography.H2>
		<Typography.P class="mt-3 max-w-3xl text-muted-foreground">
			Review what changes when leaving SSR, SSG, or a web-only SPA, audit server-only code, and replace the required configuration files.
		</Typography.P>
		<a href={resolve("/installation/add-tauri")} class={Button.rootVariants({ class: "mt-6" })}>Open the migration guide</a>
	</section>
</main>

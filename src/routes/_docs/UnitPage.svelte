<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import * as Typography from "$lib/components/ui/typography";

	import type { DocKind } from "./catalog";
	import { getUnit } from "./catalog";
	import Document from "./Document.svelte";

	let { kind, slug }: { kind: DocKind; slug: string } = $props();
	let unit = $derived(getUnit(kind, slug));
</script>

<svelte:head>
	<title>{unit ? `${unit.title} — xvelte` : "Not found — xvelte"}</title>
	{#if unit}<meta name="description" content={unit.description} />{/if}
</svelte:head>

{#if unit}
	<main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
		<nav aria-label="Breadcrumb" class="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
			<a
				href={resolve(`/${kind === "component" ? "components" : kind === "hook" ? "hooks" : "attachments"}` as Pathname)}
				class="hover:text-foreground">{kind === "component" ? "Components" : kind === "hook" ? "Hooks" : "Attachments"}</a
			>
			<span aria-hidden="true">/</span><span class="text-foreground">{unit.title}</span>
		</nav>

		<Document {kind} {slug} source={unit.markdown} />
	</main>
{:else}
	<main class="mx-auto max-w-3xl px-5 py-20 sm:px-8">
		<Typography.P class="text-primary">404</Typography.P>
		<Typography.H1>Documentation not found</Typography.H1>
		<Typography.P class="text-muted-foreground">This entry does not exist in the local xvelte catalog.</Typography.P>
	</main>
{/if}

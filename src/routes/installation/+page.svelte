<script lang="ts">
	import installation from "./installation.md?raw";

	import { parseMarkdown } from "$lib/hooks/use-markdown.svelte";

	import * as Markdown from "$lib/components/ui/markdown";
	import * as Typography from "$lib/components/ui/typography";

	const ast = parseMarkdown(installation);
</script>

<svelte:head>
	<title>Installation — xvelte</title>
	<meta
		name="description"
		content="Install all or part of xvelte in a SvelteKit project, including shared styles, utilities, icons, localization, dependencies, and agent guidance."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
	<Typography.Prose>
		<Markdown.Root {ast} />
	</Typography.Prose>
</main>

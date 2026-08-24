<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";

	import * as Code from "$lib/components/ui/code";
	import * as Markdown from "$lib/components/ui/markdown";
	import * as Tabs from "$lib/components/ui/tabs";
	import * as Typography from "$lib/components/ui/typography";
	import { parseMarkdown, type MarkdownAst } from "$lib/hooks/use-markdown.svelte";

	import type { DocKind } from "./catalog";
	import { getUnit } from "./catalog";
	import type { DocExample } from "./examples";
	import { getExample } from "./examples";

	type DocumentSegment = {
		ast: MarkdownAst;
		example?: DocExample | undefined;
	};

	let { kind, slug }: { kind: DocKind; slug: string } = $props();
	let unit = $derived(getUnit(kind, slug));

	/** Splits one README around preview markers and parses each Markdown section once. */
	function createDocumentSegments(source: string): DocumentSegment[] {
		const segments: DocumentSegment[] = [];
		const matcher = /<!--\s*xvelte-example:\s*([a-z0-9-]+)\s*-->/gi;
		let start = 0;
		let match: RegExpExecArray | null;

		const addSegment = (markdown: string, exampleName?: string | undefined) => {
			const example = exampleName ? getExample(kind, slug, exampleName) : undefined;
			if (!markdown.trim() && !example) return;

			segments.push({ ast: parseMarkdown(markdown), example });
		};

		while ((match = matcher.exec(source))) {
			addSegment(source.slice(start, match.index), match[1]);
			start = matcher.lastIndex;
		}

		addSegment(source.slice(start));
		return segments;
	}

	let segments = $derived(createDocumentSegments(unit?.markdown ?? ""));
</script>

<svelte:head>
	<title>{unit ? `${unit.title} — xvelte` : "Not found — xvelte"}</title>
	{#if unit}<meta name="description" content={unit.description} />{/if}
</svelte:head>

{#if unit}
	<main class="mx-auto max-w-[90%] px-5 py-10 sm:px-8 sm:py-14">
		<nav aria-label="Breadcrumb" class="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
			<a
				href={resolve(`/${kind === "component" ? "components" : kind === "hook" ? "hooks" : "attachments"}` as Pathname)}
				class="hover:text-foreground">{kind === "component" ? "Components" : kind === "hook" ? "Hooks" : "Attachments"}</a
			>
			<span aria-hidden="true">/</span><span class="text-foreground">{unit.title}</span>
		</nav>

		{#each segments as segment, index (`${index}-${segment.example?.name ?? "markdown"}`)}
			<Typography.Prose>
				<Markdown.Root ast={segment.ast} />
			</Typography.Prose>

			{#if segment.example}
				{#await segment.example.load()}
					<div class="my-10 flex min-h-56 items-center justify-center rounded-xl border text-sm text-muted-foreground">Loading preview…</div>
				{:then loaded}
					{@const Preview = loaded.component}
					{@const exampleId = `${kind}-${slug}-${segment.example.name}-example`}

					<section class="my-10 scroll-mt-20" aria-labelledby={exampleId}>
						<div class="mb-4">
							<Typography.P class="text-primary">Live preview</Typography.P>
							<Typography.H2 id={exampleId}>{segment.example.title}</Typography.H2>
						</div>

						<Tabs.Root value="preview">
							<Tabs.List aria-label="Example view">
								<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
								<Tabs.Trigger value="code">Code</Tabs.Trigger>
							</Tabs.List>

							<Tabs.Content value="preview" class="w-full border p-8">
								<Preview />
							</Tabs.Content>

							<Tabs.Content value="code" class="w-full">
								<Code.Root code={loaded.source} lang="svelte" class="max-h-136 border-none">
									<Code.CopyButton tabindex={0} />
								</Code.Root>
							</Tabs.Content>
						</Tabs.Root>
					</section>
				{/await}
			{/if}
		{/each}
	</main>
{:else}
	<main class="mx-auto max-w-3xl px-5 py-20 sm:px-8">
		<Typography.P class="text-primary">404</Typography.P>
		<Typography.H1>Documentation not found</Typography.H1>
		<Typography.P class="text-muted-foreground">This entry does not exist in the local xvelte catalog.</Typography.P>
	</main>
{/if}

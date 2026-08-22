<script lang="ts">
	import type { DocKind } from "./catalog";
	import type { DocExample } from "./examples";
	import { getExample } from "./examples";
	import Example from "./Example.svelte";
	import Markdown from "./Markdown.svelte";

	type Segment = { markdown: string; example?: DocExample | undefined };

	let { kind, slug, source }: { kind: DocKind; slug: string; source: string } = $props();

	function createSegments(markdown: string): Segment[] {
		const segments: Segment[] = [];
		const matcher = /<!--\s*xvelte-example:\s*([a-z0-9-]+)\s*-->/gi;
		let start = 0;
		let match: RegExpExecArray | null;

		while ((match = matcher.exec(markdown))) {
			segments.push({ markdown: markdown.slice(start, match.index), example: getExample(kind, slug, match[1] ?? "") });
			start = matcher.lastIndex;
		}

		segments.push({ markdown: markdown.slice(start) });
		return segments;
	}

	let segments = $derived(createSegments(source));
</script>

{#each segments as segment, index (`${index}-${segment.example?.name ?? "markdown"}`)}
	<Markdown source={segment.markdown} />

	{#if segment.example}
		{#await segment.example.load()}
			<div class="my-10 flex min-h-56 items-center justify-center rounded-xl border text-sm text-muted-foreground">Loading preview…</div>
		{:then loaded}
			{@const Preview = loaded.component}
			<Example title={segment.example.title} source={loaded.source}>
				<Preview />
			</Example>
		{/await}
	{/if}
{/each}

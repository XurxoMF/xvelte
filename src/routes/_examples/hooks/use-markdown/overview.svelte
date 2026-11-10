<script lang="ts">
	import { UseMarkdown } from "$lib/hooks/use-markdown.svelte";
	import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";

	import * as CodeBlock from "$lib/components/ui/code-block";
	import * as Textarea from "$lib/components/ui/textarea";

	let source = $state(`# Release notes

> [!TIP]
> Markdown becomes structured data.`);

	const markdown = new UseMarkdown();

	$effect(() => {
		markdown.source = source;
	});

	let summary = $derived(
		JSON.stringify(
			markdown.current.children.map((node) => ({
				type: node.type,
				data: node.data
			})),
			null,
			2
		)
	);

	const highlightedSummary = useHighlightedCode(
		() => summary,
		() => "json"
	);
</script>

<div class="grid gap-6 md:grid-cols-2">
	<label class="grid content-start gap-2">
		<span class="text-sm font-medium">Markdown source</span>
		<Textarea.Root bind:value={source} class="min-h-48 font-mono" />
	</label>

	<div class="grid content-start gap-2">
		<span class="text-sm font-medium">Reactive AST summary</span>
		<CodeBlock.Root>
			<CodeBlock.Content>
				{#each highlightedSummary.current as line, index (index)}
					<CodeBlock.Line code={line} />
				{/each}
			</CodeBlock.Content>
		</CodeBlock.Root>
	</div>
</div>

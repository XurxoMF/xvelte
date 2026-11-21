<script lang="ts" module>
	export type SourceBlockProps = {
		title: string;
		code: string;
		language: string;
	};
</script>

<script lang="ts">
	import { useHighlightedCode } from "#lib/hooks/use-highlighted-code.svelte.ts";

	import * as CodeBlock from "#lib/components/ui/code-block/index.ts";

	let { title, code, language }: SourceBlockProps = $props();

	const lines = useHighlightedCode(
		() => code,
		() => language
	);
</script>

<CodeBlock.Root>
	<CodeBlock.Header>
		<CodeBlock.Title>{title}</CodeBlock.Title>
		<CodeBlock.Actions>
			<CodeBlock.CopyButton value={code} />
		</CodeBlock.Actions>
	</CodeBlock.Header>
	<CodeBlock.Content lineNumbers>
		{#each lines.current as line, index (index)}
			<CodeBlock.Line code={line} />
		{/each}
	</CodeBlock.Content>
</CodeBlock.Root>

<script lang="ts">
	import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";

	import * as CodeBlock from "$lib/components/ui/code-block";

	const source = `function greet(name: string) {
	return \`Hello, \${name}!\`;
}`;

	const lines = useHighlightedCode(
		() => source,
		() => "typescript"
	);
</script>

<CodeBlock.Root>
	<CodeBlock.Header>
		<CodeBlock.Title>greet.ts</CodeBlock.Title>
		<CodeBlock.Actions>
			<CodeBlock.CopyButton value={source} />
		</CodeBlock.Actions>
	</CodeBlock.Header>

	<CodeBlock.Content lineNumbers>
		{#each lines.current as line, index (index)}
			<CodeBlock.Line code={line} />
		{/each}
	</CodeBlock.Content>
</CodeBlock.Root>

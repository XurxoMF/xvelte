<script lang="ts">
	import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";

	import * as CodeBlock from "$lib/components/ui/code-block";

	let { code, language = "text", class: className }: { code: string; language?: string | undefined; class?: string | undefined } = $props();

	const lines = useHighlightedCode(
		() => code,
		() => language
	);
</script>

<CodeBlock.Root class={className}>
	<CodeBlock.Actions>
		<CodeBlock.CopyButton value={code} />
	</CodeBlock.Actions>

	<CodeBlock.Content>
		{#each lines.current as line, index (index)}
			<CodeBlock.Line code={line} />
		{/each}
	</CodeBlock.Content>
</CodeBlock.Root>

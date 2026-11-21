<script lang="ts" module>
	export type CommandBlockProps = {
		title: string;
		code: string;
	};
</script>

<script lang="ts">
	import * as CodeBlock from "#lib/components/ui/code-block/index.ts";

	let { title, code }: CommandBlockProps = $props();
</script>

<CodeBlock.Root>
	<CodeBlock.Header>
		<CodeBlock.Title>{title}</CodeBlock.Title>
		<CodeBlock.Actions>
			<CodeBlock.CopyButton value={code} />
		</CodeBlock.Actions>
	</CodeBlock.Header>
	<CodeBlock.Content {code} />
</CodeBlock.Root>

<script lang="ts">
	import type { MarkdownBlock, MarkdownInline } from "./markdown";
	import { parseMarkdown } from "./markdown";

	import * as Code from "$lib/components/ui/code";
	import * as List from "$lib/components/ui/list";
	import * as Separator from "$lib/components/ui/separator";
	import * as Table from "$lib/components/ui/table";
	import * as Typography from "$lib/components/ui/typography";

	let { source }: { source: string } = $props();

	const languageLoaders: Record<string, { lang: string; loadLanguage: Code.LanguageLoader }> = {
		svelte: { lang: "svelte", loadLanguage: () => import("@shikijs/langs/svelte") },
		ts: { lang: "typescript", loadLanguage: () => import("@shikijs/langs/typescript") },
		typescript: { lang: "typescript", loadLanguage: () => import("@shikijs/langs/typescript") },
		js: { lang: "javascript", loadLanguage: () => import("@shikijs/langs/javascript") },
		javascript: { lang: "javascript", loadLanguage: () => import("@shikijs/langs/javascript") },
		jsx: { lang: "jsx", loadLanguage: () => import("@shikijs/langs/jsx") },
		json: { lang: "json", loadLanguage: () => import("@shikijs/langs/json") },
		css: { lang: "css", loadLanguage: () => import("@shikijs/langs/css") },
		sh: { lang: "bash", loadLanguage: () => import("@shikijs/langs/bash") },
		bash: { lang: "bash", loadLanguage: () => import("@shikijs/langs/bash") },
		shell: { lang: "bash", loadLanguage: () => import("@shikijs/langs/bash") }
	};

	function highlightedLanguage(language: string) {
		return languageLoaders[language];
	}

	function isIntroduction(blocks: MarkdownBlock[], index: number) {
		return index === 1 && blocks[0]?.type === "heading" && blocks[0].level === 1;
	}

	let blocks = $derived(parseMarkdown(source));
</script>

{#snippet renderInline(nodes: MarkdownInline[])}
	{#each nodes as node, index (index)}
		{#if node.type === "text"}
			{node.value}
		{:else if node.type === "strong"}
			<strong>{@render renderInline(node.children)}</strong>
		{:else if node.type === "emphasis"}
			<em>{@render renderInline(node.children)}</em>
		{:else if node.type === "delete"}
			<del>{@render renderInline(node.children)}</del>
		{:else if node.type === "code"}
			<Typography.InlineCode>{node.value}</Typography.InlineCode>
		{:else}
			<Typography.Link href={node.href} title={node.title}>{@render renderInline(node.children)}</Typography.Link>
		{/if}
	{/each}
{/snippet}

{#snippet renderBlocks(nodes: MarkdownBlock[])}
	{#each nodes as block, index (index)}
		{#if block.type === "heading"}
			{#if block.level === 1}
				<Typography.H1 id={block.id}>{@render renderInline(block.children)}</Typography.H1>
			{:else if block.level === 2}
				<Typography.H2 id={block.id}>{@render renderInline(block.children)}</Typography.H2>
			{:else if block.level === 3}
				<Typography.H3 id={block.id}>{@render renderInline(block.children)}</Typography.H3>
			{:else if block.level === 4}
				<Typography.H4 id={block.id}>{@render renderInline(block.children)}</Typography.H4>
			{:else if block.level === 5}
				<Typography.H5 id={block.id}>{@render renderInline(block.children)}</Typography.H5>
			{:else}
				<Typography.H6 id={block.id}>{@render renderInline(block.children)}</Typography.H6>
			{/if}
		{:else if block.type === "paragraph"}
			{#if isIntroduction(nodes, index)}
				<Typography.Leading>{@render renderInline(block.children)}</Typography.Leading>
			{:else}
				<Typography.P>{@render renderInline(block.children)}</Typography.P>
			{/if}
		{:else if block.type === "code"}
			{@const language = highlightedLanguage(block.language)}
			{#if language}
				<Code.Root code={block.value} lang={language.lang} loadLanguage={language.loadLanguage}>
					<Code.CopyButton tabindex={0} />
				</Code.Root>
			{:else}
				<Code.Root code={block.value} lang="text">
					<Code.CopyButton tabindex={0} />
				</Code.Root>
			{/if}
		{:else if block.type === "list"}
			<List.Root variant={block.ordered ? "ordered" : "unordered"}>
				{#each block.items as item, itemIndex (itemIndex)}
					<List.Item>
						{@const first = item[0]}
						{#if item.length === 1 && first?.type === "paragraph"}
							{@render renderInline(first.children)}
						{:else}
							{@render renderBlocks(item)}
						{/if}
					</List.Item>
				{/each}
			</List.Root>
		{:else if block.type === "blockquote"}
			<Typography.Blockquote>{@render renderBlocks(block.children)}</Typography.Blockquote>
		{:else if block.type === "table"}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						{#each block.headers as cell, cellIndex (cellIndex)}
							<Table.Head scope="col">{@render renderInline(cell)}</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each block.rows as row, rowIndex (rowIndex)}
						<Table.Row>
							{#each row as cell, cellIndex (cellIndex)}
								<Table.Cell>{@render renderInline(cell)}</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{:else}
			<Separator.Root decorative={false} />
		{/if}
	{/each}
{/snippet}

<Typography.Prose>
	{@render renderBlocks(blocks)}
</Typography.Prose>

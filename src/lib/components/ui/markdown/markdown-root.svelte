<script lang="ts" module>
	import type { Definition, PhrasingContent, RootContent } from "mdast";

	import type { MarkdownAlertKind, MarkdownAst } from "$lib/hooks/use-markdown.svelte";

	/** Props for the headless mdast-to-xvelte renderer. */
	export type RootProps = {
		/** Parsed mdast root, normally produced by parseMarkdown or UseMarkdown. */
		ast: MarkdownAst;
		/** Whether fenced code blocks include the keyboard-accessible copy button. */
		showCopyButton?: boolean | undefined;
		/** Whether the paragraph immediately after a top-level H1 uses Typography.Leading. */
		leadingIntroduction?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { SvelteMap } from "svelte/reactivity";

	import type { Node, Parent } from "unist";

	import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import * as Alert from "$lib/components/ui/alert";
	import * as Checkbox from "$lib/components/ui/checkbox";
	import * as Code from "$lib/components/ui/code";
	import * as List from "$lib/components/ui/list";
	import * as Separator from "$lib/components/ui/separator";
	import * as Table from "$lib/components/ui/table";
	import * as Typography from "$lib/components/ui/typography";

	let { ast, showCopyButton = true, leadingIntroduction = true }: RootProps = $props();

	/** Returns whether a unist node owns child nodes. */
	function isParent(node: Node): node is Parent {
		return "children" in node && Array.isArray(node.children);
	}

	/** Extracts readable text from a node for task-checkbox labels. */
	function nodeText(node: Node): string {
		if ("value" in node && typeof node.value === "string") return node.value;
		if (!isParent(node)) return "";
		return node.children.map(nodeText).join("");
	}

	/** Collects reference definitions from every nested mdast parent. */
	function collectDefinitions(node: Node, definitions = new SvelteMap<string, Definition>()) {
		if (node.type === "definition") {
			const definition = node as Definition;
			definitions.set(definition.identifier, definition);
		}

		if (isParent(node)) node.children.forEach((child) => collectDefinitions(child, definitions));
		return definitions;
	}

	/** Allows relative URLs and common navigation protocols while rejecting executable schemes. */
	function safeUrl(url: string | null | undefined) {
		if (!url) return undefined;
		const protocol = url
			.trim()
			.match(/^([a-z][a-z\d+.-]*):/i)?.[1]
			?.toLowerCase();
		if (protocol && !["http", "https", "mailto", "tel"].includes(protocol)) return undefined;
		return url;
	}

	/** Detects the introductory paragraph convention used by xvelte documentation. */
	function isIntroduction(nodes: RootContent[], index: number) {
		return leadingIntroduction && index === 1 && nodes[0]?.type === "heading" && nodes[0].depth === 1;
	}

	let definitions = $derived(collectDefinitions(ast));
</script>

{#snippet Todo(kind: "image" | "footnote" | "html", inline = false)}
	{#if inline}
		<span data-slot="markdown-todo" class="text-muted-foreground">
			{kind === "image" ? m.gentle_raven_wait() : kind === "footnote" ? m.lunar_badger_pause() : m.amber_willow_hold()}
		</span>
	{:else}
		<Typography.P data-slot="markdown-todo" class="text-muted-foreground">
			{kind === "image" ? m.gentle_raven_wait() : kind === "footnote" ? m.lunar_badger_pause() : m.amber_willow_hold()}
		</Typography.P>
	{/if}
{/snippet}

{#snippet renderInline(nodes: PhrasingContent[])}
	{#each nodes as node, index (index)}
		{#if node.type === "text"}
			{node.value}
		{:else if node.type === "strong"}
			<strong data-slot="markdown-strong">{@render renderInline(node.children)}</strong>
		{:else if node.type === "emphasis"}
			<em data-slot="markdown-emphasis">{@render renderInline(node.children)}</em>
		{:else if node.type === "delete"}
			<del data-slot="markdown-delete">{@render renderInline(node.children)}</del>
		{:else if node.type === "inlineCode"}
			<Typography.InlineCode>{node.value}</Typography.InlineCode>
		{:else if node.type === "break"}
			<br data-slot="markdown-break" />
		{:else if node.type === "link"}
			{@const href = safeUrl(node.url)}
			{#if href}
				<Typography.Link {href} title={node.title}>{@render renderInline(node.children)}</Typography.Link>
			{:else}
				<span data-slot="markdown-unsafe-link">{@render renderInline(node.children)}</span>
			{/if}
		{:else if node.type === "linkReference"}
			{@const definition = definitions.get(node.identifier)}
			{@const href = safeUrl(definition?.url)}
			{#if href}
				<Typography.Link {href} title={definition?.title}>{@render renderInline(node.children)}</Typography.Link>
			{:else}
				<span data-slot="markdown-unresolved-link">{@render renderInline(node.children)}</span>
			{/if}
		{:else if node.type === "image" || node.type === "imageReference"}
			{@render Todo("image", true)}
		{:else if node.type === "footnoteReference"}
			{@render Todo("footnote", true)}
		{:else if node.type === "html"}
			{@render Todo("html", true)}
		{/if}
	{/each}
{/snippet}

{#snippet AlertTitle(kind: MarkdownAlertKind)}
	{#if kind === "note"}
		<AlertInfoIcon aria-hidden="true" />
		<Alert.Title>{m.velvet_ibis_turn()}</Alert.Title>
	{:else if kind === "tip"}
		<AlertSuccessIcon aria-hidden="true" />
		<Alert.Title>{m.solar_otter_rest()}</Alert.Title>
	{:else if kind === "important"}
		<AlertInfoIcon aria-hidden="true" />
		<Alert.Title>{m.misty_yak_glow()}</Alert.Title>
	{:else if kind === "warning"}
		<AlertWarningIcon aria-hidden="true" />
		<Alert.Title>{m.rapid_fern_bloom()}</Alert.Title>
	{:else}
		<AlertErrorIcon aria-hidden="true" />
		<Alert.Title>{m.silent_coral_drift()}</Alert.Title>
	{/if}
{/snippet}

{#snippet renderBlocks(nodes: RootContent[])}
	{#each nodes as node, index (index)}
		{#if node.type === "heading"}
			{#if node.depth === 1}
				<Typography.H1 id={node.data?.headingId}>{@render renderInline(node.children)}</Typography.H1>
			{:else if node.depth === 2}
				<Typography.H2 id={node.data?.headingId}>{@render renderInline(node.children)}</Typography.H2>
			{:else if node.depth === 3}
				<Typography.H3 id={node.data?.headingId}>{@render renderInline(node.children)}</Typography.H3>
			{:else if node.depth === 4}
				<Typography.H4 id={node.data?.headingId}>{@render renderInline(node.children)}</Typography.H4>
			{:else if node.depth === 5}
				<Typography.H5 id={node.data?.headingId}>{@render renderInline(node.children)}</Typography.H5>
			{:else}
				<Typography.H6 id={node.data?.headingId}>{@render renderInline(node.children)}</Typography.H6>
			{/if}
		{:else if node.type === "paragraph"}
			{#if isIntroduction(nodes, index)}
				<Typography.Leading>{@render renderInline(node.children)}</Typography.Leading>
			{:else}
				<Typography.P>{@render renderInline(node.children)}</Typography.P>
			{/if}
		{:else if node.type === "code"}
			<Code.Root code={node.value} lang={node.lang ?? "text"}>
				{#if showCopyButton}<Code.CopyButton tabindex={0} />{/if}
			</Code.Root>
		{:else if node.type === "list"}
			<List.Root variant={node.ordered ? "ordered" : "unordered"} start={node.start ?? undefined}>
				{#each node.children as item, itemIndex (itemIndex)}
					<List.Item class={item.checked !== null && item.checked !== undefined ? "list-none" : undefined}>
						{#if item.checked !== null && item.checked !== undefined}
							<div data-slot="markdown-task-list-item" class="flex items-start gap-2">
								<Checkbox.Root checked={item.checked} disabled aria-label={nodeText(item)} class="mt-1.5" />
								<div data-slot="markdown-task-list-content" class="min-w-0 flex-1">
									{@render renderBlocks(item.children)}
								</div>
							</div>
						{:else if item.children.length === 1 && item.children[0]?.type === "paragraph"}
							{@render renderInline(item.children[0].children)}
						{:else}
							<div data-slot="markdown-list-item-content" class="flex flex-col gap-4">
								{@render renderBlocks(item.children)}
							</div>
						{/if}
					</List.Item>
				{/each}
			</List.Root>
		{:else if node.type === "blockquote"}
			{#if node.data?.alert}
				<Alert.Root
					variant={node.data.alert === "caution"
						? "danger"
						: node.data.alert === "note"
							? "info"
							: node.data.alert === "tip"
								? "success"
								: node.data.alert === "warning"
									? "warning"
									: node.data.alert === "important"
										? "important"
										: "default"}
				>
					{@render AlertTitle(node.data.alert)}
					<Alert.Description>{@render renderBlocks(node.children)}</Alert.Description>
				</Alert.Root>
			{:else}
				<Typography.Blockquote class="flex flex-col gap-4">{@render renderBlocks(node.children)}</Typography.Blockquote>
			{/if}
		{:else if node.type === "table"}
			<Table.Root>
				{#if node.children[0]}
					<Table.Header>
						<Table.Row>
							{#each node.children[0].children as cell, cellIndex (cellIndex)}
								<Table.Head scope="col" style={node.align?.[cellIndex] ? `text-align: ${node.align[cellIndex]}` : undefined}>
									{@render renderInline(cell.children)}
								</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>
				{/if}
				<Table.Body>
					{#each node.children.slice(1) as row, rowIndex (rowIndex)}
						<Table.Row>
							{#each row.children as cell, cellIndex (cellIndex)}
								<Table.Cell style={node.align?.[cellIndex] ? `text-align: ${node.align[cellIndex]}` : undefined}>
									{@render renderInline(cell.children)}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{:else if node.type === "thematicBreak"}
			<Separator.Root decorative={false} />
		{:else if node.type === "image" || node.type === "imageReference"}
			{@render Todo("image")}
		{:else if node.type === "footnoteDefinition" || node.type === "footnoteReference"}
			{@render Todo("footnote")}
		{:else if node.type === "html"}
			{@render Todo("html")}
		{:else if node.type !== "definition" && node.type !== "yaml" && node.type !== "listItem" && node.type !== "tableRow" && node.type !== "tableCell"}
			<Typography.P>{@render renderInline([node])}</Typography.P>
		{/if}
	{/each}
{/snippet}

{@render renderBlocks(ast.children)}

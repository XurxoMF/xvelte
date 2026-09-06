<script lang="ts" module>
	import type { Definition, FootnoteDefinition, FootnoteReference, Image, ImageReference, PhrasingContent, RootContent } from "mdast";
	import type { MarkdownAlertKind, MarkdownAst } from "$lib/hooks/use-markdown.svelte";

	/** HTML handling policy used for raw mdast HTML nodes. */
	export type HtmlMode = "sanitize" | "trusted";

	/** Props for the headless mdast-to-xvelte renderer. */
	export type RootProps = {
		/** Parsed mdast root, normally produced by parseMarkdown or UseMarkdown. */
		ast: MarkdownAst;
		/** Whether fenced code blocks include the keyboard-accessible copy button. */
		showCopyButton?: boolean | undefined;
		/** Whether the paragraph immediately after a top-level H1 uses Typography.Leading. */
		leadingIntroduction?: boolean | undefined;
		/** Whether raw HTML is sanitized before rendering or inserted unchanged. */
		html?: HtmlMode | undefined;
	};
</script>

<script lang="ts">
	import { SvelteMap } from "svelte/reactivity";
	import { fromHtml } from "hast-util-from-html";
	import { sanitize } from "hast-util-sanitize";
	import { toHtml } from "hast-util-to-html";

	import type { Node, Parent } from "unist";

	import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import * as Alert from "$lib/components/ui/alert";
	import * as Checkbox from "$lib/components/ui/checkbox";
	import * as Code from "$lib/components/ui/code";
	import * as Footnote from "$lib/components/ui/footnote";
	import * as List from "$lib/components/ui/list";
	import * as Separator from "$lib/components/ui/separator";
	import * as Table from "$lib/components/ui/table";
	import * as Typography from "$lib/components/ui/typography";

	let { ast, showCopyButton = true, leadingIntroduction = true, html = "sanitize" }: RootProps = $props();
	const rootId = $props.id();
	const footnotePrefix = `${rootId}-footnote`;

	/** Numbering and backlink metadata for one rendered footnote definition. */
	type FootnoteEntry = {
		/** Definition node associated with the first matching reference. */
		definition: FootnoteDefinition;
		/** One-based number assigned in first-reference order. */
		number: number;
		/** Total number of references that link to this definition. */
		referenceCount: number;
	};

	/** Position assigned to one inline footnote-reference node. */
	type FootnoteReferenceInfo = {
		/** One-based number shared by all references to the same definition. */
		number: number;
		/** One-based occurrence of this particular reference. */
		occurrence: number;
	};

	/** Prepared footnote data used by the inline and block renderers. */
	type FootnoteModel = {
		/** Referenced definitions in their first-reference order. */
		entries: FootnoteEntry[];
		/** Metadata keyed by the original inline reference-node identity. */
		references: SvelteMap<FootnoteReference, FootnoteReferenceInfo>;
	};

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

	/**
	 * Collects definitions and assigns footnote numbers in first-reference order.
	 *
	 * References inside a used definition are visited after the document body, while
	 * unused definitions stay hidden and do not affect numbering.
	 *
	 * @param node mdast root or descendant to inspect.
	 * @returns Referenced definitions and per-reference numbering metadata.
	 */
	function collectFootnotes(node: Node): FootnoteModel {
		const definitions = new SvelteMap<string, FootnoteDefinition>();
		const entries: FootnoteEntry[] = [];
		const entriesByIdentifier = new SvelteMap<string, FootnoteEntry>();
		const references = new SvelteMap<FootnoteReference, FootnoteReferenceInfo>();

		/**
		 * Collects every definition before references are resolved.
		 *
		 * @param current Current mdast node in the definition traversal.
		 */
		function collectDefinitionNodes(current: Node): void {
			if (current.type === "footnoteDefinition") {
				const definition = current as FootnoteDefinition;
				definitions.set(definition.identifier, definition);
			}

			if (isParent(current)) current.children.forEach(collectDefinitionNodes);
		}

		/**
		 * Registers references without descending into definitions at their source position.
		 *
		 * @param current Current mdast node in the reference traversal.
		 */
		function collectReferenceNodes(current: Node): void {
			if (current.type === "footnoteDefinition") return;

			if (current.type === "footnoteReference") {
				const reference = current as FootnoteReference;
				const definition = definitions.get(reference.identifier);
				if (!definition) return;

				let entry = entriesByIdentifier.get(reference.identifier);
				if (!entry) {
					entry = { definition, number: entries.length + 1, referenceCount: 0 };
					entriesByIdentifier.set(reference.identifier, entry);
					entries.push(entry);
				}

				entry.referenceCount += 1;
				references.set(reference, { number: entry.number, occurrence: entry.referenceCount });
				return;
			}

			if (isParent(current)) current.children.forEach(collectReferenceNodes);
		}

		collectDefinitionNodes(node);
		collectReferenceNodes(node);

		// The loop grows when a referenced definition introduces another referenced definition.
		for (let index = 0; index < entries.length; index += 1) {
			entries[index]?.definition.children.forEach(collectReferenceNodes);
		}

		return { entries, references };
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

	/** Allows relative, HTTP, and HTTPS image sources while rejecting executable and local-file schemes. */
	function safeImageUrl(url: string | null | undefined) {
		if (!url) return undefined;
		const protocol = url
			.trim()
			.match(/^([a-z][a-z\d+.-]*):/i)?.[1]
			?.toLowerCase();
		if (protocol && !["http", "https"].includes(protocol)) return undefined;
		return url;
	}

	/**
	 * Produces the HTML inserted for one raw mdast node according to the active policy.
	 *
	 * @param value Raw HTML source stored by mdast.
	 * @returns Unchanged trusted HTML or HTML parsed and cleaned with the default GitHub-style schema.
	 */
	function renderHtml(value: string): string {
		if (html === "trusted") return value;
		return toHtml(sanitize(fromHtml(value, { fragment: true })));
	}

	/** Resolves direct and reference images to the native image attributes used by the renderer. */
	function resolveImage(node: Image | ImageReference) {
		const definition = node.type === "imageReference" ? definitions.get(node.identifier) : undefined;

		return {
			src: safeImageUrl(node.type === "image" ? node.url : definition?.url),
			alt: node.alt ?? "",
			title: (node.type === "image" ? node.title : definition?.title) ?? undefined
		};
	}

	/** Detects the introductory paragraph convention used by xvelte documentation. */
	function isIntroduction(nodes: RootContent[], index: number) {
		return leadingIntroduction && index === 1 && nodes[0]?.type === "heading" && nodes[0].depth === 1;
	}

	/**
	 * Returns the stable definition ID for one numbered footnote in this renderer instance.
	 *
	 * @param number One-based rendered footnote number.
	 * @returns Document-unique definition element ID.
	 */
	function footnoteItemId(number: number): string {
		return `${footnotePrefix}-note-${number}`;
	}

	/**
	 * Returns the stable reference ID for one occurrence in this renderer instance.
	 *
	 * @param number One-based rendered footnote number.
	 * @param occurrence One-based occurrence of that footnote reference.
	 * @returns Document-unique inline reference element ID.
	 */
	function footnoteReferenceId(number: number, occurrence: number): string {
		return `${footnotePrefix}-reference-${number}-${occurrence}`;
	}

	let definitions = $derived(collectDefinitions(ast));
	let footnotes = $derived(collectFootnotes(ast));
</script>

{#snippet renderImage(node: Image | ImageReference)}
	{@const image = resolveImage(node)}
	{#if image.src}
		<img data-slot="markdown-image" class="h-auto max-w-full rounded-lg" src={image.src} alt={image.alt} title={image.title} />
	{:else if image.alt}
		<span data-slot="markdown-image-fallback" class="text-muted-foreground">{image.alt}</span>
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
			{@render renderImage(node)}
		{:else if node.type === "footnoteReference"}
			{@const reference = footnotes.references.get(node)}
			{#if reference}
				<Footnote.Reference
					id={footnoteReferenceId(reference.number, reference.occurrence)}
					href={`#${footnoteItemId(reference.number)}`}
					number={reference.number}
				/>
			{:else}
				<span data-slot="markdown-unresolved-footnote">[^{node.label ?? node.identifier}]</span>
			{/if}
		{:else if node.type === "html"}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html renderHtml(node.value)}
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
			{@render renderImage(node)}
		{:else if node.type === "footnoteReference"}
			<Typography.P>{@render renderInline([node])}</Typography.P>
		{:else if node.type === "html"}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html renderHtml(node.value)}
		{:else if node.type !== "definition" && node.type !== "footnoteDefinition" && node.type !== "yaml" && node.type !== "listItem" && node.type !== "tableRow" && node.type !== "tableCell"}
			<Typography.P>{@render renderInline([node])}</Typography.P>
		{/if}
	{/each}
{/snippet}

{@render renderBlocks(ast.children)}

{#if footnotes.entries.length > 0}
	<Footnote.Root>
		<Footnote.List>
			{#each footnotes.entries as entry (entry.number)}
				<Footnote.Item id={footnoteItemId(entry.number)}>
					<div data-slot="markdown-footnote-content" class="flex flex-col gap-4">
						{@render renderBlocks(entry.definition.children)}
					</div>

					<div data-slot="markdown-footnote-back-references" class="mt-1 flex flex-wrap">
						{#each Array.from({ length: entry.referenceCount }).keys() as index (index)}
							<Footnote.BackReference href={`#${footnoteReferenceId(entry.number, index + 1)}`} number={entry.number} occurrence={index + 1} />
						{/each}
					</div>
				</Footnote.Item>
			{/each}
		</Footnote.List>
	</Footnote.Root>
{/if}

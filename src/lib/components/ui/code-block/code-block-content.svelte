<script lang="ts" module>
	import type { Snippet } from "svelte";

	import * as ScrollArea from "$lib/components/ui/scroll-area";

	/** Props accepted by the scrollable or wrapping Code Block content area. */
	export type ContentProps = Omit<ScrollArea.RootProps, "children"> & {
		code?: string | undefined;
		wrap?: boolean | undefined;
		lineNumbers?: boolean | undefined;
		startLine?: number | undefined;
		viewportRef?: HTMLDivElement | null | undefined;
		preRef?: HTMLPreElement | null | undefined;
		viewportProps?: Omit<ScrollArea.ViewportProps, "children" | "ref"> | undefined;
		horizontalScrollbarProps?: ScrollArea.ScrollbarHorizontalProps | undefined;
		verticalScrollbarProps?: ScrollArea.ScrollbarVerticalProps | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import * as CodeBlock from ".";

	let {
		ref = $bindable(null),
		class: className,
		code,
		wrap = false,
		lineNumbers = false,
		startLine = 1,
		viewportRef = $bindable(null),
		preRef = $bindable(null),
		viewportProps,
		horizontalScrollbarProps,
		verticalScrollbarProps,
		children,
		...restProps
	}: ContentProps = $props();

	const viewportClass = $derived(viewportProps?.class);
	const viewportTabindex = $derived(viewportProps?.tabindex ?? 0);
	const viewportRestProps = $derived.by(() => {
		const props = { ...viewportProps };
		delete props.class;
		delete props.tabindex;
		return props;
	});

	// A plain code string becomes individual lines only when the counter needs one DOM row per line.
	const lines = $derived(code !== undefined && lineNumbers ? code.replace(/\n$/, "").split("\n") : null);
</script>

{#snippet content()}
	<code
		data-slot="code-block-code"
		class="grid size-full min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-full"
	>
		{#if lines}
			{#each lines as line, index (index)}
				<CodeBlock.Line code={line} />
			{/each}
		{:else if code !== undefined}
			{code}
		{:else}
			{@render children?.()}
		{/if}
	</code>
{/snippet}

<ScrollArea.Root
	bind:ref
	data-code-block-content=""
	data-wrap={wrap || undefined}
	data-numbered={lineNumbers || undefined}
	class={cn("min-h-0 min-w-0 overflow-hidden", className)}
	{...restProps}
>
	<ScrollArea.Viewport
		bind:ref={viewportRef}
		data-code-block-viewport=""
		tabindex={viewportTabindex}
		class={cn(
			"max-h-[inherit] min-h-0 min-w-0 px-4 py-4 text-start font-mono leading-relaxed outline-none group-has-data-[slot=code-block-footer]/code-block:pb-2 group-has-data-[slot=code-block-header]/code-block:pt-2 group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:py-3 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1.5",
			viewportClass
		)}
		{...viewportRestProps}
	>
		<!-- Whitespace inside pre is rendered, so the snippet is defined outside where Svelte trims structural whitespace. -->
		<pre
			bind:this={preRef}
			data-slot="code-block-content"
			dir="ltr"
			style={`counter-reset: line ${startLine - 1}`}
			class={cn("m-0 size-full min-w-full font-[inherit]", wrap && "wrap-break-word whitespace-pre-wrap")}>{@render content()}</pre>
	</ScrollArea.Viewport>

	<ScrollArea.ScrollbarVertical {...verticalScrollbarProps} />
	<ScrollArea.ScrollbarHorizontal {...horizontalScrollbarProps} />
</ScrollArea.Root>

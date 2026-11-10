<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props accepted by the scrollable or wrapping Code Block content area. */
	export type ContentProps = WithElementRef<HTMLAttributes<HTMLPreElement>> & {
		code?: string | undefined;
		wrap?: boolean | undefined;
		lineNumbers?: boolean | undefined;
		startLine?: number | undefined;
	};
</script>

<script lang="ts">
	import * as CodeBlock from ".";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		style,
		code,
		wrap = false,
		lineNumbers = false,
		startLine = 1,
		tabindex = 0,
		children,
		...restProps
	}: ContentProps = $props();

	// A plain code string becomes individual lines only when the counter needs one DOM row per line.
	const lines = $derived(code !== undefined && lineNumbers ? code.replace(/\n$/, "").split("\n") : null);
</script>

{#snippet content()}
	<code data-slot="code-block-code" class="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0">
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

<!-- Whitespace inside pre is rendered, so the snippet is defined outside where Svelte trims structural whitespace. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<pre
	bind:this={ref}
	data-slot="code-block-content"
	data-wrap={wrap || undefined}
	data-numbered={lineNumbers || undefined}
	dir="ltr"
	{tabindex}
	style={`counter-reset: line ${startLine - 1};${style ?? ""}`}
	class={cn(
		"min-h-0 min-w-0 scroll-fade-x overflow-auto px-4 py-4 text-start font-mono leading-relaxed outline-none group-has-data-[slot=code-block-footer]/code-block:pb-2 group-has-data-[slot=code-block-header]/code-block:pt-2 group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:py-3 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1.5 data-wrap:scroll-fade-y data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap",
		className
	)}
	{...restProps}>{@render content()}</pre>

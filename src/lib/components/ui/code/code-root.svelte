<script lang="ts" module>
	import type { CodeRootProps } from "./types";

	export type RootProps = CodeRootProps;
</script>

<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";

	import { codeVariants } from "./code-variants";
	import { useCode } from "./code.svelte.js";

	let {
		ref = $bindable(null),
		variant = "default",
		lang = "typescript",
		code,
		class: className,
		hideLines = false,
		highlight = [],
		children,
		...rest
	}: RootProps = $props();

	const codeState = useCode({
		code: box.with(() => code.trimEnd()),
		hideLines: box.with(() => hideLines),
		highlight: box.with(() => highlight),
		lang: box.with(() => lang)
	});
</script>

<div {...rest} bind:this={ref} data-slot="code" class={cn(codeVariants({ variant }), className)}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html codeState.highlighted}
	{@render children?.()}
</div>

<style>
	:global(.dark) {
		:global(.shiki, .shiki span) {
			color: var(--shiki-dark) !important;
			font-style: var(--shiki-dark-font-style) !important;
			font-weight: var(--shiki-dark-font-weight) !important;
			text-decoration: var(--shiki-dark-text-decoration) !important;
		}
	}

	:global(pre.shiki) {
		overflow-x: auto;
		border-radius: var(--radius);
		background: inherit;
		padding-block: 1rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:global(pre.shiki:not([data-code-overflow] *):not([data-code-overflow])) {
		overflow-y: auto;
		max-height: min(100%, 650px);
	}

	:global(pre.shiki code) {
		display: grid;
		min-width: 100%;
		border: 0;
		border-radius: 0;
		background: transparent;
		padding: 0;
		overflow-wrap: break-word;
		counter-reset: line;
		box-decoration-break: clone;
	}

	:global(pre.line-numbers) {
		counter-reset: step;
		counter-increment: step 0;
	}

	:global(pre.line-numbers .line::before) {
		content: counter(step);
		counter-increment: step;
		display: inline-block;
		width: 1.8rem;
		margin-right: 1.4rem;
		text-align: right;
	}

	:global(pre.line-numbers .line::before) {
		color: var(--muted-foreground);
	}

	:global(pre .line.line--highlighted) {
		background: var(--secondary);
	}

	:global(pre .line.line--highlighted span) {
		position: relative;
	}

	:global(pre .line) {
		display: inline-block;
		min-height: 1rem;
		width: 100%;
		padding: 0.125rem 1rem;
	}

	:global(pre.line-numbers .line) {
		padding-inline: 0.5rem;
	}
</style>

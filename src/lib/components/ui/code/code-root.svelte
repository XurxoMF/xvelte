<script lang="ts" module>
	import type { WithChildren, WithoutChildren } from "bits-ui";
	import { type VariantProps, tv } from "tailwind-variants";

	import type { RootProps as ScrollAreaRootProps } from "$lib/components/ui/scroll-area";

	import type { LanguageLoader, PlainTextLanguage } from "./shiki";

	export const codeVariants = tv({
		base: "not-prose relative h-full max-h-[650px] overflow-hidden rounded-lg border",
		variants: {
			variant: {
				default: "border-border bg-card",
				secondary: "border-transparent bg-secondary/50"
			}
		}
	});

	export type CodeVariant = VariantProps<typeof codeVariants>["variant"];

	type BaseRootProps = WithChildren<{
		ref?: HTMLDivElement | null | undefined;
		variant?: CodeVariant | undefined;
		code: string;
		class?: string | undefined;
		hideLines?: boolean | undefined;
		highlight?: (number | [number, number])[] | undefined;
	}>;

	/** Props for plain code, which Shiki handles without loading a grammar. */
	export type PlainTextRootProps = BaseRootProps & {
		lang?: PlainTextLanguage | undefined;
		loadLanguage?: never;
	};

	/** Props for syntax-highlighted code loaded on demand. */
	export type HighlightedRootProps = BaseRootProps & {
		lang: string;
		loadLanguage?: LanguageLoader | undefined;
	};

	/** Props accepted by the Code root. */
	export type RootProps = (PlainTextRootProps | HighlightedRootProps) & WithoutChildren<ScrollAreaRootProps>;
</script>

<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";
	import { cn } from "$lib/utils";

	import { setCodeContext } from "./code-context.svelte.js";
	import { resolveLanguage } from "./shiki";

	let {
		ref = $bindable(null),
		variant = "default",
		lang = "text",
		loadLanguage,
		code,
		class: className,
		hideLines = false,
		highlight = [],
		children,
		...restProps
	}: RootProps = $props();

	let resolvedLanguage = $derived(resolveLanguage(lang, loadLanguage));

	const codeState = setCodeContext({
		get code() {
			return code.trimEnd();
		},
		get hideLines() {
			return hideLines;
		},
		get highlight() {
			return highlight;
		},
		get lang() {
			return resolvedLanguage.lang;
		},
		get loadLanguage() {
			return resolvedLanguage.loadLanguage;
		}
	});
</script>

<ScrollArea.Root {...restProps} bind:ref data-slot="code" class={cn(codeVariants({ variant }), className)}>
	<ScrollArea.Viewport class="max-h-[inherit]">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html codeState.highlighted}
	</ScrollArea.Viewport>

	{@render children?.()}

	<ScrollArea.ScrollbarVertical />
	<ScrollArea.ScrollbarHorizontal />
</ScrollArea.Root>

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
		overflow-x: visible;
		border-radius: var(--radius);
		background: inherit;
		padding-block: 1rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:global([data-code-overflow] [data-slot="code"]),
	:global([data-code-overflow] [data-slot="scroll-area-viewport"]) {
		max-height: none;
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

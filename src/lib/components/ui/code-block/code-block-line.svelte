<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";

	import type { WithElementRef } from "$lib/utils";

	export const lineVariants = tv({
		base: "relative block min-h-lh -mx-4 px-4 after:absolute after:start-1 after:top-0 after:select-none after:text-muted-foreground in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:min-w-6 in-data-numbered:before:select-none in-data-numbered:before:text-end in-data-numbered:before:text-muted-foreground in-data-numbered:before:content-[counter(line)] in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_''] group-data-[size=sm]/code-block:-mx-3 group-data-[size=sm]/code-block:px-3",
		variants: {
			variant: {
				default: "",
				added: "bg-muted after:content-['+']",
				removed: "bg-danger/10 after:text-danger after:content-['−']",
				highlighted: "bg-muted"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	/** Visual treatments available for one Code Block line. */
	export type LineVariants = VariantProps<typeof lineVariants>["variant"];

	/** One syntax-highlighted token accepted by a Code Block line. */
	export type LineToken = {
		content: string;
		style?: string | undefined;
		class?: string | undefined;
	};

	/** Props accepted by one plain, diff, highlighted, or tokenized Code Block line. */
	export type LineProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		variant?: LineVariants | undefined;
		code?: string | LineToken[] | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "default", code, children, ...restProps }: LineProps = $props();

	const newline = "\n";
</script>

<!-- An empty line owns a newline so copying a selection preserves blank lines. -->
<span bind:this={ref} data-slot="code-block-line" data-variant={variant} class={cn(lineVariants({ variant }), className)} {...restProps}>
	<span data-slot="code-block-line-content" class="min-w-0">
		{#if typeof code === "string"}
			{code || newline}
		{:else if code?.length}
			{#each code as token, index (index)}
				<span style={token.style} class={token.class}>{token.content}</span>
			{/each}
		{:else if code}
			{newline}
		{:else if children}
			{@render children()}
		{:else}
			{newline}
		{/if}
	</span>
</span>

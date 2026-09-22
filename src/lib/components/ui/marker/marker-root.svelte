<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	/** Generates Marker layout classes for the selected visual treatment. */
	export const rootVariants = tv({
		base: "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground [&_svg:not([class*='size-'])]:size-4",
		variants: {
			variant: {
				default: "",
				separator:
					"before:me-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ms-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
				border: "border-b border-border pb-2"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	/** Available Marker visual treatments. */
	export type RootVariants = VariantProps<typeof rootVariants>["variant"];
	/** Props for the native or delegated Marker root. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: RootVariants | undefined;
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "default", child, ...restProps }: RootProps = $props();

	const mergedProps = $derived({
		class: cn(rootVariants({ variant }), className),
		"data-slot": "marker",
		"data-variant": variant,
		...restProps
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render mergedProps.children?.()}
	</div>
{/if}

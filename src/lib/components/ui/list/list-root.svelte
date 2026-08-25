<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes, HTMLOlAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	/** Builds the Root indentation, marker, spacing, and caller-supplied classes. */
	export const rootVariants = tv({
		base: "ms-6",
		variants: {
			variant: {
				ordered: "list-decimal",
				unordered: "list-disc"
			},
			spacing: {
				default: "[&>li]:mt-2",
				compact: "[&>li]:mt-1",
				none: "[&>li]:mt-0"
			}
		},
		defaultVariants: {
			variant: "unordered",
			spacing: "default"
		}
	});

	/** Semantic element variants rendered by Root. */
	export type RootVariants = VariantProps<typeof rootVariants>["variant"];

	/** Vertical spacing options applied to direct list items. */
	export type RootSpacings = VariantProps<typeof rootVariants>["spacing"];

	type RootElement = HTMLOListElement | HTMLUListElement;
	type OrderedAttributes = Pick<HTMLOlAttributes, "reversed" | "start" | "type">;

	/** Props for the semantic ordered or unordered list root. */
	export type RootProps = WithElementRef<HTMLAttributes<RootElement> & OrderedAttributes, RootElement> & {
		variant?: RootVariants | undefined;
		spacing?: RootSpacings | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		variant = "unordered",
		spacing = "default",
		reversed,
		start,
		type,
		class: className,
		children,
		...restProps
	}: RootProps = $props();

	const orderedProps = $derived(variant === "ordered" ? { reversed, start, type } : {});
</script>

<svelte:element
	this={variant === "ordered" ? "ol" : "ul"}
	{...restProps}
	{...orderedProps}
	bind:this={ref}
	data-slot="list"
	data-variant={variant}
	data-spacing={spacing}
	class={cn(rootVariants({ variant, spacing }), className)}
>
	{@render children?.()}
</svelte:element>

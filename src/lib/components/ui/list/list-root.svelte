<script lang="ts" module>
	import type { HTMLAttributes, HTMLOlAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Semantic element variants rendered by Root. */
	export type RootVariants = "ordered" | "unordered";

	/** Vertical spacing options applied to direct list items. */
	export type RootSpacings = "default" | "compact" | "none";

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

	const spacingClass = $derived(spacing === "compact" ? "[&>li]:mt-1" : spacing === "none" ? "[&>li]:mt-0" : "[&>li]:mt-2");
	const rootClass = $derived(cn("ms-6", variant === "ordered" ? "list-decimal" : "list-disc", spacingClass, className));
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
	class={rootClass}
>
	{@render children?.()}
</svelte:element>

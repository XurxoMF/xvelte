<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	/** Generates the placement classes for Bubble reactions. */
	export const reactionsVariants = tv({
		base: "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card has-[button]:p-0",
		variants: {
			side: {
				top: "top-0 -translate-y-3/4",
				bottom: "bottom-0 translate-y-3/4"
			},
			align: {
				start: "start-3",
				end: "end-3"
			}
		},
		defaultVariants: {
			side: "bottom",
			align: "end"
		}
	});

	/** Available vertical reaction anchors. */
	export type ReactionsSides = VariantProps<typeof reactionsVariants>["side"];
	/** Available logical reaction alignments. */
	export type ReactionsAlignments = VariantProps<typeof reactionsVariants>["align"];
	/** Props for a Bubble reaction row. */
	export type ReactionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: ReactionsSides | undefined;
		align?: ReactionsAlignments | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, side = "bottom", align = "end", children, ...restProps }: ReactionsProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="bubble-reactions"
	data-side={side}
	data-align={align}
	class={cn(reactionsVariants({ side, align }), className)}
	{...restProps}
>
	{@render children?.()}
</div>

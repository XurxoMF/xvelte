<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	/** Generates the root layout classes for the selected size and orientation. */
	export const rootVariants = tv({
		base: "group/attachment relative flex max-w-full min-w-0 shrink-0 flex-wrap rounded-xl border border-border bg-card text-card-foreground transition-colors focus-within:ring-1 focus-within:ring-ring/50 has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-danger/30 data-[state=idle]:border-dashed",
		variants: {
			size: {
				default:
					"gap-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
				sm: "gap-2.5 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
				xs: "gap-1.5 rounded-lg text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1"
			},
			orientation: {
				horizontal: "min-w-40 items-center",
				vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-30"
			}
		},
		defaultVariants: {
			size: "default",
			orientation: "horizontal"
		}
	});

	/** Available attachment root sizes. */
	export type RootSizes = VariantProps<typeof rootVariants>["size"];
	/** Available attachment root layouts. */
	export type RootOrientations = VariantProps<typeof rootVariants>["orientation"];
	/** Upload lifecycle states exposed through the root's `data-state` attribute. */
	export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

	/** Props for the Attachment root. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		state?: AttachmentState | undefined;
		size?: RootSizes | undefined;
		orientation?: RootOrientations | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		state = "done",
		size = "default",
		orientation = "horizontal",
		children,
		...restProps
	}: RootProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="attachment"
	data-state={state}
	data-size={size}
	data-orientation={orientation}
	class={cn(rootVariants({ size, orientation }), className)}
	{...restProps}
>
	{@render children?.()}
</div>

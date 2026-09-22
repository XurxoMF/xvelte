<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	/** Generates media classes for icon and image previews. */
	export const mediaVariants = tv({
		base: "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-md group-data-[orientation=vertical]/attachment:w-full group-data-[state=error]/attachment:bg-danger/10 group-data-[state=error]/attachment:text-danger [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6!",
		variants: {
			variant: {
				icon: "",
				image:
					"opacity-60 group-data-[state=idle]/attachment:opacity-100 group-data-[state=done]/attachment:opacity-100 [&_img]:aspect-square [&_img]:w-full [&_img]:object-cover"
			}
		},
		defaultVariants: {
			variant: "icon"
		}
	});

	/** Available attachment media presentations. */
	export type MediaVariants = VariantProps<typeof mediaVariants>["variant"];

	/** Props for Attachment media. */
	export type MediaProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: MediaVariants | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "icon", children, ...restProps }: MediaProps = $props();
</script>

<div bind:this={ref} data-slot="attachment-media" data-variant={variant} class={cn(mediaVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</div>

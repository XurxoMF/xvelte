<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	export const mediaVariants = tv({
		base: "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-transparent",
				icon: "bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-4"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	export type MediaVariants = VariantProps<typeof mediaVariants>["variant"];

	export type MediaProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: MediaVariants | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, variant = "default", ...restProps }: MediaProps = $props();
</script>

<div bind:this={ref} data-slot="empty-icon" data-variant={variant} class={cn(mediaVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</div>

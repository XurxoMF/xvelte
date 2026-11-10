<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";

	import type { WithElementRef } from "$lib/utils";

	export const rootVariants = tv({
		base: "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-lg text-sm data-[size=sm]:text-xs has-[>[data-slot=code-block-content]:focus-visible]:ring-3 has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50",
		variants: {
			variant: {
				default: "border border-input text-foreground dark:bg-input/30 has-[>[data-slot=code-block-content]:focus-visible]:border-ring",
				destructive: "border border-danger/30 text-danger dark:border-danger/40"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	/** Visual treatments available for a Code Block root. */
	export type RootVariants = VariantProps<typeof rootVariants>["variant"];

	/** Density options available for a Code Block root. */
	export type RootSizes = "default" | "sm";

	/** Props accepted by the Code Block root container. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: RootVariants | undefined;
		size?: RootSizes | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "default", size = "default", children, ...restProps }: RootProps = $props();
</script>

<div bind:this={ref} data-slot="code-block" data-variant={variant} data-size={size} class={cn(rootVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</div>

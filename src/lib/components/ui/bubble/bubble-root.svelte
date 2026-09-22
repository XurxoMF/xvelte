<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	/** Generates the root classes for a Bubble visual treatment. */
	export const rootVariants = tv({
		base: "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 data-[align=end]:self-end data-[variant=ghost]:max-w-full group-data-[align=end]/message:self-end",
		variants: {
			variant: {
				default:
					"*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
				secondary:
					"*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
				muted:
					"*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
				tinted:
					"*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
				outline:
					"*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
				ghost:
					"border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50",
				danger:
					"*:data-[slot=bubble-content]:bg-danger/10 *:data-[slot=bubble-content]:text-danger [&>[data-slot=bubble-content]:is(button,a):hover]:bg-danger/20 dark:*:data-[slot=bubble-content]:bg-danger/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-danger/30"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	/** Available Bubble visual treatments. */
	export type RootVariants = VariantProps<typeof rootVariants>["variant"];
	/** Available logical Bubble alignments. */
	export type RootAlignments = "start" | "end";
	/** Props for the Bubble root. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: RootVariants | undefined;
		align?: RootAlignments | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "default", align = "start", children, ...restProps }: RootProps = $props();
</script>

<div bind:this={ref} data-slot="bubble" data-variant={variant} data-align={align} class={cn(rootVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</div>

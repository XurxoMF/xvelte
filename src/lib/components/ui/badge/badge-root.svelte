<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAnchorAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	export const rootVariants = tv({
		base: "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors [&>svg]:pointer-events-none",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
				secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
				danger: "bg-danger/10 text-danger [a]:hover:bg-danger/20 focus-visible:ring-danger/20 dark:bg-danger/20 dark:focus-visible:ring-danger/40",
				warning:
					"bg-warning/10 text-warning [a]:hover:bg-warning/20 focus-visible:ring-warning/20 dark:bg-warning/20 dark:focus-visible:ring-warning/40",
				success:
					"bg-success/10 text-success [a]:hover:bg-success/20 focus-visible:ring-success/20 dark:bg-success/20 dark:focus-visible:ring-success/40",
				info: "bg-info/10 text-info [a]:hover:bg-info/20 focus-visible:ring-info/20 dark:bg-info/20 dark:focus-visible:ring-info/40",
				important:
					"bg-important/10 text-important [a]:hover:bg-important/20 focus-visible:ring-important/20 dark:bg-important/20 dark:focus-visible:ring-important/40",
				outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
				ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
				link: "text-primary underline-offset-4 hover:underline"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	export type RootVariants = VariantProps<typeof rootVariants>["variant"];

	export type RootProps = WithElementRef<HTMLAnchorAttributes> & {
		variant?: RootVariants | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), href, class: className, variant = "default", children, ...restProps }: RootProps = $props();
</script>

<svelte:element this={href ? "a" : "span"} bind:this={ref} data-slot="badge" {href} class={cn(rootVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</svelte:element>

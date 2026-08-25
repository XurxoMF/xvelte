<script lang="ts" module>
	import { tv } from "tailwind-variants";

	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import type { WithElementRef } from "$lib/utils";

	export const rootVariants = tv({
		base: "rounded-full",
		variants: {
			variant: {
				default: "bg-primary text-primary",
				success: "bg-emerald-500 text-emerald-500",
				warning: "bg-amber-500 text-amber-500",
				error: "bg-rose-500 text-rose-500",
				info: "bg-sky-500 text-sky-500",
				muted: "bg-muted-foreground/50 text-muted-foreground/50"
			},
			size: {
				sm: "h-2 w-2",
				md: "h-3 w-3",
				lg: "h-4 w-4"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "md"
		}
	});

	export type RootVariants = VariantProps<typeof rootVariants>["variant"];
	export type RootSizes = VariantProps<typeof rootVariants>["size"];
	export type RootProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		variant?: RootVariants | undefined;
		size?: RootSizes | undefined;
		pulse?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "default", size = "md", pulse = false, ...restProps }: RootProps = $props();
</script>

<span
	bind:this={ref}
	class={cn("relative flex items-center justify-center", rootVariants({ size }), className)}
	data-slot="status-dot"
	{...restProps}
>
	{#if pulse}
		<span class={cn("absolute inline-flex size-full animate-ping rounded-full opacity-75", rootVariants({ variant, size: undefined }))}></span>
	{/if}
	<span class={cn("relative inline-flex rounded-full", rootVariants({ variant, size }))}></span>
</span>

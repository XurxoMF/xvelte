<script lang="ts" module>
	import { Select as SelectPrimitive } from "bits-ui";

	import type { WithoutChild } from "$lib/utils";

	export type TriggerProps = WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: "sm" | "default" | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { SelectorIcon } from "$lib/icons";

	let { ref = $bindable(null), class: className, children, size = "default", ...restProps }: TriggerProps = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		"flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<SelectorIcon class="pointer-events-none size-4 text-muted-foreground" />
</SelectPrimitive.Trigger>

<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	export type NextButtonProps = RangeCalendarPrimitive.NextButtonProps & {
		variant?: Button.RootVariants | undefined;
	};
</script>

<script lang="ts">
	import { ChevronRightIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, variant = "ghost", ...restProps }: NextButtonProps = $props();
</script>

{#snippet Fallback()}
	<ChevronRightIcon class="size-4" />
{/snippet}

<RangeCalendarPrimitive.NextButton
	bind:ref
	class={cn(Button.rootVariants({ variant }), "size-(--cell-size) bg-transparent p-0 select-none disabled:opacity-50 rtl:rotate-180", className)}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{@render Fallback()}
	{/if}
</RangeCalendarPrimitive.NextButton>

<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	export type PrevButtonProps = CalendarPrimitive.PrevButtonProps & {
		variant?: Button.RootVariants | undefined;
	};
</script>

<script lang="ts">
	import { ChevronLeftIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, variant = "ghost", ...restProps }: PrevButtonProps = $props();
</script>

{#snippet Fallback()}
	<ChevronLeftIcon class="size-4" />
{/snippet}

<CalendarPrimitive.PrevButton
	bind:ref
	data-slot="calendar-prev-button"
	class={cn(Button.rootVariants({ variant }), "size-(--cell-size) bg-transparent p-0 select-none disabled:opacity-50 rtl:rotate-180", className)}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{@render Fallback()}
	{/if}
</CalendarPrimitive.PrevButton>

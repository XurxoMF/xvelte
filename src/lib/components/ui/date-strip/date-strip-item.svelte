<script lang="ts" module>
	import type { DateValue } from "@internationalized/date";

	export type ItemProps = { date: DateValue; class?: string | undefined };
</script>

<script lang="ts">
	import { getLocalTimeZone, isToday } from "@internationalized/date";
	import { DateFormatter } from "@internationalized/date";

	import { cn } from "$lib/utils";
	import * as Button from "$lib/components/ui/button";

	import { getDateStripContext } from "./date-strip-context";

	let { date, class: className }: ItemProps = $props();

	const ctx = getDateStripContext();
	const formatterMonth = new DateFormatter("en-US", { month: "short" });
	const formatterDay = new DateFormatter("en-US", { day: "numeric" });

	let isSelected = $derived(ctx.selectedValue?.compare(date) === 0);
	let isDisabled = $derived(ctx.isDateDisabled(date));
	let direction = $derived(ctx.direction);

	/** Selects this date unless the root has marked it as disabled. */
	function handleClick() {
		if (!isDisabled) {
			ctx.onSelect(date);
		}
	}

	const dateObj = $derived(date.toDate("UTC"));
</script>

<Button.Root
	data-slot="date-strip-item"
	variant="ghost"
	onclick={handleClick}
	class={cn(
		"flex animate-in flex-col items-center justify-center -space-y-1 fade-in-5",
		"h-12 w-12 shrink-0 rounded-lg",
		direction === "end" ? "slide-in-from-right-12" : "slide-in-from-left-12",
		isToday(date, getLocalTimeZone()) && "bg-accent",
		isSelected && "bg-primary text-primary-foreground",
		className
	)}
	disabled={isDisabled}
>
	<span class="text-[8px] font-medium uppercase opacity-70">
		{formatterMonth.format(dateObj)}
	</span>
	<span class="text-base leading-none font-bold">
		{formatterDay.format(dateObj)}
	</span>
</Button.Root>

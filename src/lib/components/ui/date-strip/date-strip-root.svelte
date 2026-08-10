<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { DateValue } from "@internationalized/date";
	export type RootProps = {
		value?: DateValue | undefined;
		class?: string | undefined;
		daysToShow?: number | undefined;
		isDateDisabled?: ((date: DateValue) => boolean) | undefined;
		onDateChange?: ((date: DateValue) => void) | undefined;
		children: Snippet<[{ date: DateValue }]>;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { setDateStripContext } from "./date-strip-context";
	import * as Button from "$lib/components/ui/button";
	import { ChevronLeftIcon, ChevronRightIcon } from "$lib/icons";
	import { getLocalTimeZone, today, startOfWeek } from "@internationalized/date";

	let { value = $bindable(), class: className, daysToShow = 5, isDateDisabled = () => false, onDateChange, children }: RootProps = $props();

	let startDate = $state(startOfWeek(today(getLocalTimeZone()), "en-US"));
	let slideDirection = $state<"start" | "end">("end");

	const displayedDates = $derived(Array.from({ length: daysToShow }, (_, i) => startDate.add({ days: i })));

	/** Moves the visible date window backward by its displayed day count. */
	function handlePrev() {
		slideDirection = "start";
		startDate = startDate.add({ days: -daysToShow });
	}

	/** Moves the visible date window forward by its displayed day count. */
	function handleNext() {
		slideDirection = "end";
		startDate = startDate.add({ days: daysToShow });
	}

	setDateStripContext({
		selectedValue: () => value,
		onSelect: (d) => {
			value = d;
			onDateChange?.(d);
		},
		isDateDisabled: (date) => isDateDisabled(date),
		direction: () => slideDirection
	});
</script>

<div class={cn("flex items-center gap-2 rounded-xl border bg-card p-1 shadow-sm", className)} data-slot="date-strip">
	<Button.Root variant="ghost" size="icon" class="h-7 w-7 shrink-0" onclick={handlePrev}>
		<ChevronLeftIcon class="h-4 w-4" />
	</Button.Root>

	<div class="flex flex-1 justify-between gap-1 overflow-hidden">
		{#each displayedDates as date (date.toString())}
			{@render children({ date })}
		{/each}
	</div>

	<Button.Root variant="ghost" size="icon" class="h-7 w-7 shrink-0" onclick={handleNext}>
		<ChevronRightIcon class="h-4 w-4" />
	</Button.Root>
</div>

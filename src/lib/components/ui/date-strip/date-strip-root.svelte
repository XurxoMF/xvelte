<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { DateValue } from "@internationalized/date";

	export type RootProps = {
		value?: DateValue | undefined;
		class?: string | undefined;
		/** Locale used for the initial week boundary and visible date labels. */
		locale?: string | undefined;
		daysToShow?: number | undefined;
		isDateDisabled?: ((date: DateValue) => boolean) | undefined;
		onDateChange?: ((date: DateValue) => void) | undefined;
		children: Snippet<[{ date: DateValue }]>;
	};
</script>

<script lang="ts">
	import { getLocalTimeZone, today, startOfWeek } from "@internationalized/date";

	import { getLocale } from "$lib/paraglide/runtime";
	import { cn } from "$lib/utils";
	import * as Button from "$lib/components/ui/button";
	import { ChevronLeftIcon, ChevronRightIcon } from "$lib/icons";

	import { setDateStripContext } from "./date-strip-context";

	let {
		value = $bindable(),
		class: className,
		locale = getLocale(),
		daysToShow = 5,
		isDateDisabled = () => false,
		onDateChange,
		children
	}: RootProps = $props();

	let dayOffset = $state(0);
	let slideDirection = $state<"start" | "end">("end");

	const startDate = $derived(startOfWeek(today(getLocalTimeZone()), locale).add({ days: dayOffset }));
	const displayedDates = $derived(Array.from({ length: daysToShow }, (_, i) => startDate.add({ days: i })));

	/** Moves the visible date window backward by its displayed day count. */
	function handlePrev() {
		slideDirection = "start";
		dayOffset -= daysToShow;
	}

	/** Moves the visible date window forward by its displayed day count. */
	function handleNext() {
		slideDirection = "end";
		dayOffset += daysToShow;
	}

	/** Selects a date and notifies the root consumer. */
	function handleSelect(date: DateValue) {
		value = date;
		onDateChange?.(date);
	}

	setDateStripContext({
		get selectedValue() {
			return value;
		},
		get locale() {
			return locale;
		},
		onSelect: handleSelect,
		get isDateDisabled() {
			return isDateDisabled;
		},
		get direction() {
			return slideDirection;
		}
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

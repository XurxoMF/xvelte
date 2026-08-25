<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	import type { Snippet } from "svelte";
	import type { DateValue } from "@internationalized/date";
	import type { WithoutChildrenOrChild } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";

	export type RootProps = WithoutChildrenOrChild<RangeCalendarPrimitive.RootProps> & {
		buttonVariant?: Button.RootVariants | undefined;
		captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label" | undefined;
		months?: RangeCalendarPrimitive.MonthSelectProps["months"] | undefined;
		years?: RangeCalendarPrimitive.YearSelectProps["years"] | undefined;
		monthFormat?: RangeCalendarPrimitive.MonthSelectProps["monthFormat"] | undefined;
		yearFormat?: RangeCalendarPrimitive.YearSelectProps["yearFormat"] | undefined;
		day?: Snippet<[{ day: DateValue; outsideMonth: boolean }]> | undefined;
	};
</script>

<script lang="ts">
	import { isEqualMonth } from "@internationalized/date";

	import * as CalendarRange from ".";

	import { getLocale } from "$lib/paraglide/runtime";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(),
		placeholder = $bindable(),
		weekdayFormat = "short",
		class: className,
		buttonVariant = "ghost",
		captionLayout = "label",
		locale = getLocale(),
		months: monthsProp,
		years,
		monthFormat: monthFormatProp,
		yearFormat = "numeric",
		day,
		disableDaysOutsideMonth = false,
		...restProps
	}: RootProps = $props();

	// Dropdown captions stay compact unless the consumer explicitly selects another format.
	const monthFormat = $derived.by(() => {
		if (monthFormatProp) return monthFormatProp;
		if (captionLayout.startsWith("dropdown")) return "short";
		return "long";
	});
</script>

<RangeCalendarPrimitive.Root
	bind:ref
	bind:value
	bind:placeholder
	data-slot="calendar-range"
	{weekdayFormat}
	{disableDaysOutsideMonth}
	class={cn(
		"group/calendar w-fit max-w-full bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
		className
	)}
	{locale}
	{monthFormat}
	{yearFormat}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<CalendarRange.Months>
			<CalendarRange.Nav>
				<CalendarRange.PrevButton variant={buttonVariant} />
				<CalendarRange.NextButton variant={buttonVariant} />
			</CalendarRange.Nav>
			{#each months as month, monthIndex (month)}
				<CalendarRange.Month>
					<CalendarRange.Header>
						<CalendarRange.Caption
							{captionLayout}
							months={monthsProp}
							{monthFormat}
							{years}
							{yearFormat}
							month={month.value}
							bind:placeholder
							{locale}
							{monthIndex}
						/>
					</CalendarRange.Header>

					<CalendarRange.Grid>
						<CalendarRange.GridHead>
							<CalendarRange.GridRow class="select-none">
								{#each weekdays as weekday (weekday)}
									<CalendarRange.HeadCell>
										{weekday.slice(0, 2)}
									</CalendarRange.HeadCell>
								{/each}
							</CalendarRange.GridRow>
						</CalendarRange.GridHead>
						<CalendarRange.GridBody>
							{#each month.weeks as weekDates (weekDates)}
								<CalendarRange.GridRow>
									{#each weekDates as date (date)}
										<CalendarRange.Cell {date} month={month.value}>
											{#if day}
												{@render day({
													day: date,
													outsideMonth: !isEqualMonth(date, month.value)
												})}
											{:else}
												<CalendarRange.Day />
											{/if}
										</CalendarRange.Cell>
									{/each}
								</CalendarRange.GridRow>
							{/each}
						</CalendarRange.GridBody>
					</CalendarRange.Grid>
				</CalendarRange.Month>
			{/each}
		</CalendarRange.Months>
	{/snippet}
</RangeCalendarPrimitive.Root>

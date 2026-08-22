<script lang="ts" module>
	import type { DateValue } from "@internationalized/date";

	import * as CalendarRange from ".";

	export type CaptionProps = {
		captionLayout: CalendarRange.RootProps["captionLayout"];
		months: CalendarRange.MonthSelectProps["months"];
		monthFormat: CalendarRange.MonthSelectProps["monthFormat"];
		years: CalendarRange.YearSelectProps["years"];
		yearFormat: CalendarRange.YearSelectProps["yearFormat"];
		month: DateValue;
		placeholder: DateValue | undefined;
		locale: string;
		monthIndex: number;
	};
</script>

<script lang="ts">
	import { DateFormatter, getLocalTimeZone } from "@internationalized/date";

	let { captionLayout, months, monthFormat, years, yearFormat, month, locale, placeholder = $bindable(), monthIndex = 0 }: CaptionProps = $props();

	/** @param date - Calendar date whose year should use the configured formatter. */
	function formatYear(date: DateValue) {
		const dateObj = date.toDate(getLocalTimeZone());
		if (typeof yearFormat === "function") return yearFormat(dateObj.getFullYear());
		return new DateFormatter(locale, { year: yearFormat }).format(dateObj);
	}

	/** @param date - Calendar date whose month should use the configured formatter. */
	function formatMonth(date: DateValue) {
		const dateObj = date.toDate(getLocalTimeZone());
		if (typeof monthFormat === "function") return monthFormat(dateObj.getMonth() + 1);
		return new DateFormatter(locale, { month: monthFormat }).format(dateObj);
	}
</script>

{#snippet MonthSelect()}
	<CalendarRange.MonthSelect
		{months}
		{monthFormat}
		value={month.month}
		onchange={(e) => {
			if (!placeholder) return;
			const v = Number.parseInt(e.currentTarget.value);
			const newPlaceholder = placeholder.set({ month: v });
			placeholder = newPlaceholder.subtract({ months: monthIndex });
		}}
	/>
{/snippet}

{#snippet YearSelect()}
	<CalendarRange.YearSelect {years} {yearFormat} value={month.year} />
{/snippet}

{#if captionLayout === "dropdown"}
	{@render MonthSelect()}
	{@render YearSelect()}
{:else if captionLayout === "dropdown-months"}
	{@render MonthSelect()}
	{#if placeholder}
		{formatYear(placeholder)}
	{/if}
{:else if captionLayout === "dropdown-years"}
	{#if placeholder}
		{formatMonth(placeholder)}
	{/if}
	{@render YearSelect()}
{:else}
	{formatMonth(month)} {formatYear(month)}
{/if}

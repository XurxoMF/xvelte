<script lang="ts">
	import { getLocalTimeZone, today } from "@internationalized/date";
	import type { DateRange } from "bits-ui";

	import * as RangeCalendar from "$lib/components/ui/range-calendar";

	const start = today(getLocalTimeZone());
	let value = $state<DateRange>({
		start,
		end: start.add({ days: 6 })
	});
</script>

<RangeCalendar.Root bind:value calendarLabel="Travel dates" class="rounded-lg border shadow-sm" />

<p class="mt-2 text-sm">
	{value.start?.toString() ?? "No start date"} – {value.end?.toString() ?? "No end date"}
</p>

<script lang="ts">
	import { getLocalTimeZone, today } from "@internationalized/date";
	import type { DateRange } from "bits-ui";

	import * as Field from "$lib/components/ui/field";
	import * as CalendarRange from "$lib/components/ui/calendar-range";

	const start = today(getLocalTimeZone());
	let value = $state<DateRange>({
		start,
		end: start.add({ days: 6 })
	});
</script>

<Field.Field>
	<Field.Title>Travel dates</Field.Title>

	<CalendarRange.Root
		bind:value
		calendarLabel="Travel dates"
		class="w-full rounded-lg border shadow-sm"
		aria-describedby="travel-dates-description"
	/>

	<Field.Description id="travel-dates-description">
		{value.start?.toString() ?? "No start date"} – {value.end?.toString() ?? "No end date"}.
	</Field.Description>
</Field.Field>

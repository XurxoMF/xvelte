<script lang="ts">
	import { getLocalTimeZone, today } from "@internationalized/date";

	import type { DateValue } from "@internationalized/date";

	import * as Calendar from "$lib/components/ui/calendar";
	import * as Field from "$lib/components/ui/field";

	let value = $state<DateValue | undefined>(today(getLocalTimeZone()));
</script>

<Field.Field>
	<Field.Title>Appointment date</Field.Title>

	<Calendar.Root
		type="single"
		bind:value
		calendarLabel="Appointment date"
		class="w-full rounded-lg border shadow-sm"
		aria-describedby="appointment-date-description"
	/>

	<Field.Description id="appointment-date-description">Selected date: {value?.toString() ?? "No date selected"}.</Field.Description>
</Field.Field>

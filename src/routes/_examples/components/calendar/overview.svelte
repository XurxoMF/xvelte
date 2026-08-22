<script lang="ts">
	import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

	import * as Calendar from "$lib/components/ui/calendar";

	let value = $state<DateValue | undefined>(today(getLocalTimeZone()));
</script>

<Calendar.Root type="single" bind:value calendarLabel="Appointment date" class="rounded-lg border shadow-sm" />

<p class="mt-2 text-sm">Selected: {value?.toString() ?? "No date selected"}</p>

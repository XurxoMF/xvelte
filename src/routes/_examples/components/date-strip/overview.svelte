<script lang="ts">
	import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

	import * as DateStrip from "$lib/components/ui/date-strip";

	let selectedDate = $state<DateValue>(today(getLocalTimeZone()));
</script>

<DateStrip.Root bind:value={selectedDate}>
	{#snippet children({ date })}
		<DateStrip.Item {date} />
	{/snippet}
</DateStrip.Root>

<p class="text-sm">Selected date: {selectedDate.toString()}</p>

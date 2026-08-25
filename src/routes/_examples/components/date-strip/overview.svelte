<script lang="ts">
	import { getLocalTimeZone, today } from "@internationalized/date";

	import type { DateValue } from "@internationalized/date";

	import * as DateStrip from "$lib/components/ui/date-strip";
	import * as Field from "$lib/components/ui/field";

	let selectedDate = $state<DateValue>(today(getLocalTimeZone()));
</script>

<Field.Field>
	<Field.Title>Delivery date</Field.Title>

	<DateStrip.Root bind:value={selectedDate}>
		{#snippet children({ date })}
			<DateStrip.Item {date} />
		{/snippet}
	</DateStrip.Root>

	<Field.Description>Selected date: {selectedDate.toString()}.</Field.Description>
</Field.Field>

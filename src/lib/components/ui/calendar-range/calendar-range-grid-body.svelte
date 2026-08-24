<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	export type GridBodyProps = RangeCalendarPrimitive.GridBodyProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: GridBodyProps = $props();
</script>

<RangeCalendarPrimitive.GridBody bind:ref data-slot="calendar-range-grid-body" {...restProps} />

<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	export type GridHeadProps = RangeCalendarPrimitive.GridHeadProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: GridHeadProps = $props();
</script>

<RangeCalendarPrimitive.GridHead bind:ref {...restProps} />

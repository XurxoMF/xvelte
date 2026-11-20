<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	export type GridRowProps = RangeCalendarPrimitive.GridRowProps;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, ...restProps }: GridRowProps = $props();
</script>

<RangeCalendarPrimitive.GridRow bind:ref data-slot="calendar-range-grid-row" class={cn(className)} {...restProps} />

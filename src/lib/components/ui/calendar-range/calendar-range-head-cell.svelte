<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	export type HeadCellProps = RangeCalendarPrimitive.HeadCellProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: HeadCellProps = $props();
</script>

<RangeCalendarPrimitive.HeadCell
	bind:ref
	data-slot="calendar-range-head-cell"
	class={cn("w-1/7 rounded-md text-[0.8rem] font-normal text-muted-foreground", className)}
	{...restProps}
/>

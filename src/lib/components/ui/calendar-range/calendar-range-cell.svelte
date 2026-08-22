<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	export type CellProps = RangeCalendarPrimitive.CellProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: CellProps = $props();
</script>

<RangeCalendarPrimitive.Cell
	bind:ref
	class={cn(
		"relative h-(--cell-size) w-1/7 p-0 text-center text-sm focus-within:z-20 has-data-range-end:rounded-e-(--cell-radius) has-data-range-middle:rounded-none has-data-range-middle:bg-accent has-data-range-start:rounded-s-(--cell-radius) has-data-selected:bg-accent dark:has-data-range-end:hover:bg-accent dark:has-data-range-middle:hover:bg-accent/50 dark:has-data-range-start:hover:bg-accent",
		className
	)}
	{...restProps}
/>

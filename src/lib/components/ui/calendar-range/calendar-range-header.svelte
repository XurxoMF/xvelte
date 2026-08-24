<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	export type HeaderProps = RangeCalendarPrimitive.HeaderProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: HeaderProps = $props();
</script>

<RangeCalendarPrimitive.Header
	bind:ref
	data-slot="calendar-range-header"
	class={cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", className)}
	{...restProps}
/>

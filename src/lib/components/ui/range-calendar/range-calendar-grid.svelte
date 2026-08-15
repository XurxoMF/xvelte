<script lang="ts" module>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";

	export type GridProps = RangeCalendarPrimitive.GridProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: GridProps = $props();
</script>

<RangeCalendarPrimitive.Grid bind:ref class={cn("mt-4 flex w-full border-collapse flex-col gap-1", className)} {...restProps} />

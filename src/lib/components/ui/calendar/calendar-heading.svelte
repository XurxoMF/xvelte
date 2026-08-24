<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type HeadingProps = CalendarPrimitive.HeadingProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: HeadingProps = $props();
</script>

<CalendarPrimitive.Heading bind:ref data-slot="calendar-heading" class={cn("px-(--cell-size) text-sm font-medium", className)} {...restProps} />

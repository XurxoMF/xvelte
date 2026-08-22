<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type HeadCellProps = CalendarPrimitive.HeadCellProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: HeadCellProps = $props();
</script>

<CalendarPrimitive.HeadCell bind:ref class={cn("w-1/7 rounded-md text-[0.8rem] font-normal text-muted-foreground", className)} {...restProps} />

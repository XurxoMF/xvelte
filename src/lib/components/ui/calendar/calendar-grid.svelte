<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type GridProps = CalendarPrimitive.GridProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: GridProps = $props();
</script>

<CalendarPrimitive.Grid bind:ref class={cn("w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-1", className)} {...restProps} />

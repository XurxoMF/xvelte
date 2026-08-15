<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type GridHeadProps = CalendarPrimitive.GridHeadProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: GridHeadProps = $props();
</script>

<CalendarPrimitive.GridHead bind:ref class={cn(className)} {...restProps} />

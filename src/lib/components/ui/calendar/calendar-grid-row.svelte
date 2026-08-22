<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type GridRowProps = CalendarPrimitive.GridRowProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: GridRowProps = $props();
</script>

<CalendarPrimitive.GridRow bind:ref class={cn(className)} {...restProps} />

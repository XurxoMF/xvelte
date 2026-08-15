<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type GridBodyProps = CalendarPrimitive.GridBodyProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: GridBodyProps = $props();
</script>

<CalendarPrimitive.GridBody bind:ref class={cn(className)} {...restProps} />

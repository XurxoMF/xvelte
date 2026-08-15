<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type GridProps = CalendarPrimitive.GridProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: GridProps = $props();
</script>

<CalendarPrimitive.Grid bind:ref class={cn("flex w-full border-collapse flex-col", className)} {...restProps} />

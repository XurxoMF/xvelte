<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	export type HeaderProps = CalendarPrimitive.HeaderProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: HeaderProps = $props();
</script>

<CalendarPrimitive.Header
	bind:ref
	data-slot="calendar-header"
	class={cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", className)}
	{...restProps}
/>

<script lang="ts" module>
	import { Calendar as CalendarPrimitive } from "bits-ui";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	export type YearSelectProps = WithoutChildrenOrChild<CalendarPrimitive.YearSelectProps>;
</script>

<script lang="ts">
	import { ChevronDownIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, value, ...restProps }: YearSelectProps = $props();
</script>

<span
	data-slot="calendar-year-select"
	class={cn("relative flex rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-3 has-focus:ring-ring/50", className)}
>
	<CalendarPrimitive.YearSelect bind:ref class="absolute inset-0 opacity-0 dark:bg-popover dark:text-popover-foreground" {...restProps}>
		{#snippet child({ props, yearItems, selectedYearItem })}
			<select {...props} {value}>
				{#each yearItems as yearItem (yearItem.value)}
					<option value={yearItem.value} selected={value !== undefined ? yearItem.value === value : yearItem.value === selectedYearItem.value}>
						{yearItem.label}
					</option>
				{/each}
			</select>
			<span
				class="flex h-(--cell-size) items-center gap-1 rounded-md ps-2 pe-1 text-sm font-medium select-none [&>svg]:size-3.5 [&>svg]:text-muted-foreground"
				aria-hidden="true"
			>
				{yearItems.find((item) => item.value === value)?.label || selectedYearItem.label}
				<ChevronDownIcon class="size-4" />
			</span>
		{/snippet}
	</CalendarPrimitive.YearSelect>
</span>

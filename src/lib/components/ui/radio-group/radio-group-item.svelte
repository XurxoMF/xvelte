<script lang="ts" module>
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	export type ItemProps = WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps>;
</script>

<script lang="ts">
	import { CircleIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ItemProps = $props();
</script>

<RadioGroupPrimitive.Item
	bind:ref
	data-slot="radio-group-item"
	class={cn(
		"group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
		className
	)}
	{...restProps}
>
	{#snippet children({ checked })}
		<div data-slot="radio-group-indicator" class="flex size-4 items-center justify-center">
			{#if checked}
				<CircleIcon class="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
			{/if}
		</div>
	{/snippet}
</RadioGroupPrimitive.Item>

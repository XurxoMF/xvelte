<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { WithoutChild } from "$lib/utils";

	import * as Command from "$lib/components/ui/command";

	/** Props for a selectable Combobox option. */
	export type ItemProps = Omit<WithoutChild<Command.ItemProps>, "value" | "onSelect"> & {
		/** Stable searchable and selected value. */
		value: string;
		/** Callback invoked after Combobox selection behavior runs. */
		onSelect?: (() => void) | undefined;
		/** Visible option content. */
		children: Snippet;
	};
</script>

<script lang="ts">
	import { getComboboxContext } from "./combobox-context.svelte";

	import { CheckIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), value, onSelect, disabled = false, class: className, children, ...restProps }: ItemProps = $props();

	const ctx = getComboboxContext();
</script>

<Command.Item
	bind:ref
	data-slot="combobox-item"
	{value}
	disabled={ctx.disabled || disabled}
	onSelect={() => {
		ctx.selectItem(value);
		onSelect?.();
	}}
	class={cn(
		"relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=danger]:focus:**:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
		className
	)}
	{...restProps}
>
	{@render children()}

	<span class="absolute inset-e-2 flex size-3.5 items-center justify-center">
		{#if ctx.isSelected(value)}
			<CheckIcon />
		{/if}
	</span>
</Command.Item>

<script lang="ts" module>
	import type { Snippet } from "svelte";

	import { Menubar as MenubarPrimitive } from "bits-ui";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	export type CheckboxItemProps = WithoutChildrenOrChild<MenubarPrimitive.CheckboxItemProps> & {
		inset?: boolean | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { CheckIcon, MinusIcon } from "$lib/icons";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		indeterminate = $bindable(false),
		inset,
		children: childrenProp,
		...restProps
	}: CheckboxItemProps = $props();
</script>

<MenubarPrimitive.CheckboxItem
	bind:ref
	bind:checked
	bind:indeterminate
	data-slot="menubar-checkbox-item"
	data-inset={inset}
	class={cn(
		"relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{#snippet children({ checked: checked, indeterminate: indeterminate })}
		<span class="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
			{#if indeterminate}
				<MinusIcon />
			{:else if checked}
				<CheckIcon />
			{/if}
		</span>
		{@render childrenProp?.()}
	{/snippet}
</MenubarPrimitive.CheckboxItem>

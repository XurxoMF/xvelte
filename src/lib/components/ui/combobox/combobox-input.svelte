<script lang="ts" module>
	import type { WithoutChild } from "$lib/utils";

	import * as Command from "$lib/components/ui/command";

	/** Props for the Combobox search input. */
	export type InputProps = WithoutChild<Command.InputProps>;
</script>

<script lang="ts">
	import { getComboboxContext } from "./combobox-context.svelte";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		placeholder = m.harbor_wren_pause(),
		disabled = false,
		class: className,
		...restProps
	}: InputProps = $props();

	const ctx = getComboboxContext();
</script>

<Command.Input
	bind:ref
	bind:value
	data-slot="combobox-input"
	{placeholder}
	disabled={ctx.disabled || disabled}
	class={cn(className)}
	{...restProps}
/>

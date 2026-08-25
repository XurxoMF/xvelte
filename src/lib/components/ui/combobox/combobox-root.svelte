<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ComboboxType, ValueMap } from "./combobox-context.svelte";

	export type RootProps<T extends ComboboxType> = {
		type?: T | undefined;
		value?: ValueMap[T] | undefined;
		onchange?: ((value: ValueMap[T]) => void) | undefined;
		children: Snippet;
	};
</script>

<script lang="ts" generics="T extends ComboboxType = 'single'">
	import { untrack } from "svelte";

	import { setComboboxContext } from "./combobox-context.svelte";

	import * as Popover from "$lib/components/ui/popover";

	let { type = "single" as T, value = $bindable(), onchange, children }: RootProps<T> = $props();

	const ctx = setComboboxContext({
		get value() {
			return value as ValueMap[T];
		},
		set value(nextValue) {
			value = nextValue;
			onchange?.(nextValue);
		},
		type: untrack(() => type)
	});
</script>

<Popover.Root bind:open={ctx.open}>
	{@render children()}
</Popover.Root>

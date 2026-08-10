<script lang="ts" module>
	export type RootProps<T extends ComboboxType> = {
		type?: T | undefined;
		value?: ValueMap[T] | undefined;
		onchange?: ((value: ValueMap[T]) => void) | undefined;
		children: Snippet;
	};
</script>

<script lang="ts" generics="T extends ComboboxType = 'single'">
	import { untrack, type Snippet } from "svelte";

	import * as Popover from "$lib/components/ui/popover";

	import { setComboboxContext, type ComboboxType, type ValueMap } from "./combobox-context.svelte";

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

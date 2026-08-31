<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ComboboxType, ValueMap } from "./combobox-context.svelte";

	/** Props for the Combobox root state provider. */
	export type RootProps<T extends ComboboxType> = {
		/** Single or multiple selection mode. */
		type?: T | undefined;
		/** Bindable selection matching the configured mode. */
		value?: ValueMap[T] | undefined;
		/** Bindable popup visibility. */
		open?: boolean | undefined;
		/** Whether all trigger, search, and selection interaction is disabled. */
		disabled?: boolean | undefined;
		/** Whether the selected single item may clear itself. */
		allowDeselect?: boolean | undefined;
		/** Whether item selection closes the popup. */
		closeOnSelect?: boolean | undefined;
		/** Compatibility callback invoked after context-owned value changes. */
		onchange?: ((value: ValueMap[T]) => void) | undefined;
		/** Callback invoked after context-owned value changes. */
		onValueChange?: ((value: ValueMap[T]) => void) | undefined;
		/** Callback invoked when shared popup visibility changes. */
		onOpenChange?: ((open: boolean) => void) | undefined;
		/** Callback invoked after the Popover open or close lifecycle completes. */
		onOpenChangeComplete?: ((open: boolean) => void) | undefined;
		/** Trigger, content, and optional app-owned surrounding markup. */
		children: Snippet;
	};
</script>

<script lang="ts" generics="T extends ComboboxType = 'single'">
	import { untrack } from "svelte";

	import { setComboboxContext } from "./combobox-context.svelte";

	import * as Popover from "$lib/components/ui/popover";

	let {
		type = "single" as T,
		value = $bindable(),
		open = $bindable(false),
		disabled = false,
		allowDeselect = true,
		closeOnSelect = type === "single",
		onchange,
		onValueChange,
		onOpenChange,
		onOpenChangeComplete,
		children
	}: RootProps<T> = $props();

	const ctx = setComboboxContext({
		get value() {
			return value as ValueMap[T];
		},
		set value(nextValue) {
			value = nextValue;
			onchange?.(nextValue);
			onValueChange?.(nextValue);
		},
		get open() {
			return open;
		},
		set open(nextOpen) {
			open = nextOpen;
		},
		type: untrack(() => type),
		get disabled() {
			return disabled;
		},
		get allowDeselect() {
			return allowDeselect;
		},
		get closeOnSelect() {
			return closeOnSelect;
		},
		get onOpenChange() {
			return onOpenChange;
		}
	});
</script>

<Popover.Root bind:open={ctx.open} {onOpenChangeComplete}>
	{@render children()}
</Popover.Root>

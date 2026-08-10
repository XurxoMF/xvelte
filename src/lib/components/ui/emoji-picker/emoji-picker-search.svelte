<script lang="ts" module>
	import type { Command as CommandPrimitiveProps } from "bits-ui";

	export type SearchProps = CommandPrimitiveProps.InputProps;
</script>

<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { box } from "svelte-toolbelt";

	import { SearchIcon } from "$lib/icons";

	import { useEmojiPickerInput } from "./emoji-picker.svelte.js";

	let { value = $bindable(""), placeholder = "Search", ...rest }: SearchProps = $props();

	useEmojiPickerInput({
		value: box.with(
			() => value,
			(v) => (value = v)
		)
	});
</script>

<div data-slot="emoji-picker-search" class="p-2">
	<div class="flex h-9 items-center gap-2 rounded-md border border-input bg-input px-3 dark:bg-input/30">
		<SearchIcon class="size-4 shrink-0 opacity-50" />
		<CommandPrimitive.Input
			{...rest}
			data-slot="emoji-picker-search-input"
			{placeholder}
			class="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
			bind:value
		/>
	</div>
</div>

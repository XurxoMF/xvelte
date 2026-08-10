<script lang="ts" module>
	import type { Command as CommandPrimitiveProps } from "bits-ui";

	export type SearchProps = CommandPrimitiveProps.InputProps;
</script>

<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";

	import { SearchIcon } from "$lib/icons";

	import { getEmojiPickerContext } from "./emoji-picker-context.svelte.js";

	let { value = $bindable(""), placeholder = "Search", ...restProps }: SearchProps = $props();

	const emojiPicker = getEmojiPickerContext();

	$effect(() => {
		emojiPicker.search = value;
	});
</script>

<div data-slot="emoji-picker-search" class="p-2">
	<div class="flex h-9 items-center gap-2 rounded-md border border-input bg-input px-3 dark:bg-input/30">
		<SearchIcon class="size-4 shrink-0 opacity-50" />
		<CommandPrimitive.Input
			{...restProps}
			data-slot="emoji-picker-search-input"
			{placeholder}
			class="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
			bind:value
		/>
	</div>
</div>

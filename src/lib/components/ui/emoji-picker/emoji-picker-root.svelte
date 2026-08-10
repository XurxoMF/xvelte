<script lang="ts" module>
	import type { Command as CommandPrimitiveProps, WithChildren, WithoutChild } from "bits-ui";

	import type { EmojiPickerSkin, SelectedEmoji } from "./emoji-picker.svelte.js";

	type RootPropsWithoutHTML = WithChildren<{
		skin?: EmojiPickerSkin;
		onSelect?: (emoji: SelectedEmoji) => void;
		onSkinChange?: (skin: EmojiPickerSkin) => void;
	}> &
		({ showRecents?: true; recentsKey: string; maxRecents?: number } | { showRecents?: false | never; recentsKey?: never; maxRecents?: never });

	export type RootProps = WithoutChild<Omit<CommandPrimitiveProps.RootProps, "filter" | "shouldFilter" | "columns" | "onValueChange">> &
		RootPropsWithoutHTML;
</script>

<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";

	import { useEmojiPicker } from "./emoji-picker.svelte.js";

	let {
		value = $bindable(""),
		skin = $bindable(0),
		onSelect = () => {},
		showRecents = false,
		recentsKey = "",
		maxRecents = 12,
		onSkinChange = () => {},
		class: className,
		children,
		...restProps
	}: RootProps = $props();

	const state = useEmojiPicker({
		value: box.with(
			() => value,
			(v) => (value = v)
		),
		skin: box.with(
			() => skin,
			(v) => (skin = v)
		),
		showRecents: box.with(() => showRecents),
		recentsKey: box.with(() => recentsKey),
		maxRecents: box.with(() => maxRecents),
		onSelect: box.with(() => onSelect),
		onSkinChange: box.with(() => onSkinChange)
	});
</script>

<CommandPrimitive.Root
	{...restProps}
	data-slot="emoji-picker"
	columns={6}
	shouldFilter={false}
	class={cn("max-w-58", className)}
	onValueChange={state.onValueChange}
>
	{@render children?.()}
</CommandPrimitive.Root>

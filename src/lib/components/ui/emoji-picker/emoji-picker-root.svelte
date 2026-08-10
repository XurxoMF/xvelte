<script lang="ts" module>
	import type { Command as CommandPrimitiveProps, WithChildren, WithoutChild } from "bits-ui";

	import type { EmojiPickerSkin, SelectedEmoji } from "./emoji-picker-context.svelte.js";

	type RootPropsWithoutHTML = WithChildren<{
		skin?: EmojiPickerSkin | undefined;
		onSelect?: ((emoji: SelectedEmoji) => void) | undefined;
		onSkinChange?: ((skin: EmojiPickerSkin) => void) | undefined;
	}> &
		(
			| { showRecents?: true | undefined; recentsKey: string; maxRecents?: number | undefined }
			| { showRecents?: false | never | undefined; recentsKey?: never | undefined; maxRecents?: never | undefined }
		);

	export type RootProps = WithoutChild<Omit<CommandPrimitiveProps.RootProps, "filter" | "shouldFilter" | "columns" | "onValueChange">> &
		RootPropsWithoutHTML;
</script>

<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";

	import { cn } from "$lib/utils";

	import { setEmojiPickerContext } from "./emoji-picker-context.svelte.js";

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

	const state = setEmojiPickerContext({
		get value() {
			return value;
		},
		set value(next) {
			value = next;
		},
		get skin() {
			return skin;
		},
		set skin(next) {
			skin = next;
		},
		get showRecents() {
			return showRecents;
		},
		get recentsKey() {
			return recentsKey;
		},
		get maxRecents() {
			return maxRecents;
		},
		get onSelect() {
			return onSelect;
		},
		get onSkinChange() {
			return onSkinChange;
		}
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

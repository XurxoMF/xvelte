<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";
	import { Root as Button, type RootProps as ButtonProps } from "$lib/components/ui/button";

	import { useEmojiPickerSkinToneSelector } from "./emoji-picker.svelte.js";
	import type { EmojiPickerSkinProps } from "./types.js";

	let { previewEmoji = "👋", variant = "outline", size = "icon", class: className, onclick, ...rest }: EmojiPickerSkinProps = $props();

	const skinState = useEmojiPickerSkinToneSelector({
		previewEmoji: box.with(() => previewEmoji)
	});
</script>

<Button
	{...rest}
	data-slot="emoji-picker-skin-tone-selector"
	{variant}
	{size}
	class={cn("size-8", className)}
	onclick={(e: Parameters<NonNullable<ButtonProps["onclick"]>>[0]) => {
		onclick?.(e);
		skinState.cycleSkinTone();
	}}
>
	{skinState.preview}
</Button>

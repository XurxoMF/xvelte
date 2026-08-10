<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonRootProps } from "$lib/components/ui/button";

	export type SkinToneSelectorProps = WithoutChildren<ButtonRootProps> & {
		previewEmoji?: string | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { Root as Button, type RootProps as ButtonProps } from "$lib/components/ui/button";

	import { EmojiPickerSkinToneState } from "./emoji-picker-context.svelte.js";

	let { previewEmoji = "👋", variant = "outline", size = "icon", class: className, onclick, ...restProps }: SkinToneSelectorProps = $props();

	const skinState = new EmojiPickerSkinToneState({
		get previewEmoji() {
			return previewEmoji;
		}
	});
</script>

<Button
	{...restProps}
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

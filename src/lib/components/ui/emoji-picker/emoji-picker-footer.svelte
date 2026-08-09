<script lang="ts">
	import { cn } from "$lib/utils";

	import { useEmojiPickerFooter } from "./emoji-picker.svelte.js";
	import type { EmojiPickerFooterProps } from "./types";

	let { class: className, children, ...rest }: EmojiPickerFooterProps = $props();

	const footerState = useEmojiPickerFooter();
</script>

<div {...rest} data-slot="emoji-picker-footer" class={cn("relative max-w-full border-t border-border p-2", className)}>
	{@render children?.({ active: footerState.root.emojiPickerState.active })}
</div>

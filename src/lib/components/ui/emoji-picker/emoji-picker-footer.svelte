<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithoutChildren } from "bits-ui";

	import type { SelectedEmoji } from "./emoji-picker-context.svelte.js";

	export type FooterProps = WithoutChildren<HTMLAttributes<HTMLDivElement>> & {
		children: Snippet<[{ active: SelectedEmoji | null }]>;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { getEmojiPickerContext } from "./emoji-picker-context.svelte.js";

	let { class: className, children, ...restProps }: FooterProps = $props();

	const emojiPicker = getEmojiPickerContext();
</script>

<div {...restProps} data-slot="emoji-picker-footer" class={cn("relative max-w-full border-t border-border p-2", className)}>
	{@render children?.({ active: emojiPicker.active })}
</div>

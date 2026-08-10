<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithoutChildren } from "bits-ui";

	import type { SelectedEmoji } from "./emoji-picker.svelte.js";

	export type FooterProps = WithoutChildren<HTMLAttributes<HTMLDivElement>> & {
		children: Snippet<[{ active: SelectedEmoji | null }]>;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { useEmojiPickerFooter } from "./emoji-picker.svelte.js";

	let { class: className, children, ...rest }: FooterProps = $props();

	const footerState = useEmojiPickerFooter();
</script>

<div {...rest} data-slot="emoji-picker-footer" class={cn("relative max-w-full border-t border-border p-2", className)}>
	{@render children?.({ active: footerState.root.emojiPickerState.active })}
</div>

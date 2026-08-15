import Root, { type RootProps } from "./emoji-picker-root.svelte";
import { applySkinTone, emojiCategories, SKIN_TONES } from "./emoji-data";
import type { Emoji, EmojiCategory, EmojiCategoryId, EmojiSkinTone } from "./emoji-data";

export {
	Root,
	Root as EmojiPicker,
	emojiCategories,
	applySkinTone,
	SKIN_TONES,
	//
	type RootProps,
	type Emoji,
	type EmojiCategory,
	type EmojiCategoryId,
	type EmojiSkinTone
};

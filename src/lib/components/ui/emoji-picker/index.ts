import Footer from "./emoji-picker-footer.svelte";
import List from "./emoji-picker-list.svelte";
import Root from "./emoji-picker-root.svelte";
import Search from "./emoji-picker-search.svelte";
import SkinToneSelector from "./emoji-picker-skin-tone-selector.svelte";
import Viewport, { type ViewportProps } from "./emoji-picker-viewport.svelte";

export { Root, List, Viewport, Search, Footer, SkinToneSelector };
export type { ViewportProps };

export type {
	SelectedEmoji,
	EmojiPickerSkin,
	EmojiPickerRootProps as RootProps,
	EmojiPickerListProps as ListProps,
	EmojiPickerSearchProps as SearchProps,
	EmojiPickerFooterProps as FooterProps,
	EmojiPickerSkinProps as SkinToneSelectorProps
} from "./types";

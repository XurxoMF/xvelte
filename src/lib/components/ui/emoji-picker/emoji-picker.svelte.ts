import { Context, watch } from "runed";
import data, { type Emoji, type EmojiMartData } from "@emoji-mart/data";
import type { ReadableBoxedValues, WritableBoxedValues } from "svelte-toolbelt";

import { UseFrecency } from "$lib/hooks/use-frecency.svelte";

export type SelectedEmoji = {
	emoji: string;
	data: Emoji;
	skin: number;
};

export type EmojiPickerSkin = 0 | 1 | 2 | 3 | 4 | 5;

const emojiData = data as EmojiMartData;

type EmojiPickerState = {
	search: string;
	active: SelectedEmoji | null;
};

const defaultState: EmojiPickerState = {
	search: "",
	active: null
};

type EmojiPickerRootProps = WritableBoxedValues<{
	value: string;
	skin: EmojiPickerSkin;
}> &
	ReadableBoxedValues<{
		onSelect: (emoji: SelectedEmoji) => void;
		showRecents: boolean;
		recentsKey: string;
		maxRecents: number;
		onSkinChange: (skin: EmojiPickerSkin) => void;
	}>;

/** Owns emoji selection, search state, skin preference, and optional recents. */
class EmojiPickerRootState {
	emojiPickerState = $state(defaultState);
	frecency: UseFrecency | null;

	/** @param opts - Boxed picker values, callbacks, and recents settings. */
	constructor(readonly opts: EmojiPickerRootProps) {
		this.select = this.select.bind(this);
		this.onValueChange = this.onValueChange.bind(this);

		if (this.opts.showRecents) {
			if (!this.opts.recentsKey) throw new Error("[emoji-picker] recentsKey is required when recents is true");

			this.frecency = new UseFrecency(this.opts.recentsKey.current, {}, { maxItems: this.opts.maxRecents.current });
		} else {
			this.frecency = null;
		}
	}

	/** @param emoji - Internal `name:skin` value selected from the emoji list. */
	select(emoji: string) {
		const { name, skin } = parseValue(emoji);

		const selected = {
			emoji: emojiData.emojis[name].skins[skin].native,
			data: emojiData.emojis[name],
			skin
		};

		this.opts.value.current = selected.emoji;

		this.opts.onSelect.current(selected);
	}

	/** @param value - Internal item value whose emoji should become the active preview. */
	onValueChange(value: string) {
		if (value === "") {
			this.emojiPickerState.active = null;
			return;
		}

		const { name, skin } = parseValue(value);

		const emojiSkin = skin ? skin : this.opts.skin.current;

		const data = emojiData.emojis[name];

		if (data.skins.length === 1) {
			this.emojiPickerState.active = {
				emoji: data.skins[0].native,
				data: data,
				skin: 0
			};
			return;
		}

		this.emojiPickerState.active = {
			emoji: data.skins[emojiSkin].native,
			data: data,
			skin: emojiSkin
		};
	}
}

/**
 * Splits an internal emoji value into its dataset name and skin index.
 *
 * @param emojiKey - Value encoded as `name:skin`.
 */
export function parseValue(emojiKey: string): { name: string; skin: number } {
	const [name, skin] = emojiKey.split(":");
	return { name, skin: skin ? Number(skin) : 0 };
}

/**
 * Builds the internal value used by command items.
 *
 * @param name - Emoji dataset key.
 * @param skin - Skin variant index.
 */
export function makeValue(name: string, skin: number) {
	return `${name}:${skin}`;
}

/** Exposes root selection and recents settings to the emoji list. */
class EmojiPickerListState {
	/** @param root - Picker root shared by list items. */
	constructor(readonly root: EmojiPickerRootState) {
		this.select = this.select.bind(this);
	}

	/** Currently selected skin-tone index. */
	get skinIndex() {
		return this.root.opts.skin.current;
	}

	/** @param emoji - Internal value forwarded to the root selection handler. */
	select(emoji: string) {
		this.root.select(emoji);
	}

	/** Maximum recents count, or zero when recents are disabled. */
	get maxRecents() {
		if (this.root.opts.showRecents) {
			return this.root.opts.maxRecents.current;
		}

		return 0;
	}

	/** Whether the recents group has both configuration and persisted state. */
	get showRecents() {
		return this.root.opts.showRecents.current && this.root.frecency !== null;
	}
}

type EmojiPickerInputProps = WritableBoxedValues<{
	value: string;
}>;

/** Synchronizes the command input value with the root search query. */
class EmojiPickerInputState {
	/**
	 * @param root - Picker root whose search query should change.
	 * @param opts - Boxed command input value.
	 */
	constructor(
		readonly root: EmojiPickerRootState,
		readonly opts: EmojiPickerInputProps
	) {
		watch(
			() => this.opts.value.current,
			() => {
				this.root.emojiPickerState.search = this.opts.value.current;
			}
		);
	}
}

/** Exposes picker root state to the footer preview. */
class EmojiPickerFooterState {
	/** @param root - Picker root containing the active emoji. */
	constructor(readonly root: EmojiPickerRootState) {}
}

type EmojiPickerSkinProps = ReadableBoxedValues<{
	previewEmoji: string;
}>;

/** Resolves the preview emoji and cycles through its skin variants. */
class EmojiPickerSkinToneSelectorState {
	/**
	 * @param root - Picker root containing the selected skin.
	 * @param opts - Boxed native emoji used to locate preview variants.
	 */
	constructor(
		readonly root: EmojiPickerRootState,
		readonly opts: EmojiPickerSkinProps
	) {
		this.cycleSkinTone = this.cycleSkinTone.bind(this);
	}

	previewEmoji = $derived.by(() => {
		for (const data of Object.values(emojiData.emojis)) {
			let found = false;
			for (const skin of data.skins) {
				if (skin.native === this.opts.previewEmoji.current) {
					found = true;
					break;
				}
			}

			if (!found) continue;

			if (data.skins.length === 0) {
				throw new Error(`The selected previewEmoji: ${this.opts.previewEmoji.current} does not have multiple skins!`);
			}

			return data;
		}

		return null;
	});

	/** Native emoji for the currently selected preview skin. */
	get preview() {
		if (!this.previewEmoji) return null;

		return this.previewEmoji.skins[this.root.opts.skin.current].native;
	}

	/** Selects the next skin tone, wrapping to the base variant after the last. */
	cycleSkinTone() {
		if (!this.previewEmoji) return;

		if (this.root.opts.skin.current + 1 > 5) {
			this.root.opts.skin.current = 0;
		} else {
			this.root.opts.skin.current += 1;
		}

		this.root.opts.onSkinChange.current(this.root.opts.skin.current as EmojiPickerSkin);
	}
}

const ctx = new Context<EmojiPickerRootState>("emoji-picker-root-state");

/** @param props - Boxed picker state and callbacks to provide to descendants. */
export function useEmojiPicker(props: EmojiPickerRootProps) {
	return ctx.set(new EmojiPickerRootState(props));
}

/** @returns List state connected to the nearest emoji-picker root. */
export function useEmojiPickerList() {
	return new EmojiPickerListState(ctx.get());
}

/** @param props - Boxed search input value. */
export function useEmojiPickerInput(props: EmojiPickerInputProps) {
	return new EmojiPickerInputState(ctx.get(), props);
}

/** @returns Footer state connected to the nearest emoji-picker root. */
export function useEmojiPickerFooter() {
	return new EmojiPickerFooterState(ctx.get());
}

/** @param props - Boxed native emoji used for the skin-tone preview. */
export function useEmojiPickerSkinToneSelector(props: EmojiPickerSkinProps) {
	return new EmojiPickerSkinToneSelectorState(ctx.get(), props);
}

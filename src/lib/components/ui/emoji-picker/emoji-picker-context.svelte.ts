import { createContext } from "svelte";

import data, { type Emoji, type EmojiMartData } from "@emoji-mart/data";

import { UseFrecency } from "$lib/hooks/use-frecency.svelte";

export type SelectedEmoji = {
	emoji: string;
	data: Emoji;
	skin: number;
};

export type EmojiPickerSkin = 0 | 1 | 2 | 3 | 4 | 5;

type EmojiPickerOptions = {
	value: string;
	skin: EmojiPickerSkin;
	readonly onSelect: (emoji: SelectedEmoji) => void;
	readonly showRecents: boolean;
	readonly recentsKey: string;
	readonly maxRecents: number;
	readonly onSkinChange: (skin: EmojiPickerSkin) => void;
};

type EmojiPickerSkinToneOptions = {
	readonly previewEmoji: string;
};

const emojiData = data as EmojiMartData;

/** Owns emoji selection, search state, skin preference, and optional recents. */
export class EmojiPickerContext {
	search = $state("");
	active = $state<SelectedEmoji | null>(null);
	frecency: UseFrecency | null;

	/** @param options - Reactive picker values, callbacks, and recents settings. */
	constructor(readonly options: EmojiPickerOptions) {
		if (this.options.showRecents) {
			if (!this.options.recentsKey) throw new Error("[emoji-picker] recentsKey is required when recents are enabled");

			this.frecency = new UseFrecency(this.options.recentsKey, {}, { maxItems: this.options.maxRecents });
		} else {
			this.frecency = null;
		}
	}

	/** @param emoji - Internal `name:skin` value selected from the emoji list. */
	select = (emoji: string) => {
		const { name, skin } = parseValue(emoji);
		const selected = {
			emoji: emojiData.emojis[name].skins[skin].native,
			data: emojiData.emojis[name],
			skin
		};

		this.options.value = selected.emoji;
		this.options.onSelect(selected);
	};

	/** @param value - Internal item value whose emoji should become the active preview. */
	onValueChange = (value: string) => {
		if (value === "") {
			this.active = null;
			return;
		}

		const { name, skin } = parseValue(value);
		const data = emojiData.emojis[name];
		const emojiSkin = skin || this.options.skin;

		this.active = {
			emoji: data.skins.length === 1 ? data.skins[0].native : data.skins[emojiSkin].native,
			data,
			skin: data.skins.length === 1 ? 0 : emojiSkin
		};
	};

	/** Maximum recents count, or zero when recents are disabled. */
	get maxRecents() {
		return this.options.showRecents ? this.options.maxRecents : 0;
	}

	/** Whether the recents group has both configuration and persisted state. */
	get showRecents() {
		return this.options.showRecents && this.frecency !== null;
	}
}

/** Resolves a preview emoji and cycles through its available skin variants. */
export class EmojiPickerSkinToneState {
	readonly root = getEmojiPickerContext();

	/** @param options - Reactive native emoji used to locate preview variants. */
	constructor(readonly options: EmojiPickerSkinToneOptions) {}

	previewEmoji = $derived.by(() => {
		for (const emoji of Object.values(emojiData.emojis)) {
			if (!emoji.skins.some((skin) => skin.native === this.options.previewEmoji)) continue;

			if (emoji.skins.length === 0) {
				throw new Error(`The selected previewEmoji: ${this.options.previewEmoji} does not have multiple skins!`);
			}

			return emoji;
		}

		return null;
	});

	/** Native emoji for the currently selected preview skin. */
	get preview() {
		return this.previewEmoji?.skins[this.root.options.skin].native ?? null;
	}

	/** Selects the next skin tone, wrapping to the base variant after the last. */
	cycleSkinTone() {
		if (!this.previewEmoji) return;

		this.root.options.skin = this.root.options.skin + 1 > 5 ? 0 : ((this.root.options.skin + 1) as EmojiPickerSkin);
		this.root.options.onSkinChange(this.root.options.skin);
	}
}

const [getEmojiPickerContext, provideEmojiPickerContext] = createContext<EmojiPickerContext>();

/** @param options - Reactive picker state and callbacks to provide to descendants. */
export function setEmojiPickerContext(options: EmojiPickerOptions) {
	return provideEmojiPickerContext(new EmojiPickerContext(options));
}

/** @returns The state from the nearest emoji-picker root. */
export { getEmojiPickerContext };

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

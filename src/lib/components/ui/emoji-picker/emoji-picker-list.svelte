<script lang="ts" module>
	import type { Command as CommandPrimitiveProps, WithoutChild, WithoutChildren } from "bits-ui";

	export type ListProps = WithoutChildren<WithoutChild<CommandPrimitiveProps.ListProps>> & {
		emptyMessage?: string | undefined;
	};
</script>

<script lang="ts">
	import data, { type EmojiMartData } from "@emoji-mart/data";
	import { Command as CommandPrimitive } from "bits-ui";

	import * as Command from "$lib/components/ui/command";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

	import { getEmojiPickerContext, makeValue, parseValue } from "./emoji-picker-context.svelte.js";

	let { ref = $bindable(null), emptyMessage = m.ivory_crane_empty(), class: className, ...restProps }: ListProps = $props();

	const emojiData = data as EmojiMartData;

	/** @param value - Category identifier to translate for display. */
	function formatCategory(value: string) {
		const labels: Record<string, string> = {
			people: m.green_vole_people(),
			nature: m.honey_fir_nature(),
			foods: m.icy_marten_foods(),
			activity: m.juniper_bear_activity(),
			places: m.khaki_whale_places(),
			objects: m.lilac_eagle_objects(),
			symbols: m.marine_rabbit_symbols(),
			flags: m.noble_peach_flags()
		};

		return labels[value] ?? value;
	}

	/**
	 * @param value - Case-insensitive search prefix.
	 * @param keywords - Emoji keywords tested against that prefix.
	 */
	const filter = (value: string, keywords: string[]) => {
		if (!Array.isArray(keywords)) {
			return false;
		}

		for (const keyword of keywords) {
			if (keyword.toLowerCase().startsWith(value.toLowerCase())) return true;
		}

		return false;
	};

	const emojiPicker = getEmojiPickerContext();
</script>

<Command.List bind:ref data-slot="emoji-picker-list" class={cn("relative h-50", className)} {...restProps}>
	<Command.Empty class="absolute inset-0 flex place-items-center justify-center py-0">
		{emptyMessage}
	</Command.Empty>

	{#if emojiPicker.showRecents}
		{@const recents = emojiPicker.frecency?.items
			.filter((item) => {
				const { name } = parseValue(item);
				return filter(emojiPicker.search, emojiData.emojis[name].keywords);
			})
			.slice(0, emojiPicker.maxRecents)}
		{#if recents && recents.length > 0}
			<CommandPrimitive.Group>
				<CommandPrimitive.GroupHeading class="px-2 py-1 text-xs text-muted-foreground">{m.jolly_fern_recent()}</CommandPrimitive.GroupHeading>
				<CommandPrimitive.GroupItems class="grid grid-cols-6 px-2">
					{#each recents as item (item)}
						{@const { name, skin } = parseValue(item)}
						{@const emoji = emojiData.emojis[name].skins[skin].native}
						<Command.Item
							class="flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!"
							value="{item}:recent"
							onSelect={() => {
								emojiPicker.select(item);
								emojiPicker.frecency?.use(item);
							}}
						>
							{emoji}
						</Command.Item>
					{/each}
				</CommandPrimitive.GroupItems>
			</CommandPrimitive.Group>
		{/if}
	{/if}

	{#each emojiData.categories as category (category.id)}
		{@const emojis = category.emojis.filter((item) => filter(emojiPicker.search, emojiData.emojis[item].keywords))}
		{#if emojis.length > 0}
			<CommandPrimitive.Group>
				<CommandPrimitive.GroupHeading class="px-2 py-1 text-xs text-muted-foreground">
					{formatCategory(category.id)}
				</CommandPrimitive.GroupHeading>
				<CommandPrimitive.GroupItems class="grid grid-cols-6 px-2">
					{#each emojis as item (item)}
						{@const emoji = emojiData.emojis[item]}
						{@const emojiSkin = emoji.skins.length > 1 ? emojiPicker.options.skin : 0}
						{@const key = makeValue(item, emojiSkin)}
						<Command.Item
							class="flex aspect-square size-9 place-items-center justify-center text-lg [&_svg]:hidden!"
							value={item}
							onSelect={() => {
								emojiPicker.select(key);
								emojiPicker.frecency?.use(key);
							}}
						>
							{emoji.skins[emojiSkin].native}
						</Command.Item>
					{/each}
				</CommandPrimitive.GroupItems>
			</CommandPrimitive.Group>
		{/if}
	{/each}
</Command.List>

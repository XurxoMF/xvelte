# Emoji Picker

A self-contained emoji selector with a bundled dataset, category navigation, search, skin tones, recent choices, keyboard controls, and optional browser persistence. It returns native Unicode characters and can be rendered directly or placed inside another component such as Popover.

Use Emoji Picker to add emoji to messages, reactions, labels, or other text. It makes no network request and needs no emoji-data package at runtime. Do not use it for custom stickers, server-synchronized history, translated emoji search terms, or very large custom emoji collections without adapting the bundled data and rendering strategy.

## Contents

- [Import](#import)
- [Anatomy](#anatomy)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Styling and DOM contract](#styling-and-dom-contract)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Import

Import the component namespace from its public `index.ts`:

```svelte
<script lang="ts">
	import * as EmojiPicker from "$lib/components/ui/emoji-picker";
</script>
```

Render `EmojiPicker.Root`. The same component is also exported as the named `EmojiPicker` alias:

```svelte
<script lang="ts">
	import { EmojiPicker } from "$lib/components/ui/emoji-picker";
</script>
```

The component's `index.ts` also exports `RootProps`, `Emoji`, `EmojiCategory`, `EmojiCategoryId`, and `EmojiSkinTone`, together with the `emojiCategories`, `SKIN_TONES`, and `applySkinTone` data helpers.

---

## Anatomy

Emoji Picker is one self-contained component; callers do not assemble internal parts:

```svelte
<EmojiPicker.Root />
```

It renders, in order:

1. An optional search field and skin-tone selector.
2. Optional category navigation.
3. A fixed-height, internally scrollable emoji list with sticky category headings.
4. An optional preview of the pointer-hovered or keyboard-active emoji.

Search, filtering, recent-item tracking, category scrolling, selection, and preview state are managed internally. Use the public props to hide sections or bind state instead of importing implementation files.

---

## Basic usage

```svelte
<script lang="ts">
	import * as EmojiPicker from "$lib/components/ui/emoji-picker";

	let selectedEmoji = $state("👋");
</script>

<EmojiPicker.Root bind:value={selectedEmoji} onSelect={(emoji) => console.info("Selected", emoji)} />

<p>Selected: <span class="text-lg">{selectedEmoji}</span></p>
```

Selecting an item updates `value` with the displayed Unicode character. `onSelect` receives that character plus its base data record.

---

## Examples

### Controlled skin tone and recents

`skinTone` and `recents` are bindable. Set `persistKey={null}` when the app owns storage or does not want browser persistence:

```svelte
<script lang="ts">
	import * as EmojiPicker from "$lib/components/ui/emoji-picker";

	let selectedEmoji = $state("");
	let skinTone = $state<EmojiPicker.EmojiSkinTone>(0);
	let recents = $state<string[]>([]);
</script>

<EmojiPicker.Root bind:value={selectedEmoji} bind:skinTone bind:recents persistKey={null} maxRecents={12} />
```

When persistence is enabled, the component stores base emoji characters and the selected tone under `<persistKey>:recents` and `<persistKey>:skin-tone`. Stored values are loaded once when the component reaches the browser. Use a stable, app-specific key to keep histories separate.

### Insert into a message from a Popover

Popover is optional and not an internal Emoji Picker dependency:

```svelte
<script lang="ts">
	import * as EmojiPicker from "$lib/components/ui/emoji-picker";
	import * as Popover from "$lib/components/ui/popover";
	import { Button } from "$lib/components/ui/button";

	import { EmojiSmileysIcon } from "$lib/icons";

	let message = $state("Ship it ");
	let open = $state(false);
</script>

<div class="flex items-center gap-2">
	<input bind:value={message} aria-label="Message" class="h-9 flex-1 rounded-md border px-3" />

	<Popover.Root bind:open>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="icon" aria-label="Insert emoji">
					<EmojiSmileysIcon aria-hidden="true" />
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="w-auto border-none p-0" align="end">
			<EmojiPicker.Root
				class="shadow-none"
				onSelect={(emoji) => {
					message += emoji;
					open = false;
				}}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
```

Follow the Popover and Button components' READMEs when using this optional composition. The app owns the trigger's accessible name and decides whether selection closes the popup.

### Compact picker

Every visible section can be disabled independently, and `columns` controls grid density:

```svelte
<EmojiPicker.Root columns={7} showPreview={false} showSkinTones={false} showRecents={false} class="w-67" />
```

The component clamps `columns` to at least one whole column and `maxRecents` to a non-negative whole number.

### Selection metadata

Use the second callback argument when the app needs the base character, English name, keywords, or skin-tone support flag:

```svelte
<script lang="ts">
	import * as EmojiPicker from "$lib/components/ui/emoji-picker";

	let selectedData = $state<EmojiPicker.Emoji | null>(null);
</script>

<EmojiPicker.Root
	onSelect={(emoji, data) => {
		console.info("Rendered character", emoji);
		selectedData = data;
	}}
/>

{#if selectedData}
	<p>{selectedData.n}</p>
{/if}
```

The data record always describes the base emoji. The first callback argument and bound `value` contain the active skin-tone variant.

---

## Public API

The API below is owned by xvelte and does not wrap an external primitive. The component's `index.ts`, exported types, and local source are the source of truth.

### `EmojiPicker.Root`

Type: `RootProps`, based on native Svelte `HTMLAttributes<HTMLDivElement>` with a bindable element reference.

| Prop                | Type                                   | Default                 | Behavior                                                                                                            |
| ------------------- | -------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `value`             | `string`                               | `""`                    | Bindable character selected most recently. Programmatic changes do not call `onSelect`.                             |
| `skinTone`          | `EmojiSkinTone`                        | `0`                     | Bindable tone: `0` is the base emoji and `1`–`5` are Fitzpatrick modifiers.                                         |
| `recents`           | `string[]`                             | `[]`                    | Bindable base characters ordered newest first. Unknown characters are ignored when rendered.                        |
| `columns`           | `number`                               | `9`                     | Grid columns and vertical keyboard-navigation step. Finite values are floored and clamped to at least `1`.          |
| `maxRecents`        | `number`                               | `18`                    | Maximum recent items displayed and retained after selection. Finite values are floored and clamped to at least `0`. |
| `showSearch`        | `boolean`                              | `true`                  | Renders the search input and its clear action.                                                                      |
| `showCategories`    | `boolean`                              | `true`                  | Renders category buttons when no search is active.                                                                  |
| `showSkinTones`     | `boolean`                              | `true`                  | Renders the tone selector in the toolbar.                                                                           |
| `showRecents`       | `boolean`                              | `true`                  | Records selections and shows Frequently used when records exist.                                                    |
| `showPreview`       | `boolean`                              | `true`                  | Renders the footer preview.                                                                                         |
| `persistKey`        | `string \| null`                       | `"xvelte:emoji-picker"` | Storage namespace. `null` disables reads and writes; changing it after hydration does not reload stored values.     |
| `searchPlaceholder` | `string`                               | localized               | Overrides the search placeholder.                                                                                   |
| `onSelect`          | `(emoji: string, data: Emoji) => void` | `undefined`             | Runs after pointer or keyboard selection.                                                                           |
| `ref`               | `HTMLDivElement \| null`               | `null`                  | Bindable root element.                                                                                              |
| `class`             | `string`                               | `undefined`             | Merged after the component's root classes with `cn`.                                                                |

Remaining compatible native `div` attributes are forwarded to the root. Internal sections are intentionally not exposed as snippets or child components.

Search performs a case-insensitive substring match against each record's English name and keyword string, or an exact match against its base character. It is not fuzzy search. The complete bundled list renders in the DOM and is not virtualized.

### Exported types and data

`Emoji` has this shape:

| Field | Type                  | Meaning                                             |
| ----- | --------------------- | --------------------------------------------------- |
| `e`   | `string`              | Base Unicode character.                             |
| `n`   | `string`              | English display name and search text.               |
| `k`   | `string \| undefined` | Additional space-separated English search terms.    |
| `t`   | `true \| undefined`   | Whether the five skin-tone modifiers are supported. |

`EmojiSkinTone` is `0 | 1 | 2 | 3 | 4 | 5`.

`EmojiCategoryId` is `"recent" | "smileys" | "people" | "nature" | "food" | "activity" | "travel" | "objects" | "symbols" | "flags"`. The exported `emojiCategories` array contains the nine permanent categories; `recent` is created dynamically.

`EmojiCategory` contains an `id` and an `emojis` array. Category labels are localized inside the component rather than stored in this data.

`SKIN_TONES` contains each tone's numeric `id`, Unicode `modifier`, and hand `swatch`. `applySkinTone(emoji, tone)` returns the correctly modified character for tone-capable records and the base character otherwise.

---

## Styling and DOM contract

The root has a default width of `352px`, `max-width: 100%`, a Popover-colored bordered surface, rounded corners, and a shadow. The scrollable list is `280px` high. Override root sizing and presentation through `class`.

Stable xvelte hooks are:

| Element             | Stable hook or attribute                                                            |
| ------------------- | ----------------------------------------------------------------------------------- |
| Root                | `data-slot="emoji-picker"`                                                          |
| Toolbar             | `data-slot="emoji-picker-toolbar"`                                                  |
| Search wrapper      | `data-slot="emoji-picker-search"`                                                   |
| Skin-tone wrapper   | `data-slot="emoji-picker-skin-tones"`                                               |
| Category navigation | `data-slot="emoji-picker-categories"`                                               |
| Scrollable results  | `data-slot="emoji-picker-list"`                                                     |
| Sticky heading      | `data-slot="emoji-picker-category-heading"`                                         |
| Category grid       | `data-slot="emoji-picker-grid"`                                                     |
| Emoji button        | `data-slot="emoji-picker-item"`, `data-emoji-index`, and `data-active` while active |
| Empty state         | `data-slot="emoji-picker-empty"`                                                    |
| Preview             | `data-slot="emoji-picker-preview"`                                                  |

The root sets `--emoji-columns` from the normalized `columns` prop, and each category grid uses it in `repeat(var(--emoji-columns), minmax(0, 1fr))`. Treat this variable as component-managed; set `columns` instead of overriding it in CSS.

Root `class` values are merged with `cn`, so later Tailwind utilities can replace defaults such as width or shadow. Internal classes are implementation details; prefer the stable `data-slot` hooks for targeted CSS. The component defines no animation, keyframe, or shared stylesheet.

Native emoji appearance depends on the operating system, browser, and available emoji font.

---

## Accessibility

The search field has a localized accessible name. Arrow Down moves from it to the first result, and Escape clears a non-empty query without interfering with normal Left/Right text editing.

The results use a labeled grid containing native buttons. When focus is in the grid:

- Arrow Left and Right move by one emoji.
- Arrow Up and Down move by the configured column count.
- Enter activates the focused emoji button.
- Escape clears the current search.

Pointer hover updates the visual preview; focus also establishes the keyboard-active item. Emoji buttons use the bundled English emoji name as their accessible name and expose whether their rendered character matches `value` through `aria-pressed`.

Category controls are labeled toggle buttons and can be reached with normal Tab navigation. The skin-tone trigger exposes expanded state and opens a labeled listbox whose options expose selected state. The component does not trap focus, return focus to a popup trigger, or close an enclosing Popover/Dialog; the surrounding component owns those behaviors.

The preview is deliberately not an `aria-live` region because announcing every pointer or arrow movement can be noisy. Add a separate app-level selection announcement when confirmation is required.

---

## Localization

The component uses these Paraglide messages:

| Message ID                 | English value       | Purpose                                          |
| -------------------------- | ------------------- | ------------------------------------------------ |
| `gentle_mole_scan`         | `Search emoji...`   | Search placeholder and accessible name.          |
| `ivory_crane_empty`        | `No emoji found`    | Empty result state.                              |
| `jolly_fern_recent`        | `Frequently used`   | Dynamic recent category.                         |
| `green_vole_people`        | `People & Body`     | Category label.                                  |
| `honey_fir_nature`         | `Animals & Nature`  | Category label.                                  |
| `icy_marten_foods`         | `Food & Drink`      | Category label.                                  |
| `juniper_bear_activity`    | `Activities`        | Category label.                                  |
| `khaki_whale_places`       | `Travel & Places`   | Category label.                                  |
| `lilac_eagle_objects`      | `Objects`           | Category label.                                  |
| `marine_rabbit_symbols`    | `Symbols`           | Category label.                                  |
| `noble_peach_flags`        | `Flags`             | Category label.                                  |
| `opal_finch_smileys`       | `Smileys & Emotion` | Category label.                                  |
| `plum_otter_results`       | `Results`           | Search-result heading.                           |
| `quartz_lynx_clear`        | `Clear search`      | Clear button accessible name.                    |
| `river_marten_tone`        | `Change skin tone`  | Tone trigger and list accessible name.           |
| `sunny_badger_default`     | `Default`           | Base tone label.                                 |
| `tidy_heron_light`         | `Light`             | Tone label.                                      |
| `umber_koala_medium_light` | `Medium light`      | Tone label.                                      |
| `violet_panda_medium`      | `Medium`            | Tone label.                                      |
| `willow_raven_medium_dark` | `Medium dark`       | Tone label.                                      |
| `xenon_wren_dark`          | `Dark`              | Tone label.                                      |
| `young_maple_emoji`        | `Emoji`             | Category navigation and results accessible name. |
| `zesty_cedar_pick`         | `Pick an emoji…`    | Idle preview.                                    |

`searchPlaceholder` can override the default placeholder per instance. Emoji names and search keywords are bundled English dataset content rather than Paraglide messages, so item accessible names, preview names, and text search remain English in every locale unless the data file is replaced.

The app supplies and translates surrounding text such as a popup trigger label, selected-value caption, message-field label, or selection announcement.

---

## Dependencies

Emoji Picker expects Svelte 5, Tailwind CSS 4, and xvelte's Paraglide setup. The emoji records ship in the component folder, so no emoji-data library or remote service is required.

Install the shared packages with one of these command groups:

```sh
# bun
bun add @tabler/icons-svelte clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install @tabler/icons-svelte clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add @tabler/icons-svelte clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/emoji-picker` folder:

- `emoji-picker-root.svelte`
- `emoji-data.ts`
- `index.ts`
- `README.md`

The bundled `emoji-data.ts` is required and must not be replaced with the old `@emoji-mart/data` dependency. No other xvelte UI component, hook, attachment, context file, shared component style, image, sprite, network request, or service is required. Popover and Button in the earlier example are optional app composition.

### Shared utility

The component imports `cn` from `$lib/utils`. Add this code to `src/lib/utils.ts` if it is not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class values and resolves conflicting Tailwind utilities in favor of the last value.
 *
 * @param inputs - Conditional, nested, or plain class values to merge.
 * @returns The normalized class string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

The package block includes `clsx` and `tailwind-merge`.

### Icons

Add these exact semantic exports to `src/lib/icons.ts`:

```ts
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
export { default as EmojiActivityIcon } from "@tabler/icons-svelte/icons/barbell";
export { default as EmojiFlagsIcon } from "@tabler/icons-svelte/icons/flag";
export { default as EmojiFoodIcon } from "@tabler/icons-svelte/icons/coffee";
export { default as EmojiNatureIcon } from "@tabler/icons-svelte/icons/leaf";
export { default as EmojiObjectsIcon } from "@tabler/icons-svelte/icons/bulb";
export { default as EmojiPeopleIcon } from "@tabler/icons-svelte/icons/hand-stop";
export { default as EmojiRecentIcon } from "@tabler/icons-svelte/icons/clock";
export { default as EmojiSmileysIcon } from "@tabler/icons-svelte/icons/mood-smile";
export { default as EmojiSymbolsIcon } from "@tabler/icons-svelte/icons/hash";
export { default as EmojiTravelIcon } from "@tabler/icons-svelte/icons/plane";
export { default as SearchIcon } from "@tabler/icons-svelte/icons/search";
```

The package block includes `@tabler/icons-svelte`. Keep component imports pointed at the shared icon facade.

### Localization setup

Add every message listed in [Localization](#localization) to each locale, then compile Paraglide to `src/lib/paraglide`. The component imports generated functions from `$lib/paraglide/messages.js`; do not copy or edit generated output by hand.

No additional localization runtime helper is required.

### Global CSS

The component needs Tailwind plus the semantic surface, text, border, input, focus-ring, accent, and radius tokens below. These are xvelte's values; apps may replace the values while preserving the variable names and mappings:

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--accent: oklch(0.841 0.238 128.85);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--accent: oklch(0.768 0.233 130.85);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-ring: var(--ring);
	--color-input: var(--input);
	--color-border: var(--border);
	--color-accent: var(--accent);
	--color-muted-foreground: var(--muted-foreground);
	--color-popover-foreground: var(--popover-foreground);
	--color-popover: var(--popover);
	--color-foreground: var(--foreground);
	--color-background: var(--background);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
}
```

The app owns dark-mode activation. Emoji Picker needs no `tw-animate-css` import, keyframe, custom variant, attachment, or additional layout rule.

---

## Credits

Adapted from [more-shadcn-svelte's Emoji Picker](https://more-shadcn.noair.fun/docs/components/emoji-picker). The local xvelte API, localization, icon facade, accessibility adjustments, styling hooks, and behavior documented here are the source of truth.

---

## File organization

| File                       | Responsibility                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `emoji-picker-root.svelte` | Complete UI, bindings, search, navigation, keyboard focus, selection, storage, and rendering. |
| `emoji-data.ts`            | Bundled category data, public data types, tone constants, and skin-tone helper.               |
| `index.ts`                 | Public component alias, props, types, data, and helper exports.                               |
| `README.md`                | Usage, API, accessibility, localization, installation, dependencies, and credits.             |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

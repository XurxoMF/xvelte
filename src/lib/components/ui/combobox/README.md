# Combobox

A searchable selection component that combines a button trigger, an anchored options popover, Command-based filtering, and visible selection indicators. It supports one selected string or multiple selected strings while leaving option labels and trigger content fully composable.

Use Combobox when a long or searchable option list would be cumbersome in a native select, or when option rows need custom markup. Prefer a native select for short, simple lists and use Command directly for actions that do not represent a selected value.

<!-- xvelte-example: overview -->

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
- [File organization](#file-organization)

---

## Import

Import all component parts from the component's public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Combobox from "$lib/components/ui/combobox";
</script>
```

The component's `index.ts` exports `Root`, `Trigger`, `Content`, `Input`, `List`, `Group`, `Item`, and `Empty`, together with all corresponding props types. It also exports the `ComboboxType`, `ValueMap`, `ComboboxState`, and `ComboboxContextState` types and the advanced `setComboboxContext` and `getComboboxContext` helpers.

---

## Anatomy

Compose the public parts below one root:

```svelte
<Combobox.Root>
	<Combobox.Trigger>Selected value or placeholder</Combobox.Trigger>

	<Combobox.Content>
		<Combobox.Input />
		<Combobox.Empty>No matches found.</Combobox.Empty>

		<Combobox.List>
			<Combobox.Group heading="Options">
				<Combobox.Item value="option">Option</Combobox.Item>
			</Combobox.Group>
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
```

`Root` owns selection and open state. `Trigger` opens the Popover and displays content supplied by the app. `Content` creates the anchored panel and internal Command root. `Input` filters items by their `value`; `List` is the scrollable results area; `Group` optionally labels related items; `Item` selects its string value; and `Empty` appears when filtering produces no matches.

Keep every state-aware part under the same `Root`. `Trigger` and `Item` read the nearest Combobox context during component initialization and fail when rendered without one.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Combobox from "$lib/components/ui/combobox";

	const frameworks = [
		{ value: "sveltekit", label: "SvelteKit" },
		{ value: "astro", label: "Astro" },
		{ value: "nuxt", label: "Nuxt" },
		{ value: "next", label: "Next.js" }
	];

	let framework = $state("");
	let frameworkLabel = $derived(frameworks.find((item) => item.value === framework)?.label ?? "Select a framework");
</script>

<Combobox.Root bind:value={framework}>
	<Combobox.Trigger>{frameworkLabel}</Combobox.Trigger>

	<Combobox.Content>
		<Combobox.Input placeholder="Search frameworks..." />
		<Combobox.Empty>No framework found.</Combobox.Empty>

		<Combobox.List>
			<Combobox.Group heading="Frameworks">
				{#each frameworks as item (item.value)}
					<Combobox.Item value={item.value}>{item.label}</Combobox.Item>
				{/each}
			</Combobox.Group>
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
```

The bound value stores the selected item's `value`, not its rendered label. Selecting the current item again clears the single selection to an empty string. Selecting any single item closes the popup and restores focus to the trigger.

---

## Examples

### Multiple selection

Set `type="multiple"` and bind an initialized string array. Selecting an item toggles its membership and keeps the popup open:

```svelte
<script lang="ts">
	import * as Combobox from "$lib/components/ui/combobox";

	const permissions = [
		{ value: "read", label: "Read" },
		{ value: "comment", label: "Comment" },
		{ value: "edit", label: "Edit" }
	];

	let selected = $state<string[]>([]);
	let summary = $derived(selected.length === 0 ? "Choose permissions" : `${selected.length} selected`);
</script>

<Combobox.Root type="multiple" bind:value={selected}>
	<Combobox.Trigger>{summary}</Combobox.Trigger>

	<Combobox.Content>
		<Combobox.Input placeholder="Search permissions..." />
		<Combobox.Empty>No permission found.</Combobox.Empty>

		<Combobox.List>
			{#each permissions as permission (permission.value)}
				<Combobox.Item value={permission.value}>{permission.label}</Combobox.Item>
			{/each}
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
```

The trigger content is not generated from the selection. Render a count, joined labels, badges, or a placeholder from the bound array as appropriate for the app.

### Grouped options

Use headings to make a larger result set easier to scan:

```svelte
<Combobox.Content>
	<Combobox.Input placeholder="Search locations..." />
	<Combobox.Empty>No location found.</Combobox.Empty>

	<Combobox.List>
		<Combobox.Group heading="Europe">
			<Combobox.Item value="lisbon">Lisbon</Combobox.Item>
			<Combobox.Item value="vienna">Vienna</Combobox.Item>
		</Combobox.Group>

		<Combobox.Group heading="Americas">
			<Combobox.Item value="montreal">Montréal</Combobox.Item>
			<Combobox.Item value="quito">Quito</Combobox.Item>
		</Combobox.Group>
	</Combobox.List>
</Combobox.Content>
```

Filtering is based on each item's `value`, not necessarily the visible children. Choose human-searchable values when labels contain terms people are likely to type.

### React to selection changes

`onchange` runs after a selection made through `Item`. It does not run merely because a parent assigns a new bound value:

```svelte
<Combobox.Root
	bind:value={framework}
	onchange={(nextValue) => {
		console.info("Framework selected", nextValue);
	}}
>
	<!-- Trigger and content -->
</Combobox.Root>
```

Use the binding as the source of truth. The callback is useful for selection-specific side effects, but it should not duplicate the bound state.

### Submit with a form

Combobox is not a native form control and has no `name`, `required`, or validity API. Mirror its value into hidden inputs:

```svelte
<form method="POST">
	<Combobox.Root bind:value={framework}>
		<!-- Trigger and content -->
	</Combobox.Root>

	<input type="hidden" name="framework" value={framework} />
	<button type="submit">Save preference</button>
</form>
```

For multiple selection, render one hidden input per value when the server expects repeated fields:

```svelte
{#each selected as permission (permission)}
	<input type="hidden" name="permissions" value={permission} />
{/each}
```

Validate required selection and accepted values on submission.

### Compact trigger

```svelte
<Combobox.Trigger size="sm" class="max-w-52">{frameworkLabel}</Combobox.Trigger>
```

`size` changes only the local trigger height and radius. Width remains `w-full` unless `class` overrides it.

---

## Public API

### `Combobox.Root`

Generic type: `RootProps<T extends ComboboxType>`, with `T` defaulting to `"single"`.

| Prop       | Type                           | Default     | xvelte behavior                                                                                                                                 |
| ---------- | ------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | `"single" \| "multiple"`       | `"single"`  | Selects string or string-array behavior. It is captured when the root initializes; changing it later does not reconfigure the existing context. |
| `value`    | `ValueMap[T]`                  | `undefined` | Bindable selection. Use an initialized string for single mode and initialized string array for multiple mode.                                   |
| `onchange` | `(value: ValueMap[T]) => void` | `undefined` | Runs after an item changes the selection. Parent assignments through the binding do not call it.                                                |
| `children` | `Snippet`                      | required    | Renders the trigger, content, and any app-owned surrounding markup inside the internal Popover root.                                            |

`Root` renders no DOM element of its own. It does not expose the internal Popover's `open` binding, Popover options, a class, form props, disabled/read-only state, or a ref. Single selection of the current value writes `""`; multiple selection toggles values without reordering the remaining entries.

### `Combobox.Trigger`

Type: `TriggerProps`, extending the local Popover `TriggerProps` with required content and local sizing.

| Prop       | Type                | Default     | xvelte behavior                                                                                                |
| ---------- | ------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `children` | `Snippet`           | required    | Visible value summary or placeholder; it supplies the button's accessible name unless an ARIA label is passed. |
| `size`     | `"sm" \| "default"` | `"default"` | Writes `data-size` and selects a 1.75rem or 2rem trigger height.                                               |
| `class`    | `string`            | `undefined` | Merged after local combobox trigger styles.                                                                    |

Remaining Popover Trigger props, including supported button and ARIA attributes such as `disabled`, are forwarded through the Popover wrapper. The trigger always delegates to the xvelte Button with `variant="outline"`, adds the selector icon, sets `role="combobox"`, reflects popup state through `aria-expanded`, fills the available width, and stores its button reference for focus restoration. See the [Bits UI Popover Trigger API](https://www.bits-ui.com/docs/components/popover#trigger) for inherited primitive behavior.

The internal open state and trigger ref are not bindable through this component's documented API. Avoid overriding its role or Popover-owned relationship attributes.

### `Combobox.Content`

Type: `ContentProps`.

| Prop       | Type      | Default     | xvelte behavior                                                                                                |
| ---------- | --------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `children` | `Snippet` | required    | Renders Input, Empty, List, Group, and Item parts inside an internal Command root.                             |
| `class`    | `string`  | `undefined` | Merged after anchored width, minimum width, overflow, surface, ring, shadow, and open/closed animation styles. |

Content does not forward Popover Content props. Its alignment and side offset therefore remain the local Popover defaults (`"center"` and `4`), and its portal, collision, focus, positioning, and interaction options cannot be changed through Combobox props.

### `Combobox.Input`

Type: `InputProps`.

| Prop          | Type     | Default       | xvelte behavior                                                                       |
| ------------- | -------- | ------------- | ------------------------------------------------------------------------------------- |
| `placeholder` | `string` | `"Search..."` | Placeholder passed to the internal Command input.                                     |
| `class`       | `string` | `undefined`   | Merged into the actual Command input rather than its surrounding input-group wrapper. |

Input does not forward the rest of the Command Input API. It has no public `value` binding, ref, input event, disabled state, name, or additional native attributes. Command owns its filtering query internally.

### `Combobox.List`

Type: `ListProps`.

| Prop       | Type      | Default     | xvelte behavior                                             |
| ---------- | --------- | ----------- | ----------------------------------------------------------- |
| `children` | `Snippet` | required    | Renders groups or items in the Command result list.         |
| `class`    | `string`  | `undefined` | Merged after the local full-width and scroll-margin styles. |

List does not forward Command List props or expose its DOM ref. The required Command component supplies a maximum height of `18rem`, vertical scrolling, keyboard navigation, and its `no-scrollbar` utility.

### `Combobox.Group`

Type: `GroupProps`.

| Prop       | Type      | Default     | xvelte behavior                                                             |
| ---------- | --------- | ----------- | --------------------------------------------------------------------------- |
| `heading`  | `string`  | `undefined` | Optional visible heading and default filtering value for the Command group. |
| `children` | `Snippet` | required    | Renders items in the group.                                                 |
| `class`    | `string`  | `undefined` | Merged after local scroll-margin and padding styles.                        |

Group does not forward the remaining Command Group props and has no public ref. Translate `heading` in the app.

### `Combobox.Item`

Type: `ItemProps`.

| Prop       | Type      | Default     | xvelte behavior                                                                                                                      |
| ---------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `value`    | `string`  | required    | Searchable and selected value. In single mode it replaces or clears selection; in multiple mode it is toggled in the selected array. |
| `children` | `Snippet` | required    | Visible option content rendered before the selection indicator.                                                                      |
| `class`    | `string`  | `undefined` | Merged after local option layout, focus/highlight, disabled-state, typography, icon, and indicator-spacing styles.                   |

Item does not forward the remaining Command Item props. In particular, it has no public `disabled`, `keywords`, ref, or custom `onSelect` prop. Values should be stable and unique within a root. The trailing check icon is rendered from Combobox context rather than Command's own checked state.

### `Combobox.Empty`

Type: `EmptyProps`.

| Prop       | Type      | Default     | xvelte behavior                                            |
| ---------- | --------- | ----------- | ---------------------------------------------------------- |
| `children` | `Snippet` | required    | App-supplied empty result message.                         |
| `class`    | `string`  | `undefined` | Merged with the Command Empty component's existing styles. |

Empty does not forward the remaining Command Empty props or expose a ref. Translate its children in the app.

### Selection and context types

```ts
type ComboboxType = "single" | "multiple";

type ValueMap = {
	single: string;
	multiple: string[];
};
```

`ComboboxState<T>` is the public type of the state object returned by `setComboboxContext`. `ComboboxContextState` is its type-erased descendant view, exposing reactive `open`, `triggerRef`, `type`, and read-only `value` properties plus `toggle()`, `close()`, `isSelected(itemValue)`, and `selectItem(itemValue)` methods. The concrete class is exported as a type only and cannot be instantiated from `index.ts`.

### Context helpers

`setComboboxContext(options)` creates a state object and provides it to descendants. Its options object must expose a reactive `value` getter and setter plus a `readonly type`. `getComboboxContext()` returns the nearest provided state and must run while initializing a descendant component.

These helpers are intended for custom Combobox roots or parts that extend the provided composition. Normal usage should prefer `Root`, `Trigger`, and `Item`; calling `setComboboxContext` creates a separate context, and calling `getComboboxContext` outside a provider fails. `close()` updates the DOM and then returns focus to `triggerRef`.

The component's `index.ts`, exported types, and local source are the source of truth for the public API. The [Bits UI Command documentation](https://www.bits-ui.com/docs/components/command) and [Popover documentation](https://www.bits-ui.com/docs/components/popover) describe dependency behavior, not additional Combobox props.

---

## Styling and DOM contract

Combobox uses Tailwind utilities, semantic theme tokens, Bits UI state attributes, and the styles of its required Button, Popover, Command, and Input Group components. It exposes no component-specific CSS variables.

| Part      | Rendered structure                                | Stable xvelte hook or class                                                 |
| --------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `Root`    | No element; creates Popover and Combobox contexts | None                                                                        |
| `Trigger` | Button delegated through Popover Trigger          | `data-slot="combobox-trigger"`, `data-size`                                 |
| `Content` | Portaled Popover content containing Command root  | `data-slot="combobox-content"`; inner `data-slot="command"`                 |
| `Input`   | Command input inside an Input Group               | `data-slot="command-input-wrapper"`, `command-input`, and Input Group hooks |
| `List`    | Command list                                      | `data-slot="command-list"`                                                  |
| `Group`   | Command group and optional group heading          | `data-slot="command-group"`                                                 |
| `Item`    | Command item and trailing indicator               | `data-slot="command-item"`, `.cn-select-item-indicator-icon`                |
| `Empty`   | Command empty state                               | `data-slot="command-empty"`                                                 |

`Content` uses `w-(--bits-popover-anchor-width)`, so its normal width follows the trigger's measured anchor width and never drops below `9rem`. `class` can override that width. `--bits-popover-anchor-width`, positioning transforms, `data-state`, `data-side`, Command selection attributes, ARIA relationships, and generated IDs are dependency-owned and may follow the installed stable Bits UI version.

The trigger's app-supplied `class` is merged after its local styles. Classes on the other public parts are passed into required wrappers and merged according to those components. Do not replace the documented slot values: descendant selectors use `combobox-content` to remove the Input Group's focus ring inside the popup.

---

## Accessibility

`Trigger` is a native button with `role="combobox"`, an `aria-expanded` value synchronized with open state, and Popover-provided relationship attributes. Its rendered children should always provide a clear accessible name; a placeholder such as “Select a framework” is preferable to an empty trigger. Pass an explicit `aria-label` when the visible summary is only a count or otherwise ambiguous.

The required Popover and Command primitives provide button activation, Escape handling, focus management, query filtering, arrow-key result navigation, and item selection. Single selection closes the popup and explicitly restores focus to the trigger after Svelte's next DOM update. Multiple selection leaves the popup open so more items can be toggled. A visual check indicates every selected item.

Consumer responsibilities:

- Supply meaningful, unique item values and visible option labels.
- Supply and translate an `Empty` message; do not leave filtered users with a blank popup.
- Use `Group.heading` for meaningful groups rather than visual decoration alone.
- Do not place interactive controls inside an Item's children because the entire row is one selectable command option.
- Add visible form labeling around the component when context alone does not identify the field.
- Mirror and validate values separately when the selection participates in a form.
- Test screen reader announcements for custom option markup and custom trigger summaries.

The current wrapper does not expose disabled items, input labeling attributes, open state, or focus hooks. If those are required, extend the reusable API rather than relying on private implementation elements.

---

## Localization

Combobox uses Paraglide for its default search placeholder. Keep this message in `messages/en.json` and translate it in every supported locale:

| Message ID          | English value | Used by                               |
| ------------------- | ------------- | ------------------------------------- |
| `harbor_wren_pause` | `Search...`   | Default `Combobox.Input` placeholder. |

Apps supply and translate trigger placeholders, selected-value summaries, group headings, item labels, empty results, labels, validation errors, and form actions. `Input.placeholder` overrides the built-in message.

Copying the complete required Command and Dialog folders also requires their existing `eager_panda_seek`, `frost_lime_drift`, and `amber_fox_glide` messages. They are used by optional exports in those folders rather than by the standard Combobox composition; follow the Command and Dialog README localization sections for their values and overrides.

---

## Dependencies

Combobox expects a Svelte 5 project using Tailwind CSS 4 and xvelte's Paraglide setup. Install all runtime and development packages in one of these command groups:

```sh
# bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss tw-animate-css

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss tw-animate-css
```

### Required UI components

Copy these complete xvelte component folders and follow each component's README to install it and understand its API:

- `src/lib/components/ui/button`: `button-root.svelte`, `index.ts`
- `src/lib/components/ui/command`: `command-root.svelte`, `command-dialog.svelte`, `command-empty.svelte`, `command-group.svelte`, `command-input.svelte`, `command-item.svelte`, `command-link-item.svelte`, `command-list.svelte`, `command-loading.svelte`, `command-separator.svelte`, `command-shortcut.svelte`, `index.ts`
- `src/lib/components/ui/popover`: `popover-root.svelte`, `popover-close.svelte`, `popover-content.svelte`, `popover-description.svelte`, `popover-header.svelte`, `popover-portal.svelte`, `popover-title.svelte`, `popover-trigger.svelte`, `index.ts`

The complete Command folder imports these components through its public `index.ts`, so copy them as well and follow their README guides:

- `src/lib/components/ui/dialog`: `dialog-root.svelte`, `dialog-close.svelte`, `dialog-content.svelte`, `dialog-description.svelte`, `dialog-footer.svelte`, `dialog-header.svelte`, `dialog-overlay.svelte`, `dialog-portal.svelte`, `dialog-title.svelte`, `dialog-trigger.svelte`, `index.ts`
- `src/lib/components/ui/input-group`: `input-group-root.svelte`, `input-group-addon.svelte`, `input-group-button.svelte`, `input-group-input.svelte`, `input-group-text.svelte`, `input-group-textarea.svelte`, `index.ts`
- `src/lib/components/ui/input`: `input-root.svelte`, `index.ts`
- `src/lib/components/ui/textarea`: `textarea-root.svelte`, `index.ts`

Keep `combobox-context.svelte.ts` in the Combobox folder; its complete contents are required for selection state, popup state, and focus restoration. Combobox requires no xvelte hook, attachment, shared component stylesheet, or external asset.

### Shared utilities

Combobox and its required UI components import `cn`, `WithoutChild`, `WithoutChildren`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block includes `clsx` and `tailwind-merge`, which `cn` imports.

### Icons

Combobox and the complete Command and Dialog component folders import these semantic names from `$lib/icons`. Add the exact exports to `src/lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
export { default as SearchIcon } from "@tabler/icons-svelte/icons/search";
export { default as SelectorIcon } from "@tabler/icons-svelte/icons/selector";
```

Keep these aliases in the shared icon facade instead of importing Tabler directly from component files.

### Localization setup

Keep the message entries documented in [Localization](#localization) in each locale and compile the Paraglide output to `src/lib/paraglide`. Combobox and its required components import generated functions from `$lib/paraglide/messages.js`; no generated localization file belongs inside the component folders.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, provide the hidden-scrollbar utility, define the dark and Bits UI state variants, set the shared border/outline defaults, and expose the semantic colors and radius scale. The values below are xvelte's defaults; apps may replace the values while preserving their names and mappings:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--accent: oklch(0.841 0.238 128.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.577 0.245 27.325);
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
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--accent: oklch(0.768 0.233 130.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
}

@custom-variant data-open {
	&:where([data-state="open"]),
	&:where([data-open]:not([data-open="false"])) {
		@slot;
	}
}

@custom-variant data-closed {
	&:where([data-state="closed"]),
	&:where([data-closed]:not([data-closed="false"])) {
		@slot;
	}
}

@custom-variant data-selected {
	&:where([data-selected]) {
		@slot;
	}
}

@custom-variant data-disabled {
	&:where([data-disabled="true"]),
	&:where([data-disabled]:not([data-disabled="false"])) {
		@slot;
	}
}

@utility no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}
```

`tw-animate-css` supplies the Popover and Dialog animation utilities; no Combobox-specific keyframe must be copied. The app remains responsible for applying its `.dark` class when dark mode is supported.

---

## File organization

| File                         | Responsibility                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `combobox-root.svelte`       | Public root, bindable selection, change callback, Popover root, and context initialization.           |
| `combobox-trigger.svelte`    | Button trigger, size styles, accessible popup state, selector icon, and focus-reference registration. |
| `combobox-content.svelte`    | Anchored Popover panel, internal Command root, surface styling, and animations.                       |
| `combobox-input.svelte`      | Search input with localized default placeholder.                                                      |
| `combobox-list.svelte`       | Scrollable Command result list.                                                                       |
| `combobox-group.svelte`      | Optional visible group heading and item grouping.                                                     |
| `combobox-item.svelte`       | Selectable value, selection behavior, state styling, and check indicator.                             |
| `combobox-empty.svelte`      | Empty filtered-results content.                                                                       |
| `combobox-context.svelte.ts` | Shared reactive selection, popup state, item toggling, and focus-restoration state.                   |
| `index.ts`                   | Public components, props types, state types, value mapping, and context helper exports.               |
| `README.md`                  | Installation, composition, examples, API, styling, accessibility, localization, and dependency guide. |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

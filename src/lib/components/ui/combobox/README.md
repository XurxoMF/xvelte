# Combobox

A searchable selection component that combines a button trigger, an anchored options popover, configurable Command-based filtering, and visible selection indicators. It supports one selected string or multiple selected strings, controlled selection and open state, root-level disabling, configurable deselection and closing behavior, disabled options, loading states, separators, and custom positioning while leaving option labels and trigger content fully composable.

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

The component's `index.ts` exports `Root`, `Trigger`, `Content`, `Input`, `List`, `Group`, `Item`, `Empty`, `Separator`, and `Loading`, together with all corresponding props types. It also exports the `ComboboxType`, `ValueMap`, `ComboboxOptions`, `ComboboxState`, and `ComboboxContextState` types and the advanced `setComboboxContext` and `getComboboxContext` helpers.

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
			<Combobox.Separator />
			<Combobox.Loading>Loading more options...</Combobox.Loading>
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
```

`Root` owns selection, open, disabled, deselection, and close-on-selection state. `Trigger` opens the Popover and displays content supplied by the app. `Content` creates the anchored panel and internal Command root. `Input` filters items by their `value` and keywords; `List` is the scrollable results area; `Group` optionally labels related items; `Item` selects its string value; `Empty` appears when filtering produces no matches; and `Separator` and `Loading` provide optional list structure and progress content.

Keep every state-aware part under the same `Root`. `Trigger`, `Input`, and `Item` read the nearest Combobox context during component initialization and fail when rendered without one.

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

The bound value stores the selected item's `value`, not its rendered label. By default, selecting the current item again clears the single selection to an empty string. Selecting any single item closes the popup and restores focus to the trigger.

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

### Controlled open state and selection behavior

Bind `open` to coordinate the popup with surrounding UI. Root callbacks report user and context-driven changes, while the completion callback runs after the Popover presence lifecycle finishes:

```svelte
<Combobox.Root
	bind:open
	bind:value={framework}
	allowDeselect={false}
	onOpenChange={(nextOpen) => console.info("Combobox open", nextOpen)}
	onOpenChangeComplete={(nextOpen) => console.info("Transition complete", nextOpen)}
>
	<!-- Trigger and content -->
</Combobox.Root>
```

`allowDeselect={false}` keeps the current single selection when its item is chosen again. `closeOnSelect` defaults to `true` in single mode and `false` in multiple mode; override it when a single-selection popup should remain open or a multiple-selection popup should close after every choice.

### Disabled and searchable options

Disable the complete component at Root or individual unavailable items at Item. `keywords` adds search terms without changing the stored value:

```svelte
<Combobox.Root bind:value={region} disabled={regionsUnavailable}>
	<Combobox.Trigger>Select a region</Combobox.Trigger>

	<Combobox.Content commandProps={{ loop: true }}>
		<Combobox.Input aria-label="Search regions" bind:value={query} />

		<Combobox.List>
			<Combobox.Item value="north" keywords={["northern"]}>North</Combobox.Item>
			<Combobox.Item value="south" keywords={["southern"]} disabled>South — unavailable</Combobox.Item>
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
```

`Input` forwards native input attributes and exposes bindable `value` and `ref`. `Content.commandProps` accepts Command Root options such as `loop`, `shouldFilter`, `filter`, `vimBindings`, and `onStateChange`.

### Positioning, separators, and loading

Content forwards the Popover positioning API and accepts `portalProps` through the local Popover wrapper:

```svelte
<Combobox.Content align="start" side="bottom" sideOffset={8} portalProps={{ disabled: true }}>
	<Combobox.Input />

	<Combobox.List>
		<Combobox.Group heading="Suggested">
			<!-- Items -->
		</Combobox.Group>

		<Combobox.Separator />
		<Combobox.Loading progress={65}>Loading all regions...</Combobox.Loading>
	</Combobox.List>
</Combobox.Content>
```

Use `Loading` only while results are being fetched. Its `progress` value is between `0` and `100`; the app supplies and translates its visible or screen-reader copy.

### React to selection changes

`onValueChange` runs after a selection made through `Item` or the public context state. It does not run merely because a parent assigns a new bound value:

```svelte
<Combobox.Root
	bind:value={framework}
	onValueChange={(nextValue) => {
		console.info("Framework selected", nextValue);
	}}
>
	<!-- Trigger and content -->
</Combobox.Root>
```

Use the binding as the source of truth. The callback is useful for selection-specific side effects, but it should not duplicate the bound state. The earlier `onchange` callback remains available as a compatibility alias and receives the same changes.

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

| Prop                   | Type                           | Default                           | xvelte behavior                                                                                                                                 |
| ---------------------- | ------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                 | `"single" \| "multiple"`       | `"single"`                        | Selects string or string-array behavior. It is captured when the root initializes; changing it later does not reconfigure the existing context. |
| `value`                | `ValueMap[T]`                  | `undefined`                       | Bindable selection. Use an initialized string for single mode and initialized string array for multiple mode.                                   |
| `open`                 | `boolean`                      | `false`                           | Bindable popup visibility shared with Trigger and context consumers.                                                                            |
| `disabled`             | `boolean`                      | `false`                           | Disables the root Trigger, search Input, and every Item.                                                                                        |
| `allowDeselect`        | `boolean`                      | `true`                            | Allows the selected single item to clear the value when selected again. It does not restrict clearing a multiple selection.                     |
| `closeOnSelect`        | `boolean`                      | Single: `true`; multiple: `false` | Chooses whether any enabled item selection closes the popup and restores Trigger focus.                                                         |
| `onValueChange`        | `(value: ValueMap[T]) => void` | `undefined`                       | Runs after context selection or clearing changes the value. Parent assignments through the binding do not call it.                              |
| `onchange`             | `(value: ValueMap[T]) => void` | `undefined`                       | Compatibility alias for `onValueChange`; both callbacks run when both are supplied.                                                             |
| `onOpenChange`         | `(open: boolean) => void`      | `undefined`                       | Runs when Popover interaction or the public context state changes popup visibility.                                                             |
| `onOpenChangeComplete` | `(open: boolean) => void`      | `undefined`                       | Runs after the underlying Popover reports that its open or close presence lifecycle completed.                                                  |
| `children`             | `Snippet`                      | required                          | Renders the trigger, content, and any app-owned surrounding markup inside the internal Popover root.                                            |

`Root` renders no DOM element of its own. It has no class, form props, read-only state, or ref. Single selection of the current value writes `""` only when `allowDeselect` permits it; multiple selection toggles values without reordering the remaining entries. Assigning `value` or `open` directly through a parent binding does not invoke its matching callback.

### `Combobox.Trigger`

Type: `TriggerProps`, extending the local Popover `TriggerProps` with required content and local sizing.

| Prop       | Type                  | Default     | xvelte behavior                                                                                                |
| ---------- | --------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `children` | `Snippet`             | required    | Visible value summary or placeholder; it supplies the button's accessible name unless an ARIA label is passed. |
| `size`     | `"sm" \| "default"`   | `"default"` | Writes `data-size` and selects a 1.75rem or 2rem trigger height.                                               |
| `class`    | `string`              | `undefined` | Merged after local combobox trigger styles.                                                                    |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable delegated trigger reference; the rendered node is normally a native button.                           |

Remaining Popover Trigger props, including supported button and ARIA attributes such as `disabled`, are forwarded through the Popover wrapper. The trigger always delegates to the xvelte Button with `variant="outline"`, adds the selector icon, sets `role="combobox"`, reflects popup state through `aria-expanded`, fills the available width, and stores its button reference for focus restoration. See the [Bits UI Popover Trigger API](https://www.bits-ui.com/docs/components/popover#trigger) for inherited primitive behavior.

Root-level `disabled` takes precedence over a false Trigger `disabled` prop. Avoid overriding its role or Popover-owned relationship attributes.

### `Combobox.Content`

Type: `ContentProps`.

| Prop           | Type                                 | Default     | xvelte behavior                                                                                                |
| -------------- | ------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `children`     | `Snippet`                            | required    | Renders Input, Empty, List, Group, Item, Separator, and Loading parts inside an internal Command root.         |
| `class`        | `string`                             | `undefined` | Merged after anchored width, minimum width, overflow, surface, ring, shadow, and open/closed animation styles. |
| `ref`          | `HTMLDivElement \| null`             | `null`      | Bindable positioned-content reference.                                                                         |
| `commandProps` | `Command.RootProps` without snippets | `undefined` | Configures the internal Command root; its class is merged after the local full-width and padding styles.       |

Content forwards the local Popover Content API, including `portalProps`, `sideOffset`, `align`, `side`, collision and sticky options, focus hooks, Escape and outside-interaction callbacks, and native div attributes. Its local Popover defaults remain `align="center"` and `sideOffset={4}`. `commandProps` supports filtering, keyboard-loop, pointer-selection, Vim-binding, grid, label, and state callbacks; snippets remain owned by Content. See the [Bits UI Command Root API](https://www.bits-ui.com/docs/components/command#root) and [Popover Content API](https://www.bits-ui.com/docs/components/popover#content).

### `Combobox.Input`

Type: `InputProps`.

| Prop          | Type                       | Default       | xvelte behavior                                                                       |
| ------------- | -------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `placeholder` | `string`                   | `"Search..."` | Placeholder passed to the internal Command input.                                     |
| `value`       | `string`                   | `""`          | Bindable filtering query.                                                             |
| `ref`         | `HTMLInputElement \| null` | `null`        | Bindable native input reference.                                                      |
| `class`       | `string`                   | `undefined`   | Merged into the actual Command input rather than its surrounding input-group wrapper. |

Input forwards the remaining Command Input and native input attributes, including `disabled`, ARIA labeling, input handlers, `name`, and `autocomplete`; its primitive `child` customization is removed so the xvelte input structure remains stable. Root-level `disabled` takes precedence over a false Input `disabled` prop.

### `Combobox.List`

Type: `ListProps`.

| Prop       | Type                     | Default     | xvelte behavior                                             |
| ---------- | ------------------------ | ----------- | ----------------------------------------------------------- |
| `children` | `Snippet`                | required    | Renders groups or items in the Command result list.         |
| `class`    | `string`                 | `undefined` | Merged after the local full-width and scroll-margin styles. |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable Command list reference.                            |

List forwards the remaining Command List and native div attributes. Its primitive `child` customization is removed. The required Command component supplies a maximum height of `18rem`, vertical scrolling, keyboard navigation, and its `no-scrollbar` utility.

### `Combobox.Group`

Type: `GroupProps`.

| Prop         | Type                     | Default                 | xvelte behavior                                                             |
| ------------ | ------------------------ | ----------------------- | --------------------------------------------------------------------------- |
| `heading`    | `string`                 | `undefined`             | Optional visible heading and default filtering value for the Command group. |
| `children`   | `Snippet`                | required                | Renders items in the group.                                                 |
| `class`      | `string`                 | `undefined`             | Merged after local scroll-margin and padding styles.                        |
| `value`      | `string`                 | Heading or generated ID | Explicit filtering value for the group.                                     |
| `forceMount` | `boolean`                | `false`                 | Keeps the group mounted when filtering would hide it.                       |
| `ref`        | `HTMLDivElement \| null` | `null`                  | Bindable Command group reference.                                           |

Group forwards the remaining Command Group and native div attributes while removing primitive `child` customization. Translate `heading` in the app.

### `Combobox.Item`

Type: `ItemProps`.

| Prop         | Type                     | Default     | xvelte behavior                                                                                                                      |
| ------------ | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `value`      | `string`                 | required    | Searchable and selected value. In single mode it replaces or clears selection; in multiple mode it is toggled in the selected array. |
| `children`   | `Snippet`                | required    | Visible option content rendered before the selection indicator.                                                                      |
| `class`      | `string`                 | `undefined` | Merged after local option layout, focus/highlight, disabled-state, typography, icon, and indicator-spacing styles.                   |
| `disabled`   | `boolean`                | `false`     | Prevents pointer and keyboard selection; root-level disabled state takes precedence.                                                 |
| `keywords`   | `string[]`               | `undefined` | Adds filtering terms without changing the stable selected value.                                                                     |
| `forceMount` | `boolean`                | `false`     | Keeps the item mounted regardless of filtering.                                                                                      |
| `onSelect`   | `() => void`             | `undefined` | Runs after the Combobox applies its selection behavior.                                                                              |
| `ref`        | `HTMLDivElement \| null` | `null`      | Bindable Command item reference.                                                                                                     |

Item forwards remaining native div attributes while removing primitive `child` customization. Values should be stable and unique within a root. The trailing check icon is rendered from Combobox context rather than Command's own checked state. `onSelect` is not called for disabled items.

### `Combobox.Empty`

Type: `EmptyProps`.

| Prop         | Type                     | Default     | xvelte behavior                                            |
| ------------ | ------------------------ | ----------- | ---------------------------------------------------------- |
| `children`   | `Snippet`                | required    | App-supplied empty result message.                         |
| `class`      | `string`                 | `undefined` | Merged with the Command Empty component's existing styles. |
| `forceMount` | `boolean`                | `false`     | Keeps the empty state mounted regardless of filtering.     |
| `ref`        | `HTMLDivElement \| null` | `null`      | Bindable Command empty-state reference.                    |

Empty forwards the remaining Command Empty and native div attributes while removing primitive `child` customization. Translate its children in the app.

### `Combobox.Separator` and `Combobox.Loading`

| Part and type                  | Public API                                                                                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Separator` — `SeparatorProps` | Forwards the complete Command Separator API, including `forceMount`, bindable `ref`, native div attributes, and optional children. It replaces the inherited slot with `combobox-separator`. |
| `Loading` — `LoadingProps`     | Forwards the complete Command Loading API, including `progress`, bindable `ref`, native div attributes, and optional children. It replaces the inherited slot with `combobox-loading`.       |

Place these parts inside List or Group as appropriate. Loading supplies no built-in spinner or message.

### Selection and context types

```ts
type ComboboxType = "single" | "multiple";

type ValueMap = {
	single: string;
	multiple: string[];
};
```

`ComboboxState<T>` is the public type of the state object returned by `setComboboxContext`. `ComboboxContextState` is its type-erased descendant view. It exposes reactive `value`, `open`, `triggerRef`, `type`, `disabled`, `allowDeselect`, and `closeOnSelect` properties plus `openPopup()`, `toggle()`, `close()`, `clear()`, `isSelected(itemValue)`, and `selectItem(itemValue)` methods. The concrete class is exported as a type only and cannot be instantiated from `index.ts`.

### Context helpers

`setComboboxContext(options)` creates a state object and provides it to descendants. Its exported `ComboboxOptions<T>` object must expose reactive `value` and `open` getters and setters, plus read-only `type`, `disabled`, `allowDeselect`, `closeOnSelect`, and optional `onOpenChange` properties. Use accessor properties for every reactive option. `getComboboxContext()` returns the nearest provided state and must run while initializing a descendant component.

These helpers are intended for custom Combobox roots or parts that extend the provided composition. Normal usage should prefer `Root`, `Trigger`, and `Item`; calling `setComboboxContext` creates a separate context, and calling `getComboboxContext` outside a provider fails. `openPopup()` and `toggle()` do nothing while disabled. `clear()` respects disabled state and single-mode `allowDeselect`. `close()` updates the DOM and then returns focus to `triggerRef`.

The component's `index.ts`, exported types, and local source are the source of truth for the public API. The [Bits UI Command documentation](https://www.bits-ui.com/docs/components/command) and [Popover documentation](https://www.bits-ui.com/docs/components/popover) describe dependency behavior, not additional Combobox props.

---

## Styling and DOM contract

Combobox uses Tailwind utilities, semantic theme tokens, Bits UI state attributes, and the styles of its required Button, Popover, Command, and Input Group components. It exposes no component-specific CSS variables.

| Part        | Rendered structure                                | Stable xvelte hook or class                                      |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `Root`      | No element; creates Popover and Combobox contexts | None                                                             |
| `Trigger`   | Button delegated through Popover Trigger          | `data-slot="combobox-trigger"`, `data-size`                      |
| `Content`   | Portaled Popover content containing Command root  | `data-slot="combobox-content"`; inner `data-slot="command"`      |
| `Input`     | Command input inside an Input Group               | `data-slot="combobox-input"`, plus Command and Input Group hooks |
| `List`      | Command list                                      | `data-slot="combobox-list"`                                      |
| `Group`     | Command group and optional group heading          | `data-slot="combobox-group"`                                     |
| `Item`      | Command item and trailing indicator               | `data-slot="combobox-item"`                                      |
| `Empty`     | Command empty state                               | `data-slot="combobox-empty"`                                     |
| `Separator` | Command separator                                 | `data-slot="combobox-separator"`                                 |
| `Loading`   | Command loading state                             | `data-slot="combobox-loading"`                                   |

`Content` uses `w-(--bits-popover-anchor-width)`, so its normal width follows the trigger's measured anchor width and never drops below `9rem`. `class` can override that width. `--bits-popover-anchor-width`, positioning transforms, `data-state`, `data-side`, Command selection attributes, disabled attributes, ARIA relationships, and generated IDs are dependency-owned and may follow the installed stable Bits UI version.

The trigger's app-supplied `class` is merged after its local styles. Classes on the other public parts are passed into required wrappers and merged according to those components. Do not replace the documented slot values: descendant selectors use `combobox-content` to remove the Input Group's focus ring inside the popup.

---

## Accessibility

`Trigger` is a native button with `role="combobox"`, an `aria-expanded` value synchronized with open state, and Popover-provided relationship attributes. Its rendered children should always provide a clear accessible name; a placeholder such as “Select a framework” is preferable to an empty trigger. Pass an explicit `aria-label` when the visible summary is only a count or otherwise ambiguous.

The required Popover and Command primitives provide button activation, Escape handling, focus management, query filtering, arrow-key result navigation, and item selection. By default, single selection closes the popup and explicitly restores focus to the trigger after Svelte's next DOM update, while multiple selection leaves it open. `closeOnSelect` can change either rule. A visual check indicates every selected item.

Consumer responsibilities:

- Supply meaningful, unique item values and visible option labels.
- Supply an accessible label on Input through `aria-label`, `aria-labelledby`, or surrounding labeling when its placeholder alone is not sufficient.
- Mark unavailable options with Item `disabled`, and use Root `disabled` when the complete field is unavailable.
- Supply and translate an `Empty` message; do not leave filtered users with a blank popup.
- Use `Group.heading` for meaningful groups rather than visual decoration alone.
- Do not place interactive controls inside an Item's children because the entire row is one selectable command option.
- Add visible form labeling around the component when context alone does not identify the field.
- Mirror and validate values separately when the selection participates in a form.
- Test screen reader announcements for custom option markup and custom trigger summaries.

Combobox is still not a native form control and Root does not provide `name`, `required`, validity, or read-only behavior. Mirror its selection into hidden inputs and validate it separately when it participates in a form.

---

## Localization

Combobox uses Paraglide for its default search placeholder. Keep this message in `messages/en.json` and translate it in every supported locale:

| Message ID          | English value | Used by                               |
| ------------------- | ------------- | ------------------------------------- |
| `harbor_wren_pause` | `Search...`   | Default `Combobox.Input` placeholder. |

Apps supply and translate trigger placeholders, selected-value summaries, group headings, item labels, empty results, loading content, labels, validation errors, and form actions. `Input.placeholder` overrides the built-in message. Separator has no human-readable copy.

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
	--danger: oklch(0.577 0.245 27.325);
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
	--danger: oklch(0.704 0.191 22.216);
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
	--color-danger: var(--danger);
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

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
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
| `combobox-separator.svelte`  | Optional forwarded Command separator with a Combobox-specific slot.                                   |
| `combobox-loading.svelte`    | Optional forwarded Command loading state and progress metadata.                                       |
| `combobox-context.svelte.ts` | Shared reactive selection, popup, disabled, deselection, closing, and focus-restoration state.        |
| `index.ts`                   | Public components, props types, context option and state types, value mapping, and helper exports.    |
| `README.md`                  | Installation, composition, examples, API, styling, accessibility, localization, and dependency guide. |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

# Command

A composable command menu for searching, filtering, navigating, and selecting actions or destinations. It supports grouped results, disabled items, links, keyboard shortcuts, loading and empty states, custom filtering, controlled selection, an imperative navigation API, and an optional modal presentation.

Use Command for command palettes, searchable action lists, launchers, and other interfaces where selecting a result performs an action. Use Combobox when the result represents a persistent form value, and do not use Command as ordinary site navigation when visible links would be clearer and easier to discover.

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
- [Credits](#credits)
- [File organization](#file-organization)

---

## Import

Import all parts from the component's public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Command from "$lib/components/ui/command";
</script>
```

Command's `index.ts` exports `Root`, `Dialog`, `Input`, `List`, `Group`, `Item`, `LinkItem`, `Empty`, `Loading`, `Separator`, and `Shortcut`. It also exports `RootApi` and the props type for every public part.

---

## Anatomy

Compose a search input and result list beneath one root:

```svelte
<Command.Root label="Application commands">
	<Command.Input placeholder="Search commands..." />

	<Command.List aria-label="Available commands">
		<Command.Empty>No commands found.</Command.Empty>

		<Command.Group heading="Suggestions">
			<Command.Item value="open-settings">Open settings</Command.Item>
		</Command.Group>

		<Command.Separator />

		<Command.Group heading="Help">
			<Command.LinkItem value="open-help" href="/help">Help center</Command.LinkItem>
		</Command.Group>
	</Command.List>
</Command.Root>
```

`Root` owns the search, filtered results, and current item state. `Input` changes the search query. `List` contains `Empty`, `Loading`, groups, items, links, and separators. `Group` renders its own optional heading around its items. `Shortcut` is a presentational suffix inside an Item. `Dialog` replaces `Root` when the complete menu should be modal.

The local wrapper intentionally does not export the lower-level Bits UI `Viewport`, `GroupHeading`, or `GroupItems` parts. `List` accepts results directly, while `Group.heading` and `Group.children` create the other two structures internally.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Command from "$lib/components/ui/command";

	function runCommand(command: string) {
		console.info("Run command", command);
	}
</script>

<Command.Root label="Workspace commands" class="max-w-md border shadow-md">
	<Command.Input placeholder="Search workspace commands..." />

	<Command.List aria-label="Workspace commands">
		<Command.Empty>No commands found.</Command.Empty>

		<Command.Group heading="Workspace">
			<Command.Item value="create-project" onSelect={() => runCommand("create-project")}>Create project</Command.Item>
			<Command.Item value="open-project" onSelect={() => runCommand("open-project")}>Open project</Command.Item>
			<Command.Item value="archive-project" disabled>Archive project</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Root>
```

Give every item a stable, unique `value`. That value drives filtering, ranking, selection, and `Root.value`; `onSelect` is the appropriate place to run the associated action.

---

## Examples

### Command palette dialog

`Dialog` combines the local Dialog and Command roots. The keyboard shortcut remains application behavior and must be registered by the app:

```svelte
<script lang="ts">
	import * as Command from "$lib/components/ui/command";

	let open = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<button type="button" onclick={() => (open = true)}>Open command palette</button>

<Command.Dialog bind:open label="Command palette commands" title="Command palette" description="Search for an action to run">
	<Command.Input placeholder="Search actions..." autofocus />

	<Command.List aria-label="Actions">
		<Command.Empty>No actions found.</Command.Empty>

		<Command.Group heading="Navigation">
			<Command.LinkItem value="open-dashboard" href="/dashboard">Dashboard</Command.LinkItem>
			<Command.LinkItem value="open-settings" href="/settings">Settings</Command.LinkItem>
		</Command.Group>
	</Command.List>
</Command.Dialog>
```

`title` and `description` are rendered in a screen-reader-only Dialog header. The default dialog has no visible close button; set `showCloseButton` when a pointer-accessible close control is wanted. Escape and outside interaction are handled by Dialog according to its configured behavior.

### Selection and search bindings

The Root binding and Input binding represent different state:

```svelte
<script lang="ts">
	import * as Command from "$lib/components/ui/command";

	let selectedValue = $state("");
	let search = $state("");
</script>

<Command.Root bind:value={selectedValue} label="Documentation commands" loop>
	<Command.Input bind:value={search} placeholder="Search documentation..." />

	<Command.List aria-label="Documentation commands">
		<Command.Empty>No documentation found.</Command.Empty>
		<Command.Item value="open-api-reference">API reference</Command.Item>
		<Command.Item value="open-examples">Examples</Command.Item>
	</Command.List>
</Command.Root>

<p>Search query: {search}</p>
<p>Current command item: {selectedValue}</p>
```

`Input.value` is the query. `Root.value` is the current command item, which can change through keyboard or pointer navigation before the item is activated. Do not treat `Root.value` alone as proof that an action was executed; use each item's `onSelect` for that.

### Keywords and custom filtering

Add alternate search terms through `keywords`, or replace the default score function on Root:

```svelte
<script lang="ts">
	function strictFilter(value: string, search: string, keywords: string[] = []) {
		const query = search.trim().toLocaleLowerCase();
		if (!query) return 1;

		return [value, ...keywords].some((candidate) => candidate.toLocaleLowerCase().includes(query)) ? 1 : 0;
	}
</script>

<Command.Root label="Editor commands" filter={strictFilter}>
	<Command.Input placeholder="Search editor commands..." />

	<Command.List aria-label="Editor commands">
		<Command.Item value="toggle-command-palette" keywords={["launcher", "quick actions"]}>Command palette</Command.Item>
		<Command.Item value="format-document" keywords={["prettier", "indent"]}>Format document</Command.Item>
	</Command.List>
</Command.Root>
```

A custom filter returns a score from `0` to `1`; `0` hides an item. Set `shouldFilter={false}` when results are already filtered or fetched externally, then conditionally render only the desired items yourself.

### Links and shortcuts

Use `LinkItem` for navigation so normal link behavior, preloading, and modifier-click behavior remain available:

```svelte
<Command.Group heading="Account">
	<Command.LinkItem value="open-profile" href="/account/profile">
		Profile
		<Command.Shortcut>⌘P</Command.Shortcut>
	</Command.LinkItem>

	<Command.Item value="sign-out" onSelect={signOut}>
		Sign out
		<Command.Shortcut>⇧⌘Q</Command.Shortcut>
	</Command.Item>
</Command.Group>
```

`Shortcut` only renders its text and styling; it does not register a key listener. LinkItem never adds a check indicator. Item appends one, but the current local visibility selector expects `data-checked` while installed Bits UI marks the active item with `data-selected`, so the check remains hidden unless the styling is adapted. An Item containing a Shortcut hides it explicitly as well.

### Loading results

```svelte
<Command.List aria-label="Remote commands" aria-busy={loading}>
	{#if loading}
		<Command.Loading {progress}>Loading commands…</Command.Loading>
	{:else}
		<Command.Empty>No remote commands found.</Command.Empty>
		<!-- Render loaded groups and items -->
	{/if}
</Command.List>
```

`Loading.progress` is a number from `0` to `100`. Command does not fetch data, announce application-specific loading copy, or manage request errors.

### Imperative navigation

Bind the local `api` prop when custom navigation needs the installed Bits UI methods:

```svelte
<script lang="ts">
	import * as Command from "$lib/components/ui/command";

	let api = $state<Command.RootApi | null>(null);

	function selectLastItem() {
		const items = api?.getValidItems() ?? [];
		if (items.length > 0) api?.updateSelectedToIndex(items.length - 1);
	}
</script>

<button type="button" onclick={selectLastItem}>Select last available command</button>

<Command.Root bind:api label="Commands">
	<!-- Input and list -->
</Command.Root>
```

Use `bind:ref` instead when the app needs the rendered root `div`. `Command.Dialog` exposes the Command root's `ref` and `value`, but its public type does not expose `api`.

---

## Public API

Every primitive-based part forwards the remaining compatible Bits UI and native element props unless a local adaptation below says otherwise. The tables summarize local behavior and the inherited options most important in normal use; see the exact [Bits UI Command API reference](https://www.bits-ui.com/docs/components/command#api-reference) for the complete primitive API.

### `Command.Root`

Type: `RootProps`, based on Bits UI `Command.RootProps` with one local imperative binding.

| Prop                      | Type                                                             | Default      | xvelte behavior                                                                                                     |
| ------------------------- | ---------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `api`                     | `RootApi \| null`                                                | `null`       | Bindable Bits UI component API; distinct from the DOM ref.                                                          |
| `value`                   | `string`                                                         | `""`         | Bindable current item value.                                                                                        |
| `onValueChange`           | `(value: string) => void`                                        | `undefined`  | Runs when Bits UI changes the current item value.                                                                   |
| `label`                   | `string`                                                         | `""`         | Screen-reader label for the command menu. Supply a meaningful non-empty value.                                      |
| `filter`                  | `(value: string, search: string, keywords?: string[]) => number` | Bits default | Scores each result from `0` to `1`.                                                                                 |
| `shouldFilter`            | `boolean`                                                        | `true`       | Enables built-in filtering and score-based sorting.                                                                 |
| `loop`                    | `boolean`                                                        | `false`      | Wraps keyboard item navigation at the first and last valid items.                                                   |
| `vimBindings`             | `boolean`                                                        | `true`       | Enables `Ctrl+N/J/P/K` navigation.                                                                                  |
| `disablePointerSelection` | `boolean`                                                        | `false`      | Stops pointer movement from changing the current item.                                                              |
| `disableInitialScroll`    | `boolean`                                                        | `false`      | Prevents the initial selected item from being scrolled into view; later selection still scrolls.                    |
| `columns`                 | `number \| null`                                                 | `null`       | Configures grid navigation columns.                                                                                 |
| `onStateChange`           | `(state: Readonly<CommandState>) => void`                        | `undefined`  | Receives batched snapshots of query, selected value, visible items, and groups. `CommandState` is dependency-owned. |
| `ref`                     | `HTMLDivElement \| null`                                         | `null`       | Bindable reference to the rendered root element.                                                                    |
| `class`                   | `string`                                                         | `undefined`  | Merged after local layout, clipping, popover surface, radius, and padding styles.                                   |
| `children` / `child`      | Bits UI snippets                                                 | `undefined`  | Render normal descendants or delegate the root element while retaining supplied primitive props.                    |

Remaining compatible `div` attributes are forwarded. The final spread can override `data-slot="command"`; doing so breaks the documented styling hook and is not recommended.

### `RootApi`

`RootApi` is the installed Bits UI Root component API exposed through `bind:api`:

| Method                          | Result                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `getValidItems()`               | Returns visible, non-disabled item elements in navigation order.             |
| `updateSelectedToIndex(index)`  | Selects a valid item by zero-based index; invalid indexes do nothing.        |
| `updateSelectedByItem(change)`  | Moves relative to the current item; use `1` for next and `-1` for previous.  |
| `updateSelectedByGroup(change)` | Moves to the next or previous group's first valid item; accepts `1` or `-1`. |

The exact API follows the installed stable Bits UI version. Check the exported `RootApi` type before depending on additional methods.

### `Command.Dialog`

Type: `DialogProps`, combining Bits UI Dialog Root and Command Root props after removing their child snippets.

| Prop              | Type                        | Default                            | xvelte behavior                                                                                                       |
| ----------------- | --------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `open`            | `boolean`                   | `false`                            | Bindable Dialog open state.                                                                                           |
| `value`           | `string`                    | `""`                               | Bindable current Command item value.                                                                                  |
| `ref`             | `HTMLDivElement \| null`    | `null`                             | Bindable reference to the inner Command root, not the Dialog content.                                                 |
| `title`           | `string`                    | `"Command Palette"`                | Screen-reader-only Dialog title.                                                                                      |
| `description`     | `string`                    | `"Search for a command to run..."` | Screen-reader-only Dialog description.                                                                                |
| `showCloseButton` | `boolean`                   | `false`                            | Shows the local Dialog content's close icon button.                                                                   |
| `portalProps`     | Bits UI Dialog Portal props | `undefined`                        | Passed to the local Dialog content's portal.                                                                          |
| `class`           | `string`                    | `undefined`                        | Styles Dialog Content; merged after its top-third position, zero vertical translation, clipping, radius, and padding. |
| `children`        | `Snippet \| undefined`      | `undefined`                        | Renders Command parts inside the inner root.                                                                          |

Inherited Command options such as `filter`, `shouldFilter`, `loop`, `label`, and `onStateChange`, and Dialog options such as modal and open-change behavior, are accepted by the combined type. The local implementation forwards the same remaining props object to both roots, so test advanced root-specific options against the installed versions. `Dialog` does not expose `api`, Dialog Content positioning props, or a visible header. See the [Bits UI Dialog API](https://www.bits-ui.com/docs/components/dialog#api-reference) for inherited modal behavior.

### `Command.Input`

Type: `InputProps`, matching Bits UI Command Input props.

| Prop                 | Type                       | Default     | xvelte behavior                                                                                                    |
| -------------------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `value`              | `string`                   | `""`        | Bindable search query.                                                                                             |
| `ref`                | `HTMLInputElement \| null` | `null`      | Bindable reference to the actual input.                                                                            |
| `class`              | `string`                   | `undefined` | Merged on the input after local width, typography, outline, and disabled styles; not applied to the outer wrapper. |
| `children` / `child` | Bits UI snippets           | `undefined` | Inherited render delegation for the primitive input.                                                               |

Native input attributes are forwarded. The local part adds a fixed outer `command-input-wrapper`, an Input Group surface, and a Search icon. Bits UI connects the input to Root's hidden label through `aria-labelledby`, so supply a meaningful `Root.label`; a placeholder alone is not a durable label.

### `Command.List`

Type: `ListProps`, matching Bits UI Command List props.

`List` forwards its `children`, render delegation, bindable `ref`, `class`, ARIA attributes, and compatible native `div` attributes. It adds a maximum height of `18rem`, vertical scrolling, hidden scrollbars, scroll padding, and `data-slot="command-list"`. Bits UI supplies `"Suggestions..."` as its fallback accessible label; pass a localized `aria-label` instead.

### `Command.Group`

Type: `GroupProps`, matching Bits UI Command Group props plus a local `heading`.

| Prop         | Type                     | Default     | xvelte behavior                                                                                                             |
| ------------ | ------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| `heading`    | `string`                 | `undefined` | Renders a styled Bits UI Group Heading.                                                                                     |
| `value`      | `string`                 | generated   | Uses the explicit value, otherwise the heading, otherwise a unique `----<id>` value so every group remains distinguishable. |
| `forceMount` | `boolean`                | `false`     | Keeps the group mounted regardless of filtering.                                                                            |
| `children`   | `Snippet`                | `undefined` | Rendered through an internal Bits UI Group Items part.                                                                      |
| `ref`        | `HTMLDivElement \| null` | `null`      | Bindable group container reference.                                                                                         |
| `class`      | `string`                 | `undefined` | Merged after local clipping, padding, foreground, and descendant heading styles.                                            |

Remaining native `div`, child delegation, and primitive props are forwarded. Because children are always rendered through Group Items, apps cannot independently style or bind the unexported Group Items part through the xvelte API.

### `Command.Item`

Type: `ItemProps`, matching Bits UI Command Item props.

| Prop                 | Type                     | Default      | xvelte behavior                                                                                        |
| -------------------- | ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| `value`              | `string`                 | text-derived | Stable unique filtering and selection value. Dynamic text requires an explicit value.                  |
| `keywords`           | `string[]`               | `[]`         | Additional terms considered by filtering.                                                              |
| `disabled`           | `boolean`                | `false`      | Removes the item from valid selection and applies disabled styling.                                    |
| `forceMount`         | `boolean`                | `false`      | Keeps the item mounted regardless of filtering.                                                        |
| `onSelect`           | `() => void`             | `undefined`  | Runs when the item is activated by pointer or keyboard.                                                |
| `ref`                | `HTMLDivElement \| null` | `null`       | Bindable default item reference.                                                                       |
| `class`              | `string`                 | `undefined`  | Merged after local item, selected, disabled, descendant icon, and Dialog-specific radius styles.       |
| `children` / `child` | Bits UI snippets         | `undefined`  | Render content or delegate the primitive while spreading its supplied semantics and interaction props. |

Compatible native `div` attributes are forwarded. The local wrapper always appends a Check icon, but its visibility currently depends on `data-checked="true"`. Installed Bits UI 2.18.1 exposes `data-selected` instead, so the icon remains transparent by default; an Item containing `Command.Shortcut` hides it explicitly too. Item values must be unique even when visible labels are duplicated.

### `Command.LinkItem`

Type: `LinkItemProps`, matching Bits UI Command Link Item props.

LinkItem supports the Item options above plus compatible native anchor attributes such as required navigation `href`, target, rel, and SvelteKit link options. It renders an anchor, uses `aria-selected` styling, and does not append the local Check indicator. Use `onSelect` only for supplemental behavior; preserve normal navigation semantics.

### `Command.Empty`

Type: `EmptyProps`, matching Bits UI Command Empty props.

Empty forwards optional children, child delegation, bindable `ref`, `class`, `forceMount`, and native `div` attributes. It appears when no filtered items remain, unless `forceMount` keeps it present. The local wrapper adds centered text, vertical padding, and `data-slot="command-empty"`; the app supplies all visible copy.

### `Command.Loading`

Type: `LoadingProps`, matching Bits UI Command Loading props.

Loading forwards `progress` (`0`–`100`), optional children, child delegation, bindable `ref`, `class`, and compatible native `div` attributes directly to Bits UI. It adds no local styles or `data-slot`. Bits UI renders `role="progressbar"`, the value range, and a fixed `aria-label="Loading..."`; supply visible loading copy and expose request failure separately.

### `Command.Separator`

Type: `SeparatorProps`, matching Bits UI Command Separator props.

Separator forwards optional children, child delegation, bindable `ref`, `class`, `forceMount`, and compatible native `div` attributes. It adds a one-pixel `border`-token line, negative inline margin, and `data-slot="command-separator"`. Bits UI hides or shows it with filtering unless `forceMount` is true.

### `Command.Shortcut`

Type: `ShortcutProps`, based on native `span` attributes with a bindable reference.

| Prop       | Type                      | Default     | xvelte behavior                                                                                              |
| ---------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `children` | `Snippet`                 | `undefined` | Renders shortcut text.                                                                                       |
| `ref`      | `HTMLSpanElement \| null` | `null`      | Bindable span reference.                                                                                     |
| `class`    | `string`                  | `undefined` | Merged after automatic end alignment, compact tracked text, muted color, and selected-item foreground color. |

Remaining native `span` attributes are forwarded. Shortcut has no keyboard registration or primitive behavior; use it only to describe a shortcut implemented elsewhere.

---

## Styling and DOM contract

Command uses Tailwind utilities, semantic theme tokens, local slots, Bits UI state attributes, and required Dialog and Input Group styles. It exposes no xvelte-specific CSS variables.

| Part        | Stable xvelte hook or class                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `Root`      | `data-slot="command"`                                                                                              |
| `Dialog`    | Dialog's `dialog-overlay`, `dialog-content`, header, title, description, and optional close hooks; inner `command` |
| `Input`     | `data-slot="command-input-wrapper"`, `command-input`, plus Input Group and addon hooks                             |
| `List`      | `data-slot="command-list"`                                                                                         |
| `Group`     | `data-slot="command-group"`; dependency-owned `cmdk-group-heading` attribute                                       |
| `Item`      | `data-slot="command-item"`; includes a trailing selection indicator                                                |
| `LinkItem`  | `data-slot="command-item"`                                                                                         |
| `Empty`     | `data-slot="command-empty"`                                                                                        |
| `Loading`   | No local slot; Bits UI attributes only                                                                             |
| `Separator` | `data-slot="command-separator"`                                                                                    |
| `Shortcut`  | `data-slot="command-shortcut"`                                                                                     |

Bits UI supplies dependency-owned attributes including `data-command-root`, `data-command-input`, `data-selected`, `data-disabled`, filtering wrappers, generated IDs, roles, and ARIA relationships. Dialog additionally supplies open/closed state attributes. Use the [Bits UI Command documentation](https://www.bits-ui.com/docs/components/command) for their semantics.

`class` is merged with `cn` for every styled local wrapper. Primitive rest props are usually spread last and may override local slot attributes; preserve documented slot names because local descendant selectors and app integrations rely on them. The `no-scrollbar` global utility hides the visual scrollbar without disabling scrolling.

When Command Input receives keyboard focus, its Input Group wrapper uses the same `ring` border and three-pixel, 50%-opacity halo as the standalone Input component.

---

## Accessibility

Bits UI provides the command menu's roles, active-descendant relationships, item state, filtering visibility, arrow-key navigation, Home/End behavior, selection, optional looping, and VIM-style bindings. Disabled items are skipped. `Dialog` adds modal focus management, Escape handling, scroll locking, outside interaction behavior, an overlay, and screen-reader title and description through the required Dialog component.

Apps remain responsible for:

- Supplying a meaningful `Root.label`, which Bits UI associates with Input through `aria-labelledby`; placeholder text is not a substitute for that name.
- Passing a localized `List aria-label` instead of relying on the dependency's English fallback.
- Supplying meaningful Empty and Loading copy.
- Keeping item values unique and stable, especially when labels are duplicated or dynamic.
- Putting actions in `Item` and destinations in `LinkItem` rather than nesting buttons or links inside selectable Item content.
- Registering every shortcut shown through `Shortcut`, avoiding conflicts with browser and assistive-technology commands, and supporting Windows/Linux as well as macOS conventions.
- Closing `Command.Dialog` after an action when navigation or application state does not unmount it automatically.
- Testing custom filters, grids, delegated elements, and asynchronous result updates with keyboard and screen-reader workflows.

The current local Item check remains visually hidden because its `data-checked` selector does not match Bits UI's `data-selected` state. The selected row styling and ARIA state still identify the current item. Prefer the dedicated Combobox component when the interface represents persistent selection.

---

## Localization

The standard non-dialog parts contain no built-in app-facing copy. Apps provide and translate Root labels, Input placeholders and labels, List labels, group headings, items, empty/loading states, and shortcut descriptions.

`Command.Dialog` and its required Dialog component use these Paraglide messages. Keep them in `messages/en.json` and translate them in every supported locale:

| Message ID         | English value                    | Used by                                                |
| ------------------ | -------------------------------- | ------------------------------------------------------ |
| `eager_panda_seek` | `Command Palette`                | Default screen-reader-only Dialog title.               |
| `frost_lime_drift` | `Search for a command to run...` | Default screen-reader-only Dialog description.         |
| `amber_fox_glide`  | `Close`                          | Dialog close icon accessible name and optional button. |

Override the first two with `Dialog.title` and `Dialog.description`. The close message has no Command-level override. Bits UI currently supplies `Suggestions...` as List's fallback accessible label and `Loading...` as Loading's fixed accessible label. Pass a translated `aria-label` to List instead of relying on its fallback; the current Loading wrapper does not provide a reliable localization override for the dependency-owned label.

---

## Dependencies

Command expects a Svelte 5 project using Tailwind CSS 4 and xvelte's Paraglide setup. Install all runtime and development packages in one of these command groups:

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

Copy the complete Dialog and Input Group components and follow each component's README to install it and understand its API:

- `src/lib/components/ui/dialog`: `dialog-root.svelte`, `dialog-close.svelte`, `dialog-content.svelte`, `dialog-description.svelte`, `dialog-footer.svelte`, `dialog-header.svelte`, `dialog-overlay.svelte`, `dialog-portal.svelte`, `dialog-title.svelte`, `dialog-trigger.svelte`, `index.ts`
- `src/lib/components/ui/input-group`: `input-group-root.svelte`, `input-group-addon.svelte`, `input-group-button.svelte`, `input-group-input.svelte`, `input-group-text.svelte`, `input-group-textarea.svelte`, `index.ts`

Those complete component folders import these components through their own `index.ts` files, so copy them as well and follow their README guides:

- `src/lib/components/ui/button`: `button-root.svelte`, `index.ts`
- `src/lib/components/ui/input`: `input-root.svelte`, `index.ts`
- `src/lib/components/ui/textarea`: `textarea-root.svelte`, `index.ts`

Command requires no xvelte hook, attachment, context file, shared component stylesheet, or external asset.

### Shared utilities

Command and its required UI components import `cn`, `WithoutChild`, `WithoutChildren`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

Command and its required Dialog component import these semantic names from `$lib/icons`. Add the exact exports to `src/lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
export { default as SearchIcon } from "@tabler/icons-svelte/icons/search";
```

Keep these aliases in the shared icon facade instead of importing Tabler directly from component files.

### Localization setup

Keep the message entries documented in [Localization](#localization) in each locale and compile the Paraglide output to `src/lib/paraglide`. Command and Dialog import generated functions from `$lib/paraglide/messages.js`; no generated localization file belongs inside either component folder.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, provide the hidden-scrollbar utility, define the dark and Bits UI state variants, set shared border/outline defaults, and expose the semantic colors and radius scale used by Command and its dependencies. The values below are xvelte's defaults; apps may replace the values while preserving their names and mappings:

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

`tw-animate-css` supplies the Dialog animation utilities; no Command-specific keyframe must be copied. The app remains responsible for applying its `.dark` class when dark mode is supported.

---

## Credits

Command is adapted from [shadcn-svelte's Command component](https://www.shadcn-svelte.com/docs/components/command). Local xvelte styling, exports, localization, dependencies, and behavior documented here take precedence.

---

## File organization

| File                       | Responsibility                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `command-root.svelte`      | Styled Bits UI root, selected-value binding, DOM ref, filtering options, and imperative API binding.                |
| `command-dialog.svelte`    | Modal composition, open and selected-value bindings, accessible title/description, portal, and close-button option. |
| `command-input.svelte`     | Search query input, Input Group surface, and search icon.                                                           |
| `command-list.svelte`      | Scrollable, visually hidden-scrollbar result container.                                                             |
| `command-group.svelte`     | Group container, visible heading, generated fallback value, and internal Group Items rendering.                     |
| `command-item.svelte`      | Selectable command item, state styles, native forwarding, and optional check indicator.                             |
| `command-link-item.svelte` | Navigational command item rendered as an anchor.                                                                    |
| `command-empty.svelte`     | Filter-aware empty state.                                                                                           |
| `command-loading.svelte`   | Primitive loading/progress state without additional local styling.                                                  |
| `command-separator.svelte` | Filter-aware visual separator.                                                                                      |
| `command-shortcut.svelte`  | Presentational native span for shortcut text.                                                                       |
| `index.ts`                 | Public components, props types, and `RootApi` export.                                                               |
| `README.md`                | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits.          |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

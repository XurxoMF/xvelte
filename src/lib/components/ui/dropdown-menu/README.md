# Dropdown Menu

An accessible action menu opened from a button. It supports regular and destructive items, disabled states, grouped content, independent and grouped checkboxes, radio choices, nested submenus, shortcut hints, controlled open state, portals, collision-aware positioning, and complete keyboard navigation through Bits UI.

Use Dropdown Menu for secondary actions and compact settings associated with a visible trigger. Keep important or frequently used actions visible elsewhere, and use Select rather than a menu when choosing one value is the primary form task.

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
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
</script>
```

Dropdown Menu's `index.ts` exports `Root`, `Trigger`, `Portal`, `Content`, `Item`, `CheckboxGroup`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `GroupHeading`, `Label`, `Separator`, `Shortcut`, `Sub`, `SubTrigger`, and `SubContent`, together with a named props type for every part.

---

## Anatomy

Compose a button trigger and menu content below one Root:

```svelte
<DropdownMenu.Root>
	<DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Item>Open</DropdownMenu.Item>
		<DropdownMenu.Separator />

		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>More actions</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent>
				<DropdownMenu.Item>Duplicate</DropdownMenu.Item>
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

Root owns open state and text direction. Trigger defines the button and positioning anchor. Content automatically renders through the local Portal and contains actions, groups, selection controls, separators, labels, shortcuts, and submenus. Each Sub coordinates one SubTrigger with one SubContent.

Use GroupHeading inside Group when a heading should label that group semantically. Label is a native visual caption and does not create the same menu-group relationship.

---

## Basic usage

```svelte
<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	function renameFile() {
		console.info("Rename file");
	}

	function deleteFile() {
		console.info("Delete file");
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="rounded-md border px-3 py-2 text-sm">File actions</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Item onSelect={renameFile}>
			Rename
			<DropdownMenu.Shortcut>F2</DropdownMenu.Shortcut>
		</DropdownMenu.Item>

		<DropdownMenu.Item disabled>Share</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item variant="destructive" onSelect={deleteFile}>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

`onSelect` receives the selection event, and an enabled Item closes the menu by default. Destructive styling does not add confirmation or undo behavior; implement those safeguards in the app.

---

## Examples

### Multiple checkbox choices

CheckboxGroup manages an array of selected CheckboxItem values:

```svelte
<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	let visiblePanels = $state(["activity", "files"]);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>Visible panels</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.CheckboxGroup bind:value={visiblePanels}>
			<DropdownMenu.CheckboxItem value="activity" closeOnSelect={false}>Activity</DropdownMenu.CheckboxItem>
			<DropdownMenu.CheckboxItem value="files" closeOnSelect={false}>Files</DropdownMenu.CheckboxItem>
			<DropdownMenu.CheckboxItem value="comments" closeOnSelect={false}>Comments</DropdownMenu.CheckboxItem>
		</DropdownMenu.CheckboxGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

Set `closeOnSelect={false}` when people should change several settings in one visit. CheckboxGroup defaults to an empty array and requires a distinct `value` on every participating CheckboxItem.

### Independent and indeterminate checkbox

CheckboxItem can also own bindable state without CheckboxGroup:

```svelte
<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	let notifications = $state(true);
	let mixedChannels = $state(true);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>Notification settings</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.CheckboxItem bind:checked={notifications} closeOnSelect={false}>Enable notifications</DropdownMenu.CheckboxItem>
		<DropdownMenu.CheckboxItem bind:indeterminate={mixedChannels} closeOnSelect={false}>Notification channels</DropdownMenu.CheckboxItem>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

The local indicator shows CheckIcon for checked state and MinusIcon for indeterminate state. CheckboxItem's app-provided children do not receive either state as snippet data.

### Radio choice

```svelte
<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	let sortOrder = $state("name");
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>Sort options</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.RadioGroup bind:value={sortOrder}>
			<DropdownMenu.Group>
				<DropdownMenu.GroupHeading>Sort by</DropdownMenu.GroupHeading>
				<DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="modified">Last modified</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="size">Size</DropdownMenu.RadioItem>
			</DropdownMenu.Group>
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

RadioGroup's local default is `undefined`. Supply an initial value when one option should begin selected. RadioItem children may receive `{ checked }` through a stateful snippet when custom content needs that state.

### Nested submenu

```svelte
<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	function moveTo(folder: string) {
		console.info("Move to", folder);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>Move file</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger inset>Move to folder</DropdownMenu.SubTrigger>

			<DropdownMenu.SubContent>
				<DropdownMenu.Item onSelect={() => moveTo("archive")}>Archive</DropdownMenu.Item>
				<DropdownMenu.Item onSelect={() => moveTo("shared")}>Shared</DropdownMenu.Item>
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

SubTrigger appends ChevronRightIcon during normal rendering. Pointer intent, opening delay, directional arrow keys, focus transfer, and collision-aware positioning come from Bits UI. Use `openDelay={0}` only when immediate pointer opening is intentional.

### Controlled open state

```svelte
<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	let open = $state(false);
</script>

<DropdownMenu.Root bind:open onOpenChange={(nextOpen) => console.info("Menu open", nextOpen)}>
	<DropdownMenu.Trigger>Account menu</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item>Profile</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

The bound state can open or close the menu from application logic. Root does not expose a positioning coordinate; Content anchors to Trigger.

### Trigger delegation

Trigger renders a native button by default. Delegate it when another accessible component should render the actual button:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button.Root variant="outline" {...props}>Project actions</Button.Root>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Item>Open project</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

Spread every supplied prop so the ref, anchor, state, disabled behavior, pointer events, and keyboard events remain connected. Button is needed only for this example and is not a Dropdown Menu dependency.

### Custom portal target

Content already uses Portal. Pass its configuration through `portalProps`:

```svelte
<DropdownMenu.Root>
	<DropdownMenu.Trigger>Open actions</DropdownMenu.Trigger>
	<DropdownMenu.Content portalProps={{ to: "#overlay-root" }}>
		<DropdownMenu.Item>Inspect details</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

The standalone Portal export is unnecessary in the standard composition.

---

## Public API

Parts backed by Bits UI forward compatible Bits UI options and native element props unless a local adaptation below states otherwise. The tables summarize local behavior and important inherited options; use the complete [Bits UI Dropdown Menu API reference](https://www.bits-ui.com/docs/components/dropdown-menu#api-reference) for options provided directly by that library.

### `DropdownMenu.Root`

Type: `RootProps`, matching Bits UI Dropdown Menu Root props.

| Prop                   | Type                      | Default     | xvelte behavior                                                 |
| ---------------------- | ------------------------- | ----------- | --------------------------------------------------------------- |
| `open`                 | `boolean`                 | `false`     | Bindable menu open state.                                       |
| `onOpenChange`         | `(open: boolean) => void` | `undefined` | Runs when open state changes.                                   |
| `onOpenChangeComplete` | `(open: boolean) => void` | `undefined` | Runs after the opening or closing transition completes.         |
| `dir`                  | `"ltr" \| "rtl"`          | `"ltr"`     | Controls directional keyboard behavior and submenu positioning. |
| `children`             | `Snippet`                 | `undefined` | Renders Trigger and Content.                                    |

Root renders no DOM element.

### `DropdownMenu.Trigger`

Type: `TriggerProps`, matching Bits UI Dropdown Menu Trigger props.

| Prop                 | Type                  | Default     | xvelte behavior                                                                                |
| -------------------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `type`               | Native button type    | `"button"`  | Bits UI's default prevents accidental form submission.                                         |
| `disabled`           | `boolean`             | `false`     | Prevents opening and forwards native disabled behavior on the default button.                  |
| `ref`                | `HTMLElement \| null` | `null`      | Bindable element reference; the default rendered element is a button.                          |
| `class`              | `string`              | `undefined` | Forwarded without local visual classes.                                                        |
| `children` / `child` | Bits UI snippets      | `undefined` | Render the default button content or delegate the element while spreading every supplied prop. |

Remaining compatible native button attributes and events are forwarded. Trigger adds `data-slot="dropdown-menu-trigger"`; Bits UI supplies ID, open/disabled state, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, pointer handling, and keyboard handling.

### `DropdownMenu.Content`

Type: `ContentProps`, matching Bits UI Content props plus local defaults and portal configuration.

| Prop                 | Type                                | Default     | xvelte behavior                                                                                                                 |
| -------------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `portalProps`        | Portal props without child snippets | `undefined` | Passed to the Portal that always wraps Content.                                                                                 |
| `sideOffset`         | `number`                            | `4`         | Local spacing between Trigger and Content.                                                                                      |
| `align`              | Bits UI alignment                   | `"start"`   | Local alignment relative to Trigger.                                                                                            |
| `loop`               | `boolean`                           | `false`     | Wraps keyboard focus from the last item to the first and back.                                                                  |
| `ref`                | `HTMLElement \| null`               | `null`      | Bindable floating-content reference.                                                                                            |
| `class`              | `string`                            | `undefined` | Merged after anchor width, minimum width, scrolling, popover surface, radius, padding, ring, shadow, and state/side animations. |
| `children` / `child` | Bits UI floating snippets           | `undefined` | Render menu content or delegate the floating content element with positioning props.                                            |

Content forwards remaining Bits UI positioning, collision, focus, escape, outside-interaction, scroll-lock, direction, transition, and native `div` options. It adds `data-slot="dropdown-menu-content"` and automatically portals.

The default width uses Bits UI's `--bits-dropdown-menu-anchor-width`, with a minimum of `8rem`. Override it with a class such as `w-auto`, `w-56`, or `min-w-48` when the menu should not match Trigger width.

### `DropdownMenu.Item`

Type: `ItemProps`, matching Bits UI Item props plus local presentation options.

| Prop                 | Type                         | Default     | xvelte behavior                                                                           |
| -------------------- | ---------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `inset`              | `boolean`                    | `undefined` | Writes `data-inset` and aligns content with indicator-bearing rows.                       |
| `variant`            | `"default" \| "destructive"` | `"default"` | Writes `data-variant` and applies destructive foreground and focus styling when selected. |
| `disabled`           | `boolean`                    | `false`     | Prevents interaction and activates dependency-owned disabled state styling.               |
| `textValue`          | `string`                     | `undefined` | Supplies typeahead text when rendered content is complex.                                 |
| `onSelect`           | `(event: Event) => void`     | `undefined` | Runs on selection. Call `event.preventDefault()` to prevent normal selection behavior.    |
| `closeOnSelect`      | `boolean`                    | `true`      | Controls whether selecting the item closes the menu.                                      |
| `ref`                | `HTMLElement \| null`        | `null`      | Bindable element reference; the default rendered element is a `div`.                      |
| `class`              | `string`                     | `undefined` | Merged after local item, focus, disabled, inset, destructive, and descendant icon styles. |
| `children` / `child` | Bits UI snippets             | `undefined` | Render content or delegate the item while preserving menu behavior.                       |

Remaining compatible native `div` attributes are forwarded. Destructive is visual intent only and has no confirmation behavior.

### `DropdownMenu.CheckboxGroup`

Type: `CheckboxGroupProps`, matching Bits UI Checkbox Group props.

| Prop                 | Type                        | Default     | xvelte behavior                                |
| -------------------- | --------------------------- | ----------- | ---------------------------------------------- |
| `value`              | `string[]`                  | `[]`        | Bindable values of selected CheckboxItems.     |
| `onValueChange`      | `(value: string[]) => void` | `undefined` | Runs when grouped checkbox values change.      |
| `ref`                | `HTMLElement \| null`       | `null`      | Bindable group element reference.              |
| `children` / `child` | Bits UI snippets            | `undefined` | Render or delegate the checkbox-group content. |

Remaining compatible native `div` attributes are forwarded, with `data-slot="dropdown-menu-checkbox-group"` added locally.

### `DropdownMenu.CheckboxItem`

Type: `CheckboxItemProps`, based on Bits UI Checkbox Item after replacing its child API.

| Prop                    | Type                         | Default     | xvelte behavior                                                                      |
| ----------------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `checked`               | `boolean`                    | `false`     | Bindable checked state.                                                              |
| `indeterminate`         | `boolean`                    | `false`     | Bindable mixed state, represented locally by MinusIcon.                              |
| `onCheckedChange`       | `(checked: boolean) => void` | `undefined` | Runs when checked state changes.                                                     |
| `onIndeterminateChange` | `(mixed: boolean) => void`   | `undefined` | Runs when indeterminate state changes.                                               |
| `value`                 | `string`                     | `undefined` | Value used by a containing CheckboxGroup.                                            |
| `children`              | `Snippet`                    | `undefined` | Renders app content without exposing Bits UI's checked/indeterminate snippet values. |

CheckboxItem also forwards Item options such as `disabled`, `textValue`, `onSelect`, `closeOnSelect`, bindable `ref`, `class`, and compatible native attributes. It does not expose element delegation or a local `inset` prop. The indicator has `data-slot="dropdown-menu-checkbox-item-indicator"`, prioritizes indeterminate over checked, and is aligned at the row's right edge.

### `DropdownMenu.RadioGroup`

Type: `RadioGroupProps`, matching Bits UI Radio Group props.

| Prop                 | Type                      | Default     | xvelte behavior                             |
| -------------------- | ------------------------- | ----------- | ------------------------------------------- |
| `value`              | `string`                  | `undefined` | Bindable value of the selected RadioItem.   |
| `onValueChange`      | `(value: string) => void` | `undefined` | Runs when the selected radio value changes. |
| `ref`                | `HTMLElement \| null`     | `null`      | Bindable group element reference.           |
| `children` / `child` | Bits UI snippets          | `undefined` | Render or delegate radio-group content.     |

Remaining compatible native `div` attributes are forwarded, with `data-slot="dropdown-menu-radio-group"` added locally.

### `DropdownMenu.RadioItem`

Type: `RadioItemProps`, based on Bits UI Radio Item with element delegation removed.

| Prop            | Type                              | Default     | xvelte behavior                                                  |
| --------------- | --------------------------------- | ----------- | ---------------------------------------------------------------- |
| `value`         | `string`                          | required    | Value selected in the containing RadioGroup.                     |
| `children`      | `Snippet<[{ checked: boolean }]>` | `undefined` | Renders content and exposes whether this radio item is selected. |
| `closeOnSelect` | `boolean`                         | `true`      | Controls whether selection closes the menu.                      |

RadioItem also forwards `disabled`, `textValue`, `onSelect`, bindable `ref`, `class`, and compatible native `div` attributes. It cannot delegate its element and has no local `inset` prop. Its CheckIcon indicator uses `data-slot="dropdown-menu-radio-item-indicator"` and appears at the right edge when selected.

### Groups and labels

| Part           | Type                | Local behavior                                                                                                                                              |
| -------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Group`        | `GroupProps`        | Forwards children, child delegation, bindable `ref`, and native `div` attributes; adds `data-slot="dropdown-menu-group"`.                                   |
| `GroupHeading` | `GroupHeadingProps` | Adds local `inset`, semantic menu-group association, heading styles, and `data-slot="dropdown-menu-group-heading"`; forwards the remaining Bits UI options. |
| `Label`        | `LabelProps`        | Native `div` with optional children, bindable `ref`, native attributes, local `inset`, muted label styles, and no menu-group semantics.                     |

Prefer GroupHeading inside Group. Use Label for a purely visual section caption that should not label a semantic menu group.

### Submenus

#### `DropdownMenu.Sub`

Type: `SubProps`, matching Bits UI Sub props. It supports bindable `open` (default `false`), `onOpenChange`, `onOpenChangeComplete`, and children. It renders no DOM element.

#### `DropdownMenu.SubTrigger`

Type: `SubTriggerProps`, matching Bits UI SubTrigger props plus local `inset`. It forwards `disabled`, `textValue`, `onSelect`, `openDelay` (default `100`ms), children, child delegation, bindable `ref`, class, and compatible native `div` attributes. Local styling responds to focus and open state, and `data-slot="dropdown-menu-sub-trigger"` and `data-inset` are added.

Normal children rendering appends ChevronRightIcon. When `child` delegates the complete element, Bits UI replaces the wrapper's rendered children, so the local chevron is not included; render an equivalent icon in the delegated snippet when needed.

#### `DropdownMenu.SubContent`

Type: `SubContentProps`, matching Bits UI SubContent props. It forwards loop, floating positioning/collision, transition, focus, bindable `ref`, class, child delegation, and compatible native `div` attributes. It adds `data-slot="dropdown-menu-sub-content"`, automatic width with a `6rem` minimum, popover colors, ring, shadow, radius, and state/side animations. It is not wrapped in another local Portal.

### `DropdownMenu.Separator`

Type: `SeparatorProps`, matching Bits UI Separator props. It forwards optional children, child delegation, bindable `ref`, class, and compatible native `div` attributes. Locally it adds `data-slot="dropdown-menu-separator"`, vertical spacing, negative horizontal margin, and a one-pixel border-token line.

### `DropdownMenu.Shortcut`

Type: `ShortcutProps`, based on native `span` attributes with a bindable reference. It forwards children and native attributes, adds `data-slot="dropdown-menu-shortcut"`, and merges class after automatic end alignment, compact tracking, muted color, and parent-item focus color. Shortcut is presentational: it does not register or execute the displayed key combination.

### `DropdownMenu.Portal`

Type: `PortalProps`, matching Bits UI Portal props. It forwards the destination, disabled state, children, and supported portal configuration without local DOM or styling. Standard Content already uses it through `portalProps`.

The component's `index.ts`, exported types, and local source are the source of truth for the public API.

---

## Styling and DOM contract

Dropdown Menu uses Tailwind utilities, semantic theme tokens, local `data-slot` hooks, locally owned presentation attributes, and dependency-owned Bits UI state and positioning attributes. It exposes no component-specific CSS variables.

| Part                    | Stable xvelte hook or class                                    |
| ----------------------- | -------------------------------------------------------------- |
| `Root`, `Sub`, `Portal` | No rendered wrapper                                            |
| `Trigger`               | `data-slot="dropdown-menu-trigger"`; visually unstyled         |
| `Content`               | `data-slot="dropdown-menu-content"`                            |
| `Item`                  | `data-slot="dropdown-menu-item"`, `data-inset`, `data-variant` |
| `CheckboxGroup`         | `data-slot="dropdown-menu-checkbox-group"`                     |
| `CheckboxItem`          | `data-slot="dropdown-menu-checkbox-item"`                      |
| Checkbox indicator      | `data-slot="dropdown-menu-checkbox-item-indicator"`            |
| `RadioGroup`            | `data-slot="dropdown-menu-radio-group"`                        |
| `RadioItem`             | `data-slot="dropdown-menu-radio-item"`                         |
| Radio indicator         | `data-slot="dropdown-menu-radio-item-indicator"`               |
| `Group`                 | `data-slot="dropdown-menu-group"`                              |
| `GroupHeading`          | `data-slot="dropdown-menu-group-heading"`, `data-inset`        |
| `Label`                 | `data-slot="dropdown-menu-label"`, `data-inset`                |
| `Separator`             | `data-slot="dropdown-menu-separator"`                          |
| `Shortcut`              | `data-slot="dropdown-menu-shortcut"`                           |
| `SubTrigger`            | `data-slot="dropdown-menu-sub-trigger"`, `data-inset`          |
| `SubContent`            | `data-slot="dropdown-menu-sub-content"`                        |

Bits UI additionally supplies dependency-owned `data-state`, `data-open`, `data-closed`, `data-disabled`, `data-highlighted`, `data-side`, `data-align`, transition, positioning, role, ID, and ARIA attributes. Content also reads the dependency-owned `--bits-dropdown-menu-anchor-width`. Preserve local slot values because component styles and app integrations may target them.

`class` is merged with `cn` on styled local parts. Trigger forwards class without adding visual styles. Forwarded props are generally spread after local `data-slot`, `data-inset`, or `data-variant` and can override them; doing so can break styling and is not recommended.

---

## Accessibility

Bits UI supplies menu and menu-item roles, checkbox/radio state, group-heading relationships, roving focus, disabled behavior, typeahead, arrow-key navigation, Home/End navigation, submenu direction, Escape handling, outside interaction, focus management, and Trigger expanded/controls state.

App responsibilities:

- Give Trigger a clear accessible name and visible focus indicator. The local wrapper adds no visual style.
- Keep essential actions visible outside the menu because hidden actions are less discoverable.
- Use Item for actions, CheckboxItem for independent or multiple settings, and RadioGroup/RadioItem for one-of-many choices.
- Use GroupHeading rather than visual Label when a heading must label a Group for assistive technology.
- Supply `textValue` when complex item content does not produce useful typeahead text.
- Implement every shortcut shown by Shortcut and avoid conflicts with browser or assistive-technology commands.
- Add confirmation or undo for destructive actions; `variant="destructive"` changes presentation only.
- Spread every supplied prop when delegating Trigger, Item, Group, GroupHeading, Separator, SubTrigger, SubContent, or other supported parts.

The indicators are hidden from pointer interaction and selection state is supplied semantically by Bits UI. CheckboxItem visually distinguishes checked, unchecked, and indeterminate states.

---

## Localization

Dropdown Menu contains no built-in human-readable copy and does not use Paraglide messages. The app supplies and translates Trigger text, item labels, group headings, visual labels, checkbox/radio copy, submenu labels, shortcut descriptions, destructive confirmations, and any supporting instructions.

The right-chevron, check, and minus symbols are icons rather than text. Shortcut symbols such as `⌘` are platform-specific presentation, not translated interaction; render the appropriate localized or platform-specific hint and implement the matching command in the app.

---

## Dependencies

Dropdown Menu expects a Svelte 5 project using Tailwind CSS 4. It requires Bits UI, three semantic Tabler icon exports, shared utility helpers, and `tw-animate-css`. Install every package requirement with one of these command groups:

```sh
# bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss tw-animate-css

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css
```

### Shared utilities

The wrappers import `cn`, `WithoutChild`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

Dropdown Menu imports three semantic names from `$lib/icons`. Add these exact exports to `src/lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
export { default as MinusIcon } from "@tabler/icons-svelte/icons/minus";
```

The package block includes `@tabler/icons-svelte`. Keep these aliases in the shared icon facade instead of importing Tabler directly from component files.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, define dark and Bits UI state variants, apply the shared border/outline defaults, and expose the semantic colors and radii used by Dropdown Menu. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--accent: oklch(0.841 0.238 128.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--accent: oklch(0.768 0.233 130.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-ring: var(--ring);
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
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

@custom-variant data-disabled {
	&:where([data-disabled="true"]),
	&:where([data-disabled]:not([data-disabled="false"])) {
		@slot;
	}
}
```

`tw-animate-css` supplies the enter, exit, fade, zoom, and directional slide utilities. No Dropdown Menu-specific keyframe or shared component stylesheet must be copied. The app remains responsible for applying its `.dark` class when dark mode is supported.

### Other requirements

Dropdown Menu requires no other xvelte component, hook, attachment, context file, localization message, Paraglide setup, shared component stylesheet, or external asset. Bits UI owns its internal contexts, floating-position logic, focus management, and selection state. Button is optional and appears only in the delegation example.

---

## Credits

Dropdown Menu is adapted from [shadcn-svelte's Dropdown Menu component](https://www.shadcn-svelte.com/docs/components/dropdown-menu). Local xvelte behavior, API, defaults, styling, dependencies, and limitations documented here take precedence.

---

## File organization

| File                                  | Responsibility                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `dropdown-menu-root.svelte`           | Bindable open state, callbacks, direction, and shared Bits UI menu state.                                    |
| `dropdown-menu-trigger.svelte`        | Unstyled default or delegated button trigger and positioning anchor.                                         |
| `dropdown-menu-portal.svelte`         | Portal target and inline-rendering configuration.                                                            |
| `dropdown-menu-content.svelte`        | Automatic Portal, local alignment/offset defaults, floating behavior, anchor width, surface, and animations. |
| `dropdown-menu-item.svelte`           | Standard selectable action with inset and destructive variants.                                              |
| `dropdown-menu-checkbox-group.svelte` | Bindable array selection for grouped CheckboxItems.                                                          |
| `dropdown-menu-checkbox-item.svelte`  | Bindable checked/indeterminate action with local check/minus indicator.                                      |
| `dropdown-menu-radio-group.svelte`    | Bindable one-of-many selection context.                                                                      |
| `dropdown-menu-radio-item.svelte`     | Radio option, checked snippet state, and local checked indicator.                                            |
| `dropdown-menu-group.svelte`          | Semantic menu group container.                                                                               |
| `dropdown-menu-group-heading.svelte`  | Semantic group heading with optional inset alignment.                                                        |
| `dropdown-menu-label.svelte`          | Presentational native label row with optional inset alignment.                                               |
| `dropdown-menu-separator.svelte`      | Decorative menu separator.                                                                                   |
| `dropdown-menu-shortcut.svelte`       | Presentational keyboard-shortcut hint.                                                                       |
| `dropdown-menu-sub.svelte`            | Submenu open state and callbacks.                                                                            |
| `dropdown-menu-sub-trigger.svelte`    | Submenu trigger, optional delegation, opening delay, state styling, inset, and default chevron.              |
| `dropdown-menu-sub-content.svelte`    | Floating submenu content, surface styles, positioning, and animations.                                       |
| `index.ts`                            | Public component and props-type exports.                                                                     |
| `README.md`                           | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits.   |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

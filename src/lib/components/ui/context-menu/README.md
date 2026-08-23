# Context Menu

A contextual action menu opened at a pointer location with right-click or long press. It supports regular and destructive actions, disabled states, nested submenus, grouped content, checkbox and radio choices, shortcut hints, controlled open state, portals, collision-aware positioning, and complete Bits UI keyboard navigation.

Use Context Menu for optional actions that apply to a specific surface or item. Keep important and frequently used actions visible elsewhere, because context menus are less discoverable and may be difficult to invoke with some input methods.

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
	import * as ContextMenu from "$lib/components/ui/context-menu";
</script>
```

Context Menu's `index.ts` exports `Root`, `Trigger`, `Portal`, `Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `GroupHeading`, `Label`, `Separator`, `Shortcut`, `Sub`, `SubTrigger`, and `SubContent`, together with a named props type for every part.

---

## Anatomy

Compose a trigger and content beneath one root:

```svelte
<ContextMenu.Root>
	<ContextMenu.Trigger>Right-click this area</ContextMenu.Trigger>

	<ContextMenu.Content>
		<ContextMenu.Item>Open</ContextMenu.Item>
		<ContextMenu.Separator />

		<ContextMenu.Sub>
			<ContextMenu.SubTrigger>More actions</ContextMenu.SubTrigger>
			<ContextMenu.SubContent>
				<ContextMenu.Item>Duplicate</ContextMenu.Item>
			</ContextMenu.SubContent>
		</ContextMenu.Sub>
	</ContextMenu.Content>
</ContextMenu.Root>
```

`Root` owns open state and direction. `Trigger` defines the surface that receives context-menu and long-press interaction. `Content` is automatically rendered through the local `Portal` and contains items, groups, selection controls, separators, labels, and submenus. Each `Sub` coordinates one `SubTrigger` with one `SubContent`.

Use `GroupHeading` within `Group` when a heading should label that group semantically. `Label` is a standalone visual heading and does not create the same menu-group relationship.

---

## Basic usage

```svelte
<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";

	function renameFile() {
		console.info("Rename file");
	}

	function deleteFile() {
		console.info("Delete file");
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="flex h-40 w-72 items-center justify-center rounded-lg border border-dashed text-sm">
		Right-click the selected file
	</ContextMenu.Trigger>

	<ContextMenu.Content class="w-52">
		<ContextMenu.Item onSelect={renameFile}>
			Rename
			<ContextMenu.Shortcut>F2</ContextMenu.Shortcut>
		</ContextMenu.Item>

		<ContextMenu.Item disabled>Share</ContextMenu.Item>
		<ContextMenu.Separator />
		<ContextMenu.Item variant="destructive" onSelect={deleteFile}>Delete</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
```

`onSelect` receives the selection event. Destructive styling does not add confirmation or undo behavior; implement those safeguards in the app.

---

## Examples

### Checkbox and radio choices

```svelte
<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";

	let showHiddenFiles = $state(false);
	let sortOrder = $state("name");
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="min-h-32 rounded-lg border border-dashed p-6">Right-click for view options</ContextMenu.Trigger>

	<ContextMenu.Content class="w-56">
		<ContextMenu.CheckboxItem bind:checked={showHiddenFiles} closeOnSelect={false}>Show hidden files</ContextMenu.CheckboxItem>

		<ContextMenu.Separator />

		<ContextMenu.RadioGroup bind:value={sortOrder}>
			<ContextMenu.Group>
				<ContextMenu.GroupHeading>Sort by</ContextMenu.GroupHeading>
				<ContextMenu.RadioItem value="name">Name</ContextMenu.RadioItem>
				<ContextMenu.RadioItem value="modified">Last modified</ContextMenu.RadioItem>
				<ContextMenu.RadioItem value="size">Size</ContextMenu.RadioItem>
			</ContextMenu.Group>
		</ContextMenu.RadioGroup>
	</ContextMenu.Content>
</ContextMenu.Root>
```

Checkbox and radio items close the menu after selection by default. Set `closeOnSelect={false}` when people should change several settings in one visit. Checkbox supports bindable `checked` and `indeterminate`; the current local indicator only displays for checked state, not indeterminate state.

### Nested submenu

```svelte
<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";

	function moveTo(folder: string) {
		console.info("Move to", folder);
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="min-h-32 rounded-lg border border-dashed p-6">Right-click the selected file</ContextMenu.Trigger>

	<ContextMenu.Content>
		<ContextMenu.Sub>
			<ContextMenu.SubTrigger inset>Move to folder</ContextMenu.SubTrigger>

			<ContextMenu.SubContent class="w-48">
				<ContextMenu.Item onSelect={() => moveTo("archive")}>Archive</ContextMenu.Item>
				<ContextMenu.Item onSelect={() => moveTo("shared")}>Shared</ContextMenu.Item>
			</ContextMenu.SubContent>
		</ContextMenu.Sub>
	</ContextMenu.Content>
</ContextMenu.Root>
```

`SubTrigger` appends the local right-chevron icon. Pointer intent, opening delay, directional arrow keys, focus transfer, and collision-aware positioning come from Bits UI. Use `openDelay={0}` on SubTrigger only when immediate pointer opening is intentional.

### Controlled open state

```svelte
<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";

	let open = $state(false);
</script>

<ContextMenu.Root
	bind:open
	onOpenChange={(nextOpen) => {
		console.info("Context menu open", nextOpen);
	}}
>
	<ContextMenu.Trigger class="min-h-32 rounded-lg border border-dashed p-6">Right-click for actions</ContextMenu.Trigger>
	<ContextMenu.Content><!-- Items --></ContextMenu.Content>
</ContextMenu.Root>
```

The bound state can close the menu from application logic. Opening at an arbitrary coordinate is not part of the Root API; Bits UI derives the anchor point from the triggering context-menu or long-press event.

### Semantic trigger delegation

Trigger renders a `div` by default. Delegate it when another non-conflicting semantic element should own the trigger props:

```svelte
<ContextMenu.Root>
	<ContextMenu.Trigger>
		{#snippet child({ props })}
			<article {...props} tabindex="0" aria-label="Project card actions">
				<h2>Migration plan</h2>
				<p>Right-click or use the platform context-menu command for actions.</p>
			</article>
		{/snippet}
	</ContextMenu.Trigger>

	<ContextMenu.Content>
		<ContextMenu.Item>Open project</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
```

Spread every supplied prop so pointer, long-press, state, ref, and positioning behavior remain connected. A focusable trigger improves keyboard reachability, but platform handling of the Context Menu key and Shift+F10 should still be tested in supported browsers.

### Custom portal target

`Content` already uses a Portal. Pass portal configuration through `portalProps` rather than wrapping Content in another Portal:

```svelte
<ContextMenu.Root>
	<ContextMenu.Trigger>Right-click for details</ContextMenu.Trigger>
	<ContextMenu.Content portalProps={{ to: "#overlay-root" }}>
		<ContextMenu.Item>Inspect details</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
```

The standalone `Portal` export is available for custom compositions built from compatible Bits UI parts; it is unnecessary in the standard xvelte composition.

---

## Public API

All primitive wrappers forward their remaining compatible Bits UI and native element props unless a local adaptation below states otherwise. The tables summarize local behavior and important inherited options; use the exact [Bits UI Context Menu API reference](https://www.bits-ui.com/docs/components/context-menu#api-reference) for the complete primitive API.

### `ContextMenu.Root`

Type: `RootProps`, matching Bits UI Context Menu Root props.

| Prop                   | Type                      | Default     | xvelte behavior                                                 |
| ---------------------- | ------------------------- | ----------- | --------------------------------------------------------------- |
| `open`                 | `boolean`                 | `false`     | Bindable menu open state.                                       |
| `onOpenChange`         | `(open: boolean) => void` | `undefined` | Runs when open state changes.                                   |
| `onOpenChangeComplete` | `(open: boolean) => void` | `undefined` | Runs after the opening or closing transition completes.         |
| `dir`                  | `"ltr" \| "rtl"`          | `"ltr"`     | Controls directional keyboard behavior and submenu positioning. |
| `children`             | `Snippet`                 | `undefined` | Renders Trigger and Content.                                    |

Root renders no DOM element and adds no local styling or behavior beyond the bindable default. It has no programmatic coordinate prop.

### `ContextMenu.Trigger`

Type: `TriggerProps`, matching Bits UI Context Menu Trigger props.

| Prop                 | Type                     | Default     | xvelte behavior                                                                            |
| -------------------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------ |
| `disabled`           | `boolean`                | `false`     | Prevents context-menu and long-press opening; writes dependency-owned disabled state.      |
| `ref`                | `HTMLDivElement \| null` | `null`      | Bindable reference to the default trigger element.                                         |
| `class`              | `string`                 | `undefined` | Merged after the local `select-none` class.                                                |
| `children` / `child` | Bits UI snippets         | `undefined` | Render default content or delegate the element while spreading the supplied trigger props. |

Remaining compatible native `div` attributes are forwarded. Bits UI supplies `tabindex="-1"` by default but preserves an explicit `tabindex` passed by the app. The local wrapper adds `data-slot="context-menu-trigger"`. On touch or pen input, a stationary 700ms press opens the menu; pointer movement, release, cancellation, disabling, or component destruction clears the timer.

### `ContextMenu.Content`

Type: `ContentProps`, matching Bits UI Content props plus local portal configuration.

| Prop                 | Type                                | Default     | xvelte behavior                                                                                                            |
| -------------------- | ----------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `portalProps`        | Portal props without child snippets | `undefined` | Passed to the local Portal that always wraps Content.                                                                      |
| `loop`               | `boolean`                           | `false`     | Wraps keyboard focus from the last item to the first and back.                                                             |
| `ref`                | `HTMLDivElement \| null`            | `null`      | Bindable menu-content reference.                                                                                           |
| `class`              | `string`                            | `undefined` | Merged after minimum width, scrolling, popover surface, radius, padding, ring, shadow, outline, and state/side animations. |
| `children` / `child` | Bits UI floating snippets           | `undefined` | Render menu content or delegate the floating content element with positioning props.                                       |

Content forwards Bits UI positioning, collision, focus, escape, outside-interaction, scroll-lock, direction, transition, and native `div` options. It adds `data-slot="context-menu-content"` and automatically portals. See the upstream API rather than assuming Dropdown Menu Content defaults are identical.

### `ContextMenu.Item`

Type: `ItemProps`, matching Bits UI Item props plus two local presentation options.

| Prop                 | Type                         | Default     | xvelte behavior                                                                           |
| -------------------- | ---------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `inset`              | `boolean`                    | `undefined` | Writes `data-inset` and aligns content with indicator-bearing items.                      |
| `variant`            | `"default" \| "destructive"` | `"default"` | Writes `data-variant` and applies destructive foreground and focus surface when selected. |
| `disabled`           | `boolean`                    | `false`     | Prevents interaction and applies dependency-owned disabled state styling.                 |
| `textValue`          | `string`                     | `undefined` | Supplies typeahead text when rendered content is complex.                                 |
| `onSelect`           | `(event: Event) => void`     | `undefined` | Runs on selection. Call `event.preventDefault()` to prevent normal selection behavior.    |
| `closeOnSelect`      | `boolean`                    | `true`      | Controls whether selecting the item closes the menu.                                      |
| `ref`                | `HTMLDivElement \| null`     | `null`      | Bindable default item reference.                                                          |
| `class`              | `string`                     | `undefined` | Merged after local item, focus, disabled, inset, destructive, and descendant icon styles. |
| `children` / `child` | Bits UI snippets             | `undefined` | Render content or delegate the item while preserving menu semantics and interaction.      |

Remaining compatible `div` attributes are forwarded. Destructive is visual intent only and has no confirmation behavior.

### `ContextMenu.CheckboxItem`

Type: `CheckboxItemProps`, based on Bits UI Checkbox Item after replacing its child API.

| Prop                    | Type                         | Default     | xvelte behavior                                                                                           |
| ----------------------- | ---------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| `checked`               | `boolean`                    | `false`     | Bindable checked state.                                                                                   |
| `indeterminate`         | `boolean`                    | `false`     | Bindable mixed state; retained by Bits UI but not represented by a local icon.                            |
| `onCheckedChange`       | `(checked: boolean) => void` | `undefined` | Runs when checked state changes.                                                                          |
| `onIndeterminateChange` | `(mixed: boolean) => void`   | `undefined` | Runs when indeterminate state changes.                                                                    |
| `value`                 | `string`                     | `undefined` | Value used when participating in a dependency-level checkbox group; xvelte does not export CheckboxGroup. |
| `inset`                 | `boolean`                    | `undefined` | Aligns content with inset items.                                                                          |
| `children`              | `Snippet`                    | `undefined` | Renders app content without exposing the primitive's checked/indeterminate snippet values.                |

CheckboxItem also forwards Item options such as `disabled`, `textValue`, `onSelect`, `closeOnSelect`, bindable `ref`, `class`, and compatible native attributes. It does not expose render delegation. The local trailing Check icon appears only when `checked` is true; indeterminate state still retains Bits UI's menu-checkbox semantics and ARIA state.

### `ContextMenu.RadioGroup`

Type: `RadioGroupProps`, matching Bits UI Radio Group props.

| Prop                 | Type                      | Default     | xvelte behavior                             |
| -------------------- | ------------------------- | ----------- | ------------------------------------------- |
| `value`              | `string`                  | `""`        | Bindable value of the selected RadioItem.   |
| `onValueChange`      | `(value: string) => void` | `undefined` | Runs when the selected radio value changes. |
| `ref`                | `HTMLDivElement \| null`  | `null`      | Bindable group reference.                   |
| `children` / `child` | Bits UI snippets          | `undefined` | Render or delegate radio-group content.     |

Remaining compatible native `div` attributes are forwarded, with `data-slot="context-menu-radio-group"` added locally.

### `ContextMenu.RadioItem`

Type: `RadioItemProps`, based on Bits UI Radio Item with render delegation removed.

| Prop            | Type                              | Default     | xvelte behavior                                                  |
| --------------- | --------------------------------- | ----------- | ---------------------------------------------------------------- |
| `value`         | `string`                          | required    | Value selected in the containing RadioGroup.                     |
| `inset`         | `boolean`                         | `undefined` | Aligns content with inset items.                                 |
| `children`      | `Snippet<[{ checked: boolean }]>` | `undefined` | Renders content and exposes whether this radio item is selected. |
| `closeOnSelect` | `boolean`                         | `true`      | Controls whether selection closes the menu.                      |

RadioItem also forwards `disabled`, `textValue`, `onSelect`, bindable `ref`, `class`, and compatible native `div` attributes. It cannot delegate its rendered element. The local trailing Check icon is shown when checked.

### Groups and headings

| Part           | Type                | Local behavior                                                                                                                    |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `Group`        | `GroupProps`        | Forwards children, child delegation, bindable `ref`, and native `div` attributes; adds `data-slot="context-menu-group"`.          |
| `GroupHeading` | `GroupHeadingProps` | Forwards primitive heading props and adds `inset`, semantic menu-group association, heading styles, and its named data slot.      |
| `Label`        | `LabelProps`        | Native `div` with optional children, bindable `ref`, native attributes, `inset`, muted label styles, and no menu-group semantics. |

Prefer GroupHeading inside Group. Use Label for a purely visual section caption that should not label a primitive group.

### Submenus

#### `ContextMenu.Sub`

Type: `SubProps`, matching Bits UI Sub props. It supports bindable `open`, `onOpenChange`, `onOpenChangeComplete`, and children. It renders no DOM element.

#### `ContextMenu.SubTrigger`

Type: `SubTriggerProps`, based on Bits UI SubTrigger props with render delegation removed. It forwards `disabled`, `textValue`, `onSelect`, `openDelay` (default `100`ms), children, bindable `ref`, class, and compatible native `div` attributes. Local `inset` aligns content, open/focus state controls the accent surface, `data-slot="context-menu-sub-trigger"` is added, and `ChevronRightIcon` is always appended.

#### `ContextMenu.SubContent`

Type: `SubContentProps`, matching Bits UI SubContent props. It forwards loop, floating positioning/collision, transition, focus, bindable `ref`, class, render delegation, and compatible native `div` attributes. It adds `data-slot="context-menu-sub-content"`, a bordered popover surface with a `8rem` minimum width, and state/side animations. It is not wrapped in another local Portal.

### `ContextMenu.Separator`

Type: `SeparatorProps`, matching Bits UI Separator props. It forwards optional children, child delegation, bindable `ref`, class, and compatible native `div` attributes. Locally it adds `data-slot="context-menu-separator"`, vertical spacing, negative horizontal margin, and a one-pixel `border`-token line.

### `ContextMenu.Shortcut`

Type: `ShortcutProps`, based on native `span` attributes with a bindable reference.

| Prop       | Type                      | Default     | xvelte behavior                                                                                   |
| ---------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `children` | `Snippet`                 | `undefined` | Renders the shortcut hint.                                                                        |
| `ref`      | `HTMLSpanElement \| null` | `null`      | Bindable span reference.                                                                          |
| `class`    | `string`                  | `undefined` | Merged after automatic end alignment, compact tracking, muted color, and parent-item focus color. |

Remaining native `span` attributes are forwarded. Shortcut is presentational: it does not register or execute the displayed key combination.

### `ContextMenu.Portal`

Type: `PortalProps`, matching Bits UI Portal props. It forwards the portal destination, disabled state, children, and other supported portal configuration without local DOM or styling. Standard Content already uses it through `portalProps`.

The component's `index.ts`, exported types, and local source are the source of truth for the public API.

---

## Styling and DOM contract

Context Menu uses Tailwind utilities, semantic theme tokens, local `data-slot` hooks, locally owned presentation attributes, and dependency-owned Bits UI state/positioning attributes. It exposes no component-specific CSS variables.

| Part           | Stable xvelte hook or class                                   |
| -------------- | ------------------------------------------------------------- |
| `Root`, `Sub`  | No DOM and no local hook                                      |
| `Trigger`      | `data-slot="context-menu-trigger"`                            |
| `Content`      | `data-slot="context-menu-content"`                            |
| `Item`         | `data-slot="context-menu-item"`, `data-inset`, `data-variant` |
| `CheckboxItem` | `data-slot="context-menu-checkbox-item"`, `data-inset`        |
| `RadioGroup`   | `data-slot="context-menu-radio-group"`                        |
| `RadioItem`    | `data-slot="context-menu-radio-item"`, `data-inset`           |
| `Group`        | `data-slot="context-menu-group"`                              |
| `GroupHeading` | `data-slot="context-menu-group-heading"`, `data-inset`        |
| `Label`        | `data-slot="context-menu-label"`, `data-inset`                |
| `Separator`    | `data-slot="context-menu-separator"`                          |
| `Shortcut`     | `data-slot="context-menu-shortcut"`                           |
| `SubTrigger`   | `data-slot="context-menu-sub-trigger"`, `data-inset`          |
| `SubContent`   | `data-slot="context-menu-sub-content"`                        |
| `Portal`       | No rendered wrapper                                           |

Bits UI additionally supplies dependency-owned `data-state`, `data-open`, `data-closed`, `data-disabled`, `data-highlighted`, `data-side`, `data-align`, transition, and positioning attributes; roles; IDs; and ARIA relationships. Preserve the xvelte slot values because component styles and app integrations may target them.

`class` is merged with `cn` on styled local parts. Primitive rest props are generally spread last and can override local `data-slot`, `data-inset`, or `data-variant`; doing so can break styling and is not recommended. `Content` and `SubContent` use Bits UI's floating-position variables internally but expose no xvelte-specific variable.

---

## Accessibility

Bits UI supplies menu roles, menu-item roles, checkbox/radio states, roving focus, disabled behavior, typeahead, arrow-key navigation, Home/End navigation, submenu direction, Escape handling, outside interaction, focus management, and pointer intent. Content is portaled so it is not clipped by the trigger's ancestors.

Trigger opens from right-click and from a stationary 700ms touch or pen press. Its default element is a `div` with `tabindex="-1"`, so it is not part of normal Tab navigation. Delegate Trigger to an appropriate focusable element or pass `tabindex="0"` when keyboard access is required, then test the platform Context Menu key and Shift+F10 behavior. Do not make a disabled default `div` appear operable; delegated native controls provide clearer disabled semantics.

App responsibilities:

- Keep essential actions visible outside the context menu.
- Give the trigger clear instructions when right-click interaction would not be obvious.
- Use Item for actions, CheckboxItem for independent settings, and RadioGroup/RadioItem for one-of-many choices.
- Use `GroupHeading` rather than visual Label when a heading must label a group for assistive technology.
- Implement every shortcut shown by Shortcut and avoid conflicts with browser or assistive-technology commands.
- Add confirmation or undo for destructive actions; `variant="destructive"` changes presentation only.
- Supply `textValue` for items whose complex rendered content does not produce useful typeahead text.
- Test long press without blocking scrolling or other expected touch gestures on the chosen trigger surface.

The local CheckboxItem does not visually distinguish indeterminate from unchecked state, even though the primitive exposes the state semantically. Add an indeterminate icon before using that state where sighted users must perceive it.

---

## Localization

Context Menu contains no built-in human-readable copy and does not use Paraglide messages. Apps supply and translate trigger instructions, item labels, group headings, visual labels, checkbox/radio copy, submenu labels, shortcut descriptions, destructive confirmations, and any supporting help text.

The right-chevron is an icon rather than text, and Bits UI derives direction behavior from `Root.dir`. Shortcut symbols such as `⌘` are platform-specific presentation, not translated interaction; render the appropriate localized or platform-specific hint and implement the matching command in the app.

---

## Dependencies

Context Menu expects a Svelte 5 project using Tailwind CSS 4. Install its runtime and development packages with one of these command groups:

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

The wrappers import `cn`, `WithoutChild`, `WithoutChildren`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

Context Menu imports these semantic names from `$lib/icons`. Add the exact exports to `src/lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
```

Keep these aliases in the shared icon facade instead of importing Tabler directly from component files.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, define dark and Bits UI state variants, set the shared border and outline defaults, and expose the semantic colors and radii used by Context Menu. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

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

`tw-animate-css` supplies the enter, exit, fade, zoom, and directional slide utilities. No Context Menu-specific keyframe or shared component stylesheet must be copied. The app remains responsible for applying its `.dark` class when dark mode is supported.

### Other requirements

Context Menu requires no other xvelte component, hook, attachment, context file, localization message, Paraglide setup, or external asset. Bits UI owns its internal contexts and floating-position logic.

---

## Credits

Context Menu is adapted from [shadcn-svelte's Context Menu component](https://www.shadcn-svelte.com/docs/components/context-menu). Local xvelte styling, exports, dependencies, behavior, and limitations documented here take precedence.

---

## File organization

| File                                | Responsibility                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `context-menu-root.svelte`          | Root open-state binding, direction, callbacks, and shared Bits UI menu state.                              |
| `context-menu-trigger.svelte`       | Default or delegated trigger surface, disabled state, right-click/long-press handling, and anchor.         |
| `context-menu-portal.svelte`        | Portal configuration and rendering.                                                                        |
| `context-menu-content.svelte`       | Automatically portaled root content, floating behavior, surface styles, and animations.                    |
| `context-menu-item.svelte`          | Standard selectable action with inset and destructive variants.                                            |
| `context-menu-checkbox-item.svelte` | Bindable checked/indeterminate action and local checked indicator.                                         |
| `context-menu-radio-group.svelte`   | Bindable one-of-many selection context.                                                                    |
| `context-menu-radio-item.svelte`    | Radio option, checked snippet state, and local checked indicator.                                          |
| `context-menu-group.svelte`         | Semantic menu group container.                                                                             |
| `context-menu-group-heading.svelte` | Semantic group heading with optional inset alignment.                                                      |
| `context-menu-label.svelte`         | Presentational native label row with optional inset alignment.                                             |
| `context-menu-separator.svelte`     | Decorative menu separator.                                                                                 |
| `context-menu-shortcut.svelte`      | Presentational keyboard-shortcut hint.                                                                     |
| `context-menu-sub.svelte`           | Submenu open state and callbacks.                                                                          |
| `context-menu-sub-trigger.svelte`   | Submenu trigger, opening delay, state styling, and chevron.                                                |
| `context-menu-sub-content.svelte`   | Floating submenu content, surface styles, positioning, and animations.                                     |
| `index.ts`                          | Public component and props-type exports.                                                                   |
| `README.md`                         | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits. |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

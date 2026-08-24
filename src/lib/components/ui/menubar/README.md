# Menubar

Menubar provides a persistent row of application menus, with keyboard navigation, nested submenus, checkable choices, radio groups, shortcuts, and dangerous or disabled actions. Use it for command-oriented interfaces such as editors and desktop-style tools; use ordinary links or a navigation landmark for primary website navigation.

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

## Import

```svelte
<script lang="ts">
	import * as Menubar from "$lib/components/ui/menubar";
</script>
```

The component's `index.ts` exports:

- Components: `Root`, `Menu`, `Trigger`, `Content`, `Portal`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `GroupHeading`, `Label`, `Separator`, `Shortcut`, `Sub`, `SubTrigger`, and `SubContent`.
- Types: `RootProps`, `MenuProps`, `TriggerProps`, `ContentProps`, `PortalProps`, `ItemProps`, `CheckboxItemProps`, `RadioGroupProps`, `RadioItemProps`, `GroupProps`, `GroupHeadingProps`, `LabelProps`, `SeparatorProps`, `ShortcutProps`, `SubProps`, `SubTriggerProps`, and `SubContentProps`.

Import only from the component folder. The implementation files are private details.

## Anatomy

Each top-level menu needs its own stable `value`. `Content` creates its portal automatically, so the normal composition does not require a separate `Portal`.

```svelte
<Menubar.Root>
	<Menubar.Menu value="file">
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Group>
				<Menubar.GroupHeading>Document</Menubar.GroupHeading>
				<Menubar.Item>
					New file
					<Menubar.Shortcut>⌘N</Menubar.Shortcut>
				</Menubar.Item>
			</Menubar.Group>

			<Menubar.Separator />

			<Menubar.Sub>
				<Menubar.SubTrigger>Share</Menubar.SubTrigger>
				<Menubar.SubContent>
					<Menubar.Item>Email link</Menubar.Item>
				</Menubar.SubContent>
			</Menubar.Sub>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
```

`Label` is a styled `div` for simple visual labels. Prefer `Group` with `GroupHeading` when the label describes a semantic group of related choices.

## Basic usage

```svelte
<script lang="ts">
	import * as Menubar from "$lib/components/ui/menubar";

	function createDocument() {
		// Create the document.
	}
</script>

<Menubar.Root>
	<Menubar.Menu value="file">
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item onSelect={createDocument}>
				New document
				<Menubar.Shortcut>⌘N</Menubar.Shortcut>
			</Menubar.Item>
			<Menubar.Item disabled>Export</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu value="help">
		<Menubar.Trigger>Help</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Keyboard shortcuts</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
```

Use `onSelect` for menu actions. A `Shortcut` only displays a key hint; register the actual keyboard command separately in your application.

## Examples

### Control the active menu

Bind `Root.value` when another part of the interface needs to observe or change the currently open menu.

```svelte
<script lang="ts">
	import * as Menubar from "$lib/components/ui/menubar";

	let activeMenu = $state("");
</script>

<Menubar.Root bind:value={activeMenu}>
	<Menubar.Menu value="file">
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>New document</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu value="edit">
		<Menubar.Trigger>Edit</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Undo</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>

<p>Open menu: {activeMenu || "none"}</p>
```

### Checkbox and radio choices

`CheckboxItem` owns independent `checked` and `indeterminate` bindings. The public component does not export a checkbox group; use several independently bound checkbox items when multiple choices may be active. Use `RadioGroup` for one choice from a set.

```svelte
<script lang="ts">
	import * as Menubar from "$lib/components/ui/menubar";

	let showToolbar = $state(true);
	let density = $state("comfortable");
</script>

<Menubar.Root>
	<Menubar.Menu value="view">
		<Menubar.Trigger>View</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.CheckboxItem bind:checked={showToolbar}>Show toolbar</Menubar.CheckboxItem>

			<Menubar.Separator />
			<Menubar.GroupHeading>Density</Menubar.GroupHeading>

			<Menubar.RadioGroup bind:value={density}>
				<Menubar.RadioItem value="comfortable">Comfortable</Menubar.RadioItem>
				<Menubar.RadioItem value="compact">Compact</Menubar.RadioItem>
			</Menubar.RadioGroup>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
```

The `CheckboxItem` child snippet does not receive state arguments. `RadioItem` children receive `{ checked }` when a custom presentation needs it.

### Nested submenu

```svelte
<script lang="ts">
	import * as Menubar from "$lib/components/ui/menubar";

	let shareOpen = $state(false);
</script>

<Menubar.Root>
	<Menubar.Menu value="file">
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Sub bind:open={shareOpen}>
				<Menubar.SubTrigger>Share</Menubar.SubTrigger>
				<Menubar.SubContent>
					<Menubar.Item>Email link</Menubar.Item>
					<Menubar.Item>Copy public URL</Menubar.Item>
				</Menubar.SubContent>
			</Menubar.Sub>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
```

### Danger and inset actions

```svelte
<Menubar.Item inset>Duplicate</Menubar.Item>
<Menubar.Item inset variant="danger">Delete document</Menubar.Item>
```

`inset` aligns text with the labels of items that reserve space for a selection icon. A danger styling communicates risk but does not add confirmation; ask for confirmation before irreversible work when appropriate.

### Change or disable the portal

```svelte
<Menubar.Content portalProps={{ to: "#overlay-root" }}>
	<Menubar.Item>Open command palette</Menubar.Item>
</Menubar.Content>

<Menubar.Content portalProps={{ disabled: true }}>
	<Menubar.Item>Render beside the trigger</Menubar.Item>
</Menubar.Content>
```

Use a portal target that exists in the browser DOM. Disabling the portal changes stacking and clipping behavior.

## Public API

The tables below describe the local xvelte API and the most important inherited behavior. The component's `index.ts` and exported types are the source of truth. For the complete primitive API, including shared `child`, positioning, event, and binding options, see the [Bits UI Menubar API reference](https://www.bits-ui.com/docs/components/menubar#api-reference).

### Root, Menu, Trigger, Content, and Portal

| Component | Local and important inherited API                                                                                                                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Root`    | Menubar root. `value` is bindable and identifies the open `Menu`; `onValueChange` observes changes. Inherits `loop` (default `true`), `dir`, `ref`, `class`, `children`, and primitive delegation through `child`.                                              |
| `Menu`    | Defines one top-level menu. `value` identifies it; `onOpenChange` reports its open state. It has no xvelte-specific props or DOM styling.                                                                                                                       |
| `Trigger` | Opens its associated `Menu`. Inherits `disabled`, `ref`, `class`, `children`, and `child`.                                                                                                                                                                      |
| `Content` | Menu panel. Local defaults are `side="bottom"`, `align="start"`, `sideOffset={8}`, and `alignOffset={-4}`. Inherits positioning, collision, focus, interaction, `ref`, `class`, `children`, and `child` options. `portalProps` configures the automatic portal. |
| `Portal`  | Direct Bits UI portal export with `to`, `disabled`, and `children`. It is useful for custom compositions, but must not wrap the standard `Content` again because `Content` already creates one.                                                                 |

`Content.portalProps` accepts the `Portal` options except `children` and `child`; its content is always the local menu panel.

### Actions and selection

| Component      | Local API                                                                                                                                                              | Important inherited API                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Item`         | `inset?: boolean`; `variant?: "default" \| "danger"` (default `"default"`).                                                                                            | `disabled`, `textValue`, `onSelect`, `closeOnSelect` (default `true`), `ref`, `class`, `children`, and `child`.                           |
| `CheckboxItem` | `inset?: boolean`; bindable `checked` and `indeterminate`, both defaulting to `false`; plain `children` snippet. A fixed check or minus icon renders before the label. | Item selection and disabled options. The local wrapper deliberately removes `child` and replaces the primitive state-aware child snippet. |
| `RadioGroup`   | Bindable `value`, locally defaulting to `""`.                                                                                                                          | `onValueChange`, `ref`, `children`, and `child`.                                                                                          |
| `RadioItem`    | `inset?: boolean`; required `value`; children receive `{ checked }`. A fixed check icon renders for the selected item.                                                 | Item selection and disabled options. The local wrapper removes primitive `child` delegation.                                              |

The local component does not export Bits UI's `CheckboxGroup`. Checkbox items can still be controlled individually, but the grouped checkbox `value` API is not part of this component's documented public API.

### Groups and presentation

| Component      | Local and important inherited API                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Group`        | Semantic primitive group with `ref`, `children`, and `child`. Its exported type currently declares `inset`, but the wrapper does not consume or style it; avoid relying on that prop. |
| `GroupHeading` | Semantic heading for a primitive `Group`. Adds `inset?: boolean` and inherits `ref`, `class`, `children`, and `child`.                                                                |
| `Label`        | Presentational `div` with `inset?: boolean`, bindable `ref`, `class`, `children`, and normal HTML `div` attributes. It is not connected to `Group` semantics.                         |
| `Separator`    | Visual and semantic separator with `ref`, `class`, and primitive attribute forwarding.                                                                                                |
| `Shortcut`     | Presentational `span` with bindable `ref`, `class`, `children`, and normal HTML `span` attributes. It displays a hint and does not register a keyboard command.                       |

### Submenus

| Component    | Local and important inherited API                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sub`        | Submenu state container. `open` is bindable and locally defaults to `false`; `onOpenChange` observes changes.                                                                                                 |
| `SubTrigger` | Opens a `Sub`. Adds `inset?: boolean` and always appends a right chevron. Inherits `disabled`, `textValue`, `onSelect`, `openDelay`, `ref`, `class`, and `children`; primitive `child` delegation is removed. |
| `SubContent` | Submenu panel. Inherits Bits UI positioning, collision, interaction, `ref`, `class`, `children`, and `child` options without adding local positioning defaults.                                               |

All component classes are merged with `cn()`, so a supplied `class` can extend or override compatible Tailwind utilities.

## Styling and DOM contract

The stable xvelte selectors are:

| Component      | Stable hook                                              |
| -------------- | -------------------------------------------------------- |
| `Root`         | `data-slot="menubar"`                                    |
| `Trigger`      | `data-slot="menubar-trigger"`                            |
| `Content`      | `data-slot="menubar-content"`                            |
| `Item`         | `data-slot="menubar-item"`, `data-inset`, `data-variant` |
| `CheckboxItem` | `data-slot="menubar-checkbox-item"`, `data-inset`        |
| `RadioGroup`   | `data-slot="menubar-radio-group"`                        |
| `RadioItem`    | `data-slot="menubar-radio-item"`, `data-inset`           |
| `Group`        | `data-slot="menubar-group"`                              |
| `GroupHeading` | `data-slot="menubar-group-heading"`, `data-inset`        |
| `Label`        | `data-slot="menubar-label"`, `data-inset`                |
| `Separator`    | `data-slot="menubar-separator"`                          |
| `Shortcut`     | `data-slot="menubar-shortcut"`                           |
| `SubTrigger`   | `data-slot="menubar-sub-trigger"`, `data-inset`          |
| `SubContent`   | `data-slot="menubar-sub-content"`                        |

`Menu`, `Portal`, and `Sub` do not render a local `data-slot`. Bits UI owns interaction attributes such as `data-open`, `data-closed`, `data-disabled`, and positioned-content `data-side`; these are dependency behavior rather than renamed xvelte state.

The component uses the `popover`, `foreground`, `accent`, `muted`, `danger`, and `border` color families plus the shared radius scale. `Content` and `SubContent` use `tw-animate-css` utilities for opening, closing, fading, zooming, and directional movement.

Top-level Trigger and focused items receive the standard three-pixel, 50%-opacity semantic `ring` treatment from the required global `*:focus-visible` rule. Items inside an open menu additionally retain the conventional accent-background highlight used by the roving-focus menu pattern.

Current implementation details worth knowing:

- `Content` references `--bits-menubar-content-transform-origin`. The installed Bits UI version exposes `--bits-menubar-menu-content-transform-origin`, so the computed transform origin is not applied unless the app defines an alias or the local class is corrected.
- The chevron inside `SubTrigger` does not automatically mirror in right-to-left layouts.
- `Group.inset` is present in the exported type but has no local styling effect.

Treat these three points as current limitations, not as recommended extension hooks.

## Accessibility

Bits UI supplies the menubar and menu semantics, roving focus, typeahead, disabled-item behavior, focus return, and keyboard interactions. Users can move between top-level menus, open and traverse their contents, enter submenus, select actions, and close menus using the expected arrow, Enter, Space, and Escape keys.

Application responsibilities:

- Use Menubar for application commands. Use semantic navigation links inside a `nav` landmark for primary site navigation.
- Give every trigger and item concise, meaningful visible text. Use `textValue` when custom visual content would otherwise make typeahead unreliable.
- Use `Group` and `GroupHeading` for meaningful groups. `Label` is only presentational.
- Keep `Shortcut` text consistent with the actual shortcut registered by the application and with the user's platform.
- Do not rely on color alone for dangerous actions. The `danger` variant changes styling but does not add a warning or confirmation flow.
- Preserve primitive focus and state attributes when overriding classes or using `child` delegation.
- If right-to-left chevron mirroring is required, provide and test an app-specific adaptation.

The fixed check, minus, and chevron icons are decorative helpers; selection state and submenu semantics continue to come from Bits UI.

## Localization

Menubar contains no built-in human-readable copy and requires no entries in `messages/en.json`. The application supplies and translates all trigger text, item labels, group headings, shortcut hints, and any confirmation dialog copy.

Pass the interface direction through `Root.dir` when it is not inherited correctly from the document. Shortcut labels may also need platform-aware formatting; they are display text, not executable bindings.

## Dependencies

### Packages

Use the commands for your package manager; runtime dependencies come first and development dependencies use `-D`:

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss tw-animate-css

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css
```

### Global styles and theme variables

Import Tailwind and the animation utilities, then provide the semantic variables used by Menubar. These values match xvelte's default theme and may be replaced with your own palette.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
	--radius: 0.45rem;
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--accent: oklch(0.95 0.035 350);
	--accent-foreground: oklch(0.35 0.12 350);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--accent: oklch(0.3 0.07 350);
	--accent-foreground: oklch(0.97 0.02 350);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-ring: var(--ring);
}

@layer base {
	* {
		@apply border-border;
	}

	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

No additional Menubar-specific keyframes or shared stylesheet files are required.

### Icons

Add the semantic icon exports used by the selection indicators and submenu trigger to `$lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
export { default as MinusIcon } from "@tabler/icons-svelte/icons/minus";
```

The backing package is `@tabler/icons-svelte`, included in the installation commands above.

### Utilities

Menubar imports `cn`, `WithElementRef`, `WithoutChild`, `WithoutChildren`, and `WithoutChildrenOrChild` from `$lib/utils`. Copy these definitions:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
```

`clsx` and `tailwind-merge` are included in the installation commands above.

### Other project files

- Copy the complete `src/lib/components/ui/menubar` component folder, including its `index.ts` and all Svelte files listed below.
- No other xvelte UI component is required.
- No xvelte hook, attachment, context module, shared style file, or localization message is required.
- Menubar does not depend on application route code.

## Credits

The local component is adapted from [shadcn-svelte's Menubar](https://www.shadcn-svelte.com/docs/components/menubar). Interaction primitives and their runtime API are provided by Bits UI and are listed under Dependencies.

## File organization

| File                           | Responsibility                                                |
| ------------------------------ | ------------------------------------------------------------- |
| `index.ts`                     | Public component and type exports.                            |
| `menubar-root.svelte`          | Menubar container and shared open-menu state.                 |
| `menubar-menu.svelte`          | One top-level menu definition.                                |
| `menubar-trigger.svelte`       | Top-level menu trigger.                                       |
| `menubar-content.svelte`       | Portaled top-level menu panel and local positioning defaults. |
| `menubar-portal.svelte`        | Public portal wrapper.                                        |
| `menubar-item.svelte`          | Standard and dangerous action item.                           |
| `menubar-checkbox-item.svelte` | Independently checkable item and state icon.                  |
| `menubar-radio-group.svelte`   | Single-choice value container.                                |
| `menubar-radio-item.svelte`    | Radio choice and selected icon.                               |
| `menubar-group.svelte`         | Semantic group container.                                     |
| `menubar-group-heading.svelte` | Semantic group heading.                                       |
| `menubar-label.svelte`         | Presentational section label.                                 |
| `menubar-separator.svelte`     | Visual and semantic item separator.                           |
| `menubar-shortcut.svelte`      | Visual keyboard shortcut hint.                                |
| `menubar-sub.svelte`           | Submenu open-state container.                                 |
| `menubar-sub-trigger.svelte`   | Submenu trigger and chevron.                                  |
| `menubar-sub-content.svelte`   | Positioned submenu panel.                                     |
| `README.md`                    | Installation and usage guide.                                 |

The component's `index.ts` and its exported prop types are the source of truth for the public API.

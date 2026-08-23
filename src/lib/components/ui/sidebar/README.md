# Sidebar

A responsive, composable application sidebar with desktop off-canvas or icon collapse modes, a mobile Sheet presentation, persisted desktop state, keyboard and pointer toggles, themed menu parts, nested navigation, actions, badges, tooltips, and inset page layout support.

Use Sidebar for persistent application navigation or tools that share the available layout with main content. Do not use it for a small contextual menu, ordinary document table of contents, or content that should remain in the normal responsive flow without independent collapse state.

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

```svelte
<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Tooltip from "$lib/components/ui/tooltip";
</script>
```

`index.ts` exports 22 component parts and a matching props type for each. It also exports `SidebarState`, `SidebarStateProps`, `getSidebarContext`, `setSidebarContext`, and the constants `SIDEBAR_COOKIE_NAME`, `SIDEBAR_COOKIE_MAX_AGE`, `SIDEBAR_WIDTH`, `SIDEBAR_WIDTH_MOBILE`, `SIDEBAR_WIDTH_ICON`, and `SIDEBAR_KEYBOARD_SHORTCUT`.

---

## Anatomy

Provider must wrap Root, every state-aware part, and the main Inset:

```text
Provider
├── Root
│   ├── Header
│   ├── Content
│   │   └── Group
│   │       ├── GroupLabel + optional GroupAction
│   │       └── GroupContent
│   │           └── Menu → MenuItem → MenuButton/Action/Badge/MenuSub
│   ├── Footer
│   └── Rail
└── Inset
    └── Trigger + main application content
```

On viewports below 768 pixels, Root renders its contents inside Sheet. On desktop it reserves a layout gap and renders the sidebar container beside Inset. The project is designed for fixed-height application shells, so Provider uses `h-full`; an ancestor must provide the height.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar";

	const links = [
		{ href: "/dashboard", label: "Dashboard", icon: "D" },
		{ href: "/projects", label: "Projects", icon: "P" },
		{ href: "/settings", label: "Settings", icon: "S" }
	];
</script>

<Tooltip.Provider delayDuration={500}>
	<Sidebar.Provider>
		<Sidebar.Root collapsible="icon">
			<Sidebar.Header>
				<strong class="px-2">Workspace</strong>
			</Sidebar.Header>

			<Sidebar.Content>
				<Sidebar.Group>
					<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each links as link (link.href)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent={link.label}>
										{#snippet child({ props })}
											<a href={link.href} {...props}>
												<span aria-hidden="true">{link.icon}</span>
												<span>{link.label}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			</Sidebar.Content>

			<Sidebar.Footer>Signed in</Sidebar.Footer>
			<Sidebar.Rail />
		</Sidebar.Root>

		<Sidebar.Inset>
			<header class="flex h-12 items-center gap-2 border-b px-4">
				<Sidebar.Trigger />
				<h1>Dashboard</h1>
			</header>

			<main class="min-h-0 flex-1 overflow-auto p-4">Application content</main>
		</Sidebar.Inset>
	</Sidebar.Provider>
</Tooltip.Provider>
```

Tooltip.Provider is required because Trigger and tooltip-enabled MenuButton use Tooltip internally.

---

## Examples

### Controlled desktop state

```svelte
<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar";

	let open = $state(true);
</script>

<Sidebar.Provider bind:open onOpenChange={(next) => console.info("Desktop sidebar open", next)}>
	<Sidebar.Root>…</Sidebar.Root>
	<Sidebar.Inset>…</Sidebar.Inset>
</Sidebar.Provider>
```

`open` controls desktop collapse only. Mobile uses a separate `openMobile` state in `SidebarState`; desktop changes invoke `onOpenChange` and write the `sidebar_state` cookie, while mobile changes do neither.

Provider does not read the cookie itself. When initial server-rendered state should persist between visits, read `sidebar_state` in application server/layout code and pass the resulting boolean as `open`.

### Collapse modes and variants

```svelte
<Sidebar.Root side="right" variant="floating" collapsible="icon">…</Sidebar.Root>
```

- `offcanvas` moves the desktop sidebar fully beyond its edge when collapsed.
- `icon` reduces it to the configured icon width; menu labels, actions, submenus, and group labels adapt or hide.
- `none` renders a fixed-width ordinary flex sidebar and ignores Provider collapse state.
- `floating` adds outer padding, rounded corners, shadow, and ring.
- `inset` is designed to accompany `Sidebar.Inset` and gives the main area its inset card treatment.

### Custom widths

Provider writes the width variables in its inline style before caller styles, so callers may override them:

```svelte
<Sidebar.Provider style="--sidebar-width: 20rem; --sidebar-width-icon: 3.5rem;">…</Sidebar.Provider>
```

The local mobile Root sets `--sidebar-width` to `SIDEBAR_WIDTH_MOBILE` directly on Sheet.Content. Override the mobile panel with Root classes or edit the exported constant when a collection-wide width change is intended.

### Active menu, badge, and action

```svelte
<Sidebar.MenuItem>
	<Sidebar.MenuButton isActive tooltipContent="Inbox">
		{#snippet child({ props })}
			<a href="/inbox" {...props}>
				<span aria-hidden="true">I</span>
				<span>Inbox</span>
			</a>
		{/snippet}
	</Sidebar.MenuButton>

	<Sidebar.MenuBadge>12</Sidebar.MenuBadge>
	<Sidebar.MenuAction type="button" showOnHover aria-label="Inbox options">•••</Sidebar.MenuAction>
</Sidebar.MenuItem>
```

MenuAction and MenuBadge position themselves relative to MenuItem and read the sibling MenuButton's size and active attributes. Pass `type="button"` to default action buttons inside forms.

### Nested navigation

```svelte
<Sidebar.MenuItem>
	<Sidebar.MenuButton tooltipContent="Projects">
		<span aria-hidden="true">P</span>
		<span>Projects</span>
	</Sidebar.MenuButton>

	<Sidebar.MenuSub>
		<Sidebar.MenuSubItem>
			<Sidebar.MenuSubButton href="/projects/alpha" isActive>Alpha</Sidebar.MenuSubButton>
		</Sidebar.MenuSubItem>
		<Sidebar.MenuSubItem>
			<Sidebar.MenuSubButton href="/projects/beta">Beta</Sidebar.MenuSubButton>
		</Sidebar.MenuSubItem>
	</Sidebar.MenuSub>
</Sidebar.MenuItem>
```

Submenus hide in icon-collapse mode. MenuSubButton renders an anchor by default; supply `href` or use its `child` snippet for another navigation component.

### Search input and separator

```svelte
<Sidebar.Header>
	<label for="sidebar-search" class="sr-only">Search navigation</label>
	<Sidebar.Input id="sidebar-search" type="search" placeholder="Search navigation" bind:value={query} />
</Sidebar.Header>

<Sidebar.Separator />
```

Sidebar.Input reuses the xvelte Input API and styles. Sidebar.Separator reuses xvelte Separator.

### Access shared state

```svelte
<script lang="ts">
	import { getSidebarContext } from "$lib/components/ui/sidebar";

	const sidebar = getSidebarContext();
</script>

<button type="button" onclick={sidebar.toggle}>
	{sidebar.isMobile ? "Toggle mobile navigation" : sidebar.open ? "Collapse navigation" : "Expand navigation"}
</button>
```

Call `getSidebarContext()` during component initialization beneath Provider. Keep the class instance intact rather than destructuring reactive getters such as `state` or `isMobile`.

---

## Public API

Sidebar is primarily local code; mobile Root uses Sheet, Trigger uses Button and Tooltip, Input and Separator reuse their matching components, and MenuButton uses Bits UI `mergeProps`. The tables document the complete local API. The component's `index.ts`, exported types/constants, and source are the source of truth.

### Provider, Root, and shared state

#### `Sidebar.Provider`

Type: `ProviderProps`, native `<div>` attributes plus:

| Prop           | Type                      | Default | Behavior                                                                  |
| -------------- | ------------------------- | ------- | ------------------------------------------------------------------------- |
| `open`         | `boolean`                 | `true`  | Bindable desktop expanded state.                                          |
| `onOpenChange` | `(open: boolean) => void` | No-op   | Runs after a desktop update and before the persistence cookie is written. |
| `style`        | Native style string       | —       | Appended after local width variables and may override them.               |
| `ref`          | `HTMLDivElement \| null`  | `null`  | Bindable wrapper element.                                                 |
| `children`     | `Snippet`                 | —       | Sidebar Root and main Inset.                                              |

Provider renders `data-slot="sidebar-wrapper"`, installs the global Ctrl/Cmd+B listener, sets context, writes desktop changes to a seven-day cookie, and uses full parent height.

#### `Sidebar.Root`

Type: `RootProps`, native `<div>` attributes plus:

| Prop          | Type                                 | Default       | Behavior                                                                                                   |
| ------------- | ------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------- |
| `side`        | `"left" \| "right"`                  | `"left"`      | Chooses edge, borders, off-canvas direction, and Rail cursor.                                              |
| `variant`     | `"sidebar" \| "floating" \| "inset"` | `"sidebar"`   | Chooses plain, floating, or inset desktop presentation.                                                    |
| `collapsible` | `"offcanvas" \| "icon" \| "none"`    | `"offcanvas"` | Chooses desktop collapse behavior or disables collapse.                                                    |
| `ref`         | `HTMLDivElement \| null`             | `null`        | Points to the fixed sidebar div, mobile Sheet.Content, or desktop outer state wrapper depending on branch. |
| `children`    | `Snippet`                            | —             | Sidebar Header/Content/Footer/Rail composition.                                                            |

On desktop, caller `class` and remaining native attributes apply to the inner sidebar container, while state attributes live on its outer wrapper. In the non-collapsible branch they apply directly to the only div. On mobile, class applies to Sheet.Content and remaining props are passed through the Sheet Root boundary; do not depend on arbitrary native div attributes landing on the mobile panel.

#### `SidebarState`

| Member                         | Type                        | Behavior                                                                 |
| ------------------------------ | --------------------------- | ------------------------------------------------------------------------ |
| `open`                         | getter/setter boolean       | Provider-owned desktop state; setter triggers callback and cookie write. |
| `openMobile`                   | reactive boolean            | Mobile Sheet state, initially false.                                     |
| `state`                        | `"expanded" \| "collapsed"` | Derived from desktop `open`.                                             |
| `isMobile`                     | boolean getter              | Matches widths below 768 pixels through `IsMobile`.                      |
| `setOpenMobile(value)`         | method                      | Updates only mobile Sheet state.                                         |
| `toggle()`                     | method                      | Toggles mobile or desktop state according to current viewport.           |
| `handleShortcutKeydown(event)` | handler                     | Toggles for Ctrl/Cmd plus the configured shortcut.                       |

`getSidebarContext()` returns the nearest state instance. `setSidebarContext(props)` creates and provides one and is used by Provider; application components normally should not call it directly. `SidebarStateProps` contains the reactive `open: boolean` bridge.

### Layout parts

The following parts accept native element attributes, children, merged `class`, and a bindable `ref`:

| Part and type                        | Element | Purpose and defaults                                                                                   |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| `Header` — `HeaderProps`             | `div`   | Top stack with gap and 0.5rem padding.                                                                 |
| `Content` — `ContentProps`           | `div`   | Flexible, minimum-zero, vertically scrolling center; uses `no-scrollbar`; hides overflow in icon mode. |
| `Footer` — `FooterProps`             | `div`   | Bottom stack with gap and 0.5rem padding.                                                              |
| `Group` — `GroupProps`               | `div`   | Relative section with 0.5rem padding.                                                                  |
| `GroupContent` — `GroupContentProps` | `div`   | Full-width group body with small text.                                                                 |
| `Inset` — `InsetProps`               | `main`  | Flexible application main area; applies inset margin/radius/shadow when paired with `variant="inset"`. |
| `Menu` — `MenuProps`                 | `ul`    | Vertical zero-gap list.                                                                                |
| `MenuItem` — `MenuItemProps`         | `li`    | Relative positioning context for button/action/badge.                                                  |
| `MenuSub` — `MenuSubProps`           | `ul`    | Indented bordered nested list, hidden in icon mode.                                                    |
| `MenuSubItem` — `MenuSubItemProps`   | `li`    | Relative submenu item.                                                                                 |

#### `GroupLabel` and `GroupAction`

Both accept native attributes, `children`, bindable `ref`, merged class, and `child({ props })` delegated rendering. Spread every delegated prop.

- GroupLabel defaults to a styled `div` and hides in icon mode.
- GroupAction defaults to an absolutely positioned `button`, hides in icon mode, and does not set `type`; use `type="button"` when appropriate.

### Menu controls

#### `Sidebar.MenuButton`

| Prop                  | Type                                   | Default     | Behavior                                                                |
| --------------------- | -------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `isActive`            | `boolean`                              | `false`     | Sets `data-active` and active colors/weight.                            |
| `variant`             | `"default" \| "outline"`               | `"default"` | Selects transparent or outlined presentation.                           |
| `size`                | `"sm" \| "default" \| "lg"`            | `"default"` | Selects 28, 32, or 48-pixel height and drives sibling positioning.      |
| `tooltipContent`      | `Snippet \| string`                    | —           | Adds a 500ms Tooltip visible only while desktop icon mode is collapsed. |
| `tooltipContentProps` | Tooltip Content props without snippets | —           | Configures the generated Tooltip.Content.                               |
| `child`               | `Snippet<[{ props }]>`                 | —           | Replaces the default button; spread every supplied prop.                |
| `children`            | `Snippet`                              | —           | Default button contents.                                                |
| `ref`                 | `HTMLButtonElement \| null`            | `null`      | Bindable default button.                                                |

MenuButton accepts native-compatible button attributes but defaults to a `<button>` without setting `type`; pass `type="button"` for actions inside forms. Use `child` for anchors and router link components. Tooltip generation requires Tooltip.Provider.

#### Actions, badges, and sub-buttons

| Part and type                          | Public additions                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `MenuAction` — `MenuActionProps`       | Native button props, `child`, `children`, `ref`, and `showOnHover` (default false). Hides in icon mode; default button has no fixed `type`. |
| `MenuBadge` — `MenuBadgeProps`         | Native div props, children, ref; positioned from the sibling MenuButton's size, non-interactive, and hidden in icon mode.                   |
| `MenuSubButton` — `MenuSubButtonProps` | Native anchor props, `child`, children, ref, `size="sm                                                                                      | md"`(default md), and`isActive`(default false). Defaults to`<a>` and hides in icon mode. |

### Input, Separator, Trigger, and Rail

| Part and type                  | Public API                                                                                                                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Input` — `InputProps`         | Complete xvelte Input props with bindable `value` (local default `""`) and ref; adds sidebar slots and compact background styling.                                                                                                                             |
| `Separator` — `SeparatorProps` | Complete xvelte Separator props and ref; changes slot and applies sidebar border/margins.                                                                                                                                                                      |
| `Trigger` — `TriggerProps`     | xvelte Button props plus optional `onclick`; calls caller handler then `sidebar.toggle()`. Defaults to ghost `icon-sm`, `type="button"`, semantic SidebarIcon, localized screen-reader text, and Tooltip. Forwarded Button props can override visual defaults. |
| `Rail` — `RailProps`           | Native button attributes, children, ref; defaults to `tabindex=-1`, localized label/title, pointer toggle, and an edge hit area. Forwarded attributes can override tabindex/title.                                                                             |

Rail is a pointer convenience and intentionally does not replace the keyboard-reachable Trigger.

### Exported constants

```ts
SIDEBAR_COOKIE_NAME = "sidebar_state";
SIDEBAR_COOKIE_MAX_AGE = 604800; // seven days
SIDEBAR_WIDTH = "16rem";
SIDEBAR_WIDTH_MOBILE = "18rem";
SIDEBAR_WIDTH_ICON = "3rem";
SIDEBAR_KEYBOARD_SHORTCUT = "b";
```

Changing these source constants changes collection-wide defaults. Provider exposes desktop width variables for per-instance overrides.

---

## Styling and DOM contract

Every visible part has a stable `data-slot`: `sidebar-wrapper`, `sidebar`, `sidebar-gap`, `sidebar-container`, `sidebar-inner`, `sidebar-header`, `sidebar-content`, `sidebar-footer`, `sidebar-group`, `sidebar-group-label`, `sidebar-group-action`, `sidebar-group-content`, `sidebar-menu`, `sidebar-menu-item`, `sidebar-menu-button`, `sidebar-menu-action`, `sidebar-menu-badge`, `sidebar-menu-sub`, `sidebar-menu-sub-item`, `sidebar-menu-sub-button`, `sidebar-input`, `sidebar-separator`, `sidebar-trigger`, `sidebar-rail`, and `sidebar-inset`.

Most sidebar-specific parts also expose `data-sidebar` with the shorter role name. Desktop Root exposes stable state attributes:

- `data-state="expanded|collapsed"`
- `data-collapsible="offcanvas|icon|"`
- `data-variant="sidebar|floating|inset"`
- `data-side="left|right"`

Mobile Root exposes `data-mobile="true"`. MenuButton and MenuSubButton expose `data-size` and `data-active`. Step-specific named Tailwind groups and peers such as `group/sidebar-wrapper`, `group/menu-item`, and `peer/menu-button` coordinate sibling presentation and are part of the local styling contract.

Provider defines `--sidebar-width` and `--sidebar-width-icon`; mobile Content replaces `--sidebar-width`. Classes use `cn()` except delegated prop objects, whose class is already built with `cn()` before being passed, and Trigger, which forwards its `class` prop to Button. Root's desktop outer state wrapper has fixed classes while caller class targets the container.

Keyboard-focusable labels, actions, menu buttons, and submenu buttons receive the shared three-pixel, 50%-opacity `ring` halo from the required global `*:focus-visible` rule.

---

## Accessibility

Trigger is the primary keyboard-reachable toggle, includes localized screen-reader text and a tooltip, and responds to Ctrl/Cmd+B through Provider's window listener. Mobile Root inherits Sheet's dialog labelling, focus handling, escape dismissal, and hidden localized Title/Description.

Menus use `ul`/`li`, but MenuButton defaults to a button. Render navigation destinations as anchors through `child`, spread every delegated prop, preserve visible focus, and set `aria-current="page"` in addition to `isActive` when a link represents the current page. Supply `tooltipContent` for icon-collapse buttons so hidden labels remain discoverable.

Rail is removed from sequential focus with `tabindex=-1`; keep Trigger available. GroupAction and MenuAction need accessible names when icon-only. Do not rely on collapse animations, color, or badges alone to communicate navigation state. The shortcut should not conflict with application or browser commands.

---

## Localization

| Message ID         | English value                  | Used by                                                       |
| ------------------ | ------------------------------ | ------------------------------------------------------------- |
| `brisk_otter_turn` | `Toggle Sidebar`               | Trigger screen-reader text and tooltip; Rail label and title. |
| `calm_raven_nest`  | `Sidebar`                      | Hidden mobile Sheet title.                                    |
| `dune_maple_shine` | `Displays the mobile sidebar.` | Hidden mobile Sheet description.                              |

The app supplies and translates navigation labels, group headings, menu tooltips, action names, search placeholders, badge context, account text, and page content.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge tw-animate-css
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge tw-animate-css
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge tw-animate-css
pnpm add -D @inlang/paraglide-js tailwindcss
```

`bits-ui` is used directly for `mergeProps` and by Sheet and Tooltip. No mode-management package is required.

### Icon facade

Sidebar itself needs:

```ts
export { default as SidebarIcon } from "@tabler/icons-svelte/icons/layout-sidebar";
```

Sheet requires its own `CloseIcon`; follow Sheet's README for that dependent component.

### Global styles and sidebar theme

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--background: oklch(1 0 0);
	--sidebar: oklch(0.985 0.001 106.423);
	--sidebar-foreground: oklch(0.147 0.004 49.25);
	--sidebar-primary: oklch(0.648 0.2 131.684);
	--sidebar-primary-foreground: oklch(0.986 0.031 120.757);
	--sidebar-accent: oklch(0.97 0.001 106.424);
	--sidebar-accent-foreground: oklch(0.216 0.006 56.043);
	--sidebar-border: oklch(0.923 0.003 48.717);
	--sidebar-ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--sidebar: oklch(0.216 0.006 56.043);
	--sidebar-foreground: oklch(0.985 0.001 106.423);
	--sidebar-primary: oklch(0.768 0.233 130.85);
	--sidebar-primary-foreground: oklch(0.274 0.072 132.109);
	--sidebar-accent: oklch(0.268 0.007 34.298);
	--sidebar-accent-foreground: oklch(0.985 0.001 106.423);
	--sidebar-border: oklch(1 0 0 / 10%);
	--sidebar-ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-sidebar: var(--sidebar);
	--color-sidebar-foreground: var(--sidebar-foreground);
	--color-sidebar-primary: var(--sidebar-primary);
	--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
	--color-sidebar-accent: var(--sidebar-accent);
	--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
	--color-sidebar-border: var(--sidebar-border);
	--color-sidebar-ring: var(--sidebar-ring);
	--color-ring: var(--sidebar-ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@custom-variant data-open {
	&:where([data-state="open"]),
	&:where([data-open]:not([data-open="false"])) {
		@slot;
	}
}

@custom-variant data-active {
	&:where([data-state="active"]),
	&:where([data-active]:not([data-active="false"])) {
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

These are the sidebar-specific values and utility. Replace colors and radius with the app's theme. Button, Input, Separator, Sheet, and Tooltip require additional semantic tokens and variants documented in their own guides.

### Shared utilities

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

### Required hook

Copy `src/lib/hooks/is-mobile.svelte.ts` with this complete content:

```ts
import { MediaQuery } from "svelte/reactivity";

const DEFAULT_MOBILE_BREAKPOINT = 768;

/** Reactive media query that matches viewport widths below a mobile breakpoint. */
export class IsMobile extends MediaQuery {
	/**
	 * @param breakpoint - First viewport width considered non-mobile, in pixels.
	 */
	constructor(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		super(`max-width: ${breakpoint - 1}px`);
	}
}
```

### Required xvelte components

Copy these components and follow each available colocated README for its own API and installation requirements:

```text
button/
├── button-root.svelte
└── index.ts

input/
├── input-root.svelte
└── index.ts

separator/
├── separator-root.svelte
└── index.ts

sheet/
├── index.ts
├── sheet-close.svelte
├── sheet-content.svelte
├── sheet-description.svelte
├── sheet-footer.svelte
├── sheet-header.svelte
├── sheet-overlay.svelte
├── sheet-portal.svelte
├── sheet-root.svelte
├── sheet-title.svelte
└── sheet-trigger.svelte

tooltip/
├── index.ts
├── tooltip-content.svelte
├── tooltip-portal.svelte
├── tooltip-provider.svelte
├── tooltip-root.svelte
└── tooltip-trigger.svelte
```

Tooltip currently has no colocated guide; keep its complete folder together and mount its Provider once around Sidebar:

```svelte
<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip";
</script>

<Tooltip.Provider delayDuration={500}>
	<!-- Sidebar.Provider and application -->
</Tooltip.Provider>
```

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the three keys listed in [Localization](#localization) to `messages/en.json`. Their complete keys and values are already shown there.

### Component files and other integration

Copy the complete Sidebar folder, including its private context and constants:

```text
sidebar/
├── index.ts
├── sidebar-constants.ts
├── sidebar-content.svelte
├── sidebar-context.svelte.ts
├── sidebar-footer.svelte
├── sidebar-group-action.svelte
├── sidebar-group-content.svelte
├── sidebar-group-label.svelte
├── sidebar-group.svelte
├── sidebar-header.svelte
├── sidebar-input.svelte
├── sidebar-inset.svelte
├── sidebar-menu-action.svelte
├── sidebar-menu-badge.svelte
├── sidebar-menu-button.svelte
├── sidebar-menu-item.svelte
├── sidebar-menu-sub-button.svelte
├── sidebar-menu-sub-item.svelte
├── sidebar-menu-sub.svelte
├── sidebar-menu.svelte
├── sidebar-provider.svelte
├── sidebar-rail.svelte
├── sidebar-root.svelte
├── sidebar-separator.svelte
└── sidebar-trigger.svelte
```

No public attachment, image, font, or network service is required. Give Provider a parent with a definite height.

---

## Credits

The component structure and design are adapted from [shadcn-svelte Sidebar](https://www.shadcn-svelte.com/docs/components/sidebar). Local responsive state, fixed-container layout, context conventions, and public exports define this implementation.

---

## File organization

| File or group                                                              | Responsibility                                                                                                          |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `sidebar-provider.svelte`                                                  | Shared state provider, desktop binding/callback/cookie, shortcut listener, width variables, and full-height wrapper.    |
| `sidebar-context.svelte.ts`                                                | Desktop/mobile responsive state, derived collapse state, context access, shortcut, and toggle actions.                  |
| `sidebar-constants.ts`                                                     | Cookie, width, and keyboard defaults.                                                                                   |
| `sidebar-root.svelte`                                                      | Non-collapsible, mobile Sheet, and desktop gap/container rendering branches.                                            |
| `sidebar-header.svelte`, `sidebar-content.svelte`, `sidebar-footer.svelte` | Main sidebar regions and internal scrolling.                                                                            |
| `sidebar-group*.svelte`                                                    | Group container, label, optional action, and content.                                                                   |
| `sidebar-menu.svelte`, `sidebar-menu-item.svelte`                          | Semantic top-level menu list and item.                                                                                  |
| `sidebar-menu-button.svelte`                                               | Menu button/link delegation, active variants, sizes, collapse behavior, and optional tooltip.                           |
| `sidebar-menu-action.svelte`, `sidebar-menu-badge.svelte`                  | Sibling action and numeric/status badge positioning.                                                                    |
| `sidebar-menu-sub*.svelte`                                                 | Nested menu list, item, and active link/button.                                                                         |
| `sidebar-input.svelte`                                                     | Sidebar-styled xvelte Input wrapper.                                                                                    |
| `sidebar-separator.svelte`                                                 | Sidebar-styled xvelte Separator wrapper.                                                                                |
| `sidebar-trigger.svelte`                                                   | Keyboard-reachable Button toggle, icon, tooltip, and localized label.                                                   |
| `sidebar-rail.svelte`                                                      | Pointer edge toggle and collapse cursor treatment.                                                                      |
| `sidebar-inset.svelte`                                                     | Main application region and inset-variant styling.                                                                      |
| `index.ts`                                                                 | Every public component, type, state helper, and constant.                                                               |
| `README.md`                                                                | Composition, examples, complete API, responsive behavior, accessibility, localization, styling, and installation guide. |

The component's `index.ts`, exported types/constants, and local source are the source of truth for the public API.

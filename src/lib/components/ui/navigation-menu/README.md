# Navigation Menu

Navigation Menu provides an accessible collection of links for a website's primary or sectional navigation. It supports direct links, expandable link panels, an animated shared viewport, active-page state, delayed pointer opening, and an optional position indicator. Use it for navigation between pages; use Menubar for application commands and Dropdown Menu for a compact action menu.

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
	import * as NavigationMenu from "$lib/components/ui/navigation-menu";
</script>
```

The component's `index.ts` exports:

- Components: `Root`, `List`, `Item`, `Trigger`, `Content`, `Link`, `Viewport`, and `Indicator`.
- Types: `RootProps`, `ListProps`, `ItemProps`, `TriggerProps`, `ContentProps`, `LinkProps`, `ViewportProps`, and `IndicatorProps`.

Import only from the component folder. The implementation files are private details.

## Anatomy

`Root` renders the navigation landmark and, by default, automatically appends one shared `Viewport`. Each expandable `Item` pairs a `Trigger` with `Content`; direct links use `Link` without a trigger.

```svelte
<NavigationMenu.Root>
	<NavigationMenu.List>
		<NavigationMenu.Item value="products">
			<NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<NavigationMenu.Link href="/analytics">Analytics</NavigationMenu.Link>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
		</NavigationMenu.Item>

		<NavigationMenu.Indicator />
	</NavigationMenu.List>
</NavigationMenu.Root>
```

`Indicator` is optional and belongs inside `List`. Do not add `Viewport` manually while `Root.viewport` is `true`, or two viewports will compete for the same content.

The installed Bits UI primitive supports nested `Sub` menus, but xvelte does not export a `Sub` component. Nested Navigation Menu submenus are therefore not part of the local public API.

## Basic usage

```svelte
<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu";
</script>

<NavigationMenu.Root aria-label="Primary">
	<NavigationMenu.List>
		<NavigationMenu.Item value="resources">
			<NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<ul class="grid w-80 gap-1 p-2">
					<li>
						<NavigationMenu.Link href="/guides">
							<div class="font-medium">Guides</div>
							<div class="text-sm opacity-70">Step-by-step help for common workflows.</div>
						</NavigationMenu.Link>
					</li>
					<li>
						<NavigationMenu.Link href="/api">
							<div class="font-medium">API reference</div>
							<div class="text-sm opacity-70">Detailed documentation for every endpoint.</div>
						</NavigationMenu.Link>
					</li>
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
		</NavigationMenu.Item>

		<NavigationMenu.Indicator />
	</NavigationMenu.List>
</NavigationMenu.Root>
```

The default `Link` renders an anchor and accepts `href` plus normal anchor attributes directly.

## Examples

### Mark the current page

Set `active` on the current link. Bits UI adds `aria-current="page"` and xvelte applies its active styling.

```svelte
<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu";

	let pathname = $state("/docs");
</script>

<NavigationMenu.Root aria-label="Documentation">
	<NavigationMenu.List>
		<NavigationMenu.Item>
			<NavigationMenu.Link href="/docs" active={pathname === "/docs"}>Overview</NavigationMenu.Link>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Link href="/docs/components" active={pathname === "/docs/components"}>Components</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>
</NavigationMenu.Root>
```

In a SvelteKit page or layout, derive `pathname` from the router state instead of keeping a separate value.

### Control the open item

The local `Root.value` prop is not bindable through the wrapper. Control it with `value` and `onValueChange`.

```svelte
<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu";

	let openItem = $state("");
</script>

<NavigationMenu.Root value={openItem} onValueChange={(value) => (openItem = value)}>
	<NavigationMenu.List>
		<NavigationMenu.Item value="products">
			<NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<NavigationMenu.Link href="/products/new">New products</NavigationMenu.Link>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>
</NavigationMenu.Root>
```

An empty string means no item is open. Although Bits UI's primitive value is bindable, `bind:value` is not accepted by this local wrapper.

### Open only on activation

```svelte
<NavigationMenu.Item value="company" openOnHover={false}>
	<NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
	<NavigationMenu.Content>
		<NavigationMenu.Link href="/about">About us</NavigationMenu.Link>
	</NavigationMenu.Content>
</NavigationMenu.Item>
```

With `openOnHover={false}`, pointer movement outside the panel does not close it. The user closes it by selecting a link, interacting outside, toggling the trigger, or pressing Escape.

### Render content without the shared viewport

```svelte
<NavigationMenu.Root viewport={false}>
	<NavigationMenu.List>
		<NavigationMenu.Item value="account">
			<NavigationMenu.Trigger>Account</NavigationMenu.Trigger>
			<NavigationMenu.Content class="w-64">
				<NavigationMenu.Link href="/profile">Profile</NavigationMenu.Link>
				<NavigationMenu.Link href="/security">Security</NavigationMenu.Link>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>
</NavigationMenu.Root>
```

Without the viewport, each `Content` is positioned below its own item and uses the local popover, ring, shadow, and open/close animation styles.

### Delegate a link to custom anchor markup

```svelte
<NavigationMenu.Link active>
	{#snippet child({ props })}
		<a {...props} href="/dashboard" data-sveltekit-preload-data="hover">
			<span class="font-medium">Dashboard</span>
		</a>
	{/snippet}
</NavigationMenu.Link>
```

Spread `props` onto the actual anchor so Bits UI keeps its focus, active-page, and selection behavior.

## Public API

The tables describe the local xvelte API and the most important inherited behavior. The component's `index.ts` and exported types are the source of truth. See the [Bits UI Navigation Menu API reference](https://www.bits-ui.com/docs/components/navigation-menu#api-reference) for the complete primitive API.

### Root

| Prop                | Type/default                                         | Behavior                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `viewport`          | `boolean`, default `true`                            | xvelte prop. Automatically appends the local `Viewport` after the supplied children.                                                                                                      |
| `value`             | `string`, default `""` in Bits UI                    | Identifies the currently open `Item`. It can be controlled, but is not bindable through the local wrapper.                                                                                |
| `onValueChange`     | `(value: string) => void`                            | Called when the active item changes; receives `""` when the menu closes.                                                                                                                  |
| `delayDuration`     | `number`, default `200`                              | Delay in milliseconds before pointer hover opens an item.                                                                                                                                 |
| `skipDelayDuration` | `number`, default `300`                              | Time in milliseconds during which moving to another trigger skips the opening delay.                                                                                                      |
| `orientation`       | `"horizontal" \| "vertical"`, default `"horizontal"` | Changes primitive keyboard orientation. Local layout classes are designed for a horizontal menu; override Root, List, Content, and Viewport positioning for a vertical design.            |
| `dir`               | `"ltr" \| "rtl"`, default `"ltr"`                    | Reading direction used by keyboard and motion logic.                                                                                                                                      |
| `ref`               | bindable element reference                           | References the rendered navigation element.                                                                                                                                               |
| `class`             | string-like class value                              | Merged onto the primitive root.                                                                                                                                                           |
| `children`          | `Snippet`                                            | Menu content rendered before the automatic viewport.                                                                                                                                      |
| `child`             | delegated-element snippet                            | Replaces the primitive root element. It also bypasses xvelte's default children block and automatic viewport, so the custom snippet must render the full menu and any desired `Viewport`. |

By default, Bits UI renders Root as `<nav aria-label="main">`. Pass a more specific `aria-label` when appropriate, especially when the page contains more than one navigation landmark.

### List and Item

| Component | Local and important inherited API                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `List`    | Renders a wrapper `div` around a `ul`. Supports bindable `ref`, `class`, normal list attributes, and `children`. Its advanced `child({ props, wrapperProps })` snippet must spread `wrapperProps` on the positioning wrapper and `props` on the list element. |
| `Item`    | Renders an `li`. `value?: string` identifies expandable items; `openOnHover?: boolean` defaults to `true`. Also supports bindable `ref`, `class`, `children`, `child`, and normal list-item attributes.                                                       |

### Trigger and Content

| Component | Local and important inherited API                                                                                                                                                                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Trigger` | Button that controls its sibling `Content`. Supports `disabled`, bindable `ref`, `class`, normal button attributes, and `children`. xvelte always appends a decorative down chevron to the default trigger. Using primitive `child` delegation bypasses the default label and chevron, so the custom snippet must render the complete trigger.                       |
| `Content` | Panel belonging to its enclosing `Item`. Supports bindable `ref`, `class`, `children`, `child`, `forceMount` (default `false`), `onInteractOutside`, `onFocusOutside`, `onEscapeKeydown`, `interactOutsideBehavior`, `escapeKeydownBehavior`, and normal div attributes. Content is moved into the active `Viewport` when one exists; otherwise it renders in place. |

The outside-interaction and Escape behavior options accept `"close"`, `"ignore"`, `"defer-otherwise-close"`, or `"defer-otherwise-ignore"`; both default to `"close"`.

### Link

| Prop                         | Type/default               | Behavior                                                                                                          |
| ---------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `href` and anchor attributes | native anchor API          | The default element is an anchor, so normal link attributes are forwarded.                                        |
| `active`                     | `boolean`, default `false` | Adds active state and `aria-current="page"`.                                                                      |
| `onSelect`                   | `(event: Event) => void`   | Runs when the link is selected. Calling `event.preventDefault()` prevents the Navigation Menu selection behavior. |
| `ref`                        | bindable anchor reference  | References the rendered anchor or delegated element.                                                              |
| `class`                      | string-like class value    | Merged with the local link styles.                                                                                |
| `children`                   | `Snippet`                  | Default link content.                                                                                             |
| `child`                      | `Snippet<[{ props }]>`     | Delegates rendering to custom markup; spread `props` onto the actual interactive link.                            |

### Viewport and Indicator

| Component   | Local and important inherited API                                                                                                                                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Viewport`  | Animated container for the active `Content`. Supports `forceMount` (default `false`), bindable `ref`, `class`, `children`, `child`, and normal div attributes. The supplied `class` and attributes target the inner primitive; xvelte always retains an uncustomizable outer positioning `div`.                                        |
| `Indicator` | Optional marker positioned beneath the active trigger. Supports `forceMount` (default `false`), bindable `ref`, `class`, `child`, and normal div attributes. Its default presentation is a fixed rotated square; normal supplied children are replaced by that marker. A delegated `child` must provide the complete custom indicator. |

All local component classes are merged with `cn()`, so a supplied `class` can extend or override compatible Tailwind utilities.

## Styling and DOM contract

Stable xvelte hooks:

| Component   | Stable hook                                                      |
| ----------- | ---------------------------------------------------------------- |
| `Root`      | `data-slot="navigation-menu"`, `data-viewport="true" \| "false"` |
| `List`      | `data-slot="navigation-menu-list"` on the inner `ul`             |
| `Item`      | `data-slot="navigation-menu-item"`                               |
| `Trigger`   | `data-slot="navigation-menu-trigger"`                            |
| `Content`   | `data-slot="navigation-menu-content"`                            |
| `Link`      | `data-slot="navigation-menu-link"`                               |
| `Viewport`  | `data-slot="navigation-menu-viewport"` on the inner viewport     |
| `Indicator` | `data-slot="navigation-menu-indicator"`                          |

Bits UI owns these relevant state hooks:

- Trigger and Content: `data-state="open" | "closed"`; Trigger also exposes `data-disabled`.
- Content: `data-motion="from-start" | "from-end" | "to-start" | "to-end"` while moving between panels.
- Link: `data-active` and `data-focused`.
- Viewport: `data-state`, `data-orientation`, `data-starting-style`, and `data-ending-style`.
- Indicator: `data-state="visible" | "hidden"`, `data-orientation`, and transition attributes.

The active Viewport publishes `--bits-navigation-menu-viewport-width` and `--bits-navigation-menu-viewport-height`. The local viewport adds `1rem` to both measured dimensions so its `p-1` content padding fits inside.

The component uses `popover`, `popover-foreground`, `foreground`, `muted`, `border`, and `ring` semantic colors plus the shared radius scale. `tw-animate-css` supplies fade, zoom, and directional slide animations.

Trigger and Link receive their three-pixel, 50%-opacity semantic `ring` halo from the required global `*:focus-visible` rule. Content does not cancel that treatment for nested links.

The local layout is optimized for a horizontal navigation bar. `orientation="vertical"` changes Bits UI behavior but does not rewrite the fixed flex row, `top-full`, responsive absolute positioning, or viewport wrapper classes.

## Accessibility

Bits UI provides the navigation landmark, list semantics, button and anchor semantics, expanded and controls relationships, roving focus between top-level items, focus movement into and out of panels, Escape handling, and direction-aware arrow-key behavior.

Application responsibilities:

- Give the `nav` a meaningful, unique accessible name when multiple navigation landmarks exist.
- Use real destinations through `Link.href` or delegated anchors. Do not replace navigation links with buttons.
- Set `active` only on the current page so `aria-current="page"` remains accurate.
- Keep trigger names concise and make every content panel understandable from its trigger.
- Preserve `props` on delegated interactive elements; omitting them removes keyboard, focus, state, and ARIA behavior.
- Do not hide essential destinations behind hover alone. Triggers remain operable by keyboard and activation.
- Use `disabled` sparingly on triggers because unavailable navigation can be difficult to understand.

The fixed trigger chevron is marked `aria-hidden="true"`; it does not replace the visible trigger label.

## Localization

Navigation Menu contains no built-in human-readable copy and requires no entries in `messages/en.json`. The application supplies and translates trigger labels, link text, descriptions, and the Root accessible name.

Use `Root.dir` for `"ltr"` or `"rtl"` behavior when direction is not inherited correctly from the surrounding application.

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

Import Tailwind and the animation utilities, define the state variants used by the local classes, and provide the semantic variables below. These values match xvelte's default theme and may be replaced with your own palette.

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--radius: 0.45rem;
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-muted: var(--muted);
	--color-border: var(--border);
	--color-ring: var(--ring);
}

@custom-variant data-open {
	&:where([data-state="open"]),
	&:where([data-open]:not([data-open="false"])) {
		@slot;
	}
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}

@custom-variant data-closed {
	&:where([data-state="closed"]),
	&:where([data-closed]:not([data-closed="false"])) {
		@slot;
	}
}

@custom-variant data-active {
	&:where([data-state="active"]),
	&:where([data-active]:not([data-active="false"])) {
		@slot;
	}
}
```

No additional Navigation Menu keyframes or shared stylesheet files are required.

### Icons

Add the semantic trigger icon export to `$lib/icons.ts`:

```ts
export { default as ChevronDownIcon } from "@tabler/icons-svelte/icons/chevron-down";
```

The backing package is `@tabler/icons-svelte`, included in the installation commands above.

### Utilities

Navigation Menu imports `cn` from `$lib/utils`. Copy this definition:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

`clsx` and `tailwind-merge` are included in the installation commands above.

### Other project files

- Copy the complete `src/lib/components/ui/navigation-menu` component folder, including its `index.ts` and all Svelte files listed below.
- No other xvelte UI component is required.
- No xvelte hook, attachment, context module, shared style file, or localization message is required.
- Navigation Menu does not depend on application route code.

## Credits

The local component is adapted from [shadcn-svelte's Navigation Menu](https://www.shadcn-svelte.com/docs/components/navigation-menu). Interaction primitives and their runtime API are provided by Bits UI and are listed under Dependencies.

## File organization

| File                               | Responsibility                                             |
| ---------------------------------- | ---------------------------------------------------------- |
| `index.ts`                         | Public component and type exports.                         |
| `navigation-menu-root.svelte`      | Navigation landmark, shared state, and automatic viewport. |
| `navigation-menu-list.svelte`      | Positioned list of navigation items.                       |
| `navigation-menu-item.svelte`      | Direct-link or expandable list item.                       |
| `navigation-menu-trigger.svelte`   | Expandable-item trigger and chevron.                       |
| `navigation-menu-content.svelte`   | Link panel and motion styles.                              |
| `navigation-menu-link.svelte`      | Navigation anchor and active-page state.                   |
| `navigation-menu-viewport.svelte`  | Shared animated content viewport and positioning wrapper.  |
| `navigation-menu-indicator.svelte` | Optional active-trigger marker.                            |
| `README.md`                        | Installation and usage guide.                              |

The component's `index.ts` and its exported prop types are the source of truth for the public API.

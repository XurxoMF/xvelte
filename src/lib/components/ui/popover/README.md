# Popover

An accessible floating panel opened from a trigger. It supports controlled state, click or optional hover activation, collision-aware placement, automatic portalling, focus management, outside-interaction dismissal, a close control, and local helpers for headers, titles, and descriptions.

Use Popover for compact interactive content such as filters, settings, forms, or contextual actions that should remain anchored to another control. Use Tooltip for short non-interactive hints, Hover Card for supplementary previews, and Dialog when the task needs stronger interruption, more space, or a clearly modal workflow.

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

Import all public parts through the component's `index.ts`:

```svelte
<script lang="ts">
	import * as Popover from "$lib/components/ui/popover";
</script>
```

The component exports `Root`, `Trigger`, `Content`, `Close`, `Portal`, `Header`, `Title`, and `Description`, together with their corresponding `RootProps`, `TriggerProps`, `ContentProps`, `CloseProps`, `PortalProps`, `HeaderProps`, `TitleProps`, and `DescriptionProps` types.

The local component does not export the Bits UI `Arrow`, `Overlay`, `ContentStatic`, or custom anchor parts. `Content` still accepts the primitive's `customAnchor` prop.

---

## Anatomy

Place Trigger and Content inside Root. Header, Title, Description, and Close are optional:

```svelte
<Popover.Root>
	<Popover.Trigger>Open settings</Popover.Trigger>

	<Popover.Content aria-labelledby="settings-popover-title">
		<Popover.Header>
			<Popover.Title id="settings-popover-title">Settings</Popover.Title>
			<Popover.Description>Change the options for this item.</Popover.Description>
		</Popover.Header>

		<!-- Interactive content -->
		<Popover.Close>Done</Popover.Close>
	</Popover.Content>
</Popover.Root>
```

Content automatically wraps the Bits UI floating panel in the local Portal, which defaults to `document.body`. Do not wrap Content in another `Popover.Portal`; configure its built-in portal through `portalProps`.

Trigger and Close render buttons by default. Header, Title, and Description are styled `div` elements. They organize content visually but do not automatically connect IDs, create a heading, or add ARIA labelling relationships.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Popover from "$lib/components/ui/popover";
</script>

<Popover.Root>
	<Popover.Trigger>Change dimensions</Popover.Trigger>

	<Popover.Content aria-labelledby="dimensions-title" class="w-80">
		<Popover.Header>
			<Popover.Title id="dimensions-title">Dimensions</Popover.Title>
			<Popover.Description>Set the width and height for the selected layer.</Popover.Description>
		</Popover.Header>

		<label class="grid gap-1">
			<span>Width</span>
			<input class="rounded-lg border px-2 py-1" name="width" value="100%" />
		</label>

		<label class="grid gap-1">
			<span>Height</span>
			<input class="rounded-lg border px-2 py-1" name="height" value="320px" />
		</label>

		<Popover.Close>Apply</Popover.Close>
	</Popover.Content>
</Popover.Root>
```

The trigger is intentionally visually unstyled so it can be styled directly or replaced through its `child` snippet. Content defaults to a centered alignment, a `4px` side offset, and a width of `18rem` (`w-72`).

---

## Examples

### Controlled open state

Bind `open` when app code needs to inspect or change visibility:

```svelte
<script lang="ts">
	import * as Popover from "$lib/components/ui/popover";

	let open = $state(false);
</script>

<button type="button" onclick={() => (open = true)}>Open notification settings</button>

<Popover.Root bind:open>
	<Popover.Trigger>Toggle notification settings</Popover.Trigger>
	<Popover.Content>
		<Popover.Title>Notifications</Popover.Title>
		<p>Choose which updates should be sent to you.</p>
		<Popover.Close>Close</Popover.Close>
	</Popover.Content>
</Popover.Root>

<p aria-live="polite">{open ? "Settings open" : "Settings closed"}</p>
```

`onOpenChange` runs when the state changes. `onOpenChangeComplete` runs after Bits UI reports that the opening or closing presence lifecycle has completed.

### Placement and collision handling

Content accepts the installed Bits UI floating-position options:

```svelte
<Popover.Root>
	<Popover.Trigger>Open actions</Popover.Trigger>

	<Popover.Content side="right" align="start" sideOffset={8} collisionPadding={16}>
		<Popover.Title>Item actions</Popover.Title>
		<button type="button">Duplicate</button>
		<button type="button">Archive</button>
	</Popover.Content>
</Popover.Root>
```

`side` is a preference rather than a guarantee when collision avoidance is enabled. Bits UI may place Content on another side or alignment near a viewport boundary, and the directional animation follows the final `data-side`.

### Custom portal target

Pass Portal options through Content's local `portalProps` prop:

```svelte
<div id="popover-layer"></div>

<Popover.Root>
	<Popover.Trigger>Open help</Popover.Trigger>
	<Popover.Content portalProps={{ to: "#popover-layer" }}>
		<Popover.Title>Keyboard shortcuts</Popover.Title>
		<p>Press Command or Control and K to open search.</p>
	</Popover.Content>
</Popover.Root>
```

Use `portalProps={{ disabled: true }}` to keep Content in its original DOM location. Inline rendering can be useful inside an isolated container, but ancestor overflow, stacking contexts, and transforms may then clip or change the floating panel.

### Delegated trigger

Use the inherited `child` snippet to apply Trigger behavior to another element. Spread every supplied prop:

```svelte
<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<button class="rounded-lg border px-3 py-2" type="button" {...props}>Open display options</button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content>
		<Popover.Title>Display options</Popover.Title>
		<label><input type="checkbox" /> Show grid</label>
	</Popover.Content>
</Popover.Root>
```

The delegated element must receive every supplied property so IDs, ARIA state, keyboard behavior, pointer behavior, and element references remain connected.

### Open on hover

Trigger can inherit Bits UI's optional hover behavior:

```svelte
<Popover.Root>
	<Popover.Trigger openOnHover openDelay={400} closeDelay={200}>Open details</Popover.Trigger>
	<Popover.Content>
		<Popover.Title>Details</Popover.Title>
		<p>Hovering opens this panel after a short delay.</p>
	</Popover.Content>
</Popover.Root>
```

Touch input ignores hover activation. Keyboard users can still press Enter or Space. Clicking a hover-opened trigger converts the panel to click-opened behavior, while interacting with Content keeps it open until it is explicitly dismissed.

### Custom anchor

Content normally uses Trigger as its anchor. Supply an element or selector through `customAnchor` when the visual anchor is different:

```svelte
<script lang="ts">
	import * as Popover from "$lib/components/ui/popover";

	let anchor = $state<HTMLElement | null>(null);
</script>

<div bind:this={anchor} class="h-2 w-24 bg-muted-foreground"></div>

<Popover.Root>
	<Popover.Trigger>Explain marker</Popover.Trigger>
	<Popover.Content customAnchor={anchor}>
		<p>The panel is positioned relative to the separate marker.</p>
	</Popover.Content>
</Popover.Root>
```

Trigger continues to own open state and keyboard activation. `customAnchor` changes positioning and outside-interaction handling; it does not become another trigger.

---

## Public API

Popover wraps the installed stable Bits UI Popover primitive. The tables summarize the local behavior and important inherited options; use the [Bits UI Popover API](https://bits-ui.com/docs/components/popover#api-reference) for the complete primitive API. The component's `index.ts` and exported types remain the source of truth.

### `Popover.Root`

Type: `RootProps`, equal to `PopoverPrimitive.RootProps`.

| Prop                   | Type                      | Default | Behavior                                                                                |
| ---------------------- | ------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `open`                 | `boolean`                 | `false` | Bindable open state.                                                                    |
| `onOpenChange`         | `(open: boolean) => void` | —       | Runs whenever Bits UI changes `open`.                                                   |
| `onOpenChangeComplete` | `(open: boolean) => void` | —       | Runs after the dependency reports that the open or close animation lifecycle completed. |
| `children`             | `Snippet`                 | —       | Renders Trigger and Content inside the shared Popover state.                            |

The local wrapper makes `open` bindable and forwards the remaining Root props.

### `Popover.Trigger`

Type: `TriggerProps`, equal to `PopoverPrimitive.TriggerProps`.

| Prop          | Type                        | Default | Behavior                                                                               |
| ------------- | --------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `openOnHover` | `boolean`                   | `false` | Adds delayed non-touch hover activation while retaining click and keyboard activation. |
| `openDelay`   | `number`                    | `700`   | Milliseconds before opening through hover.                                             |
| `closeDelay`  | `number`                    | `300`   | Milliseconds before closing after leaving the hover area.                              |
| `disabled`    | `boolean`                   | `false` | Disables the default trigger button and prevents activation.                           |
| `children`    | `Snippet`                   | —       | Renders inside the default button.                                                     |
| `child`       | `Snippet<[{ props }]>`      | —       | Replaces the default button; spread every supplied prop on the delegated element.      |
| `ref`         | `HTMLButtonElement \| null` | `null`  | Bindable default trigger reference; delegated-element typing follows the primitive.    |
| `class`       | `string`                    | —       | Passed through `cn()` without visual base classes, then forwarded to the primitive.    |

Trigger forwards supported native button attributes and handlers. The primitive defaults its button `type` to `"button"` and provides the open state, ARIA relationships, pointer behavior, and Enter/Space handling.

### `Popover.Content`

Type: `ContentProps`, extending `PopoverPrimitive.ContentProps` with local portal configuration.

| Prop                | Type                                          | Default         | Behavior                                                                                        |
| ------------------- | --------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `portalProps`       | `WithoutChildrenOrChild<Popover.PortalProps>` | —               | Configures the automatic local Portal without replacing its children.                           |
| `sideOffset`        | `number`                                      | `4`             | Local distance in pixels between Content and its anchor.                                        |
| `align`             | `"start" \| "center" \| "end"`                | `"center"`      | Local preferred alignment against the selected side.                                            |
| `side`              | Floating side                                 | Bits UI default | Preferred placement side; collision handling may change the rendered side.                      |
| `trapFocus`         | `boolean`                                     | `true`          | Traps focus for click/keyboard-opened interactive content. Hover-only opening delays this trap. |
| `preventScroll`     | `boolean`                                     | `false`         | Prevents document scrolling while open when enabled.                                            |
| `forceMount`        | `boolean`                                     | `false`         | Keeps the primitive mounted for custom presence or transitions.                                 |
| `customAnchor`      | `HTMLElement \| string \| null`               | `null`          | Positions Content against another element instead of Trigger.                                   |
| `onOpenAutoFocus`   | `(event: Event) => void`                      | —               | Can prevent or replace the default focus performed on open.                                     |
| `onCloseAutoFocus`  | `(event: Event) => void`                      | —               | Can prevent or replace focus restoration on close.                                              |
| `onEscapeKeydown`   | `(event: KeyboardEvent) => void`              | —               | Can prevent Escape from closing Content.                                                        |
| `onInteractOutside` | `(event: PointerEvent) => void`               | —               | Can prevent an outside pointer interaction from closing Content.                                |
| `children`          | `Snippet`                                     | —               | Renders the panel contents.                                                                     |
| `child`             | Floating content snippet                      | —               | Replaces primitive content rendering; preserve both supplied content and wrapper props.         |
| `ref`               | `HTMLDivElement \| null`                      | `null`          | Bindable floating content element reference.                                                    |
| `class`             | `string`                                      | —               | Merged after local panel, typography, shadow, and animation classes.                            |

Content forwards the remaining positioning, collision, dismissal, focus, direction, style, native `div`, and floating-layer options supported by the installed primitive. The local `class` targets the actual floating content element, while Bits UI also creates a positioning wrapper.

### `Popover.Close`

Type: `CloseProps`, equal to `PopoverPrimitive.CloseProps`.

| Prop       | Type                        | Default | Behavior                                                                         |
| ---------- | --------------------------- | ------- | -------------------------------------------------------------------------------- |
| `children` | `Snippet`                   | —       | Renders inside the default close button.                                         |
| `child`    | `Snippet<[{ props }]>`      | —       | Replaces the default button; spread the supplied props on the delegated element. |
| `ref`      | `HTMLButtonElement \| null` | `null`  | Bindable default close-button reference.                                         |

Close forwards native button attributes and handlers, defaults to `type="button"`, and closes the nearest Popover when clicked or activated with Enter or Space. It has no local visual classes.

### `Popover.Portal`

Type: `PortalProps`, equal to `PopoverPrimitive.PortalProps`.

| Prop       | Type                | Default         | Behavior                                                      |
| ---------- | ------------------- | --------------- | ------------------------------------------------------------- |
| `to`       | `Element \| string` | `document.body` | Portal target element or selector.                            |
| `disabled` | `boolean`           | `false`         | Renders children in their original DOM location when enabled. |
| `children` | `Snippet`           | —               | Content to render at the selected target.                     |

Standard `Popover.Content` already uses Portal. The public Portal is available for advanced composition, but wrapping Content in another Portal creates unnecessary nested portalling.

### `Popover.Header`, `Popover.Title`, and `Popover.Description`

These are local styled `div` helpers based on native `HTMLAttributes<HTMLDivElement>` plus `WithElementRef`.

| Part          | Local classes                        | Other behavior                                               |
| ------------- | ------------------------------------ | ------------------------------------------------------------ |
| `Header`      | Vertical flex layout, `0.125rem` gap | Groups title and description visually.                       |
| `Title`       | Medium font weight                   | Provides visual title styling; it is not a semantic heading. |
| `Description` | `text-muted-foreground`              | Provides secondary description styling.                      |

Each helper accepts `children`, a bindable `HTMLDivElement` `ref`, `class`, and remaining native `div` attributes. Classes are merged after local styles. Add IDs and connect them through `aria-labelledby` or `aria-describedby` on Content when the floating panel needs those relationships. Put a semantic heading element inside Title when the surrounding document structure requires one.

---

## Styling and DOM contract

Stable local hooks:

| Part          | Element                     | Stable hook                       |
| ------------- | --------------------------- | --------------------------------- |
| `Root`        | No element                  | —                                 |
| `Trigger`     | Button or delegated element | `data-slot="popover-trigger"`     |
| `Content`     | Floating `div`              | `data-slot="popover-content"`     |
| `Header`      | `div`                       | `data-slot="popover-header"`      |
| `Title`       | `div`                       | `data-slot="popover-title"`       |
| `Description` | `div`                       | `data-slot="popover-description"` |
| `Close`       | Button or delegated element | `data-slot="popover-close"`       |
| `Portal`      | No wrapper element          | —                                 |

Content uses a `w-72` flex column, `0.625rem` internal gap and padding, rounded semantic popover surface, foreground ring, shadow, and `z-50`. A supplied class can replace compatible Tailwind utilities through `cn()`.

Bits UI supplies dependency-owned trigger/content attributes including `data-state`, transition-state attributes, `data-side`, `data-align`, primitive IDs, ARIA relationships, and floating-position styles. The local `data-open:` and `data-closed:` variants recognize the primitive state for fade and zoom animations; `data-side` selects the directional slide animation.

The installed primitive exposes `--bits-popover-content-transform-origin`, `--bits-popover-content-available-width`, `--bits-popover-content-available-height`, `--bits-popover-anchor-width`, and `--bits-popover-anchor-height`. The local origin class currently reads `--transform-origin`, so its zoom uses the browser's default centered origin unless the app defines that alias or the component is adapted.

`Root` and `Portal` render no local DOM elements. Trigger and Close have no local appearance beyond their hooks. Preserve every stable `data-slot`; remaining attributes are forwarded last and can technically override these hooks.

---

## Accessibility

Bits UI provides the activation, expanded state, content relationship, focus management, dismissal, and pointer-outside behavior.

- Trigger renders a `type="button"` control by default and exposes `aria-haspopup`, `aria-expanded`, and `aria-controls` when applicable.
- Enter and Space toggle the default or correctly delegated Trigger.
- Click/keyboard-opened Content traps focus by default and initially focuses the first focusable descendant. Closing normally restores focus to Trigger.
- Escape and outside pointer interaction close Content unless the corresponding callback prevents the default behavior.
- Use Close for an explicit dismissal control when the panel contains a task or several focusable controls.
- Give Trigger a clear accessible name. Icon-only triggers require an `aria-label` or visible screen-reader text supplied by your app.
- Header, Title, and Description are visual helpers. Add semantic headings and explicit `aria-labelledby` or `aria-describedby` relationships where needed.
- Keep interactive content reasonably compact and preserve the primitive-supplied props when using `child` snippets.
- `openOnHover` supplements rather than replaces click and keyboard activation. Do not make essential functionality discoverable only by hovering.

Use Dialog instead when focus must be strongly isolated from the page, the workflow is complex, or the panel should behave as a modal interruption.

---

## Localization

Popover contains no built-in human-readable copy and uses no localization message. Your app supplies and translates Trigger text, titles, descriptions, field labels, actions, and accessible names.

Primitive state values, IDs, `data-*` values, side/alignment values, and CSS variables are implementation details and are not translated.

---

## Dependencies

### Packages

Install runtime dependencies first and development dependencies second:

```sh
# Bun
bun add bits-ui clsx tailwind-merge
bun add -D tailwindcss tw-animate-css

# npm
npm install bits-ui clsx tailwind-merge
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css
```

Implement against the stable Bits UI version installed by your project. See the [Bits UI Popover documentation](https://bits-ui.com/docs/components/popover) for the complete dependency-owned API and behavior.

### Component files

Copy the complete `src/lib/components/ui/popover` component folder:

- `popover-root.svelte`
- `popover-trigger.svelte`
- `popover-content.svelte`
- `popover-close.svelte`
- `popover-portal.svelte`
- `popover-header.svelte`
- `popover-title.svelte`
- `popover-description.svelte`
- `index.ts`
- `README.md`

Popover requires no other xvelte component, icon, hook, attachment, context module, localization message, shared style file, font, image, or external network service.

### Shared utilities

Popover imports `cn`, `WithElementRef`, and `WithoutChildrenOrChild` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

### Icons

Popover does not use icons and requires no export from `src/lib/icons.ts` or icon package.

### Global styles

Load Tailwind CSS and `tw-animate-css`, then expose the semantic values used by Content and Description. The values below are xvelte's defaults and may be replaced with your own theme:

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-muted-foreground: var(--muted-foreground);
	--radius-lg: var(--radius);
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
```

No Popover-specific keyframe, icon style, font, or app-owned CSS variable is required. `tw-animate-css` provides the enter, exit, fade, zoom, and slide utilities used by Content.

---

## Credits

Popover is adapted from the [shadcn-svelte Popover](https://www.shadcn-svelte.com/docs/components/popover). Its implementation has been modified to follow xvelte's local API, portal configuration, styling, type, and import conventions.

---

## File organization

| File                         | Responsibility                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `popover-root.svelte`        | Bindable open state and shared Bits UI Popover context.                                         |
| `popover-trigger.svelte`     | Public activation control, trigger hook, class forwarding, and render delegation.               |
| `popover-content.svelte`     | Automatic Portal, floating placement, local panel styles, animations, and portal configuration. |
| `popover-close.svelte`       | Public primitive-backed close control.                                                          |
| `popover-portal.svelte`      | Public portal target and inline-rendering wrapper.                                              |
| `popover-header.svelte`      | Local visual grouping for title and description.                                                |
| `popover-title.svelte`       | Local title typography helper.                                                                  |
| `popover-description.svelte` | Local secondary-description typography helper.                                                  |
| `index.ts`                   | Public components and exported props types.                                                     |
| `README.md`                  | Composition, examples, API, DOM contract, accessibility, dependencies, and credits.             |

The component's `index.ts` and exported types are the source of truth for the public API.

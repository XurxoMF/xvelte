# Tooltip

An accessible popup for brief supplementary information shown when a trigger receives keyboard focus or pointer hover. It supports shared providers, controlled state, delayed opening, portals, collision-aware positioning, a built-in arrow, custom arrow classes, and advanced singleton payloads through Bits UI.

Use Tooltip to explain unfamiliar icon controls or provide short optional context. Do not place essential instructions, validation, interactive workflows, or information available only to pointer users inside a tooltip.

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
	import * as Tooltip from "$lib/components/ui/tooltip";
</script>
```

`index.ts` exports `Provider`, `Root`, `Trigger`, `Content`, and `Portal`, together with a matching props type for every part. Root and Trigger types support the optional Bits UI payload generic.

## Anatomy

Mount Provider once around the application or tooltip region:

```svelte
<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>Trigger</Tooltip.Trigger>
		<Tooltip.Content>Supplementary information</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
```

Content creates Portal and Arrow internally. Do not add a second Portal or Arrow for normal use.

## Basic usage

In the root layout:

```svelte
<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip";

	let { children } = $props();
</script>

<Tooltip.Provider delayDuration={500}>
	{@render children()}
</Tooltip.Provider>
```

In a descendant component:

```svelte
<Tooltip.Root>
	<Tooltip.Trigger aria-label="Add to library">+</Tooltip.Trigger>
	<Tooltip.Content>Add to library</Tooltip.Content>
</Tooltip.Root>
```

The trigger remains independently named because tooltip content is supplemental and may not always be announced as its label.

## Examples

### Delegated trigger

```svelte
<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button {...props} type="button" class="rounded-md border px-3 py-2">Preview</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content side="bottom" sideOffset={6}>Open a read-only preview</Tooltip.Content>
</Tooltip.Root>
```

Spread every supplied prop to preserve focus, hover, IDs, and accessibility relationships.

### Controlled state

```svelte
<Tooltip.Root bind:open onOpenChange={(next) => console.info("Tooltip open", next)}>
	<Tooltip.Trigger>Keyboard shortcuts</Tooltip.Trigger>
	<Tooltip.Content>Press ? to open help</Tooltip.Content>
</Tooltip.Root>
```

### Custom arrow and portal

```svelte
<Tooltip.Root>
	<Tooltip.Trigger>Details</Tooltip.Trigger>
	<Tooltip.Content arrowClasses="bg-primary fill-primary" portalProps={{ disabled: true }}>Additional details</Tooltip.Content>
</Tooltip.Root>
```

Disabling Portal renders content inline; verify clipping and stacking contexts. Arrow uses the same side data as Content.

### Instant nested region

```svelte
<Tooltip.Provider delayDuration={0} skipDelayDuration={100}>
	<!-- Tooltips here use the closest Provider settings. -->
</Tooltip.Provider>
```

The local Provider defaults to zero delay when no value is supplied, overriding Bits UI's 700ms primitive default. Applications often set a deliberate global delay.

## Public API

Tooltip wraps the installed stable `bits-ui@2.18.1` primitive. The tables document local defaults/additions and important inherited behavior; see the complete [Bits UI Tooltip API](https://bits-ui.com/docs/components/tooltip#api-reference). The component's `index.ts`, exported types, and source are the source of truth.

### `Tooltip.Provider`

| Prop                         | Type      | Default     | Behavior                                                        |
| ---------------------------- | --------- | ----------- | --------------------------------------------------------------- |
| `delayDuration`              | `number`  | `0` locally | Delay before opening.                                           |
| `skipDelayDuration`          | `number`  | `300`       | Grace period for moving between triggers without another delay. |
| `disableHoverableContent`    | `boolean` | `false`     | Closes instead of keeping content open while hovered.           |
| `disableCloseOnTriggerClick` | `boolean` | `false`     | Keeps tooltip open when trigger is clicked.                     |
| `disabled`                   | `boolean` | `false`     | Disables descendant tooltips.                                   |
| `ignoreNonKeyboardFocus`     | `boolean` | `false`     | Ignores focus not initiated through keyboard navigation.        |
| `children`                   | `Snippet` | —           | Application or tooltip group.                                   |

Nested providers override the nearest group settings.

### `Tooltip.Root`

| Prop                   | Type                                               | Default  | Behavior                                             |
| ---------------------- | -------------------------------------------------- | -------- | ---------------------------------------------------- |
| `open`                 | `boolean`                                          | `false`  | Bindable visibility.                                 |
| `onOpenChange`         | `(open: boolean) => void`                          | —        | Runs as visibility changes.                          |
| `onOpenChangeComplete` | `(open: boolean) => void`                          | —        | Runs after transition completion.                    |
| Provider options       | Same relevant booleans/delay                       | Provider | Overrides settings for this tooltip.                 |
| `triggerId`            | `string \| null`                                   | —        | Controlled active trigger for singleton mode.        |
| `tether`               | Bits UI `TooltipTether<Payload>`                   | —        | Connects detached triggers and typed payloads.       |
| `children`             | Snippet, optionally `{ open, triggerId, payload }` | —        | Trigger and Content or advanced singleton rendering. |

Root renders no element.

### Trigger, Content, and Portal

| Part and type                 | Local/inherited API                                                                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Trigger` — `TriggerProps<T>` | Bits UI button with `disabled`, optional singleton `payload`/`tether`, children/child, native button attributes, bindable ref, and `data-slot="tooltip-trigger"`.                                                                      |
| `Content` — `ContentProps`    | Bits UI floating content plus local `arrowClasses` and `portalProps`; local defaults `side="top"`, `sideOffset=0`; accepts children, class, bindable ref, positioning/collision, force-mount, escape, and outside-interaction options. |
| `Portal` — `PortalProps`      | Bits UI target, disabled, and children props. Content normally configures it through `portalProps`.                                                                                                                                    |

Content always appends the local Arrow after caller children. Advanced primitive `child` delegation must retain the supplied floating props and be tested with that arrow composition.

## Styling and DOM contract

- Trigger: `data-slot="tooltip-trigger"`; otherwise unstyled.
- Content: `data-slot="tooltip-content"`; foreground background, background-colored text, maximum width, compact padding, rounded corners, side/open/closed animation, and `--bits-tooltip-content-transform-origin`.
- A descendant Kbd `Key` with `data-slot="kbd-key"` receives compact inset spacing and stacking adjustments for the tooltip surface.
- Arrow: internal delegated div with semantic foreground fill/background, border-free diamond shape, and dependency-owned `data-side`; `arrowClasses` merges last.

Bits UI owns open state, side, trigger/content IDs, and positioning variables. Content `class` and Arrow classes pass through `cn()`. Portal has no local hook.

## Accessibility

Bits UI connects Trigger and Content, opens for keyboard focus and hover, closes on escape/blur/pointer departure according to settings, and coordinates Provider behavior. The trigger must still communicate its primary action without relying solely on tooltip text.

Keep content brief and non-interactive. Tooltips are not a replacement for labels, descriptions that must always be available, or popovers containing buttons/links. Test hover, keyboard focus, touch, zoom, and reduced-motion behavior.

## Localization

Tooltip contains no built-in copy and requires no localization messages. The app supplies and translates tooltip content, trigger labels, shortcut names, and any accessible descriptions.

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui clsx tailwind-merge tw-animate-css
bun add -D tailwindcss

# npm
npm install bits-ui clsx tailwind-merge tw-animate-css
npm install -D tailwindcss

# pnpm
pnpm add bits-ui clsx tailwind-merge tw-animate-css
pnpm add -D tailwindcss
```

### Global styles and theme tokens

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
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

Values may be replaced by the app's theme. No component-specific keyframe, font, or global layout rule is required.

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
```

### Component files and other integration

```text
tooltip/
├── index.ts
├── tooltip-content.svelte
├── tooltip-portal.svelte
├── tooltip-provider.svelte
├── tooltip-root.svelte
└── tooltip-trigger.svelte
```

Tooltip needs no icon, other xvelte component, hook, attachment, local context file, localization setup, shared style, image, font, or network service. Bits UI owns internal Provider/Root context.

## Credits

The component structure, styling, and arrow treatment are adapted from [shadcn-svelte Tooltip](https://www.shadcn-svelte.com/docs/components/tooltip).

## File organization

| File                      | Responsibility                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `tooltip-provider.svelte` | Shared timing and interaction defaults, including local zero-delay default.        |
| `tooltip-root.svelte`     | Bindable state and per-tooltip primitive options/generics.                         |
| `tooltip-trigger.svelte`  | Primitive trigger, ref, payload/tether support, and slot.                          |
| `tooltip-content.svelte`  | Portal composition, floating content, animations, local arrow, and custom classes. |
| `tooltip-portal.svelte`   | Public Bits UI Portal wrapper.                                                     |
| `index.ts`                | Public parts and every exported props type.                                        |
| `README.md`               | Composition, examples, API, accessibility, styling, and installation guide.        |

The component's `index.ts` and exported types are the source of truth for the public API.

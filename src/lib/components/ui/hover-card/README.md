# Hover Card

A pointer-triggered preview for showing brief, supplementary information about a link or referenced item. It supports delayed opening and closing, controlled state, collision-aware floating placement, automatic portalling, and locally styled enter and exit animations.

Use Hover Card to preview a profile, document, product, or other destination before a sighted pointer user follows its link. Do not place essential information or required actions inside it: touch interaction does not open the preview, and keyboard users cannot move focus into its content. Use Popover, Dialog, or another explicitly activated component when people must interact with the floating content.

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

Import all public parts through the component's `index.ts`:

```svelte
<script lang="ts">
	import * as HoverCard from "$lib/components/ui/hover-card";
</script>
```

`index.ts` exports `Root`, `Trigger`, `Content`, and `Portal`, together with their `RootProps`, `TriggerProps`, `ContentProps`, and `PortalProps` types.

## Anatomy

Place Trigger and Content inside Root:

```svelte
<HoverCard.Root>
	<HoverCard.Trigger href="/people/ada">Ada Lovelace</HoverCard.Trigger>
	<HoverCard.Content>
		<p>Mathematician and early computing pioneer.</p>
	</HoverCard.Content>
</HoverCard.Root>
```

Trigger renders an anchor by default. Content renders a floating `div` and automatically wraps itself in the local Portal, which defaults to `document.body`. Do not add a second Portal around Content; configure the built-in portal through `portalProps` instead.

The component does not export Bits UI's `Arrow` or `ContentStatic` parts. The documented local composition is Root, Trigger, and Content. Portal is public for advanced portal composition but is not required around the standard Content.

## Basic usage

Keep the complete destination and all essential information available without opening the preview:

```svelte
<script lang="ts">
	import * as HoverCard from "$lib/components/ui/hover-card";
</script>

<p>
	Project maintained by
	<HoverCard.Root>
		<HoverCard.Trigger href="/team/maya" class="rounded-sm font-medium underline underline-offset-4">Maya Chen</HoverCard.Trigger>

		<HoverCard.Content class="w-80">
			<div class="space-y-1">
				<p class="font-semibold">Maya Chen</p>
				<p class="text-sm">Design systems engineer working on accessible interface foundations.</p>
			</div>
		</HoverCard.Content>
	</HoverCard.Root>.
</p>
```

Hovering the trigger with a non-touch pointer opens the card after `700ms` by default. Moving from Trigger to Content keeps it open, and leaving the preview area closes it after `300ms`. Keyboard focus can open the preview in the installed Bits UI version, but focus remains on the trigger and Content is not an interactive keyboard destination.

## Examples

### Controlled open state

Bind `open` when the app needs to observe or control visibility:

```svelte
<script lang="ts">
	import * as HoverCard from "$lib/components/ui/hover-card";

	let open = $state(false);
</script>

<HoverCard.Root bind:open openDelay={300} closeDelay={150}>
	<HoverCard.Trigger href="/projects/atlas">Project Atlas</HoverCard.Trigger>
	<HoverCard.Content>
		<p class="font-medium">Project Atlas</p>
		<p class="text-muted-foreground">Updated two hours ago</p>
	</HoverCard.Content>
</HoverCard.Root>

<p aria-live="polite">{open ? "Preview visible" : "Preview hidden"}</p>
```

`onOpenChange` runs whenever Bits UI changes the state. `onOpenChangeComplete` runs after the opening or closing presence lifecycle completes. Binding and callbacks may be used together.

### Placement and collision handling

Content defaults to the dependency's top side, local centered alignment, and a local `4px` side offset:

```svelte
<HoverCard.Root>
	<HoverCard.Trigger href="/docs/deployment">Deployment guide</HoverCard.Trigger>
	<HoverCard.Content side="right" align="start" sideOffset={8} collisionPadding={16} class="w-96">
		<p class="font-medium">Deployment guide</p>
		<p>Requirements and release steps for production environments.</p>
	</HoverCard.Content>
</HoverCard.Root>
```

With collision avoidance enabled, the rendered `data-side` and `data-align` may differ from the preferred props near a viewport boundary. The directional slide animation follows the final placed side.

### Custom portal target

Pass Portal options through Content's `portalProps`:

```svelte
<div id="preview-layer"></div>

<HoverCard.Root>
	<HoverCard.Trigger href="/reports/quarterly">Quarterly report</HoverCard.Trigger>
	<HoverCard.Content portalProps={{ to: "#preview-layer" }}>
		<p>Revenue and retention summary for the current quarter.</p>
	</HoverCard.Content>
</HoverCard.Root>
```

Use `portalProps={{ disabled: true }}` to render Content at its original DOM location. Positioning remains managed by Bits UI, but local overflow, stacking contexts, and transformed ancestors can then affect clipping and placement.

### Disabled preview

Disable opening without disabling the destination link:

```svelte
<HoverCard.Root disabled>
	<HoverCard.Trigger href="/people/temporary-profile">Temporary profile</HoverCard.Trigger>
	<HoverCard.Content>This preview is unavailable.</HoverCard.Content>
</HoverCard.Root>
```

`disabled` prevents the preview from opening; it does not add `aria-disabled`, prevent navigation, or disable the rendered anchor. If the destination itself is unavailable, communicate and implement that state separately.

### Delegated trigger element

Trigger accepts Bits UI's `child` snippet when an anchor is not appropriate. Spread every supplied prop so pointer, focus, ID, state, and ARIA behavior reach the rendered element:

```svelte
<script lang="ts">
	import * as HoverCard from "$lib/components/ui/hover-card";
</script>

<HoverCard.Root>
	<HoverCard.Trigger>
		{#snippet child({ props })}
			<button type="button" {...props}>Preview release notes</button>
		{/snippet}
	</HoverCard.Trigger>

	<HoverCard.Content>
		<p>Highlights from the latest release.</p>
	</HoverCard.Content>
</HoverCard.Root>
```

A button trigger does not make Content keyboard-interactive. Use Popover when the trigger must open content containing links, buttons, forms, or other controls.

## Public API

Hover Card wraps the installed stable Bits UI `LinkPreview` primitive. The tables summarize every local adaptation and the inherited options most relevant to ordinary use; see the [Bits UI Link Preview API](https://bits-ui.com/docs/components/link-preview) for the complete primitive API. Hover Card's `index.ts`, exported types, and local source are the source of truth.

### `HoverCard.Root`

Type: `RootProps`, equal to Bits UI's `LinkPreview.RootProps`.

| Prop                     | Type                      | Default     | Behavior                                                                                                       |
| ------------------------ | ------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `open`                   | `boolean`                 | `false`     | Bindable open state.                                                                                           |
| `onOpenChange`           | `(open: boolean) => void` | `undefined` | Runs when the open state changes.                                                                              |
| `onOpenChangeComplete`   | `(open: boolean) => void` | `undefined` | Runs when the dependency reports that the opening or closing presence lifecycle has completed.                 |
| `openDelay`              | `number`                  | `700`       | Delay in milliseconds before a supported hover or keyboard-focus interaction opens the preview.                |
| `closeDelay`             | `number`                  | `300`       | Delay in milliseconds before leaving or blurring closes the preview.                                           |
| `disabled`               | `boolean`                 | `false`     | Prevents the preview from opening without disabling Trigger's native element.                                  |
| `ignoreNonKeyboardFocus` | `boolean`                 | `false`     | Declared by the installed primitive type; the installed `bits-ui@2.18.1` Root implementation does not read it. |
| `children`               | `Snippet`                 | `undefined` | Renders Trigger and Content inside the shared state and positioning context.                                   |

The local wrapper makes `open` bindable and forwards every other Root prop. Delay values are not validated locally. Treat finite non-negative millisecond values as the supported input.

`ignoreNonKeyboardFocus` is present in the installed exported type but has no runtime effect in the installed implementation. Do not depend on it unless Bits UI is upgraded and its local behavior is re-verified.

### `HoverCard.Trigger`

Type: `TriggerProps`, equal to Bits UI's `LinkPreview.TriggerProps`.

| Prop       | Type                   | Default     | Behavior                                                                                                     |
| ---------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `href`     | `string`               | `undefined` | Native destination when Trigger renders its default anchor.                                                  |
| `ref`      | `HTMLElement \| null`  | `null`      | Bindable trigger reference; the default rendered element is an anchor.                                       |
| `children` | `Snippet`              | `undefined` | Renders content inside the default anchor.                                                                   |
| `child`    | `Snippet<[{ props }]>` | `undefined` | Replaces the anchor; the snippet must spread all supplied primitive props onto exactly one suitable element. |
| `class`    | `string`               | `undefined` | Forwarded to the primitive without local class merging or styling.                                           |

Native anchor attributes such as `target`, `rel`, `download`, `aria-*`, and event handlers are forwarded. Bits UI composes its internal pointer and focus behavior through the primitive prop merger.

The local wrapper writes `data-slot="hover-card-trigger"` before forwarding props. Avoid passing a conflicting `data-slot`, because the forwarded value can replace the stable local hook.

### `HoverCard.Content`

Type: `ContentProps`, extending Bits UI's `LinkPreview.ContentProps` with the local `portalProps` option.

| Prop                | Type                                     | Default     | Behavior                                                                                                     |
| ------------------- | ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `align`             | `"start" \| "center" \| "end"`           | `"center"`  | Preferred alignment relative to the anchor; collision handling may change the rendered alignment.            |
| `side`              | `"top" \| "right" \| "bottom" \| "left"` | `"top"`     | Preferred side from the installed primitive; collision handling may flip it.                                 |
| `sideOffset`        | `number`                                 | `4`         | Local distance in pixels between anchor and Content. Bits UI's unwrapped default is `0`.                     |
| `alignOffset`       | `number`                                 | `0`         | Offset in pixels from a start or end alignment.                                                              |
| `avoidCollisions`   | `boolean`                                | `true`      | Allows positioning middleware to change placement to avoid boundaries.                                       |
| `collisionBoundary` | element or element array                 | `undefined` | Custom boundary or boundaries used for overflow detection.                                                   |
| `collisionPadding`  | `number` or side map                     | `0`         | Installed primitive padding around the collision boundary.                                                   |
| `sticky`            | `"partial" \| "always"`                  | `"partial"` | Controls whether alignment may shift while avoiding collisions.                                              |
| `hideWhenDetached`  | `boolean`                                | `false`     | Hides Content when its anchor is fully clipped or detached.                                                  |
| `customAnchor`      | selector, element, measurable, or `null` | `undefined` | Positions Content against another anchor instead of Trigger.                                                 |
| `forceMount`        | `boolean`                                | `false`     | Keeps Content mounted so the app can manage additional transition behavior.                                  |
| `portalProps`       | `WithoutChildrenOrChild<PortalProps>`    | `undefined` | Configures Content's automatic local Portal without replacing its children.                                  |
| `ref`               | `HTMLElement \| null`                    | `null`      | Bindable content element reference.                                                                          |
| `children`          | `Snippet`                                | `undefined` | Renders preview content inside the default floating `div`.                                                   |
| `child`             | Bits UI content child snippet            | `undefined` | Replaces the default content element and receives primitive `props`, positioning `wrapperProps`, and `open`. |
| `class`             | `string`                                 | `undefined` | Merged after the local width, surface, spacing, ring, shadow, positioning, and animation classes.            |

Content also inherits `dir`, positioning strategy/update options, primitive IDs and styles, Escape and outside-interaction behavior, and related callbacks supported by the installed type. Follow the upstream API for their full signatures and composition rules.

The installed Link Preview Content is deliberately nonmodal: it hardcodes no focus trap, no focus loop, and no scroll lock. Those are not public local Content props. The local component does not expose `ContentStatic` or `Arrow`.

### `HoverCard.Portal`

Type: `PortalProps`, equal to Bits UI's `LinkPreview.PortalProps`.

| Prop       | Type                | Default         | Behavior                                                               |
| ---------- | ------------------- | --------------- | ---------------------------------------------------------------------- |
| `to`       | `Element \| string` | `document.body` | Portal destination element or selector.                                |
| `disabled` | `boolean`           | `false`         | Renders children in their original DOM location instead of portalling. |
| `children` | `Snippet`           | `undefined`     | Content rendered by a directly used Portal.                            |

Normal Content already uses this component internally. Prefer `Content portalProps={...}` rather than manually nesting the standard Hover Card in another Portal.

## Styling and DOM contract

Root and Portal do not render stable local elements of their own. Trigger and Content expose these stable xvelte hooks:

| Part    | Stable hook                      | Default element |
| ------- | -------------------------------- | --------------- |
| Trigger | `data-slot="hover-card-trigger"` | `a`             |
| Content | `data-slot="hover-card-content"` | Floating `div`  |

Content's local classes provide:

- `z-50`, width `w-64`, `rounded-lg`, `p-2.5`, and `text-sm`.
- `bg-popover`, `text-popover-foreground`, `ring-foreground/10`, `ring-1`, and `shadow-md`.
- Hidden outline and a `100ms` duration.
- Fade and `95%` zoom animations for open/closed state.
- A two-unit directional slide selected from the final `data-side`.

Content merges caller classes with `cn`, so later conflicting Tailwind utilities can replace ordinary local values such as width, padding, radius, surface colors, ring, shadow, z-index, or duration. Trigger does not call `cn`; its class is forwarded directly.

Bits UI owns `data-state`, `data-side`, `data-align`, `data-starting-style`, `data-ending-style`, `data-link-preview-trigger`, `data-link-preview-content`, generated IDs, ARIA relationships, the floating wrapper, and its positioning styles. It also publishes these Content CSS variables:

- `--bits-link-preview-content-transform-origin`
- `--bits-link-preview-content-available-width`
- `--bits-link-preview-content-available-height`
- `--bits-link-preview-anchor-width`
- `--bits-link-preview-anchor-height`

The local origin class reads `--transform-origin`, while the installed primitive publishes its computed origin under `--bits-link-preview-content-transform-origin`. No local alias connects them, so the zoom uses the browser's default centered transform origin unless the app supplies `--transform-origin` or the component is adapted. Treat this as a current local styling limitation.

The local `data-open:` and `data-closed:` variants recognize Bits UI's state attributes. Treat all dependency-owned hooks as version-specific unless the upstream API documents them.

## Accessibility

Hover Card is only for supplementary preview information. The installed Bits UI primitive provides pointer safe-area handling between Trigger and Content, delayed opening/closing, Escape dismissal, trigger `aria-haspopup`, `aria-expanded`, `aria-controls`, state attributes, and selection-aware closing for pointer users.

Important limitations and app responsibilities:

- Trigger ignores touch pointer entry, so tapping follows or activates the trigger without first exposing Content.
- Keyboard-visible focus can open the preview, but focus stays on Trigger. Bits UI removes Content descendants from the tab order and Content itself uses `tabindex="-1"`.
- Do not put links, buttons, forms, tooltips, or any required action inside Content. Pointer operability alone is insufficient.
- Repeat all information needed to understand or use the destination on the destination page or in nearby accessible content.
- Use a real destination with the default anchor. Provide an accessible name, visible focus style, and safe `target`/`rel` values when opening another browsing context.
- When delegating Trigger, use one appropriate focusable element and spread all supplied props. Never nest interactive elements.
- Do not use Hover Card as a tooltip for an unlabeled control. Use a visible or accessible label, and use Tooltip only for optional terse clarification.
- Do not use it as a menu, disclosure, confirmation, or dialog. Choose a component with explicit activation and keyboard-accessible content.

The preview does not trap focus, move focus, lock document scrolling, or add a live region. Its animation does not include a local reduced-motion override; provide one globally or adapt the classes when required.

## Localization

Hover Card has no built-in user-facing copy and imports no localization messages. The app supplies and translates Trigger content, preview text, accessible names, destination descriptions, dates, statuses, and any other content.

Placement values, open state, delay values, CSS variables, and `data-*` attributes are technical identifiers and are not translated.

## Dependencies

Hover Card expects a Svelte 5 project using Tailwind CSS 4. It requires Bits UI's Link Preview primitive, shared utility helpers, and `tw-animate-css`.

Install all runtime dependencies first and development dependencies second in the same package-manager group:

```sh
# bun
bun add bits-ui clsx tailwind-merge
bun add -D tailwindcss tw-animate-css

# npm
npm install bits-ui clsx tailwind-merge
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css
```

### Component files

Copy the complete `src/lib/components/ui/hover-card` component folder:

- `hover-card-root.svelte`
- `hover-card-trigger.svelte`
- `hover-card-content.svelte`
- `hover-card-portal.svelte`
- `index.ts`
- `README.md`

No other xvelte UI component, context module, hook, attachment, standalone helper file, shared component stylesheet, image, font, or network service is required.

### Shared utilities

Content imports `cn` and `WithoutChildrenOrChild` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class values and resolves conflicting Tailwind utilities in favor of the last value.
 *
 * @param inputs - Conditional, nested, or plain class values to merge.
 * @returns The normalized class string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
```

The package block includes `clsx` and `tailwind-merge`, which `cn` imports.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, expose the semantic surface and radius values, and define the local open/closed variants. These are xvelte's defaults; apps may replace the values while preserving their names and mappings:

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
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

The app owns dark-mode activation. No global base rule, component-specific keyframe, icon export from `src/lib/icons.ts`, localization message, or additional layout CSS is required.

## Credits

Adapted from [shadcn-svelte's Hover Card](https://www.shadcn-svelte.com/docs/components/hover-card). Bits UI is the runtime dependency and is documented separately in [Public API](#public-api).

## File organization

| File                        | Responsibility                                                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `hover-card-root.svelte`    | Bindable open state and forwarding to the Bits UI Link Preview root.                                                              |
| `hover-card-trigger.svelte` | Trigger reference, stable local hook, default anchor/delegated element, and primitive forwarding.                                 |
| `hover-card-content.svelte` | Automatic Portal, local placement defaults, styled floating content, animations, local portal configuration, and prop forwarding. |
| `hover-card-portal.svelte`  | Portal destination and inline-rendering wrapper.                                                                                  |
| `index.ts`                  | Public components and props type exports.                                                                                         |
| `README.md`                 | Composition, examples, API, styling, accessibility, localization, dependencies, limitations, and credits.                         |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

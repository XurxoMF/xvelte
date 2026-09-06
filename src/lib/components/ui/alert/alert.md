# Alert

A static callout for drawing attention to important information, outcomes, warnings, or errors. It provides default, danger, warning, success, info, and important visual variants, optional icon-aware layout, structured title and description parts, and a positioned action area.

Use an alert for concise information that deserves attention in the current context. Do not use it as a modal interruption, a transient toast, or a replacement for field-level validation next to the affected control. Because `Root` uses `role="alert"` by default, reserve that behavior for important messages that should be announced promptly by assistive technology.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Alert from "$lib/components/ui/alert";
</script>
```

Alert's `index.ts` exports `Root`, `Title`, `Description`, and `Action`, together with the `RootProps`, `RootVariants`, `TitleProps`, `DescriptionProps`, and `ActionProps` types. It also exports the `rootVariants` styling helper.

## Anatomy

Compose the public parts inside `Root`:

```svelte
<Alert.Root>
	<!-- Optional direct SVG child -->
	<Alert.Title>Alert title</Alert.Title>
	<Alert.Description>Alert details.</Alert.Description>
	<!-- Optional Alert.Action -->
</Alert.Root>
```

`Title`, `Description`, and `Action` are optional native `div` wrappers. Place an optional icon component as a direct child of `Root` before the text so its rendered `svg` activates the icon-aware grid. `Action` is absolutely positioned in the top-right corner; it does not add a button, dismiss the alert, or manage state.

## Basic usage

```svelte
<script lang="ts">
	import * as Alert from "$lib/components/ui/alert";
</script>

<Alert.Root>
	<Alert.Title>Profile updated</Alert.Title>
	<Alert.Description>Your public profile changes have been saved.</Alert.Description>
</Alert.Root>
```

Use `Title` for the concise message and `Description` for supporting detail. Either part may be omitted when the remaining content is sufficient on its own.

## Examples

### Danger alert with an icon

Use `variant="danger"` for errors or dangerous outcomes. You provide any icons, and they should be decorative when the adjacent text communicates the same meaning.

```svelte
<script lang="ts">
	import { AlertErrorIcon } from "$lib/icons";
	import * as Alert from "$lib/components/ui/alert";
</script>

<Alert.Root variant="danger">
	<AlertErrorIcon aria-hidden="true" />
	<Alert.Title>Payment failed</Alert.Title>
	<Alert.Description>
		<p>Check the card details and try again.</p>
	</Alert.Description>
</Alert.Root>
```

The icon must render as a direct `svg` child of `Root` for the built-in grid selectors to apply.

### Semantic status tones

Use `warning`, `success`, `info`, and `important` when the message's meaning is more specific than the neutral default or `danger`:

```svelte
<Alert.Root variant="warning"><Alert.Title>Storage is almost full</Alert.Title></Alert.Root>
<Alert.Root variant="success"><Alert.Title>Deployment completed</Alert.Title></Alert.Root>
<Alert.Root variant="info"><Alert.Title>A newer version is available</Alert.Title></Alert.Root>
<Alert.Root variant="important"><Alert.Title>Action required before Friday</Alert.Title></Alert.Root>
```

### Action supplied by your app

`Action` only positions its children. Your app must provide the interaction, state, accessible name, and focus behavior.

```svelte
<script lang="ts">
	import * as Alert from "$lib/components/ui/alert";

	let visible = $state(true);
</script>

{#if visible}
	<Alert.Root>
		<Alert.Title>Draft restored</Alert.Title>
		<Alert.Description>Your unsent changes were recovered.</Alert.Description>

		<Alert.Action>
			<button type="button" class="rounded px-2 py-1 text-sm underline" onclick={() => (visible = false)}>Dismiss</button>
		</Alert.Action>
	</Alert.Root>
{/if}
```

When `Action` is present, `Root` reserves additional space on the right to reduce overlap with the title and description.

### Non-urgent status

Native attributes are forwarded after the local defaults. Override the live-region role when the message is informational and does not require assertive announcement, and add heading semantics when the title participates in the page outline.

```svelte
<Alert.Root role="status">
	<Alert.Title role="heading" aria-level={2}>Synchronization complete</Alert.Title>
	<Alert.Description>All local changes are available on your other devices.</Alert.Description>
</Alert.Root>
```

## Public API

All parts render native `div` elements and forward their applicable `HTMLAttributes<HTMLDivElement>`. The tables document the complete xvelte-owned API and its non-obvious behavior.

### `Alert.Root`

Type: `RootProps`, which extends native `div` attributes with the local `variant` prop and a bindable element reference.

| Prop       | Type                                                                       | Default     | xvelte behavior                                                                                 |
| ---------- | -------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `variant`  | `"default" \| "danger" \| "warning" \| "success" \| "info" \| "important"` | `"default"` | Selects the semantic color treatment generated by `rootVariants`.                               |
| `children` | `Snippet`                                                                  | `undefined` | Renders the alert parts and any optional direct SVG icon.                                       |
| `ref`      | `HTMLDivElement \| null`                                                   | `null`      | Bindable reference to the root `div`.                                                           |
| `class`    | `string`                                                                   | `undefined` | Merged after the selected variant classes, so conflicting Tailwind utilities can override them. |

`Root` supplies `role="alert"`, `data-slot="alert"`, full-width layout, border, spacing, and icon/action-aware selectors. Because native attributes are spread after the local attributes, a `role` or `data-slot` passed by your app can replace the defaults; preserve `data-slot` and override `role` only deliberately.

### `Alert.Title`

Type: `TitleProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                |
| ---------- | ------------------------ | ----------- | -------------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders the title content.                                     |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the title `div`.                         |
| `class`    | `string`                 | `undefined` | Merged with local font, icon-grid, link, and underline styles. |

`Title` is visually emphasized but is not an HTML heading by default. It forwards native attributes, including ARIA attributes, and moves to the text column when `Root` has a direct SVG child.

### `Alert.Description`

Type: `DescriptionProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                                                     |
| ---------- | ------------------------ | ----------- | --------------------------------------------------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders supporting text, paragraphs, links, lists, or other descriptive markup.                     |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the description `div`.                                                        |
| `class`    | `string`                 | `undefined` | Merged with local text color, responsive text wrapping, link, underline, and paragraph-gap styling. |

Every semantic root variant changes the description color through its `data-slot`. Paragraphs except the last receive a bottom margin, and descendant links inherit the local underline and hover treatment.

### `Alert.Action`

Type: `ActionProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                |
| ---------- | ------------------------ | ----------- | -------------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders controls or other action content supplied by your app. |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the action wrapper.                      |
| `class`    | `string`                 | `undefined` | Merged with absolute top-right positioning.                    |

`Action` has no click callback, dismissal logic, focus management, or built-in control. Add an appropriately labeled interactive component inside it and manage behavior outside Alert.

### `rootVariants`

`rootVariants` is the exported Tailwind Variants function used by `Root`. It accepts the `variant` selection and optional class overrides, then returns the merged class string. `RootVariants` is the corresponding public variant type.

Prefer `Alert.Root` for rendered alerts. Use `rootVariants` only when another local wrapper must reproduce the same visual contract while preserving the accessibility behavior itself.

Use `index.ts`, the exported props and variant types, and `rootVariants` as the source of truth for the public API. Native Svelte element types determine the remaining forwarded attributes.

## Styling and DOM contract

Alert uses semantic Tailwind color tokens and Tailwind Variants. It has no animation, transition, dependency-owned state attributes, or CSS variables of its own.

Stable xvelte hooks:

| Part          | `data-slot`         | Notable DOM behavior                                                             |
| ------------- | ------------------- | -------------------------------------------------------------------------------- |
| `Root`        | `alert`             | `role="alert"`; becomes a two-column grid when it has a direct SVG child.        |
| `Title`       | `alert-title`       | Moves to column two when the root has a direct SVG child.                        |
| `Description` | `alert-description` | Receives the selected semantic description color through the root variant.       |
| `Action`      | `alert-action`      | Positioned absolutely; causes the root to reserve additional right-side padding. |

The root's direct-child selectors size unclassed SVGs to `1rem`, align them with the first text row, and use the current text color. An SVG with a class containing `size-` keeps the size set by your app. Nested SVGs do not activate the grid.

Classes passed to each part are merged after its local classes with `cn`, so Tailwind conflicts favor classes from your app. Native attributes are also forwarded, but preserve the stable `data-slot` values because local cross-part selectors depend on them.

## Accessibility

Alert is a presentational composition around native elements; it has no keyboard interactions or focus management of its own.

- `Root` defaults to the assertive `alert` role. Use it for important dynamically inserted information, not routine static instructions or every validation message on a page.
- Use `role="status"` for non-urgent dynamic updates that should be announced politely. Do not remove live-region semantics from important messages without providing an equivalent announcement.
- `Title` is a `div`, not a heading. Add `role="heading"` and the appropriate `aria-level`, or provide equivalent surrounding structure, when the title belongs in the document hierarchy.
- Make the text communicate the alert's meaning without relying only on color or an icon. Decorative icons should use `aria-hidden="true"`; meaningful icons need an accessible name.
- Interactive children of `Action` need their own accessible names, focus indicators, disabled behavior, and event handling. Inserting an alert should not unexpectedly move focus to its action.
- Keep descriptions concise. For blocking decisions or confirmation flows, use a dialog instead of an alert callout.

## Localization

Alert has no built-in user-facing copy or localization messages. Your app supplies and translates all titles, descriptions, action labels, and accessible icon names. Do not translate the technical `default`/`danger` variant names or `data-slot` values.

## Dependencies

Alert expects a Svelte 5 project using Tailwind CSS 4. It does not depend on Bits UI. Install its runtime styling utilities and Tailwind dependency with one of the following commands:

```sh
# bun
bun add tailwind-variants clsx tailwind-merge
bun add @tabler/icons-svelte # Optional: only for the icon example
bun add -D tailwindcss

# npm
npm install tailwind-variants clsx tailwind-merge
npm install @tabler/icons-svelte # Optional: only for the icon example
npm install -D tailwindcss

# pnpm
pnpm add tailwind-variants clsx tailwind-merge
pnpm add @tabler/icons-svelte # Optional: only for the icon example
pnpm add -D tailwindcss
```

### Global CSS

The application stylesheet, `src/routes/layout.css` in xvelte, must load Tailwind CSS:

```css
@import "tailwindcss";
```

Alert uses the `card`, `card-foreground`, `danger`, `warning`, `success`, `info`, `important`, `muted-foreground`, `foreground`, and `border` semantic color utilities. Your theme must define and expose these tokens; the values below are xvelte's light defaults:

```css
:root {
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.147 0.004 49.25);
	--danger: oklch(0.577 0.245 27.325);
	--warning: oklch(0.555 0.163 48.998);
	--success: oklch(0.527 0.154 150.069);
	--info: oklch(0.546 0.245 262.881);
	--important: oklch(0.541 0.281 293.009);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--foreground: oklch(0.147 0.004 49.25);
	--border: oklch(0.923 0.003 48.717);
}

.dark {
	--card: oklch(0.216 0.006 56.043);
	--card-foreground: oklch(0.985 0.001 106.423);
	--danger: oklch(0.704 0.191 22.216);
	--warning: oklch(0.828 0.189 84.429);
	--success: oklch(0.723 0.219 149.579);
	--info: oklch(0.707 0.165 254.624);
	--important: oklch(0.702 0.183 293.541);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--foreground: oklch(0.985 0.001 106.423);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-danger: var(--danger);
	--color-warning: var(--warning);
	--color-success: var(--success);
	--color-info: var(--info);
	--color-important: var(--important);
	--color-muted-foreground: var(--muted-foreground);
	--color-foreground: var(--foreground);
	--color-border: var(--border);
}
```

The values may be replaced by the app's theme while preserving the variable names and mappings. Alert requires no global keyframes, animation utilities, or component-specific CSS variables.

### Icons

Alert does not import or require an icon. Any icon component you place directly inside it can use the built-in SVG layout.

The danger example above uses xvelte's semantic icon facade. Copying that example requires `@tabler/icons-svelte` and this export in `$lib/icons`:

```ts
export { default as AlertErrorIcon } from "@tabler/icons-svelte/icons/alert-octagon";
```

The optional package commands are included in the single installation block above. You may omit them or use another icon already exposed by your semantic icon file.

### Shared utilities

Every part imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

Alert does not require other xvelte components, hooks, attachments, context modules, localization messages, shared styles, or `tw-animate-css`.

## Credits

Alert is adapted from the [shadcn-svelte Alert](https://www.shadcn-svelte.com/docs/components/alert). Its implementation has been modified to follow xvelte's local API, action, variant, styling, utility, and import conventions.

## File organization

| File                       | Responsibility                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `alert-root.svelte`        | Defines variants and renders the semantic root with icon- and action-aware layout.     |
| `alert-title.svelte`       | Renders the visually emphasized title and icon-aware grid placement.                   |
| `alert-description.svelte` | Renders supporting content with semantic text, link, and paragraph styling.            |
| `alert-action.svelte`      | Positions action content supplied by your app in the top-right corner.                 |
| `index.ts`                 | Exports all public component parts, props and variant types, and the variant function. |

Use `index.ts`, the exported props and variant types, and `rootVariants` as the source of truth for the public API. If this guide and the implementation disagree, verify the installed dependencies and update this guide with the code change.

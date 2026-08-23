# Item

A flexible content row for presenting a title, description, media, actions, and optional header or footer content. Items can be grouped into lists, separated visually, rendered at three densities, styled with three variants, or delegated to an anchor or another element.

Use Item for records, resources, notifications, settings summaries, menus, and similar display content. Use Field instead when the primary purpose is to label, describe, validate, or arrange a form control.

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

Import the complete component through its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Item from "$lib/components/ui/item";
</script>
```

Item's `index.ts` exports `Root`, `Group`, `Separator`, `Header`, `Footer`, `Content`, `Title`, `Description`, `Actions`, and `Media`. It also exports every corresponding props type, the `RootSizes`, `RootVariants`, and `MediaVariants` types, and the `rootVariants` and `mediaVariants` styling helpers.

---

## Anatomy

Compose only the parts needed by the content. A complete item can use this structure:

```svelte
<Item.Root>
	<Item.Header>Header content</Item.Header>

	<Item.Media>Media</Item.Media>

	<Item.Content>
		<Item.Title>Item title</Item.Title>
		<Item.Description>Short supporting description.</Item.Description>
	</Item.Content>

	<Item.Actions>Actions</Item.Actions>
	<Item.Footer>Footer content</Item.Footer>
</Item.Root>
```

`Header` and `Footer` occupy the full row. `Media`, `Content`, and `Actions` form the main flexible row. `Group` arranges several roots vertically, while `Separator` draws a divider between them.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Item from "$lib/components/ui/item";
</script>

<Item.Root variant="outline">
	<Item.Content>
		<Item.Title>Deployment complete</Item.Title>
		<Item.Description>The production site is running version 2.4.0.</Item.Description>
	</Item.Content>

	<Item.Actions>
		<button type="button">View details</button>
	</Item.Actions>
</Item.Root>
```

Actions are ordinary child content. Item does not impose a button implementation or click behavior.

---

## Examples

### Render the complete item as a link

Use the `child` snippet when the root itself should be an anchor. Apply every provided prop to the element so it receives Item's classes and stable attributes.

```svelte
<Item.Root variant="outline" size="sm">
	{#snippet child({ props })}
		<a href="/documentation" {...props}>
			<Item.Content>
				<Item.Title>Read the documentation</Item.Title>
				<Item.Description>Learn how to configure your first project.</Item.Description>
			</Item.Content>
		</a>
	{/snippet}
</Item.Root>
```

Do not place another interactive control inside an item rendered as a link.

### Media variants

Use `variant="icon"` for icon-sized content and `variant="image"` for a cropped thumbnail container. The default variant does not add a background or fixed dimensions.

```svelte
<Item.Root variant="muted">
	<Item.Media variant="image">
		<img src="/images/project-thumbnail.webp" alt="Northwind project preview" />
	</Item.Media>

	<Item.Content>
		<Item.Title>Northwind</Item.Title>
		<Item.Description>Updated five minutes ago.</Item.Description>
	</Item.Content>
</Item.Root>
```

Supply meaningful alternative text when the image conveys information. Use `alt=""` when it is purely decorative.

### Grouped items with separators

```svelte
<Item.Group aria-label="Recent activity">
	<Item.Root role="listitem">
		<Item.Content>
			<Item.Title>Invoice paid</Item.Title>
			<Item.Description>Invoice INV-2048 was paid in full.</Item.Description>
		</Item.Content>
	</Item.Root>

	<Item.Separator decorative />

	<Item.Root role="listitem">
		<Item.Content>
			<Item.Title>Member invited</Item.Title>
			<Item.Description>Alex was invited to the workspace.</Item.Description>
		</Item.Content>
	</Item.Root>
</Item.Group>
```

Set `decorative` on visual dividers inside Group so they do not add a non-list role to the accessibility tree.

### Header and footer layout

```svelte
<Item.Root variant="outline">
	<Item.Header>
		<span>Build #1842</span>
		<time datetime="2026-08-15T10:30:00Z">10:30</time>
	</Item.Header>

	<Item.Content>
		<Item.Title>Production deployment</Item.Title>
		<Item.Description>Completed successfully in 42 seconds.</Item.Description>
	</Item.Content>

	<Item.Footer>
		<span>main</span>
		<span>8f31c2a</span>
	</Item.Footer>
</Item.Root>
```

---

## Public API

All parts forward their applicable native attributes. The component's `index.ts`, exported types, and variant helpers are the source of truth.

### `Item.Root`

Type: `RootProps`, based on native `div` attributes.

| Prop       | Type                                            | Default     | xvelte behavior                                                                                                                                          |
| ---------- | ----------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`  | `"default" \| "outline" \| "muted"`             | `"default"` | Selects transparent, outlined, or muted styling.                                                                                                         |
| `size`     | `"default" \| "sm" \| "xs"`                     | `"default"` | Controls spacing and the descendant size selectors. `default` and `sm` currently share root spacing; descendants can still distinguish an explicit `sm`. |
| `child`    | `Snippet<[{ props: Record<string, unknown> }]>` | `undefined` | Replaces the default `div`. The snippet must spread `props` onto its rendered element.                                                                   |
| `children` | `Snippet`                                       | `undefined` | Renders inside the default `div`. With `child`, compose the item content inside that snippet instead.                                                    |
| `ref`      | `HTMLDivElement \| null`                        | `null`      | Bindable reference to the default `div`. It is not assigned when `child` replaces that element.                                                          |
| `class`    | `string`                                        | `undefined` | Merged after the selected root variant classes.                                                                                                          |

Remaining native `div` attributes are included in the props applied to the default or delegated element. The variant helpers always apply their default classes, but `data-variant` and `data-size` reflect the values passed to the component; omit them and those attributes are absent.

### Root variants

| Variant   | Styling                                                             |
| --------- | ------------------------------------------------------------------- |
| `default` | Transparent border.                                                 |
| `outline` | Semantic `border` color.                                            |
| `muted`   | Half-opacity semantic `muted` background with a transparent border. |

| Size      | Styling                                                                                     |
| --------- | ------------------------------------------------------------------------------------------- |
| `default` | Standard horizontal and vertical padding with a `0.625rem` gap.                             |
| `sm`      | The same root spacing as `default`, plus an explicit `data-size="sm"` hook for descendants. |
| `xs`      | Reduced padding and gap; removes its own padding inside Dropdown Menu content.              |

`rootVariants` is the exported Tailwind Variants function. `RootVariants` and `RootSizes` are its public variant-value types.

### `Item.Group`

Type: `GroupProps`, based on native `div` attributes.

| Prop       | Type                     | Default     | xvelte behavior                                    |
| ---------- | ------------------------ | ----------- | -------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders the grouped items and optional separators. |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable group reference.                          |
| `class`    | `string`                 | `undefined` | Merged with the full-width vertical layout.        |

Group always renders `role="list"`. Its gap becomes smaller when it contains roots with explicit `size="sm"` or `size="xs"`.

### `Item.Separator`

Type: `SeparatorProps`, an alias of the local Separator component's `RootProps`.

| Prop          | Type                         | Default        | xvelte behavior                                                                      |
| ------------- | ---------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Horizontal by default; forwarded to the Separator component.                         |
| `decorative`  | `boolean`                    | `false`        | Controls whether the separator is purely visual or exposed with separator semantics. |
| `ref`         | `HTMLDivElement \| null`     | `null`         | Bindable separator reference.                                                        |
| `class`       | `string`                     | `undefined`    | Merged with Item's vertical margin and Separator's base classes.                     |

Other Separator and native `div` props are forwarded. See the [Bits UI Separator API](https://www.bits-ui.com/docs/components/separator#api-reference) for its inherited primitive options.

### `Item.Header` and `Item.Footer`

Types: `HeaderProps` and `FooterProps`, each based on native `div` attributes.

| Prop       | Type                     | Default     | xvelte behavior                               |
| ---------- | ------------------------ | ----------- | --------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders the header or footer content.         |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable element reference.                   |
| `class`    | `string`                 | `undefined` | Merged with the full-row, spaced flex layout. |

Both parts span the full available row and distribute their immediate children with `justify-between`.

### `Item.Content`

Type: `ContentProps`, based on native `div` attributes.

| Prop       | Type                     | Default     | xvelte behavior                                             |
| ---------- | ------------------------ | ----------- | ----------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders titles, descriptions, or custom content vertically. |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable content reference.                                 |
| `class`    | `string`                 | `undefined` | Merged with the flexible column layout.                     |

Content grows to fill available space. An immediately adjacent second Content stops growing, which supports trailing metadata columns. Explicit `size="xs"` on Root removes the normal vertical gap.

### `Item.Title`

Type: `TitleProps`, based on native `div` attributes.

| Prop       | Type                     | Default     | xvelte behavior                                |
| ---------- | ------------------------ | ----------- | ---------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders the title content on one clamped line. |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable title reference.                      |
| `class`    | `string`                 | `undefined` | Merged with the title typography and layout.   |

Title renders a `div`, not a semantic heading. Add a heading inside it, use an appropriate role and level, or provide surrounding heading structure when the title represents a document section.

### `Item.Description`

Type: `DescriptionProps`, based on native paragraph attributes.

| Prop       | Type                           | Default     | xvelte behavior                                      |
| ---------- | ------------------------------ | ----------- | ---------------------------------------------------- |
| `children` | `Snippet`                      | `undefined` | Renders muted supporting copy, clamped to two lines. |
| `ref`      | `HTMLParagraphElement \| null` | `null`      | Bindable paragraph reference.                        |
| `class`    | `string`                       | `undefined` | Merged with description typography and link styling. |

Links placed directly inside Description are underlined and use the semantic primary color on hover.

### `Item.Actions`

Type: `ActionsProps`, based on native `div` attributes.

| Prop       | Type                     | Default     | xvelte behavior                                     |
| ---------- | ------------------------ | ----------- | --------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders action controls or trailing status content. |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable actions reference.                         |
| `class`    | `string`                 | `undefined` | Merged with the horizontal action layout.           |

### `Item.Media`

Type: `MediaProps`, based on native `div` attributes.

| Prop       | Type                             | Default     | xvelte behavior                                                                              |
| ---------- | -------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `variant`  | `"default" \| "icon" \| "image"` | `"default"` | Selects an unconstrained wrapper, normalized icon sizing, or a responsive cropped thumbnail. |
| `children` | `Snippet`                        | `undefined` | Renders an icon, avatar, image, or custom media.                                             |
| `ref`      | `HTMLDivElement \| null`         | `null`      | Bindable media reference.                                                                    |
| `class`    | `string`                         | `undefined` | Merged after the selected media variant classes.                                             |

Media aligns itself to the start when the item contains a Description. Image dimensions shrink for explicit `sm` and `xs` root sizes. `mediaVariants` is the exported Tailwind Variants function, and `MediaVariants` is its public variant-value type.

---

## Styling and DOM contract

Stable xvelte hooks:

| Part          | `data-slot`        | Other stable attributes                                   |
| ------------- | ------------------ | --------------------------------------------------------- |
| `Root`        | `item`             | `data-variant`, `data-size` when their props are explicit |
| `Group`       | `item-group`       | `role="list"`                                             |
| `Separator`   | `item-separator`   | Separator orientation and state attributes                |
| `Header`      | `item-header`      | —                                                         |
| `Footer`      | `item-footer`      | —                                                         |
| `Content`     | `item-content`     | —                                                         |
| `Title`       | `item-title`       | —                                                         |
| `Description` | `item-description` | —                                                         |
| `Actions`     | `item-actions`     | —                                                         |
| `Media`       | `item-media`       | `data-variant`                                            |

Root also exposes the stable `group/item` Tailwind group name, and Group exposes `group/item-group`. Descendant sizing and alignment depend on these group and `data-slot` hooks. Every public `class` prop is merged with local classes through `cn()`, so later conflicting Tailwind utilities normally win.

When Root delegates through `child`, its classes and data attributes move to the rendered child element. Anchor roots receive local hover styling; all delegated focusable elements receive the local focus-visible border and ring.

---

## Accessibility

Item supplies layout, not complete content semantics.

- Root is a `div` by default. Use `child` to render an anchor when the whole item navigates, or place clearly named controls inside Actions when actions are independent.
- Do not nest buttons, links, or other interactive controls inside a whole-item anchor.
- Title is not a heading. Add suitable heading semantics when the surrounding page structure requires them.
- Group renders `role="list"`, but Root does not add `role="listitem"`. Add appropriate item semantics for non-interactive roots, or choose native list markup in a wrapper when richer semantics are needed.
- Give icon-only controls in Actions an accessible name.
- Provide useful `alt` text for informative images and empty `alt` text for decorative images.
- Preserve the root's focus-visible styles when rendering an interactive child.
- Separator inherits Bits UI's decorative and semantic behavior. Set `decorative` for a purely visual divider; retain its semantic default only when the boundary itself carries meaning.

---

## Localization

Item has no built-in user-facing copy. Your app supplies and translates titles, descriptions, action labels, image alternatives, accessible names, and any header or footer content. Variant names, size names, roles, and `data-*` values are technical values and are not translated.

---

## Dependencies

Item expects a Svelte 5 project using Tailwind CSS 4. Install all runtime dependencies first and the development dependency second in the same package-manager group:

```sh
# bun
bun add bits-ui clsx tailwind-merge tailwind-variants
bun add -D tailwindcss

# npm
npm install bits-ui clsx tailwind-merge tailwind-variants
npm install -D tailwindcss

# pnpm
pnpm add bits-ui clsx tailwind-merge tailwind-variants
pnpm add -D tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/item` component folder with all files listed under [File organization](#file-organization).

### Separator component

`Item.Separator` requires the complete `src/lib/components/ui/separator` component:

- `separator-root.svelte`
- `index.ts`

Copy the Separator component with Item. Its folder does not yet contain a colocated README, so the installation requirements Item needs from it are included here: the two files above, `bits-ui`, the shared `cn` helper, and the semantic `border` color defined below. Use the exported Separator types and `index.ts` as its current API reference.

### Shared utilities

Every part imports `cn`, and the native-element wrappers also use `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when absent:

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

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package installation block includes `clsx` and `tailwind-merge`. Root and Media import `tv` and `VariantProps` from `tailwind-variants`; no shared variant helper is required.

### Global CSS

The global stylesheet must load Tailwind and expose the semantic colors and radius used by Item and Separator. These are xvelte's defaults; replace their values to match an app's theme while preserving the names and mappings:

```css
@import "tailwindcss";

:root {
	--primary: oklch(0.841 0.238 128.85);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--primary: oklch(0.768 0.233 130.85);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-primary: var(--primary);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--color-ring: var(--ring);
	--radius-lg: var(--radius);
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

The app owns dark-mode activation. Item requires no icon export from `src/lib/icons.ts`, localization message, hook, attachment, context, animation import, keyframe, image, font, network service, or additional layout rule. Icons, avatars, images, buttons, dropdowns, and other content shown inside Item are optional compositions; install and follow their own component guides only when using them.

---

## Credits

Item is adapted from [shadcn-svelte's Item component](https://www.shadcn-svelte.com/docs/components/item). The local xvelte implementation, exports, variant behavior, styling hooks, and limitations documented here are the source of truth.

---

## File organization

| File                      | Responsibility                                                        |
| ------------------------- | --------------------------------------------------------------------- |
| `item-root.svelte`        | Root layout, variants, sizes, focus styling, and delegated rendering. |
| `item-group.svelte`       | Vertical list container and density-aware spacing.                    |
| `item-separator.svelte`   | Item-specific wrapper around the Separator component.                 |
| `item-header.svelte`      | Full-width header row.                                                |
| `item-footer.svelte`      | Full-width footer row.                                                |
| `item-content.svelte`     | Flexible vertical content column.                                     |
| `item-title.svelte`       | Single-line title container.                                          |
| `item-description.svelte` | Two-line supporting paragraph and link styling.                       |
| `item-actions.svelte`     | Trailing action layout.                                               |
| `item-media.svelte`       | Media alignment, image sizing, and icon styling variants.             |
| `index.ts`                | Public components, types, and variant-helper exports.                 |
| `README.md`               | Installation, API, behavior, and usage guide.                         |

The component's `index.ts`, exported types, and exported variant helpers are the source of truth for the public API.

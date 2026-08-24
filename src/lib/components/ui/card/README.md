# Card

A flexible surface for grouping related information, supporting text, actions, media, forms, and a visually separated footer. Card provides consistent spacing and styling while leaving content, semantics, and behavior under the app's control.

Use Card for self-contained summaries, settings, forms, products, events, and other content that benefits from a visible boundary. Do not use it only to add spacing to ordinary page sections, and do not assume that Card adds selection, navigation, or button behavior by itself.

<!-- xvelte-example: overview -->

## Contents

- [Import](#import)
- [Anatomy](#anatomy)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Layout behavior](#layout-behavior)
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
	import * as Card from "$lib/components/ui/card";
</script>
```

Card's `index.ts` exports `Root`, `Header`, `Title`, `Description`, `Action`, `Content`, and `Footer`. It also exports a matching props type for every component.

## Anatomy

Compose only the parts required by the content:

```svelte
<Card.Root>
	<Card.Header>
		<Card.Title>...</Card.Title>
		<Card.Description>...</Card.Description>
		<Card.Action>...</Card.Action>
	</Card.Header>
	<Card.Content>...</Card.Content>
	<Card.Footer>...</Card.Footer>
</Card.Root>
```

The recommended order is:

```text
Root
├── optional leading image or media
├── Header
│   ├── Title
│   ├── Description
│   └── optional Action
├── Content
└── optional Footer
```

The parts do not require a Svelte context and can technically render independently, but their spacing and group selectors are designed to work together inside `Card.Root`.

## Basic usage

```svelte
<script lang="ts">
	import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Project activity</Card.Title>
		<Card.Description>Changes made during the last seven days.</Card.Description>
	</Card.Header>

	<Card.Content>
		<p>12 commits, 4 reviews, and 2 deployments.</p>
	</Card.Content>
</Card.Root>
```

Card does not set its own width. Use `class` to place it in the surrounding layout and constrain it when necessary.

## Examples

### Header action

`Action` moves into a second header column and spans the title and description rows:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Notifications</Card.Title>
		<Card.Description>Choose how the workspace contacts you.</Card.Description>
		<Card.Action>
			<Button.Root variant="ghost" size="sm">Manage</Button.Root>
		</Card.Action>
	</Card.Header>

	<Card.Content>
		<p class="text-sm">Email notifications are enabled.</p>
	</Card.Content>
</Card.Root>
```

Button is an example composition dependency, not a requirement of Card itself. Any suitable control, badge, menu, or non-interactive content can be placed in `Action`.

### Small card

```svelte
<Card.Root size="sm" class="w-72">
	<Card.Header>
		<Card.Title>Storage</Card.Title>
		<Card.Description>8.4 GB of 20 GB used.</Card.Description>
	</Card.Header>

	<Card.Content>
		<div class="h-2 rounded-full bg-muted">
			<div class="h-full w-[42%] rounded-full bg-primary"></div>
		</div>
	</Card.Content>
</Card.Root>
```

Small cards reduce the root gap and vertical padding, section insets, header border spacing, footer padding, and title size together.

### Footer actions

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>Delete workspace</Card.Title>
		<Card.Description>This action cannot be undone.</Card.Description>
	</Card.Header>

	<Card.Content>
		<p class="text-sm">All projects and uploaded files will be permanently removed.</p>
	</Card.Content>

	<Card.Footer class="justify-end gap-2">
		<Button.Root variant="outline">Cancel</Button.Root>
		<Button.Root variant="danger">Delete</Button.Root>
	</Card.Footer>
</Card.Root>
```

The local Footer already adds a top border, muted background, bottom corner rounding, and padding. When a Footer is present, Root removes its own bottom padding so both sections meet cleanly.

### Card with an image

```svelte
<Card.Root class="w-full max-w-sm">
	<img src="/event-cover.webp" alt="People attending the design systems meetup" class="aspect-video w-full object-cover" />

	<Card.Header>
		<Card.Title>Design systems meetup</Card.Title>
		<Card.Description>A practical session about accessible component APIs.</Card.Description>
	</Card.Header>

	<Card.Content>
		<p class="text-sm">Thursday at 18:00</p>
	</Card.Content>
</Card.Root>
```

A direct image placed first removes Root's top padding, and the built-in image selectors round images at the outer top or bottom edges. Keep meaningful alternative text on informative images; use `alt=""` for purely decorative media.

### Header divider

```svelte
<Card.Root>
	<Card.Header class="border-b">
		<Card.Title>Billing details</Card.Title>
		<Card.Description>Invoice and tax information.</Card.Description>
	</Card.Header>

	<Card.Content>...</Card.Content>
</Card.Root>
```

Adding `border-b` to Header automatically adds matching bottom padding: `1rem` for the default size and `0.75rem` for a small card.

## Public API

Card is implemented with native HTML elements and does not wrap a third-party primitive. Every part forwards its native attributes, event handlers, `children`, bindable `ref`, and `class`.

### `Card.Root`

Type: `RootProps`, based on native `div` attributes.

| Prop       | Type                     | Default     | Behavior                                                                                     |
| ---------- | ------------------------ | ----------- | -------------------------------------------------------------------------------------------- |
| `size`     | `"default" \| "sm"`      | `"default"` | Coordinates compact spacing and typography across descendant Card parts through `data-size`. |
| `children` | `Snippet \| undefined`   | `undefined` | Card sections, media, and custom content.                                                    |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable root element.                                                                       |
| `class`    | `string`                 | `undefined` | Merged with the local surface, spacing, radius, ring, and group classes.                     |

Native `div` attributes are forwarded. Root renders no heading, landmark, link, or button semantics automatically.

### Card parts

| Component     | Props type         | Element | Local behavior                                                                                                                        |
| ------------- | ------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Header`      | `HeaderProps`      | `div`   | Grid header with responsive section insets; detects Description and Action descendants and adds bottom spacing when given `border-b`. |
| `Title`       | `TitleProps`       | `div`   | Medium-weight title with compact line height; becomes smaller when Root uses `size="sm"`.                                             |
| `Description` | `DescriptionProps` | `p`     | Muted secondary text at the small text size.                                                                                          |
| `Action`      | `ActionProps`      | `div`   | Places content at the upper end of the Header's second column and spans both text rows.                                               |
| `Content`     | `ContentProps`     | `div`   | Main content with horizontal insets coordinated with Root size.                                                                       |
| `Footer`      | `FooterProps`      | `div`   | Flex row with a top border, muted background, bottom radius, and coordinated padding.                                                 |

All part types are based on the native attributes for their listed element. Their shared props are:

| Prop       | Type                            | Default     | Behavior                                                                                             |
| ---------- | ------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `children` | `Snippet \| undefined`          | `undefined` | Content rendered inside the part.                                                                    |
| `ref`      | Matching HTML element or `null` | `null`      | Bindable DOM element. Description uses `HTMLParagraphElement`; the other parts use `HTMLDivElement`. |
| `class`    | `string`                        | `undefined` | Merged with that part's local classes.                                                               |

Use `index.ts` and the exported props types as the source of truth for the local API.

## Layout behavior

- Root is a vertical flex container with a default `1rem` gap and vertical padding. `size="sm"` reduces both to `0.75rem`.
- Header and Content use `1rem` horizontal insets by default and `0.75rem` in small cards.
- Header switches to a two-column grid when it contains `Card.Action`. Description occupies the second text row while Action stays in the end column.
- Footer removes Root's remaining bottom padding, then supplies its own padding and visual separation.
- A direct first-child image removes Root's top padding. Built-in image selectors preserve the outer corner radius for first and last images.
- Root clips overflow. Menus, tooltips, and popovers that must extend outside the card should render through a portal or be placed where clipping is not a problem.

Unlike the current shadcn-svelte Card, the local implementation does not expose or read a `--card-spacing` CSS variable. Customize local spacing with `size` and `class`, and treat the component source as the authority when adapting upstream examples.

## Styling and DOM contract

Card uses semantic Tailwind colors and exposes stable `data-slot` selectors:

| `data-slot`        | Element | Purpose                                                         |
| ------------------ | ------- | --------------------------------------------------------------- |
| `card`             | `div`   | Root surface, group state, sizing, spacing, clipping, and ring. |
| `card-header`      | `div`   | Title, description, and action grid.                            |
| `card-title`       | `div`   | Primary title styling.                                          |
| `card-description` | `p`     | Muted descriptive text.                                         |
| `card-action`      | `div`   | Header action placement.                                        |
| `card-content`     | `div`   | Main content inset.                                             |
| `card-footer`      | `div`   | Visually separated footer.                                      |

Root also exposes `data-size="default"` or `data-size="sm"`. Descendants use the named `group/card` state, while Header exposes `group/card-header` and `@container/card-header` for custom composition.

`class` is merged with Tailwind Merge, so ordinary conflicting utilities can replace local ones. Some structural selectors react to descendants or classes—such as Footer presence, a leading image, `data-slot="card-action"`, and `border-b`—and should be preserved when the matching behavior is wanted.

## Accessibility

Card is a visual composition helper, not an accessibility primitive. It intentionally adds no role, keyboard handling, focus management, or accessible name.

- `Card.Title` renders a `div`, not a native heading. Give it `role="heading"` and `aria-level`, or place a real heading element inside it when the title belongs in the page heading hierarchy.
- Add `aria-labelledby` or `aria-label` to Root only when the card should be exposed as a named region or group; do not add landmarks to every decorative card.
- Use real links and buttons for actions. `Card.Action`, `Card.Footer`, and the card surface are not interactive by themselves.
- Do not make the complete Card clickable when it contains nested interactive controls. Prefer a clearly labelled primary link.
- Preserve alternative text for informative images and form labels for fields placed inside Content.
- Do not rely on the border, background, or position alone to communicate state or meaning.

The local colors come from semantic theme tokens; verify text, muted text, focus indicators, and action contrast in every supported theme.

## Localization

Card contains no built-in human-readable text and does not require Paraglide messages. Titles, descriptions, actions, image alternatives, and content are supplied by the app and should follow its localization conventions.

## Dependencies

Card requires Svelte 5, the local utility helpers, and Tailwind CSS. Install its runtime and development packages with one of these command groups:

```sh
# bun
bun add clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss
```

### Shared utilities

Card imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block above includes `clsx` and `tailwind-merge`, which this code imports.

### Global CSS

Your global stylesheet must import Tailwind, set the default border color, and expose the semantic colors and radius used by Card. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--card: oklch(0.216 0.006 56.043);
	--card-foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
	* {
		@apply border-border;
	}
}
```

The app remains responsible for applying its `.dark` class when dark theme values are required.

Card requires no icon export, UI component, hook, attachment, context file, localization message, shared component stylesheet, animation package, or global keyframe. Components shown inside Card examples have their own installation requirements; follow each component's README when you use them.

## Credits

Card is adapted from the [shadcn-svelte Card](https://www.shadcn-svelte.com/docs/components/card). Its composition has been adapted to xvelte's local size option, spacing, footer treatment, styling, props types, and import conventions.

## File organization

| File                      | Responsibility                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `card-root.svelte`        | Provides the surface, size state, spacing, clipping, media handling, and footer-aware padding. |
| `card-header.svelte`      | Arranges title, description, and optional action.                                              |
| `card-title.svelte`       | Styles the primary title text.                                                                 |
| `card-description.svelte` | Styles supporting text.                                                                        |
| `card-action.svelte`      | Positions optional header-side content.                                                        |
| `card-content.svelte`     | Provides the main content inset.                                                               |
| `card-footer.svelte`      | Provides the separated footer surface and layout.                                              |
| `index.ts`                | Exports every component and matching props type.                                               |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, update the guide with the code change.

# Avatar

A composable identity image with a loading/error fallback, three local sizes, an optional badge, and helpers for overlapping groups and overflow counts. It is built on the Bits UI Avatar primitive, while xvelte supplies the visual treatment and the additional `Badge`, `Group`, and `GroupCount` parts.

Use Avatar for people, organizations, accounts, or other entities represented by a compact image or initials. Do not use it as the only accessible name for an action, as a replacement for larger editorial imagery, or when the image must expose controls, captions, zooming, or gallery behavior.

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
	import * as Avatar from "$lib/components/ui/avatar";
</script>
```

Avatar's `index.ts` exports `Root`, `Image`, `Fallback`, `Badge`, `Group`, and `GroupCount`, together with the `RootProps`, `ImageProps`, `FallbackProps`, `BadgeProps`, `GroupProps`, and `GroupCountProps` types.

## Anatomy

An individual avatar combines the root, image, and fallback. A badge is optional:

```svelte
<Avatar.Root>
	<Avatar.Image src="/avatars/ada.jpg" alt="Ada Lovelace" />
	<Avatar.Fallback>AL</Avatar.Fallback>
	<Avatar.Badge />
</Avatar.Root>
```

Compose several roots and an optional count inside a group:

```svelte
<Avatar.Group>
	<Avatar.Root><!-- Image and fallback --></Avatar.Root>
	<Avatar.Root><!-- Image and fallback --></Avatar.Root>
	<Avatar.GroupCount>+3</Avatar.GroupCount>
</Avatar.Group>
```

`Image` and `Fallback` must be descendants of the same `Root` because the Bits UI primitive coordinates their loading state through context. `Badge` should remain inside its root so its position and size follow that avatar. Your app supplies the `GroupCount` content; the component does not inspect the group or calculate a hidden-item count.

## Basic usage

```svelte
<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
</script>

<div class="flex items-center gap-3">
	<Avatar.Root>
		<Avatar.Image src="/avatars/ada.jpg" alt="" />
		<Avatar.Fallback>AL</Avatar.Fallback>
	</Avatar.Root>

	<div>
		<p class="font-medium">Ada Lovelace</p>
		<p class="text-sm text-muted-foreground">Mathematician</p>
	</div>
</div>
```

The image uses an empty `alt` here because the adjacent text already identifies the person. While the image is loading, or if it fails, Bits UI displays the fallback instead.

## Examples

### Sizes and a status badge

`size` belongs to `Root`. The fallback text and badge adapt through the root's `data-size` value:

```svelte
<div class="flex items-end gap-4">
	<Avatar.Root size="sm">
		<Avatar.Image src="/avatars/alex.jpg" alt="Alex Morgan" />
		<Avatar.Fallback>AM</Avatar.Fallback>
	</Avatar.Root>

	<Avatar.Root>
		<Avatar.Image src="/avatars/sam.jpg" alt="Sam Rivera" />
		<Avatar.Fallback>SR</Avatar.Fallback>
		<Avatar.Badge role="img" aria-label="Online" />
	</Avatar.Root>

	<Avatar.Root size="lg">
		<Avatar.Image src="/avatars/lee.jpg" alt="Lee Chen" />
		<Avatar.Fallback>LC</Avatar.Fallback>
	</Avatar.Root>
</div>
```

`Badge` supplies only the visual surface. Give a meaningful badge its own accessible text or name; use `aria-hidden="true"` when it is purely decorative.

### Accessible avatar group

Use uniform sizes within a group and provide list semantics when the collection represents people:

```svelte
<Avatar.Group role="list" aria-label="Project members">
	<Avatar.Root role="listitem" aria-label="Ada Lovelace">
		<Avatar.Image src="/avatars/ada.jpg" alt="" />
		<Avatar.Fallback>AL</Avatar.Fallback>
	</Avatar.Root>

	<Avatar.Root role="listitem" aria-label="Grace Hopper">
		<Avatar.Image src="/avatars/grace.jpg" alt="" />
		<Avatar.Fallback>GH</Avatar.Fallback>
	</Avatar.Root>

	<Avatar.GroupCount role="listitem" aria-label="3 more project members">+3</Avatar.GroupCount>
</Avatar.Group>
```

The group overlaps adjacent avatars and adds a background-colored ring around each root. `GroupCount` follows the size detected among the group's avatars; mixing root sizes in one group can produce competing size selectors and is not recommended.

### Observing image status

Bind `loadingStatus` when application behavior needs to react to loading or failure:

```svelte
<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";

	let loadingStatus = $state<"loading" | "loaded" | "error">("loading");
</script>

<Avatar.Root bind:loadingStatus delayMs={150}>
	<Avatar.Image src="/avatars/visitor.jpg" alt="Visitor profile" />
	<Avatar.Fallback>VP</Avatar.Fallback>
</Avatar.Root>

{#if loadingStatus === "error"}
	<p class="text-sm text-muted-foreground">The profile image could not be loaded.</p>
{/if}
```

`delayMs` keeps the fallback visible for the specified interval after the image has loaded, which can avoid a very brief fallback-to-image flash. When changing an already loaded `src`, reset a controlled `loadingStatus` to `"loading"` so the new source is checked.

## Public API

`Root`, `Image`, and `Fallback` wrap Bits UI. The tables below document the local surface and the most relevant inherited props; see the complete [Bits UI Avatar API reference](https://www.bits-ui.com/docs/components/avatar#api-reference) for primitive render delegation and native attributes.

### `Avatar.Root`

Type: `RootProps`, extending `AvatarPrimitive.RootProps` with xvelte's `size` option.

| Prop                    | Type                                          | Default     | xvelte behavior                                                                                       |
| ----------------------- | --------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `size`                  | `"default" \| "sm" \| "lg"`                   | `"default"` | Sets `data-size` and the root diameter; descendants use it for fallback text and badge sizing.        |
| `loadingStatus`         | `"loading" \| "loaded" \| "error"`            | `"loading"` | Bindable Bits UI state shared with `Image` and `Fallback`.                                            |
| `delayMs`               | `number`                                      | `0`         | Delays the transition from loading to loaded after image preloading succeeds.                         |
| `onLoadingStatusChange` | `(status: AvatarLoadingStatus) => void`       | `undefined` | Runs when Bits UI changes the loading status.                                                         |
| `children`              | `Snippet`                                     | `undefined` | Renders the default root contents.                                                                    |
| `child`                 | `Snippet<{ props: Record<string, unknown> }>` | `undefined` | Replaces the default root element through Bits UI render delegation.                                  |
| `ref`                   | `HTMLDivElement \| null`                      | `null`      | Bindable reference to the default root `div`; its exact type follows a delegated child when replaced. |
| `class`                 | `string`                                      | `undefined` | Merged with the local circular size, border-overlay, and selection styles.                            |

Native `div` attributes are forwarded. Bits UI preloads the source registered by `Image`, then exposes `data-status` and switches the visible part. Supplying `loadingStatus="loaded"` tells the primitive to treat the image as loaded without running its normal preload check.

### `Avatar.Image`

Type: `ImageProps`, an alias of `AvatarPrimitive.ImageProps`.

| Prop          | Type                                          | Default     | xvelte behavior                                                                                     |
| ------------- | --------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `src`         | Native image `src`                            | `undefined` | Registered with the root and preloaded by Bits UI; a missing or failed source produces error state. |
| `alt`         | `string`                                      | `undefined` | Native alternative text. Choose it according to the surrounding identity text.                      |
| `crossorigin` | Native image `crossorigin`                    | `undefined` | Participates in preloading and is forwarded to the rendered image.                                  |
| `children`    | `Snippet`                                     | `undefined` | Inherited primitive content; normally unnecessary for the default `img`.                            |
| `child`       | `Snippet<{ props: Record<string, unknown> }>` | `undefined` | Replaces the default image through Bits UI render delegation.                                       |
| `ref`         | `HTMLImageElement \| null`                    | `null`      | Bindable reference to the default `img`.                                                            |
| `class`       | `string`                                      | `undefined` | Merged with full-size, circular, square-aspect, cover-crop styles.                                  |

Native image attributes, including `referrerpolicy`, `width`, `height`, `loading`, and `aria-*`, are inherited. The rendered image remains `display: none` until the shared status is `loaded`.

### `Avatar.Fallback`

Type: `FallbackProps`, an alias of `AvatarPrimitive.FallbackProps`.

| Prop       | Type                                          | Default     | xvelte behavior                                                                    |
| ---------- | --------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `children` | `Snippet`                                     | `undefined` | Usually renders initials, a short label, or fallback content supplied by your app. |
| `child`    | `Snippet<{ props: Record<string, unknown> }>` | `undefined` | Replaces the default fallback element through Bits UI render delegation.           |
| `ref`      | `HTMLSpanElement \| null`                     | `null`      | Bindable reference to the default fallback `span`.                                 |
| `class`    | `string`                                      | `undefined` | Merged with centered, circular, muted surface and responsive fallback text styles. |

Native `span` attributes are forwarded. The fallback is visible during `loading` and `error`, and hidden when the image is `loaded`.

### `Avatar.Badge`

Type: `BadgeProps`, based on native `span` attributes with an element reference.

| Prop       | Type                      | Default     | xvelte behavior                                                                    |
| ---------- | ------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `children` | `Snippet`                 | `undefined` | Renders optional content, commonly a small icon or visually hidden status label.   |
| `ref`      | `HTMLSpanElement \| null` | `null`      | Bindable reference to the badge `span`.                                            |
| `class`    | `string`                  | `undefined` | Merged with bottom-right positioning, primary colors, background ring, and sizing. |

All remaining native `span` attributes are forwarded. The badge has no built-in meaning, icon, label, or status logic. It responds to the enclosing root's named group and `data-size` value.

### `Avatar.Group`

Type: `GroupProps`, based on native `div` attributes with an element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                                |
| ---------- | ------------------------ | ----------- | ------------------------------------------------------------------------------ |
| `children` | `Snippet`                | `undefined` | Renders avatar roots and an optional count.                                    |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the group `div`.                                         |
| `class`    | `string`                 | `undefined` | Merged with horizontal flex, negative spacing, and direct-avatar ring styling. |

All remaining native `div` attributes are forwarded. The group supplies layout only; it does not add list semantics, labels, selection, keyboard behavior, or shared state.

### `Avatar.GroupCount`

Type: `GroupCountProps`, based on native `div` attributes with an element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                                                |
| ---------- | ------------------------ | ----------- | ---------------------------------------------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders a count calculated by your app, such as `+3`, or another compact overflow indicator.   |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the count `div`.                                                         |
| `class`    | `string`                 | `undefined` | Merged with muted colors, a background ring, circular layout, and group-responsive size rules. |

All remaining native `div` attributes are forwarded. The component does not calculate, format, or localize a number. Its own size and the default size of direct SVG children respond to avatar sizes detected in the parent group.

Use `index.ts` and the exported props types as the source of truth for the local API. The installed Bits UI types define all inherited options.

## Styling and DOM contract

Avatar uses semantic Tailwind tokens and exposes no CSS variables or variant generator. Classes supplied by your app are merged after local classes with `cn`, so conflicting Tailwind utilities normally favor your values.

| Part         | `data-slot`          | Default element | Notable behavior                                                                 |
| ------------ | -------------------- | --------------- | -------------------------------------------------------------------------------- |
| `Root`       | `avatar`             | `div`           | Circular 24, 32, or 40 px surface with `data-size` and Bits UI `data-status`.    |
| `Image`      | `avatar-image`       | `img`           | Cover-cropped full-size image with Bits UI `data-status`.                        |
| `Fallback`   | `avatar-fallback`    | `span`          | Centered muted surface with Bits UI `data-status`.                               |
| `Badge`      | `avatar-badge`       | `span`          | Absolutely positioned bottom-right primary surface with a background ring.       |
| `Group`      | `avatar-group`       | `div`           | Overlaps direct avatar children by `0.5rem` and gives each a background ring.    |
| `GroupCount` | `avatar-group-count` | `div`           | Muted circular count that follows avatar size selectors in the containing group. |

Bits UI additionally owns `data-avatar-root`, `data-avatar-image`, and `data-avatar-fallback`. Treat those selectors and `data-status` as dependency-owned; prefer the xvelte `data-slot` hooks for local customization unless status-specific styling is required.

The root's visual border is a circular `::after` overlay using `border`, with dark/light mix-blend behavior. If changing Avatar from circular to another shape, apply matching radius changes to the root overlay, image, fallback, and badge placement rather than overriding only one part.

`Badge` and `GroupCount` resize direct SVG children but do not provide icons. `Group` relies on direct child roots for its ring selector.

## Accessibility

Avatar manages visual loading state but intentionally adds no identity semantics, accessible name, live announcements, focus handling, or keyboard interaction.

- Use meaningful `alt` text when the image communicates an identity not already written nearby. Use `alt=""` when adjacent text or an enclosing accessible name supplies the same information.
- Keep fallback text consistent with the identity. Initials are useful visually, but may be unclear when announced without a full name elsewhere.
- When an avatar activates an action or navigation, place it inside a real `button` or link with an accessible name. Do not make the default root `div` clickable by itself.
- A badge is semantically neutral. Add accessible status text or a suitable role/name when it communicates availability, verification, or another state; hide decorative badges from assistive technology.
- Add `role="list"` and `role="listitem"`, or equivalent semantic markup through render delegation, when a group represents a meaningful list.
- Give `GroupCount` an accessible label such as “3 more project members”; `+3` alone may not explain what is being counted.
- Loading, loaded, and error states are not announced automatically. Add status messaging in your app only when the image result is important enough to warrant an announcement.

Neither the component nor Bits UI makes Avatar interactive, so there are no built-in keyboard shortcuts.

## Localization

Avatar contains no built-in user-facing copy and uses no localization messages. Your app supplies image alternative text, fallback content, badge labels, group labels, and count formatting. Localize a count's accessible label even when the visible value remains a compact language-neutral form such as `+3`.

Do not translate the technical `data-slot`, `data-size`, or `data-status` values.

## Dependencies

Avatar requires Svelte 5, Bits UI, the local `cn` helper, and Tailwind CSS. Install its runtime and development packages with one of the following command groups:

```sh
# bun
bun add bits-ui clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui clsx tailwind-merge
pnpm add -D tailwindcss
```

### Shared utilities

The component imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block above includes the `clsx` and `tailwind-merge` imports used by this code.

Your global stylesheet must import Tailwind and expose the semantic colors used by the component. This is the minimum required setup; replace the sample values with your app's theme while preserving the variable names and `@theme` mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
}

.dark {
	--background: /* application dark background */;
	--primary: /* application dark primary */;
	--primary-foreground: /* application dark primary foreground */;
	--muted: /* application dark muted surface */;
	--muted-foreground: /* application dark muted foreground */;
	--border: /* application dark border */;
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
}
```

The `dark` custom variant enables the root border overlay's dark-mode blend utility. The application remains responsible for applying its `.dark` class, normally through root-level theme management.

No `tw-animate-css` import, animation, keyframe, radius token, icon export from `$lib/icons`, other xvelte component, hook, attachment, context module, localization message, or shared component stylesheet is required. Icons placed inside `Badge` or `GroupCount` are optional content supplied by your app and bring their own dependency.

## Credits

Avatar is adapted from the [shadcn-svelte Avatar](https://www.shadcn-svelte.com/docs/components/avatar). Its sizing, badge, group, styling, utility, and import conventions have been adapted for xvelte.

## File organization

| File                        | Responsibility                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `avatar-root.svelte`        | Wraps the Bits UI root and adds local sizes, the border overlay, and stable slot.    |
| `avatar-image.svelte`       | Wraps the Bits UI image and supplies circular cover-crop styling.                    |
| `avatar-fallback.svelte`    | Wraps the Bits UI fallback and supplies its muted surface and size-aware typography. |
| `avatar-badge.svelte`       | Renders the optional size-aware badge on an individual avatar.                       |
| `avatar-group.svelte`       | Lays out overlapping avatar roots and adds separation rings.                         |
| `avatar-group-count.svelte` | Renders an overflow count supplied by your app with group-aware sizing.              |
| `index.ts`                  | Exports all public components and props types.                                       |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, verify the installed Bits UI API and update this guide with the code change.

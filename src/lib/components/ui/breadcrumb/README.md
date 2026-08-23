# Breadcrumb

A composable navigation trail that represents the hierarchy leading to the current page. It provides semantic navigation and ordered-list parts, links, the current-page marker, decorative separators, and a visual ellipsis for collapsed paths.

Use Breadcrumb on nested sites or applications where people benefit from understanding and navigating the current resource hierarchy. Do not use it for a flat primary navigation menu, a stepper whose items represent progress, browser history, or paths so shallow that the trail adds no useful context.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Breadcrumb from "$lib/components/ui/breadcrumb";
</script>
```

Breadcrumb's `index.ts` exports `Root`, `List`, `Item`, `Link`, `Page`, `Separator`, and `Ellipsis`, together with the `RootProps`, `ListProps`, `ItemProps`, `LinkProps`, `PageProps`, `SeparatorProps`, and `EllipsisProps` types.

---

## Anatomy

A complete breadcrumb follows this hierarchy:

```svelte
<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
		</Breadcrumb.Item>

		<Breadcrumb.Separator />

		<Breadcrumb.Item>
			<Breadcrumb.Page>Current page</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
```

`Root` renders the navigation landmark, `List` the ordered path, and each `Item` one location. Place a `Separator` between items, never inside a link. Use `Page` for the current location instead of linking the page to itself.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Breadcrumb from "$lib/components/ui/breadcrumb";
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/components">Components</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
```

The root supplies a localized “Breadcrumb” accessible label. Links use native anchor behavior, separators are hidden from assistive technology, and the final page exposes `aria-current="page"`.

---

## Examples

### Custom separator

Pass children to `Separator` to replace its default chevron:

```svelte
<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/docs">Documentation</Breadcrumb.Link>
		</Breadcrumb.Item>

		<Breadcrumb.Separator>/</Breadcrumb.Separator>

		<Breadcrumb.Item>
			<Breadcrumb.Page>Installation</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
```

The separator remains `role="presentation"` and `aria-hidden="true"`, so custom separator content must be decorative.

### Collapsed path

`Ellipsis` visually represents omitted intermediate locations. The application decides which locations to collapse:

```svelte
<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Ellipsis />
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/docs/components">Components</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
```

The ellipsis has no built-in expansion behavior. Compose a separately accessible menu or disclosure when people must reach the omitted locations.

### Router-specific link

`Link.child` lets your own link component render the element while receiving Breadcrumb's attributes and classes:

```svelte
<script lang="ts">
	import * as Breadcrumb from "$lib/components/ui/breadcrumb";
	import AppLink from "$lib/components/app-link.svelte";
</script>

<Breadcrumb.Link href="/account">
	{#snippet child({ props })}
		<AppLink {...props}>Account</AppLink>
	{/snippet}
</Breadcrumb.Link>
```

The delegated component must spread every received prop onto its interactive element. When `child` is present, the normal `children` snippet and default anchor are not rendered, and the current implementation does not pass or bind `Link.ref` to the delegated element.

### Overriding the landmark label

Applications with more than one breadcrumb landmark should give each one a distinct translated label:

```svelte
<Breadcrumb.Root aria-label="Product hierarchy">
	<!-- List and items -->
</Breadcrumb.Root>
```

Forwarded props are applied after the built-in label, so `aria-label` overrides the localized default.

---

## Public API

Breadcrumb is implemented with native elements rather than a headless primitive. Every public part forwards the native attributes described below.

### `Breadcrumb.Root`

Type: `RootProps`, based on native `nav`/HTML element attributes with an element reference.

| Prop         | Type                  | Default                  | xvelte behavior                                                 |
| ------------ | --------------------- | ------------------------ | --------------------------------------------------------------- |
| `children`   | `Snippet`             | `undefined`              | Renders the breadcrumb list and any additional content.         |
| `aria-label` | Native `aria-label`   | Localized `"Breadcrumb"` | Labels the navigation landmark; a forwarded value overrides it. |
| `ref`        | `HTMLElement \| null` | `null`                   | Bindable reference to the rendered `nav`.                       |
| `class`      | `string`              | `undefined`              | Applied to the root navigation element.                         |

Remaining native HTML attributes are forwarded to `nav`. Root owns no path data, collapse logic, navigation state, or context; your app composes every descendant explicitly.

### `Breadcrumb.List`

Type: `ListProps`, based on native ordered-list attributes.

| Prop       | Type                       | Default     | xvelte behavior                                                                    |
| ---------- | -------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `children` | `Snippet`                  | `undefined` | Renders items and separators.                                                      |
| `ref`      | `HTMLOListElement \| null` | `null`      | Bindable reference to the `ol`.                                                    |
| `class`    | `string`                   | `undefined` | Merged with wrapping flex layout, small gaps, muted foreground, and text wrapping. |

Remaining native `ol` attributes are forwarded.

### `Breadcrumb.Item`

Type: `ItemProps`, based on native list-item attributes.

| Prop       | Type                    | Default     | xvelte behavior                                              |
| ---------- | ----------------------- | ----------- | ------------------------------------------------------------ |
| `children` | `Snippet`               | `undefined` | Renders a link, current page, ellipsis, or composed control. |
| `ref`      | `HTMLLIElement \| null` | `null`      | Bindable reference to the `li`.                              |
| `class`    | `string`                | `undefined` | Merged with inline-flex alignment and a small gap.           |

Remaining native `li` attributes are forwarded.

### `Breadcrumb.Link`

Type: `LinkProps`, based on native anchor attributes plus a local render-delegation snippet.

| Prop       | Type                                         | Default     | xvelte behavior                                                                          |
| ---------- | -------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `href`     | Native anchor `href`                         | `undefined` | Forwarded to the default or delegated link; it does not resolve or validate routes.      |
| `children` | `Snippet`                                    | `undefined` | Renders inside the default anchor and is ignored when `child` is supplied.               |
| `child`    | `Snippet<[{ props: HTMLAnchorAttributes }]>` | `undefined` | Replaces the default anchor and receives one object containing the attributes to spread. |
| `ref`      | `HTMLAnchorElement \| null`                  | `null`      | Bindable only for the default anchor; it is not included in delegated `props`.           |
| `class`    | `string`                                     | `undefined` | Merged with foreground hover and color-transition styles before being forwarded.         |

Remaining native anchor attributes are forwarded. The delegated props include `data-slot`, merged `class`, `href`, and all remaining attributes. The child snippet is responsible for rendering an appropriate interactive link and forwarding those props.

### `Breadcrumb.Page`

Type: `PageProps`, based on native `span` attributes.

| Prop            | Type                      | Default     | xvelte behavior                                                |
| --------------- | ------------------------- | ----------- | -------------------------------------------------------------- |
| `children`      | `Snippet`                 | `undefined` | Renders the current page name.                                 |
| `role`          | Native ARIA role          | `"link"`    | Represents the current location using disabled-link semantics. |
| `aria-disabled` | `boolean \| "true"`       | `"true"`    | Marks the current-page link representation as unavailable.     |
| `aria-current`  | ARIA current token        | `"page"`    | Identifies the current location within the breadcrumb.         |
| `ref`           | `HTMLSpanElement \| null` | `null`      | Bindable reference to the current-page `span`.                 |
| `class`         | `string`                  | `undefined` | Merged with normal font weight and foreground text.            |

Remaining native `span` attributes are forwarded and can override the default ARIA attributes. Preserve `aria-current="page"` unless the composition intentionally changes its semantics.

### `Breadcrumb.Separator`

Type: `SeparatorProps`, based on native list-item attributes.

| Prop          | Type                    | Default          | xvelte behavior                                                   |
| ------------- | ----------------------- | ---------------- | ----------------------------------------------------------------- |
| `children`    | `Snippet`               | `undefined`      | Replaces the default semantic `ChevronRightIcon` when present.    |
| `role`        | Native ARIA role        | `"presentation"` | Removes separator semantics from the accessibility tree.          |
| `aria-hidden` | `boolean \| "true"`     | `"true"`         | Hides the separator and custom content from assistive technology. |
| `ref`         | `HTMLLIElement \| null` | `null`           | Bindable reference to the separator `li`.                         |
| `class`       | `string`                | `undefined`      | Merged with a `0.875rem` size rule for direct SVG children.       |

Remaining native `li` attributes are forwarded. Because props from your app are applied last, they can replace the presentation attributes, but separators should normally remain decorative.

### `Breadcrumb.Ellipsis`

Type: `EllipsisProps`, based on native `span` attributes with `children` removed.

| Prop          | Type                      | Default          | xvelte behavior                                                      |
| ------------- | ------------------------- | ---------------- | -------------------------------------------------------------------- |
| `role`        | Native ARIA role          | `"presentation"` | Marks the ellipsis wrapper as visual presentation.                   |
| `aria-hidden` | `boolean \| "true"`       | `"true"`         | Hides the entire wrapper, icon, and internal localized text from AT. |
| `ref`         | `HTMLSpanElement \| null` | `null`           | Bindable reference to the ellipsis `span`.                           |
| `class`       | `string`                  | `undefined`      | Merged with a centered square and a `1rem` direct-SVG size.          |

Ellipsis always renders `EllipsisIcon` plus an internal screen-reader-only localized “More” string, but the wrapper's default `aria-hidden="true"` means neither is announced. It accepts no `children` and has no click, menu, expansion, or collapse behavior. Remaining native `span` attributes are forwarded.

Use `index.ts` and the exported props types as the source of truth for the public API.

---

## Styling and DOM contract

Breadcrumb uses semantic Tailwind colors and exposes no variants or CSS variables of its own. Classes passed to its parts are merged after local classes with `cn`, so conflicting Tailwind utilities normally favor the classes from your app.

| Part        | `data-slot`            | Element | Notable behavior                                                                  |
| ----------- | ---------------------- | ------- | --------------------------------------------------------------------------------- |
| `Root`      | `breadcrumb`           | `nav`   | Navigation landmark with a localized label.                                       |
| `List`      | `breadcrumb-list`      | `ol`    | Wrapping flex path with muted text and breakable long labels.                     |
| `Item`      | `breadcrumb-item`      | `li`    | Inline-flex container for one path location or composed control.                  |
| `Link`      | `breadcrumb-link`      | `a`     | Foreground hover transition; your link component owns the element when delegated. |
| `Page`      | `breadcrumb-page`      | `span`  | Foreground current-page label with ARIA current/disabled link semantics.          |
| `Separator` | `breadcrumb-separator` | `li`    | Decorative default/custom separator placed between location items.                |
| `Ellipsis`  | `breadcrumb-ellipsis`  | `span`  | Decorative fixed-size collapsed-path marker with no interaction.                  |

`Separator` and `Ellipsis` size only direct SVG children. The default icons are imported through xvelte's semantic icon facade, not directly from Tabler in component files.

The link's delegated `props` contain the stable hook, but the custom component must spread them for the hook and styles to reach the DOM. Forwarded props are spread last across the implementation, so overriding `data-slot` or required ARIA values can break the documented contract.

---

## Accessibility

The default structure follows the expected breadcrumb pattern: a labeled `nav`, an ordered list of locations, native links for ancestors, a current-page marker, and hidden visual separators.

- Keep one `List` inside each `Root` and represent path locations with `Item` elements so the hierarchy remains understandable.
- Use links for every navigable ancestor and `Page` for the current location. Avoid linking the current page to itself.
- Preserve `aria-current="page"` on exactly one current-page part.
- Override the root's label with distinct localized text when a page contains multiple breadcrumb landmarks.
- Keep separators decorative. Their symbols duplicate structure already conveyed by the ordered list.
- Ellipsis is visual-only and does not expose or open omitted locations. If it triggers a menu, place it inside a separately labeled interactive control and manage that menu's complete keyboard/focus behavior.
- A custom link rendered through `child` must remain a real link, spread all supplied props, and preserve normal focus and keyboard navigation.
- Keep link and page names concise but unambiguous. Do not rely on separator shape, color, or truncation to communicate hierarchy.

Breadcrumb adds no custom keyboard behavior; navigation uses native links and any separately composed interactive components.

---

## Localization

Breadcrumb uses two reusable-library messages from `messages/en.json`:

| Message ID               | English value | Used by                                                                   |
| ------------------------ | ------------- | ------------------------------------------------------------------------- |
| `orchid_tern_breadcrumb` | `Breadcrumb`  | Default accessible label on `Root`.                                       |
| `azure_beaver_more`      | `More`        | Screen-reader-only text inside `Ellipsis`; hidden by its default wrapper. |

Your app supplies all visible location names, custom landmark labels, menu labels, omitted-location controls, and route-specific copy. Translate them through your app's localization system.

Do not translate URLs, `data-slot` values, ARIA tokens, or internal message IDs.

---

## Dependencies

Breadcrumb requires Svelte 5, the Tabler Svelte icon package, the local utility helpers, generated Paraglide messages, and Tailwind CSS. Install its runtime and development packages with one of the following command groups:

```sh
# bun
bun add @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss @inlang/paraglide-js

# npm
npm install @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss @inlang/paraglide-js

# pnpm
pnpm add @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss @inlang/paraglide-js
```

### Shared utilities

The component imports `cn`, `WithElementRef`, and `WithoutChildren` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block above includes the `clsx` and `tailwind-merge` imports used by this code.

The following semantic exports must exist in `$lib/icons`:

```ts
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
export { default as EllipsisIcon } from "@tabler/icons-svelte/icons/dots";
```

Copy the two exact message IDs and English values listed in [Localization](#localization) into your Paraglide message file and compile them so `$lib/paraglide/messages.js` exports both functions. They are not duplicated here. If your project uses another localization system, adapt the two imports and calls while preserving localized defaults.

Your global stylesheet must import Tailwind and expose the two semantic colors used by Breadcrumb:

```css
@import "tailwindcss";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted-foreground: var(--muted-foreground);
}
```

No Bits UI package, `tw-animate-css` import, custom dark variant, animation, keyframe, radius token, other xvelte component, hook, attachment, context module, or shared component stylesheet is required. Dropdowns, disclosures, and router-specific link components shown in advanced examples are optional and only need to be installed if your app uses them.

---

## Credits

Breadcrumb is adapted from the [shadcn-svelte Breadcrumb](https://www.shadcn-svelte.com/docs/components/breadcrumb). Its icon facade, localization, public names, and local link delegation have been aligned with xvelte.

---

## File organization

| File                          | Responsibility                                                        |
| ----------------------------- | --------------------------------------------------------------------- |
| `breadcrumb-root.svelte`      | Renders and labels the navigation landmark.                           |
| `breadcrumb-list.svelte`      | Renders the ordered, wrapping path list.                              |
| `breadcrumb-item.svelte`      | Renders one list item in the path.                                    |
| `breadcrumb-link.svelte`      | Renders a native link or delegates it through the `child` snippet.    |
| `breadcrumb-page.svelte`      | Renders the current-page marker and ARIA state.                       |
| `breadcrumb-separator.svelte` | Renders the decorative default chevron or custom separator.           |
| `breadcrumb-ellipsis.svelte`  | Renders the decorative collapsed-path icon and localized hidden text. |
| `index.ts`                    | Exports all seven public components and their props types.            |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, update the guide together with the code change.

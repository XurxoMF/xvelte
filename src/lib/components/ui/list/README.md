# List

A semantic list component with one Root that switches between native ordered and unordered markup, plus an Item for native list entries. It provides consistent indentation, markers, reusable class variants, configurable spacing, item line height, precise ordered-list attributes, and stable styling hooks without adding application state or data transformation.

Use List for prose, instructions, rankings, requirements, and other content whose grouping or order has semantic meaning. Do not use it for interactive menus, selectable collections, virtualized datasets, definition lists, or tabular data.

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
- [File organization](#file-organization)

## Import

Import the components through the public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as List from "$lib/components/ui/list";
</script>
```

List's `index.ts` exports `Root`, `Item`, the `RootProps` and `ItemProps` component types, the `RootVariants` and `RootSpacings` option types, and the `rootVariants` styling function.

## Anatomy

Root contains one or more Items:

```svelte
<List.Root variant="unordered">
	<List.Item>First item</List.Item>
	<List.Item>Second item</List.Item>
</List.Root>
```

Root renders `ul` for `variant="unordered"` and `ol` for `variant="ordered"`. Item always renders `li`. The components do not create Items from data automatically.

## Basic usage

```svelte
<script lang="ts">
	import * as List from "$lib/components/ui/list";
</script>

<List.Root>
	<List.Item>Create a project.</List.Item>
	<List.Item>Invite the team.</List.Item>
	<List.Item>Publish the first release.</List.Item>
</List.Root>
```

Root defaults to `variant="unordered"`. Use the ordered variant when sequence, rank, or progression changes the meaning.

## Examples

### Ordered steps

```svelte
<List.Root variant="ordered">
	<List.Item>Open account settings.</List.Item>
	<List.Item>Select the Security section.</List.Item>
	<List.Item>Enable two-factor authentication.</List.Item>
</List.Root>
```

The ordered variant renders `ol` and uses decimal markers by default.

### Native ordered-list options

When the variant is ordered, Root accepts Svelte's complete `HTMLOlAttributes`, including `start`, `reversed`, and the native numbering `type`:

```svelte
<List.Root variant="ordered" start={3} reversed type="A">
	<List.Item>Deploy the application.</List.Item>
	<List.Item>Run the production checks.</List.Item>
	<List.Item>Approve the release.</List.Item>
</List.Root>
```

Item uses `HTMLLiAttributes`, so an ordered Item may set its native `value` when a particular entry must change the sequence:

```svelte
<List.Root variant="ordered">
	<List.Item>First</List.Item>
	<List.Item value={5}>Fifth</List.Item>
	<List.Item>Sixth</List.Item>
</List.Root>
```

### Dynamic variant

Use a normal string value when application state chooses the semantic list type:

```svelte
<script lang="ts">
	import * as List from "$lib/components/ui/list";

	let variant = $state<List.RootVariants>("unordered");
</script>

<button type="button" onclick={() => (variant = variant === "ordered" ? "unordered" : "ordered")}>
	Use {variant === "ordered" ? "bullets" : "numbers"}
</button>

<List.Root {variant}>
	<List.Item>Prepare the workspace.</List.Item>
	<List.Item>Review the configuration.</List.Item>
</List.Root>
```

Changing `variant` replaces the underlying `ul` or `ol`. Any bound Root reference updates to the new element, and browser focus or element-local state on the old root is not preserved.

### Spacing variants

```svelte
<List.Root spacing="compact">
	<List.Item>Draft</List.Item>
	<List.Item>In review</List.Item>
	<List.Item>Published</List.Item>
</List.Root>

<List.Root spacing="none">
	<List.Item>North</List.Item>
	<List.Item>South</List.Item>
</List.Root>
```

`default` adds `mt-2`, `compact` adds `mt-1`, and `none` adds `mt-0` to every direct Item.

### Reuse the Root classes

Use `rootVariants` when app-owned native list markup needs the same indentation, markers, and spacing without rendering `List.Root`:

```svelte
<script lang="ts">
	import { rootVariants } from "$lib/components/ui/list";
</script>

<ol class={rootVariants({ variant: "ordered", spacing: "compact", class: "text-muted-foreground" })}>
	<li>Prepare the release.</li>
	<li>Run the production checks.</li>
</ol>
```

The function returns classes only. It does not select an `ol` or `ul`, add `data-slot`, `data-variant`, or `data-spacing`, or filter ordered-list attributes.

### Nested lists

Place a complete Root inside an Item to preserve valid native list structure:

```svelte
<List.Root>
	<List.Item>
		Frontend
		<List.Root spacing="compact">
			<List.Item>Svelte</List.Item>
			<List.Item>Tailwind CSS</List.Item>
		</List.Root>
	</List.Item>

	<List.Item>
		Release process
		<List.Root variant="ordered" spacing="compact">
			<List.Item>Build</List.Item>
			<List.Item>Verify</List.Item>
			<List.Item>Deploy</List.Item>
		</List.Root>
	</List.Item>
</List.Root>
```

Do not place a nested `ol` or `ul` directly beside an Item; it belongs inside the parent Item whose content it expands.

### Render from data

```svelte
<script lang="ts">
	import * as List from "$lib/components/ui/list";

	const requirements = ["A verified email address", "An active workspace", "Administrator access"];
</script>

<List.Root aria-label="Requirements">
	{#each requirements as requirement (requirement)}
		<List.Item>{requirement}</List.Item>
	{/each}
</List.Root>
```

Data iteration belongs to the app. Use a stable key when entries can change.

## Public API

The components are native element wrappers. They expose no callbacks, application state, controlled values, or custom child delegation. The component's `index.ts` and exported types are the source of truth.

### `List.Root`

Type: `RootProps`, based on the common native attributes of `ol` and `ul`, plus the ordered-list attributes `start`, `reversed`, and `type`.

| Prop       | Type                                           | Default       | xvelte behavior                                                 |
| ---------- | ---------------------------------------------- | ------------- | --------------------------------------------------------------- |
| `variant`  | `"ordered" \| "unordered"`                     | `"unordered"` | Chooses both the semantic element and its default marker style. |
| `spacing`  | `"default" \| "compact" \| "none"`             | `"default"`   | Controls the top margin applied to every direct `li` child.     |
| `children` | `Snippet`                                      | `undefined`   | Renders Items inside the selected list element.                 |
| `ref`      | `HTMLOListElement \| HTMLUListElement \| null` | `null`        | Bindable reference whose element type follows `variant`.        |
| `class`    | `string`                                       | `undefined`   | Merged after the indentation, marker, and spacing classes.      |

The ordered-only native options `start`, `reversed`, and `type` remain typed on Root so they work with both a literal ordered variant and a dynamic `RootVariants` value. They are forwarded only while `variant="ordered"`; Root omits them from the rendered `ul` while unordered. Generic attributes, ARIA attributes, data attributes, styles, and event handlers are forwarded to either element.

`RootVariants` and `RootSpacings` are derived from `rootVariants` and export the accepted option unions for application state, wrapper props, and reusable configurations.

### `rootVariants`

`rootVariants` is the Tailwind Variants function used by Root. It accepts `variant`, `spacing`, and an optional `class` value:

```ts
const className = rootVariants({
	variant: "unordered",
	spacing: "none",
	class: "text-muted-foreground"
});
```

It defaults to `variant="unordered"` and `spacing="default"`, matching the component. Supplying `class` merges custom utilities after the local variants. The function adds presentation only; consumers remain responsible for using the matching semantic list element.

### `List.Item`

Type: `ItemProps`, based on `HTMLLiAttributes`.

| Prop       | Type                    | Default     | xvelte behavior                                                              |
| ---------- | ----------------------- | ----------- | ---------------------------------------------------------------------------- |
| `children` | `Snippet`               | `undefined` | Renders prose, inline content, or a nested Root.                             |
| `value`    | `number`                | `undefined` | Native ordered-list value override; meaningful when Item belongs to an `ol`. |
| `ref`      | `HTMLLIElement \| null` | `null`      | Bindable list-item reference.                                                |
| `class`    | `string`                | `undefined` | Merged after the local line-height class.                                    |

Remaining `li` attributes and event handlers are forwarded. Item does not inspect its parent or validate that it belongs to a list.

## Styling and DOM contract

Stable xvelte hooks:

| Part             | Element | `data-slot` | Additional attributes                      |
| ---------------- | ------- | ----------- | ------------------------------------------ |
| `Root` ordered   | `ol`    | `list`      | `data-variant="ordered"`, `data-spacing`   |
| `Root` unordered | `ul`    | `list`      | `data-variant="unordered"`, `data-spacing` |
| `Item`           | `li`    | `list-item` | —                                          |

Root builds its classes with the exported `rootVariants` function. Its base always uses logical start margin `ms-6`; the ordered variant uses decimal markers and the unordered variant uses disc markers. The logical margin follows text direction, so indentation moves to the appropriate inline-start side in right-to-left layouts.

Spacing is implemented with a direct-child selector:

| `spacing` | Direct `li` class |
| --------- | ----------------- |
| `default` | `mt-2`            |
| `compact` | `mt-1`            |
| `none`    | `mt-0`            |

The selector does not style deeper Items; every nested Root supplies its own spacing. Item independently uses `leading-7`.

Every public `class` prop is merged through `cn()`, so later conflicting Tailwind utilities normally win. Use the stable slots and data attributes when custom styling depends on the selected variant or spacing.

## Accessibility

List relies on native `ol`, `ul`, and `li` semantics and adds no custom ARIA behavior.

- Use `variant="ordered"` when sequence, rank, or count matters; use `variant="unordered"` when it does not.
- Keep Items as direct children of Root, apart from Svelte's non-rendering control-flow blocks.
- Place nested Roots inside the Item they expand.
- Do not remove list semantics with `role="none"` or `role="presentation"` unless an equivalent accessible structure exists.
- Add an accessible name with `aria-label` or `aria-labelledby` when several nearby lists need to be distinguished and surrounding text does not identify them.
- Do not use List as a menu or listbox. Interactive collection patterns require their corresponding roles, focus management, selection state, and keyboard behavior.
- Marker style alone must not carry information that is absent from the item text.
- Changing `variant` replaces the semantic root element. Avoid changing it while a user is interacting with content inside the list.

## Localization

List has no built-in user-facing copy and imports no localization messages. Your app supplies and translates every Item, list label, heading, instruction, and accessible name.

Ordered numbering and unordered marker shapes come from CSS and the browser. Logical indentation follows the document's text direction automatically. Variant names, spacing names, native attributes, and `data-*` values are technical identifiers and are not translated.

## Dependencies

List expects a Svelte 5 project using Tailwind CSS 4. It has no primitive library, icon package, localization package, other xvelte component, hook, attachment, context, or shared component style dependency.

Install Tailwind Variants and the class-merging packages as runtime dependencies, then Tailwind as a development dependency:

```sh
# Bun
bun add clsx tailwind-merge tailwind-variants
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge tailwind-variants
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge tailwind-variants
pnpm add -D tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/list` component folder:

- `list-root.svelte`
- `list-item.svelte`
- `index.ts`
- `README.md`

The previous `list-ordered.svelte` and `list-unordered.svelte` files are not part of the current API and must not be copied.

### Shared utilities

Root and Item import `cn`; their public types use `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when absent:

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

The package installation block includes `clsx` and `tailwind-merge`. Root imports `tv` and `VariantProps` from `tailwind-variants`; no additional setup is required for that package.

### Global CSS

The components use Tailwind utilities without semantic color variables, dark-mode selectors, animations, radius values, or base-layer rules. The only required global stylesheet code is:

```css
@import "tailwindcss";
```

List requires no `tw-animate-css` import, semantic CSS variable, `@theme` mapping, keyframe, icon export from `src/lib/icons.ts`, localization message, image, font, browser API, network service, or additional layout rule.

## File organization

| File               | Responsibility                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `list-root.svelte` | Ordered/unordered element selection, exported class variants, precise native props, markers, indentation, spacing, and stable attributes. |
| `list-item.svelte` | Native list item, value support, line height, stable slot, children, and forwarded attributes.                                            |
| `index.ts`         | Public components, discriminated props, option types, and `rootVariants` export.                                                          |
| `README.md`        | Installation, API, styling, accessibility, localization, and usage guide.                                                                 |

The component's `index.ts` and exported types are the source of truth for the public API.

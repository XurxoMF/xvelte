# Button Group

A layout primitive for visually joining related controls into horizontal or vertical groups. It normalizes adjoining borders and radii, raises focused children above their neighbors, supports nested groups, and includes optional text and separator parts.

Use Button Group for related actions or compact combinations of buttons, inputs, and selectors. Do not use it as a selection model, toggle group, toolbar with arrow-key navigation, segmented control without explicit state semantics, or a substitute for labeling unrelated controls.

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

Import Button Group and the controls composed inside it from their public barrels:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as ButtonGroup from "$lib/components/ui/button-group";
</script>
```

Button Group's `index.ts` exports `Root`, `Text`, and `Separator`, the `RootProps`, `RootOrientations`, `TextProps`, and `SeparatorProps` types, and the `rootVariants` styling function.

## Anatomy

Compose controls as direct children of `Root` so its selectors can join them:

```svelte
<ButtonGroup.Root aria-label="Related actions">
	<Button.Root variant="outline">First action</Button.Root>
	<Button.Root variant="outline">Second action</Button.Root>
</ButtonGroup.Root>
```

`Text` and `Separator` are optional:

```svelte
<ButtonGroup.Root>
	<ButtonGroup.Text>Label</ButtonGroup.Text>
	<!-- Control supplied by your app -->
	<ButtonGroup.Separator />
	<!-- Control supplied by your app -->
</ButtonGroup.Root>
```

Direct children need a `data-slot` attribute for the root's edge, border, and radius selectors. xvelte controls already expose stable slots. For native elements, add a `data-slot` and compatible border/radius styles yourself.

## Basic usage

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as ButtonGroup from "$lib/components/ui/button-group";
</script>

<ButtonGroup.Root aria-label="Document actions">
	<Button.Root variant="outline">Save</Button.Root>
	<Button.Root variant="outline">Preview</Button.Root>
	<Button.Root variant="outline">Publish</Button.Root>
</ButtonGroup.Root>
```

The root supplies `role="group"` and connected layout only. Each button keeps its native focus, keyboard, event, and disabled behavior.

## Examples

### Vertical orientation

```svelte
<ButtonGroup.Root orientation="vertical" aria-label="Item actions">
	<Button.Root variant="outline" onclick={moveUp}>Move up</Button.Root>
	<Button.Root variant="outline" onclick={duplicate}>Duplicate</Button.Root>
	<Button.Root variant="outline" onclick={remove}>Delete</Button.Root>
</ButtonGroup.Root>
```

Orientation changes flex direction and which borders/radii are collapsed. It does not create toggle state, enforce a single selection, or add arrow-key navigation. Use the dedicated Toggle Group when those behaviors are required.

### Text prefix

`Text` adds a non-interactive segment with the same connected shape:

```svelte
<script lang="ts">
	import * as ButtonGroup from "$lib/components/ui/button-group";
	import * as Input from "$lib/components/ui/input";

	let domain = $state("");
</script>

<ButtonGroup.Root class="w-full" aria-label="Website address">
	<ButtonGroup.Text>https://</ButtonGroup.Text>
	<Input.Root bind:value={domain} aria-label="Domain" placeholder="example.com" />
</ButtonGroup.Root>
```

Direct native inputs receive `flex: 1` from the root; the xvelte Input also carries a `data-slot`, so it participates in the connected-border selectors.

### Delegated text element

`Text.child` can replace the default `div` when a label or another semantic element should own the local styling:

```svelte
<ButtonGroup.Root class="w-full">
	<ButtonGroup.Text>
		{#snippet child({ props })}
			<label {...props} for="amount">Amount</label>
		{/snippet}
	</ButtonGroup.Text>

	<input id="amount" data-slot="amount-input" class="min-w-0 flex-1 border px-2" inputmode="decimal" />
</ButtonGroup.Root>
```

The delegated element must spread every supplied prop. When `child` is present, the current implementation does not pass or bind `Text.ref` to the delegated element.

### Separator

The default separator orientation is vertical, which fits a horizontal group:

```svelte
<ButtonGroup.Root aria-label="Export actions">
	<Button.Root variant="outline">Export</Button.Root>
	<ButtonGroup.Separator />
	<Button.Root variant="outline">Export options</Button.Root>
</ButtonGroup.Root>
```

For a vertical group, explicitly make the separator horizontal:

```svelte
<ButtonGroup.Root orientation="vertical" aria-label="Export actions">
	<Button.Root variant="outline">Export</Button.Root>
	<ButtonGroup.Separator orientation="horizontal" />
	<Button.Root variant="outline">Export options</Button.Root>
</ButtonGroup.Root>
```

Root and Separator do not share context, so the separator does not infer the perpendicular orientation automatically.

### Nested groups

Directly nested groups receive a gap instead of being visually fused into one uninterrupted control:

```svelte
<ButtonGroup.Root aria-label="Pagination controls">
	<ButtonGroup.Root aria-label="Pages 1 through 3">
		<Button.Root variant="outline">1</Button.Root>
		<Button.Root variant="outline">2</Button.Root>
		<Button.Root variant="outline">3</Button.Root>
	</ButtonGroup.Root>

	<ButtonGroup.Root aria-label="Page navigation">
		<Button.Root variant="outline">Previous</Button.Root>
		<Button.Root variant="outline">Next</Button.Root>
	</ButtonGroup.Root>
</ButtonGroup.Root>
```

Each nested root remains a separate `role="group"` and should have its own accessible name when the distinction is meaningful.

## Public API

### `ButtonGroup.Root`

Type: `RootProps`, based on native `div` attributes with a bindable element reference and local orientation prop.

| Prop          | Type                         | Default        | xvelte behavior                                                                                 |
| ------------- | ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Controls flex direction, joined edges, collapsed borders, and the public `data-orientation`.    |
| `children`    | `Snippet`                    | `undefined`    | Renders controls, text segments, separators, or nested groups.                                  |
| `role`        | Native ARIA role             | `"group"`      | Groups related descendants without changing their individual interaction.                       |
| `ref`         | `HTMLElement \| null`        | `null`         | Bindable reference to the root `div`; the local shared helper exposes the broader element type. |
| `class`       | `string`                     | `undefined`    | Merged after the generated orientation classes with `cn`.                                       |

Remaining native `div` attributes are forwarded. Because the spread is last, props from your app can override `role`, `data-slot`, or `data-orientation`; doing so can break semantics or local descendant styling and is not recommended.

Root has no value, selection, disabled state, roving focus, keyboard handler, size prop, shared context, or event callback. Configure each child control independently.

### Orientations

Type: `RootOrientations`.

| Orientation  | Layout and edge behavior                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `horizontal` | Row layout; removes adjoining left borders, inner left/right radii, and restores the final direct slot's right radius.    |
| `vertical`   | Column layout; removes adjoining top borders, inner top/bottom radii, and restores the final direct slot's bottom radius. |

Both orientations act on direct children with any `data-slot`. Non-slot siblings do not participate in the joining logic and can affect which slot is visually last.

### `ButtonGroup.Text`

Type: `TextProps`, based on native `div` attributes plus local render delegation.

| Prop       | Type                                            | Default     | xvelte behavior                                                                            |
| ---------- | ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `children` | `Snippet`                                       | `undefined` | Renders inside the default `div`; it is also included in delegated props.                  |
| `child`    | `Snippet<[{ props: Record<string, unknown> }]>` | `undefined` | Replaces the default element and receives merged attributes to spread.                     |
| `ref`      | `HTMLElement \| null`                           | `null`      | Bindable for the default `div`; it is not supplied to the delegated child.                 |
| `class`    | `string`                                        | `undefined` | Merged with muted surface, border, radius, spacing, typography, and descendant SVG styles. |

Remaining native `div` attributes are forwarded to the default or delegated element. `Text` adds no role or label semantics; use `child` when its content should be a native `label` or another meaningful element.

### `ButtonGroup.Separator`

Type: `SeparatorProps`, an alias of the local Separator component's `RootProps`, which wraps Bits UI.

| Prop          | Type                         | Default      | xvelte behavior                                                                             |
| ------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Controls the line axis; this local default differs from the underlying Separator default.   |
| `decorative`  | `boolean`                    | `false`      | When true, hides the separator from assistive technology through the Bits UI primitive.     |
| `children`    | `Snippet`                    | `undefined`  | Inherited from Separator/Bits UI; normally unnecessary for a line separator.                |
| `child`       | Bits UI render snippet       | `undefined`  | Replaces the Separator primitive's default element through render delegation.               |
| `ref`         | `HTMLDivElement \| null`     | `null`       | Bindable reference to the default separator element.                                        |
| `class`       | `string`                     | `undefined`  | Merged after self-stretch, input-surface, and orientation-specific margin/size adjustments. |

Remaining Separator and native `div` attributes are forwarded. See the complete [Bits UI Separator API reference](https://www.bits-ui.com/docs/components/separator#api-reference) for all inherited options.

Separator's orientation describes the line itself, not the parent layout: use a vertical line in a horizontal group and a horizontal line in a vertical group.

### `rootVariants`

`rootVariants` is the Tailwind Variants function used by `Root` and exported from `index.ts`:

```ts
rootVariants({ orientation: "vertical" });
```

| Option        | Type               | Default        | Result                                                          |
| ------------- | ------------------ | -------------- | --------------------------------------------------------------- |
| `orientation` | `RootOrientations` | `"horizontal"` | Adds base and selected orientation classes.                     |
| `class`       | Class input        | `undefined`    | Appends classes supplied by your app through Tailwind Variants. |

The function returns classes only. It does not render a group, add its role or data attributes, bind a ref, or manage children. Use `index.ts`, the exported types, and this function as the source of truth for the public API.

## Styling and DOM contract

Button Group uses Tailwind Variants, semantic tokens, and structural selectors. It exposes no component-specific CSS variables.

| Part        | Stable hook                          | Default element | Notable behavior                                                                  |
| ----------- | ------------------------------------ | --------------- | --------------------------------------------------------------------------------- |
| `Root`      | `data-slot="button-group"`           | `div`           | Width-fit flex group with public `data-orientation` and direct-child selectors.   |
| `Text`      | `data-slot="button-group-text"`      | `div`           | Muted bordered segment; your custom component owns the element when delegated.    |
| `Separator` | `data-slot="button-group-separator"` | `div`           | Self-stretching input-colored line backed by the local Separator/Bits UI wrapper. |

Root applies these structural rules:

- Direct slot children have adjoining radii and borders collapsed according to orientation.
- Any direct child receiving `:focus-visible` becomes positioned with `z-index: 10`, keeping its focus ring above adjacent controls.
- Direct native `input` elements flex to consume available width.
- Direct `select-trigger` slots without a `w-*` class use content width.
- A directly nested `button-group` causes the parent to add a `0.5rem` gap between its children.
- When a Select composition ends with its hidden native `select`, the last select trigger receives the expected right radius.

`Text` sizes descendant SVG elements without an explicit `size-*` class to `1rem` and disables their pointer events. It does not import or render an icon.

Classes supplied by your app are merged after local classes with `cn`, so conflicting Tailwind utilities normally favor your values. Structural variants with important modifiers or complex descendant selectors may require equally specific overrides.

The root's selectors depend on stable direct-child `data-slot` values. Wrapping a control in an un-slotted element prevents that control from joining visually unless the wrapper itself carries the intended slot and styles.

## Accessibility

Button Group provides `role="group"` but intentionally leaves every control's native semantics and interaction intact.

- Give each meaningful group an `aria-label` or `aria-labelledby`, especially when its purpose is not explicit from nearby text.
- Keep action buttons as native buttons and links as native links. The group does not repair semantics of arbitrary children.
- Tab navigation follows the page's normal order through every focusable child. Button Group does not implement roving tabindex or arrow-key navigation.
- Do not use Button Group when controls represent a single or multiple selection without implementing the corresponding pressed/checked state. Prefer Toggle Group for that interaction.
- Keep icon-only controls individually named; the group label does not name its descendants.
- Use `Text.child` to render a real `label` when a text segment labels an input. Visual adjacency alone does not create a label relationship.
- Separator is non-decorative by default and exposes separator semantics through Bits UI. Set `decorative` when it is purely visual; otherwise ensure its orientation accurately describes the line.
- For nested groups, avoid redundant landmark-style verbosity. Label subgroups only when their distinct purpose helps navigation.
- Orientation affects layout only. It does not change tab order or add `aria-orientation` to Root; you generally do not need to add it to a plain ARIA group.

Focus indication comes from each child component. The root only raises a `:focus-visible` child to prevent overlapping borders from obscuring its ring.

## Localization

Button Group contains no built-in user-facing copy and uses no localization messages. Your app supplies button labels, group names, text segments, input labels/placeholders, menu copy, and accessible descriptions.

Horizontal groups may need more width for translated labels. Allow wrapping outside the group, switch to vertical orientation, or revise the layout rather than truncating essential action names. Do not translate the technical orientation names, roles, or `data-slot`/`data-orientation` values.

## Dependencies

Button Group requires Svelte 5, Bits UI through its local Separator dependency, Tailwind Variants, the local utility helpers, and Tailwind CSS. Install its runtime and development packages with one of the following command groups:

```sh
# bun
bun add bits-ui tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

Copy the complete Separator UI component from `$lib/components/ui/separator` with Button Group. `ButtonGroup.Separator` imports it through `index.ts` and supports its Bits UI options. Copy these files:

- `src/lib/components/ui/separator/separator-root.svelte`
- `src/lib/components/ui/separator/index.ts`

Follow the Separator component's README to install it and understand its API. Button Group itself requires no other xvelte component.

The examples also use the Button and Input components. Copy only the components your interface uses and follow each component's README to install it; Button Group does not import them internally.

### Shared utilities

`Root` and `Text` import `cn` and `WithElementRef` from `$lib/utils`; `Separator` and its local dependency also import `cn`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

Your global stylesheet must import Tailwind and expose the semantic colors and radius scale used directly by Button Group and Separator. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

:root {
	--muted: oklch(0.97 0.001 106.424);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--muted: oklch(0.268 0.007 34.298);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
}

@theme inline {
	--color-muted: var(--muted);
	--color-border: var(--border);
	--color-input: var(--input);
	--radius-lg: var(--radius);
}

@layer base {
	* {
		@apply border-border;
	}
}
```

The base border rule supplies the default color for `Text`'s unqualified `border`; Separator's local background is overridden to `input` by Button Group.

No `@custom-variant dark`, icon package/export from `$lib/icons`, `tw-animate-css` import, animation, keyframe, hook, attachment, custom context module, localization message, or shared component stylesheet is required. Button, Input, Select, dropdown, popover, or other controls placed inside the group may add their own packages, tokens, icons, and configuration; follow each component's README.

## Credits

Button Group is adapted from the [shadcn-svelte Button Group](https://www.shadcn-svelte.com/docs/components/button-group). Its public exports, dimensions, component composition, and local structural behavior have been aligned with xvelte.

## File organization

| File                            | Responsibility                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `button-group-root.svelte`      | Defines orientations and structural selectors, renders the group, and forwards props.    |
| `button-group-text.svelte`      | Renders or delegates the styled non-interactive text segment.                            |
| `button-group-separator.svelte` | Adapts the local Separator component with group-specific orientation and stretch styles. |
| `index.ts`                      | Exports all public components, props types, orientation type, and `rootVariants`.        |

Use `index.ts`, the exported types, and `rootVariants` as the source of truth for the public API. If this guide and the implementation disagree, update the guide together with the code change.

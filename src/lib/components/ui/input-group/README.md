# Input Group

A compound field container that places text, metadata, buttons, and other supporting content around a native input or textarea while presenting one shared border and focus treatment. It supports inline prefixes and suffixes, full-width block add-ons, compact action buttons, controlled values, invalid and disabled states, and app-owned content.

Use Input Group when a field needs a unit, domain, result count, action, status, or short instruction inside the same visual container. Do not use it merely to place a label or error beside a field, or to hide a complex toolbar inside an input. Keep essential instructions and validation messages visible outside the group, and use dedicated components for selects, comboboxes, segmented controls, or other interaction patterns.

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

Import every public part through the component's `index.ts`:

```svelte
<script lang="ts">
	import * as InputGroup from "$lib/components/ui/input-group";
</script>
```

`index.ts` exports `Root`, `Addon`, `Button`, `Input`, `Text`, and `Textarea`; their corresponding props types; the `ButtonSizes` type; and the `buttonVariants` styling helper.

`AddonAligns` and `addonVariants` exist in the Addon implementation but are not exported from the component's public `index.ts`. Use `AddonProps` and the documented `align` values instead of importing private files.

## Anatomy

Root provides the shared border and state styling. Add one control and any supporting Addons:

```svelte
<InputGroup.Root>
	<InputGroup.Addon>
		<InputGroup.Text>https://</InputGroup.Text>
	</InputGroup.Addon>

	<InputGroup.Input aria-label="Website domain" placeholder="example.com" />

	<InputGroup.Addon align="inline-end">
		<InputGroup.Text>.com</InputGroup.Text>
	</InputGroup.Addon>
</InputGroup.Root>
```

The usual composition is:

```text
Root
├── Addon (optional prefix, suffix, header, or footer)
│   ├── Text (optional)
│   └── Button (optional)
└── Input or Textarea
```

Root's selectors expect Input, Textarea, and Addon to be direct children. Addons use CSS order classes, so they can be declared before or after the control, but keeping DOM order aligned with the visual and reading order is easier to understand and more accessible.

Use one primary Input or Textarea per Root. Root has `role="group"`, but it does not label the control, combine values, manage form state, or provide component context.

## Basic usage

This example binds the field value while presenting a non-editable URL scheme:

```svelte
<script lang="ts">
	import * as InputGroup from "$lib/components/ui/input-group";

	let domain = $state("");
</script>

<div class="grid max-w-sm gap-1.5">
	<label for="website-domain" class="text-sm font-medium">Website</label>

	<InputGroup.Root>
		<InputGroup.Addon>
			<InputGroup.Text>https://</InputGroup.Text>
		</InputGroup.Addon>

		<InputGroup.Input id="website-domain" name="domain" placeholder="example.com" bind:value={domain} />
	</InputGroup.Root>
</div>
```

Clicking an Addon outside a descendant `button` focuses the first `input` found in Addon's parent. Text is presentational and is not included in the submitted value, so this example submits only the contents of `domain`.

## Examples

### Inline action button

Input Group Button defaults to `type="button"`. Set `type="submit"` explicitly when it performs a form submission:

```svelte
<script lang="ts">
	import * as InputGroup from "$lib/components/ui/input-group";

	let query = $state("");

	function search(event: SubmitEvent) {
		event.preventDefault();
		// Search with query.
	}
</script>

<form class="grid max-w-sm gap-1.5" onsubmit={search}>
	<label for="site-search" class="text-sm font-medium">Search documentation</label>

	<InputGroup.Root>
		<InputGroup.Input id="site-search" name="query" type="search" bind:value={query} />
		<InputGroup.Addon align="inline-end">
			<InputGroup.Button type="submit" variant="secondary" size="sm">Search</InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>
</form>
```

Clicks originating inside a descendant `button` do not trigger Addon's input-focus helper. Button behavior, loading state, pressed state, confirmation, and asynchronous errors remain app responsibilities.

### Textarea with block add-ons

Use `block-start` or `block-end` when supporting content should span the container width:

```svelte
<script lang="ts">
	import * as InputGroup from "$lib/components/ui/input-group";

	const limit = 500;
	let message = $state("");
</script>

<div class="grid max-w-lg gap-1.5">
	<label for="support-message" class="text-sm font-medium">Message</label>

	<InputGroup.Root>
		<InputGroup.Addon align="block-start" class="border-b">
			<InputGroup.Text>Support request</InputGroup.Text>
		</InputGroup.Addon>

		<InputGroup.Textarea id="support-message" name="message" maxlength={limit} bind:value={message} class="min-h-32" />

		<InputGroup.Addon align="block-end" class="border-t">
			<InputGroup.Text>{limit - message.length} characters remaining</InputGroup.Text>
			<InputGroup.Button class="ms-auto" type="button" onclick={() => (message = "")}>Clear</InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>
</div>
```

Addon clicking does not focus Textarea because the local handler searches only for an `input`. The label remains the reliable focus target. Add a dedicated focus button or bind Textarea's `ref` if another keyboard-accessible focus action is required.

### Invalid state and error description

Place `aria-invalid` on the actual control. Root detects it and moves the danger border and ring to the shared container:

```svelte
<script lang="ts">
	import * as InputGroup from "$lib/components/ui/input-group";

	let amount = $state<number | undefined>();
	let invalid = $derived(amount !== undefined && amount < 0);
</script>

<div class="grid max-w-sm gap-1.5">
	<label for="invoice-amount">Invoice amount</label>

	<InputGroup.Root>
		<InputGroup.Addon>
			<InputGroup.Text>$</InputGroup.Text>
		</InputGroup.Addon>
		<InputGroup.Input
			id="invoice-amount"
			name="amount"
			type="number"
			min={0}
			step="0.01"
			bind:value={amount}
			aria-invalid={invalid}
			aria-describedby={invalid ? "amount-error" : undefined}
		/>
	</InputGroup.Root>

	{#if invalid}
		<p id="amount-error" class="text-sm text-danger">Amount cannot be negative.</p>
	{/if}
</div>
```

Setting `aria-invalid` only on Root does not activate its descendant-based invalid selector. The semantic state belongs on Input or Textarea so assistive technology receives it as well.

### Disabled field

A disabled descendant automatically gives Root a tinted background and reduced opacity:

```svelte
<InputGroup.Root>
	<InputGroup.Addon>
		<InputGroup.Text>Account</InputGroup.Text>
	</InputGroup.Addon>
	<InputGroup.Input value="Archived" disabled />
	<InputGroup.Addon align="inline-end">
		<InputGroup.Text>Unavailable</InputGroup.Text>
	</InputGroup.Addon>
</InputGroup.Root>
```

The native disabled state affects only the control. Root and Addon are generic `div` elements, and Button remains enabled unless it also receives `disabled`. Disable every action that must be unavailable and communicate why when the reason is not apparent.

### Addon click behavior

The built-in convenience handler is intentionally narrow:

- It focuses the first descendant `input` of Addon's immediate parent.
- It does nothing when the click target is inside a `button`.
- It does not search for a `textarea`.
- Links and other interactive descendants are not excluded and may cause the input to receive focus after activation.
- Passing `onclick` to Addon replaces the internal handler because native props are forwarded afterward.

Keep non-button interactive elements outside Addon. If supplying `onclick`, reproduce any desired focus behavior explicitly.

## Public API

Input Group is built from native elements plus the local Button, Input, and Textarea components. Its `index.ts`, exported types and helper, and local source are the source of truth.

### `InputGroup.Root`

Type: `RootProps`, based on native `HTMLAttributes<HTMLDivElement>` with a bindable element reference.

| Prop       | Type                  | Default     | Behavior                                                                                        |
| ---------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable rendered Root reference.                                                               |
| `children` | `Snippet`             | `undefined` | Renders the control and Addons.                                                                 |
| `class`    | `string`              | `undefined` | Merged after Root's complete layout, border, focus, invalid, disabled, and composition classes. |

Remaining native `div` attributes are forwarded after `role="group"` and `data-slot="input-group"`. Do not pass conflicting `role` or `data-slot` values: the final spread can replace them and break semantics or the selectors used by other xvelte components.

Root has no value prop, disabled prop, invalid prop, orientation prop, context, or callback. It derives its visual state from descendants and direct-child attributes.

### `InputGroup.Addon`

Type: `AddonProps`, based on native `HTMLAttributes<HTMLDivElement>` with a bindable reference and local alignment.

| Prop       | Type                                                             | Default          | Behavior                                                                                      |
| ---------- | ---------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `align`    | `"inline-start" \| "inline-end" \| "block-start" \| "block-end"` | `"inline-start"` | Chooses logical placement, order, padding, width, and alignment.                              |
| `ref`      | `HTMLElement \| null`                                            | `null`           | Bindable rendered Addon reference.                                                            |
| `children` | `Snippet`                                                        | `undefined`      | Renders Text, Button, icons, keyboard hints, or other concise supporting content.             |
| `class`    | `string`                                                         | `undefined`      | Merged after classes from the internal Addon Tailwind Variants function.                      |
| `onclick`  | Native handler                                                   | Internal focus   | A supplied handler replaces, rather than composes with, Addon's built-in input-focus handler. |

Addon renders a `div` with `role="group"`, `data-slot="input-group-addon"`, and `data-align`. Forwarded native props are applied last and can replace those values. Root styling depends on the documented `data-slot` and `data-align`, so preserve them.

Alignment behavior:

| Alignment      | Local result                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `inline-start` | First visual order, start padding, and compact negative margin when it directly contains Button or `kbd`. |
| `inline-end`   | Last visual order, end padding, and compact negative margin when it directly contains Button or `kbd`.    |
| `block-start`  | First visual order, full width, start justification, and top-oriented block padding.                      |
| `block-end`    | Last visual order, full width, start justification, and bottom-oriented block padding.                    |

### `InputGroup.Button`

Type: `ButtonProps`, based on local Button `RootProps` after replacing its size API and excluding `href`.

| Prop       | Type                                     | Default     | Behavior                                                                              |
| ---------- | ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| `size`     | `"xs" \| "sm" \| "icon-xs" \| "icon-sm"` | `"xs"`      | Selects the compact local size and writes `data-size`.                                |
| `variant`  | Local Button variant                     | `"ghost"`   | Forwarded to the required Button component.                                           |
| `type`     | `"button" \| "submit" \| "reset"`        | `"button"`  | Native button behavior; the safe local default avoids accidental form submission.     |
| `disabled` | `boolean`                                | `undefined` | Native disabled state inherited from Button.                                          |
| `ref`      | `HTMLElement \| null`                    | `null`      | Bindable underlying native button reference.                                          |
| `children` | `Snippet`                                | `undefined` | Renders a concise label, icon, or both.                                               |
| `class`    | `string`                                 | `undefined` | Merged with Input Group's button classes and then with the required Button component. |

The wrapper does not forward its custom `size` to Button's size prop. Button therefore starts from its own default size and Input Group's `buttonVariants` overrides the necessary dimensions:

| Size      | Effective local behavior                                                          |
| --------- | --------------------------------------------------------------------------------- |
| `xs`      | `h-6`, compact gap and padding, smaller radius, and `0.875rem` default SVGs.      |
| `sm`      | Adds no local size utilities, so Button's default `h-8` sizing remains effective. |
| `icon-xs` | `1.5rem` square, no padding, smaller radius, and `0.875rem` default SVGs.         |
| `icon-sm` | `2rem` square with no padding; underlying Button SVG sizing remains effective.    |

Input Group Button always renders the local native Button. It has no `href`, render delegation, loading state, or built-in accessible icon label. Follow the Button component's README for inherited variants, native props, styling, form behavior, and accessibility.

### `buttonVariants`

The exported Tailwind Variants helper produces Input Group Button's local classes:

```ts
buttonVariants({ size: "icon-xs" });
```

It accepts the exported `ButtonSizes` values plus Tailwind Variants' class input. It returns classes only; it does not include the required Button component's own variant styles, render an element, set `data-size`, or provide native behavior.

### `InputGroup.Input`

Type: `InputProps`, equal to the local Input component's `RootProps`.

| Prop    | Type                      | Default     | Behavior                                                                                                |
| ------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `value` | Svelte native input value | `undefined` | Bindable value forwarded to the required Input component.                                               |
| `ref`   | `HTMLElement \| null`     | `null`      | Bindable native input reference.                                                                        |
| `class` | `string`                  | `undefined` | Removes Input's own border, radius, background, shadow, and focus ring so Root owns the shared surface. |

All remaining Input props and native attributes are forwarded. The wrapper writes `data-slot="input-group-control"`, which Root requires for focus styling. A caller-provided `data-slot` is forwarded afterward and can replace it; do not override this slot.

Input Group Input does not destructure `files` as a bindable prop. Although `InputProps` reuses Input's public type and `type="file"` can render, `bind:files` is not a supported binding on this wrapper. Use `onchange` or a bound `ref` to read files, or use the standalone Input when two-way `files` binding is required. Follow Input's README for its full native API and file behavior.

### `InputGroup.Textarea`

Type: `TextareaProps`, equal to the local Textarea component's `RootProps`.

| Prop    | Type                         | Default     | Behavior                                                                                                           |
| ------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `value` | Svelte native textarea value | `undefined` | Bindable value forwarded to the required Textarea component.                                                       |
| `ref`   | `HTMLElement \| null`        | `null`      | Bindable native textarea reference.                                                                                |
| `class` | `string`                     | `undefined` | Removes Textarea's border, radius, background, shadow, resize handle, and focus ring; adds local vertical padding. |

Remaining Textarea/native attributes are forwarded. The wrapper writes `data-slot="input-group-control"`; do not replace it because Root uses that slot to detect focus. Root becomes auto-height for a direct textarea child.

The local wrapper forces `resize-none`. Override it deliberately with a caller class when manual resize is compatible with the surrounding Root layout.

### `InputGroup.Text`

Type: `TextProps`, based on native `HTMLAttributes<HTMLSpanElement>` with a bindable reference.

| Prop       | Type                  | Default     | Behavior                                                                                    |
| ---------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable rendered span reference.                                                           |
| `children` | `Snippet`             | `undefined` | Renders a unit, scheme, count, status, shortcut, icon, or other concise supporting content. |
| `class`    | `string`              | `undefined` | Merged after flex, gap, text size/color, and descendant SVG classes.                        |

Text renders a plain `span`, forwards native attributes, and does not set `data-slot`, a role, or an accessible relationship. It prevents pointer events on descendant SVGs and supplies a default size when they do not already have a `size-*` class.

## Styling and DOM contract

Stable local hooks and elements:

| Part     | Stable hook or attribute                                       | Element           |
| -------- | -------------------------------------------------------------- | ----------------- |
| Root     | `data-slot="input-group"`, `role="group"`, `group/input-group` | Native `div`      |
| Addon    | `data-slot="input-group-addon"`, `data-align`, `role="group"`  | Native `div`      |
| Button   | `data-slot="button"` from Button, plus local `data-size`       | Native `button`   |
| Input    | `data-slot="input-group-control"`                              | Native `input`    |
| Textarea | `data-slot="input-group-control"`                              | Native `textarea` |
| Text     | No local stable slot                                           | Native `span`     |

Root is a relative, full-width, minimum-width-zero flex container with a default height of `2rem`, semantic input border, large radius, and no direct background in light mode. It becomes column-oriented and auto-height for block Addons, and auto-height for a direct Textarea.

Descendant-driven state:

- A focused descendant control with `data-slot="input-group-control"` moves the semantic focus border and three-pixel ring to Root.
- Any descendant matching `[data-slot][aria-invalid=true]` gives Root the danger border and ring.
- Any disabled descendant gives Root an input-tinted background and 50% opacity.
- Addon has a separate opacity selector for an ancestor carrying the exact attribute `data-disabled="true"`; Root does not set this attribute or disable descendants automatically.
- Inside `data-slot="combobox-content"`, focus-within preserves the inherited border and removes Root's ring.
- Inline Addons reduce the direct Input's corresponding padding; block Addons adjust Root direction and direct Input vertical padding.

Input and Textarea remove their own borders, radius, background, shadow, and rings so those visuals are not duplicated. Addon alignment is expressed with logical `inline-*`/`block-*` names, but flex `order-first` and `order-last` control the visual order.

All public parts that accept `class` merge through `cn`, directly or through their required component. Later conflicting Tailwind utilities normally replace ordinary defaults. Descendant, `:has()`, group, dark, and high-specificity selectors may require an equally specific override.

Input Group defines no CSS variable, animation, keyframe, context, or shared stylesheet. Radius calculations read the global `--radius` token.

## Accessibility

Root and Addon are generic grouped containers. Input, Textarea, and Button retain their native semantics, but the component does not create labels, descriptions, errors, or relationships automatically.

- Associate the actual Input or Textarea with a persistent label using `for` and `id`. Root's `role="group"` is not a field label.
- Do not use Addon text or a placeholder as the only accessible name. A scheme, currency symbol, unit, or suffix may be useful context but does not replace the field label.
- Connect external instructions and errors to the control with `aria-describedby`; place `aria-invalid` on the control.
- Keep the control and its actions in a logical DOM and tab order. CSS ordering changes visual position without changing reading or focus order.
- Give every icon-only Button an accessible name. Button defaults to `type="button"`; opt into submit/reset behavior deliberately.
- Ensure Addon actions are distinct from editing the field. Do not place an interactive element inside another interactive element.
- A click on non-button Addon content focuses Input, but this is only pointer convenience and supplies no label semantics. Textarea receives no equivalent behavior.
- When a field is disabled, separately disable any related Button that must be unavailable. Root's opacity does not disable descendants.
- Keep status, loading, success, and error information perceivable without relying only on color or icons. Use an appropriate live region for asynchronous updates when necessary.

Avoid excessive controls inside one group. Use a toolbar, menu, or adjacent action area when several buttons would make the field difficult to understand or navigate.

## Localization

Input Group has no built-in user-facing copy and imports no localization messages. The app supplies and translates field labels, placeholders, Addon text, Button labels, units, counts, statuses, instructions, errors, and accessible names.

Allow enough width for translated prefixes, suffixes, buttons, and block Addons. Do not translate technical alignment values, size/variant names, form attribute values, `data-slot`, or `data-align`.

## Dependencies

Input Group expects a Svelte 5 project using Tailwind CSS 4. It requires the local Button, Input, and Textarea components, Tailwind Variants, and shared utility helpers.

Install every runtime dependency first and the development dependency second:

```sh
# bun
bun add tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/input-group` component folder:

- `input-group-root.svelte`
- `input-group-addon.svelte`
- `input-group-button.svelte`
- `input-group-input.svelte`
- `input-group-text.svelte`
- `input-group-textarea.svelte`
- `index.ts`
- `README.md`

### Required UI components

Copy these complete xvelte components as well:

```text
src/lib/components/ui/button/
├── button-root.svelte
├── index.ts
└── README.md

src/lib/components/ui/input/
├── input-root.svelte
├── index.ts
└── README.md

src/lib/components/ui/textarea/
├── textarea-root.svelte
└── index.ts
```

Follow each component's README to install it and understand its API and requirements. The local Textarea folder does not yet contain its own README, so its `index.ts`, exported `RootProps`, and `textarea-root.svelte` are currently its source of truth.

Button, Input, and Textarea are source dependencies even when a particular app uses only some Input Group parts, because their wrapper files are present in and exported by the complete component folder.

### Shared utilities

Input Group and its required components import `cn`, `WithElementRef`, and `WithoutChildren` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

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
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block includes `clsx` and `tailwind-merge`, which `cn` imports.

### Global CSS

The global stylesheet must load Tailwind, define the dark variant, and expose the semantic colors and radii used by Input Group and its required components. These are xvelte's defaults; apps may replace the values while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

The app owns dark-mode activation. Input Group requires no Bits UI package, `tw-animate-css` import, base-layer rule, animation, keyframe, icon export from `src/lib/icons.ts`, localization message, hook, attachment, context file, image, font, network service, or additional shared stylesheet.

## Credits

Adapted from [shadcn-svelte's Input Group](https://www.shadcn-svelte.com/docs/components/input-group). The local exports, wrapper behavior, sizes, alignments, focus helper, direct-child selectors, theme values, and source are the source of truth.

## File organization

| File                          | Responsibility                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `input-group-root.svelte`     | Shared layout, border, focus, invalid, disabled, block-alignment, textarea, and combobox-content styling.                           |
| `input-group-addon.svelte`    | Alignment variants, supporting-content layout, Addon hooks, and click-to-focus behavior.                                            |
| `input-group-button.svelte`   | Compact sizes, local Button defaults, exported `buttonVariants`, native action wrapper, and prop forwarding.                        |
| `input-group-input.svelte`    | Input value/reference binding, shared control slot, local visual resets, and Input prop forwarding.                                 |
| `input-group-textarea.svelte` | Textarea value/reference binding, shared control slot, local visual resets, and Textarea prop forwarding.                           |
| `input-group-text.svelte`     | Supporting text span, SVG behavior, class merging, and native span forwarding.                                                      |
| `index.ts`                    | Public components, props types, Button size type, and `buttonVariants` exports.                                                     |
| `README.md`                   | Composition, examples, API, click behavior, bindings, styling, accessibility, localization, dependencies, limitations, and credits. |

Treat `index.ts`, its exported types and helper, and the local component source as the source of truth for the public API.

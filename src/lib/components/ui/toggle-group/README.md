# Toggle Group

An accessible single-selection or multiple-selection group of related toggle buttons. It coordinates bindable values, roving keyboard focus, horizontal or vertical orientation, local Toggle variants and sizes, and configurable spacing through Bits UI and shared xvelte context.

Use Toggle Group for compact related options such as text alignment or formatting. Use Radio Group when labels and choices should remain explicit, Tabs when selection switches content panels, and independent Toggle controls when buttons do not form one set.

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

```svelte
<script lang="ts">
	import * as ToggleGroup from "$lib/components/ui/toggle-group";
</script>
```

`index.ts` exports `Root`, `Item`, `RootProps`, `ItemProps`, `ToggleVariants`, `ToggleSizes`, `ToggleGroupContext`, `getToggleGroupContext`, and `setToggleGroupContext`.

---

## Anatomy

```svelte
<ToggleGroup.Root type="single">
	<ToggleGroup.Item value="left">Left</ToggleGroup.Item>
	<ToggleGroup.Item value="center">Center</ToggleGroup.Item>
	<ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup.Root>
```

Root is required: it supplies Bits UI selection/focus state and the local variant, size, spacing, and orientation context consumed by Item.

---

## Basic usage

```svelte
<script lang="ts">
	import * as ToggleGroup from "$lib/components/ui/toggle-group";

	let alignment = $state("left");
</script>

<ToggleGroup.Root type="single" bind:value={alignment} aria-label="Text alignment">
	<ToggleGroup.Item value="left">Left</ToggleGroup.Item>
	<ToggleGroup.Item value="center">Center</ToggleGroup.Item>
	<ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup.Root>
```

Single mode uses a string. Choosing the current item follows Bits UI's single-group behavior and may clear the value when the primitive permits deselection.

---

## Examples

### Multiple selection

```svelte
<script lang="ts">
	let formatting = $state<string[]>([]);
</script>

<ToggleGroup.Root type="multiple" bind:value={formatting} variant="outline" aria-label="Text formatting">
	<ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
	<ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
	<ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
</ToggleGroup.Root>
```

Multiple mode uses a string array and allows any combination.

### Spaced items

```svelte
<ToggleGroup.Root type="multiple" spacing={2} size="sm" variant="outline" aria-label="Saved states">
	<ToggleGroup.Item value="starred">Starred</ToggleGroup.Item>
	<ToggleGroup.Item value="archived">Archived</ToggleGroup.Item>
</ToggleGroup.Root>
```

`spacing` uses Tailwind spacing units: `2` produces the project's spacing value for two units. At zero, adjacent items remove inner radii/borders and Root adds a shared outline shadow.

### Vertical orientation

```svelte
<ToggleGroup.Root type="single" orientation="vertical" bind:value={density} aria-label="Display density">
	<ToggleGroup.Item value="comfortable">Comfortable</ToggleGroup.Item>
	<ToggleGroup.Item value="compact">Compact</ToggleGroup.Item>
</ToggleGroup.Root>
```

Vertical orientation changes layout, connected corners/borders, and arrow-key navigation.

### Disable a group or item

```svelte
<ToggleGroup.Root type="multiple" disabled aria-label="Unavailable formatting">…</ToggleGroup.Root>

<ToggleGroup.Item value="restricted" disabled>Restricted</ToggleGroup.Item>
```

---

## Public API

Toggle Group wraps the installed stable `bits-ui@2.18.1` primitive and reuses xvelte Toggle variants. See the complete [Bits UI Toggle Group API](https://bits-ui.com/docs/components/toggle-group#api-reference). The component's `index.ts`, exported types/context helpers, and source are the source of truth.

### `ToggleGroup.Root`

`RootProps` combines Bits UI's discriminated Root props with `ToggleGroupContext`.

| Prop                 | Type                         | Default         | Behavior                                                             |
| -------------------- | ---------------------------- | --------------- | -------------------------------------------------------------------- |
| `type`               | `"single" \| "multiple"`     | Required        | Selects `string` or `string[]` value.                                |
| `value`              | `string \| string[]`         | Empty           | Bindable selection matching `type`.                                  |
| `onValueChange`      | `(value) => void`            | —               | Runs when selection changes.                                         |
| `disabled`           | `boolean`                    | `false`         | Disables the complete group.                                         |
| `loop`               | `boolean`                    | `true`          | Wraps roving focus at the ends.                                      |
| `rovingFocus`        | `boolean`                    | Bits UI default | Uses arrow-key focus when enabled or normal Tab order when disabled. |
| `orientation`        | `"horizontal" \| "vertical"` | `"horizontal"`  | Controls layout and keyboard axis.                                   |
| `variant`            | `"default" \| "outline"`     | `"default"`     | Shared xvelte Toggle variant for every Item.                         |
| `size`               | `"sm" \| "default" \| "lg"`  | `"default"`     | Shared Toggle size.                                                  |
| `spacing`            | `number`                     | `0`             | Shared Tailwind spacing-unit gap and connected treatment.            |
| `children` / `child` | Bits UI snippets             | —               | Renders Items or delegates Root.                                     |
| `ref`                | `HTMLDivElement \| null`     | `null`          | Bindable group element.                                              |

Root forwards native div attributes and writes `--gap` through its local `style`. A caller-provided `style` forwarded afterward can replace this declaration; preserve `--gap` when overriding inline styles.

### `ToggleGroup.Item`

| Prop                 | Type                        | Default      | Behavior                                                            |
| -------------------- | --------------------------- | ------------ | ------------------------------------------------------------------- |
| `value`              | `string`                    | Required     | Stable selection value.                                             |
| `disabled`           | `boolean \| null`           | `false`      | Disables this Item.                                                 |
| `variant`            | Toggle variant              | Root context | Fallback only; an ordinary Root always supplies its shared default. |
| `size`               | Toggle size                 | Root context | Fallback only; an ordinary Root always supplies its shared default. |
| `children` / `child` | Bits UI snippets            | —            | Renders or delegates the primitive button with pressed state.       |
| `ref`                | `HTMLButtonElement \| null` | `null`       | Bindable Item button.                                               |

Root context intentionally wins over Item `variant` and `size`, keeping the group visually consistent. Native button attributes are forwarded.

### Context API and types

`ToggleGroupContext` contains optional `variant`, `size`, `spacing`, and `orientation`. `setToggleGroupContext(context)` provides it; `getToggleGroupContext()` reads the nearest value. Root uses both Bits UI context and this local styling context, so custom providers are advanced and do not replace Root selection behavior.

`ToggleVariants` and `ToggleSizes` mirror xvelte Toggle's exported helper types.

---

## Styling and DOM contract

Root exposes `data-slot="toggle-group"`, `data-variant`, `data-size`, `data-spacing`, `group/toggle-group`, and inline `--gap`. Item exposes `data-slot="toggle-group-item"`, the same local data values, and Bits UI `data-state="on|off"`.

Zero-spacing selectors join borders and radii according to orientation. Non-zero spacing uses `gap-[--spacing(var(--gap))]`. Item combines connected-group classes with `Toggle.rootVariants()` and merges caller class last.

---

## Accessibility

Bits UI supplies group and pressed-button semantics, single/multiple selection, disabled state, roving focus, orientation, and arrow navigation. Give Root an accessible label, especially for icon-only groups, and give every icon-only Item its own `aria-label`.

Keep values unique and stable. Do not use visual pressed color alone, remove focus indicators, or mix unrelated actions into one group. Delegated child elements must spread every supplied prop.

---

## Localization

Toggle Group contains no built-in copy and requires no localization messages. The app supplies and translates group labels, item labels, accessible names, state explanations, and disabled reasons. Item values remain stable implementation identifiers.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

No animation or icon package is required.

### Global styles and theme tokens

Use Toggle's semantic token code, then add the orientation variants required by Toggle Group:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--danger: oklch(0.577 0.245 27.325);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
	--danger: oklch(0.704 0.191 22.216);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted: var(--muted);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-danger: var(--danger);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@custom-variant data-horizontal {
	&:where([data-orientation="horizontal"]) {
		@slot;
	}
}

@custom-variant data-vertical {
	&:where([data-orientation="vertical"]) {
		@slot;
	}
}
```

Values may be replaced by the app's theme. No keyframe, font, or global layout rule is required.

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Required xvelte component

Copy Toggle and follow its README:

```text
toggle/
├── index.ts
└── toggle-root.svelte
```

### Component files and other integration

```text
toggle-group/
├── index.ts
├── toggle-group-context.ts
├── toggle-group-item.svelte
└── toggle-group-root.svelte
```

Toggle Group needs no icon, hook, attachment, localization setup, shared style, image, font, or network service. Its required native context file is colocated above.

---

## Credits

The component structure, variants, and spacing behavior are adapted from [shadcn-svelte Toggle Group](https://www.shadcn-svelte.com/docs/components/toggle-group).

---

## File organization

| File                       | Responsibility                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `toggle-group-root.svelte` | Primitive group selection, orientation, shared visual props, gap variable, and context. |
| `toggle-group-item.svelte` | Primitive Item, Toggle variants, connected borders/radii, and Root context consumption. |
| `toggle-group-context.ts`  | Native Svelte context for visual variant, size, spacing, and orientation.               |
| `index.ts`                 | Public parts, props/variant/context types, and context helpers.                         |
| `README.md`                | Composition, examples, API, accessibility, styling, and installation guide.             |

The component's `index.ts`, exported types, and context helpers are the source of truth for the public API.

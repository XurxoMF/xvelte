# Toggle

An accessible two-state button with bindable pressed state, default and outline variants, three sizes, icon-aware spacing, and native button forwarding through Bits UI.

Use Toggle for an independent on/off action such as pinning, muting, or showing formatting. Use Switch for a setting that takes effect immediately, Checkbox for form selections, and Toggle Group when several related toggle buttons need coordinated focus or selection.

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
	import * as Toggle from "$lib/components/ui/toggle";
</script>
```

`index.ts` exports `Root`, `RootProps`, `RootVariants`, `RootSizes`, and `rootVariants`.

---

## Anatomy

Toggle is a single Bits UI button:

```svelte
<Toggle.Root>Pin</Toggle.Root>
```

Its children may be text, a semantic icon from `$lib/icons`, or both.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Toggle from "$lib/components/ui/toggle";

	let pinned = $state(false);
</script>

<Toggle.Root bind:pressed={pinned}>Pin conversation</Toggle.Root><p>{pinned ? "Conversation pinned" : "Conversation not pinned"}</p>
```

Bits UI manages `aria-pressed`; visible text explains the action without a separate label.

---

## Examples

### Outline and sizes

```svelte
<div class="flex items-center gap-2">
	<Toggle.Root variant="outline" size="sm">Small</Toggle.Root>
	<Toggle.Root variant="outline">Default</Toggle.Root>
	<Toggle.Root variant="outline" size="lg">Large</Toggle.Root>
</div>
```

### Icon-only toggle

```svelte
<Toggle.Root aria-label="Mute notifications" bind:pressed={muted}>
	<VolumeMutedIcon />
</Toggle.Root>
```

Icon-only controls require an accessible name. The icon must be imported through `$lib/icons`; Toggle itself has no icon dependency.

### Change callback and disabled state

```svelte
<Toggle.Root bind:pressed onPressedChange={(next) => savePreference(next)} disabled={saving}>Show archived</Toggle.Root>
```

### Reuse the variant helper

```svelte
<script lang="ts">
	import { rootVariants } from "$lib/components/ui/toggle";
</script>

<a href="/preview" class={rootVariants({ variant: "outline", size: "sm" })}>Preview</a>
```

The helper applies Toggle presentation only; it does not add pressed-button semantics to another element.

---

## Public API

`RootProps` extends the installed stable `bits-ui@2.18.1` Toggle Root with local variants. See the complete [Bits UI Toggle API](https://bits-ui.com/docs/components/toggle#api-reference). The component's `index.ts`, exported types/helper, and source are the source of truth.

| Prop                 | Type                         | Default     | Behavior                                                               |
| -------------------- | ---------------------------- | ----------- | ---------------------------------------------------------------------- |
| `pressed`            | `boolean`                    | `false`     | Bindable on/off state.                                                 |
| `onPressedChange`    | `(pressed: boolean) => void` | —           | Runs when interaction changes state.                                   |
| `disabled`           | `boolean \| null`            | `false`     | Disables interaction and fades the button.                             |
| `variant`            | `"default" \| "outline"`     | `"default"` | Transparent or bordered presentation.                                  |
| `size`               | `"sm" \| "default" \| "lg"`  | `"default"` | 28, 32, or 36-pixel height and matching spacing.                       |
| `children` / `child` | Bits UI snippets             | —           | Renders content or delegates the button while receiving pressed state. |
| `ref`                | `HTMLButtonElement \| null`  | `null`      | Bindable primitive button.                                             |

Native button attributes and handlers are forwarded. `RootVariants` and `RootSizes` expose the helper's option types.

---

## Styling and DOM contract

- Stable hook: `data-slot="toggle"`.
- Stable named class: `group/toggle`.
- Bits UI state: `data-state="on|off"` and `aria-pressed`.
- Variants: transparent default or `border-input` outline.
- Pressed/hover background: semantic `muted`.
- Focus and invalid treatment: `ring` and `destructive`.
- Root class merges after `rootVariants()` through `cn()`.

Icon sizing targets descendant SVG elements unless they already have a `size-*` class. `data-icon="inline-start|inline-end"` on an icon or wrapper adjusts text padding.

---

## Accessibility

Bits UI renders a native button with `aria-pressed`, keyboard activation, disabled behavior, and focus handling. Provide visible text or `aria-label`, keep the label stable across states when possible, and expose state through pressed semantics rather than changing only color or icon.

Do not use Toggle for navigation. Delegated `child` output must spread every supplied prop to preserve semantics and interaction.

---

## Localization

Toggle contains no built-in copy and requires no localization messages. The app supplies and translates button labels, accessible names, state descriptions, and disabled explanations.

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

No animation or icon package is required by Toggle itself.

### Global styles and theme tokens

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--destructive: oklch(0.577 0.245 27.325);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
	--destructive: oklch(0.704 0.191 22.216);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted: var(--muted);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-destructive: var(--destructive);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}
```

Values may be replaced by the app's theme. No keyframe, custom state variant, font, or global layout rule is required.

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Component files and other integration

```text
toggle/
├── index.ts
└── toggle-root.svelte
```

Toggle needs no other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

---

## Credits

The component structure and variants are adapted from [shadcn-svelte Toggle](https://www.shadcn-svelte.com/docs/components/toggle).

---

## File organization

| File                 | Responsibility                                                                   |
| -------------------- | -------------------------------------------------------------------------------- |
| `toggle-root.svelte` | Primitive pressed state, variants, sizes, native props, styling helper, and ref. |
| `index.ts`           | Public component, types, and `rootVariants`.                                     |
| `README.md`          | Usage, API, accessibility, styling, and installation guide.                      |

The component's `index.ts`, exported types, and `rootVariants` are the source of truth for the public API.

# Separator

A thin horizontal or vertical line that visually or semantically separates related content. It supports decorative and accessible separator semantics through Bits UI and allows callers to replace the local `data-slot` when embedding it inside another component.

Use Separator to clarify groups inside menus, toolbars, cards, or layouts. Do not use it as a substitute for spacing, headings, or borders when no meaningful division exists.

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
	import * as Separator from "$lib/components/ui/separator";
</script>
```

The component's `index.ts` exports `Root` and `RootProps`.

---

## Anatomy

Separator is a single Bits UI element:

```svelte
<Separator.Root />
```

It is horizontal and decorative by default. Set `orientation="vertical"` inside a container with a definite height.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Separator from "$lib/components/ui/separator";
</script>

<div class="space-y-3">
	<div>
		<h2 class="font-medium">Account</h2>
		<p class="text-sm text-muted-foreground">Manage your public profile.</p>
	</div>

	<Separator.Root />

	<div>
		<h2 class="font-medium">Security</h2>
		<p class="text-sm text-muted-foreground">Review passwords and active sessions.</p>
	</div>
</div>
```

---

## Examples

### Vertical separator

```svelte
<nav aria-label="Documentation" class="flex h-5 items-center gap-4 text-sm">
	<a href="/guide">Guide</a>
	<Separator.Root orientation="vertical" />
	<a href="/api">API</a>
	<Separator.Root orientation="vertical" />
	<a href="/examples">Examples</a>
</nav>
```

The local vertical separator uses `h-full`, not `self-stretch`, so its height comes from the containing layout.

### Semantic separator

```svelte
<Separator.Root decorative={false} aria-label="Security settings" />
```

Use semantic mode only when the separator communicates a structural boundary that assistive technology should expose.

### Custom component slot

```svelte
<Separator.Root data-slot="menu-separator" class="my-1" />
```

The local wrapper deliberately permits a custom `data-slot`; most components should keep the default.

---

## Public API

`RootProps` equals the installed stable `bits-ui@2.18.1` `Separator.RootProps`. The table summarizes the important options; see the complete [Bits UI Separator API](https://bits-ui.com/docs/components/separator#api-reference). The component's `index.ts` and exported type are the source of truth.

| Prop          | Type                         | Default        | Behavior                                                                     |
| ------------- | ---------------------------- | -------------- | ---------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Sets the visual axis and `data-orientation`.                                 |
| `decorative`  | `boolean`                    | `true`         | Keeps the line visual only. Set false to expose separator semantics.         |
| `data-slot`   | `string`                     | `"separator"`  | Replaces the stable local slot name when another component reuses Separator. |
| `ref`         | `HTMLDivElement \| null`     | `null`         | Bindable rendered element.                                                   |
| `child`       | Bits UI child snippet        | —              | Replaces the default element; spread every supplied prop.                    |

Native `<div>` attributes and handlers are forwarded. `class` is merged after local classes with `cn()`.

---

## Styling and DOM contract

- Stable default hook: `data-slot="separator"`; callers may intentionally override it.
- Bits UI state: `data-orientation="horizontal|vertical"`.
- Horizontal: one pixel high and full width.
- Vertical: one pixel wide and full container height.
- Color: semantic `border` token.
- `class` passes through `cn()`, so later Tailwind utilities replace conflicting defaults.

The rendered element and accessibility attributes are owned by Bits UI when `child` is used.

---

## Accessibility

The default `decorative={true}` separator is hidden from the accessibility tree. With `decorative={false}`, Bits UI exposes separator semantics and orientation. Use semantic separators sparingly, preserve the generated role and orientation, and do not make the element interactive.

Separator provides no accessible name by default. Add `aria-label` or `aria-labelledby` only when semantic mode needs a name that is not already clear from surrounding headings.

---

## Localization

Separator contains no built-in human-readable copy and requires no localization messages. The app translates any optional `aria-label` it supplies.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui clsx tailwind-merge
pnpm add -D tailwindcss
```

No animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--border: oklch(0.923 0.003 48.717);
}

.dark {
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-border: var(--border);
}
```

The color values may be replaced by the app's theme. No global keyframe, custom variant, font, or layout rule is required.

### Shared utilities

Copy `cn()` from `$lib/utils`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Component files and other integration

```text
separator/
├── index.ts
└── separator-root.svelte
```

Separator needs no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

---

## Credits

The component structure and styling are adapted from [shadcn-svelte Separator](https://www.shadcn-svelte.com/docs/components/separator).

---

## File organization

| File                    | Responsibility                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `separator-root.svelte` | Bits UI wrapper, orientation styling, custom slot, class merging, and ref forwarding. |
| `index.ts`              | Public component and props type.                                                      |
| `README.md`             | Usage, API, accessibility, styling, and installation guide.                           |

The component's `index.ts` and `RootProps` are the source of truth for the public API.

# Skeleton

A non-interactive placeholder block with a pulse animation for representing content while it loads. Its size and shape are entirely controlled through native attributes and classes.

Use Skeleton when the final layout is known and a temporary shape reduces perceived movement. Do not use it for indeterminate actions that need a status announcement; use Spinner or visible loading text instead, and avoid skeleton screens that imitate content which may never appear.

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
	import * as Skeleton from "$lib/components/ui/skeleton";
</script>
```

`index.ts` exports `Root` and `RootProps`.

---

## Anatomy

Skeleton renders one empty `<div>` and does not accept children:

```svelte
<Skeleton.Root class="h-4 w-40" />
```

---

## Basic usage

```svelte
<script lang="ts">
	import * as Skeleton from "$lib/components/ui/skeleton";
</script>

<div class="flex items-center gap-3" aria-hidden="true">
	<Skeleton.Root class="size-10 rounded-full" />
	<div class="space-y-2">
		<Skeleton.Root class="h-4 w-40" />
		<Skeleton.Root class="h-3 w-28" />
	</div>
</div>
```

---

## Examples

### Loading card

```svelte
<div aria-busy="true" aria-label="Loading article" class="space-y-4 rounded-lg border p-4">
	<div aria-hidden="true" class="space-y-3">
		<Skeleton.Root class="aspect-video w-full" />
		<Skeleton.Root class="h-5 w-2/3" />
		<Skeleton.Root class="h-4 w-full" />
		<Skeleton.Root class="h-4 w-5/6" />
	</div>
</div>
```

Put loading semantics on the surrounding region. The individual visual blocks should normally remain hidden from assistive technology.

### Reduced motion

```svelte
<Skeleton.Root class="h-8 w-full motion-reduce:animate-none" />
```

Tailwind's reduced-motion variant can disable the pulse when the app wants stricter motion behavior.

---

## Public API

`RootProps` is the native Svelte `HTMLAttributes<HTMLDivElement>` type with `children` removed and a bindable element `ref`. The component's `index.ts` and exported type are the source of truth.

| Prop    | Type                     | Default | Behavior                                                                |
| ------- | ------------------------ | ------- | ----------------------------------------------------------------------- |
| `ref`   | `HTMLDivElement \| null` | `null`  | Bindable rendered element.                                              |
| `class` | `string`                 | —       | Merges size, shape, motion, and other app styling after local defaults. |

All remaining native `<div>` attributes and handlers are forwarded. Child content is unsupported because the component is an empty loading shape.

---

## Styling and DOM contract

- Stable hook: `data-slot="skeleton"`.
- Default classes: `animate-pulse rounded-md bg-muted`.
- Semantic token: `muted`.
- `class` passes through `cn()`, so width, height, radius, animation, or background utilities supplied later may replace defaults.

Skeleton owns no state attributes or internal elements.

---

## Accessibility

Skeleton is visual and has no role or accessible name. Mark a group of placeholders `aria-hidden="true"` and put `aria-busy="true"` plus an appropriate accessible name or status message on the loading region. Remove `aria-busy` when real content arrives.

Do not expose every rectangle to a screen reader and do not rely on animation as the only indication that loading is underway.

---

## Localization

Skeleton contains no text and requires no localization messages. Any loading label or status on the surrounding region belongs to the app and must be translated there.

---

## Dependencies

### Packages

```sh
# Bun
bun add clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss
```

No runtime primitive or animation package is required; `animate-pulse` comes from Tailwind CSS.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--muted: oklch(0.97 0.001 106.424);
	--radius: 0.45rem;
}

.dark {
	--muted: oklch(0.268 0.007 34.298);
}

@theme inline {
	--color-muted: var(--muted);
	--radius-md: calc(var(--radius) * 0.8);
}
```

These values may be replaced by the app's theme. No custom keyframe, global variant, font, or layout rule is required.

### Shared utilities

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

### Component files and other integration

```text
skeleton/
├── index.ts
└── skeleton-root.svelte
```

Skeleton requires no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

---

## Credits

The component is adapted from [shadcn-svelte Skeleton](https://www.shadcn-svelte.com/docs/components/skeleton).

---

## File organization

| File                   | Responsibility                                                                 |
| ---------------------- | ------------------------------------------------------------------------------ |
| `skeleton-root.svelte` | Empty placeholder element, pulse styling, native attributes, and bindable ref. |
| `index.ts`             | Public component and props type.                                               |
| `README.md`            | Usage, API, accessibility, styling, and installation guide.                    |

The component's `index.ts` and `RootProps` are the source of truth for the public API.

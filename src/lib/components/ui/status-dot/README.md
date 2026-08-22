# Status Dot

A small colored status marker with configurable meaning, size, and optional pulse animation. It renders a semantic span structure but deliberately leaves the accessible label and status wording to the app.

Use Status Dot beside text that explains availability, health, severity, or connection state. Never communicate status by color or animation alone, and do not use it as an interactive control.

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
	import * as StatusDot from "$lib/components/ui/status-dot";
</script>
```

`index.ts` exports `Root`, `rootVariants`, `RootProps`, `RootVariants`, and `RootSizes`.

---

## Anatomy

The root wraps the visible dot and, when enabled, a second absolute pulse layer:

```svelte
<StatusDot.Root variant="success" />
```

The component accepts no dedicated text prop; place explanatory text beside it.

---

## Basic usage

```svelte
<script lang="ts">
	import * as StatusDot from "$lib/components/ui/status-dot";
</script>

<span class="inline-flex items-center gap-2">
	<StatusDot.Root variant="success" aria-hidden="true" />
	<span>Service operational</span>
</span>
```

---

## Examples

### Pulsing live status

```svelte
<div role="status" class="inline-flex items-center gap-2">
	<StatusDot.Root variant="info" pulse aria-hidden="true" />
	<span>Connecting to the server</span>
</div>
```

The surrounding status owns the announcement; the colored dot is decorative.

### All variants and sizes

```svelte
<div class="flex items-center gap-4">
	<StatusDot.Root variant="default" size="sm" aria-label="Default" />
	<StatusDot.Root variant="success" size="md" aria-label="Successful" />
	<StatusDot.Root variant="warning" size="lg" aria-label="Warning" />
	<StatusDot.Root variant="error" aria-label="Error" />
	<StatusDot.Root variant="info" aria-label="Information" />
	<StatusDot.Root variant="muted" aria-label="Unavailable" />
</div>
```

Prefer visible labels in real interfaces; the accessible labels above only demonstrate native attribute forwarding.

### Reusing the variant helper

```svelte
<script lang="ts">
	import { rootVariants } from "$lib/components/ui/status-dot";
</script>

<span class={rootVariants({ variant: "warning", size: "sm" })}></span>
```

Use the exported helper only when another element intentionally needs the exact Status Dot variant classes.

---

## Public API

### `StatusDot.Root`

`RootProps` extends native `<span>` attributes with local variants. The component's `index.ts`, exported types, and `rootVariants` helper are the source of truth.

| Prop      | Type                                                                  | Default     | Behavior                                                         |
| --------- | --------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `variant` | `"default" \| "success" \| "warning" \| "error" \| "info" \| "muted"` | `"default"` | Selects the dot and pulse color.                                 |
| `size`    | `"sm" \| "md" \| "lg"`                                                | `"md"`      | Selects 8, 12, or 16-pixel dimensions.                           |
| `pulse`   | `boolean`                                                             | `false`     | Adds an expanding, fading `animate-ping` layer.                  |
| `ref`     | `HTMLSpanElement \| null`                                             | `null`      | Bindable root span.                                              |
| `class`   | `string`                                                              | —           | Merges onto the outer wrapper after its layout and size classes. |

All remaining native `<span>` attributes and handlers are forwarded. Children are technically inherited from the native type, but the local implementation owns its internal children and does not render caller content.

### `rootVariants`

`rootVariants({ variant, size })` is a Tailwind Variants function. `RootVariants` and `RootSizes` expose its two option types for wrappers and app code.

---

## Styling and DOM contract

- Stable root hook: `data-slot="status-dot"`.
- Root layout: relative flex container sized by `size`.
- Visible dot: nested relative span with the selected background.
- Pulse: optional absolute nested span with `animate-ping` and 75% opacity.
- `default` uses the semantic `primary` token; `muted` uses `muted-foreground`.
- `success`, `warning`, `error`, and `info` use fixed Tailwind emerald, amber, rose, and sky colors in the current local implementation.
- Root `class` uses `cn()` and may replace size or layout classes; the internal layers are not separately configurable.

The nested spans have no stable `data-slot`. Target the root or exported variant helper instead of depending on child position.

---

## Accessibility

Status Dot has no default role or accessible name. Pair it with visible text and normally mark the dot `aria-hidden="true"`. If the state changes dynamically, put `role="status"` or an appropriate live region on the surrounding text, not on an unexplained color marker.

Pulse is visual only. Respect reduced-motion needs in the app, for example with `class="motion-reduce:[&>span]:animate-none"`, and never make the pulse the only indication of change.

---

## Localization

Status Dot contains no built-in copy and requires no localization messages. The app supplies and translates every visible status and accessible label.

---

## Dependencies

### Packages

```sh
# Bun
bun add tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

No external animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--primary: oklch(0.841 0.238 128.85);
	--muted-foreground: oklch(0.553 0.013 58.071);
}

.dark {
	--primary: oklch(0.768 0.233 130.85);
	--muted-foreground: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-primary: var(--primary);
	--color-muted-foreground: var(--muted-foreground);
}
```

The semantic values may be replaced by the app's theme. Fixed status colors come from Tailwind's built-in palette. No custom keyframe, variant, font, or layout rule is required.

### Shared utilities

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

### Component files and other integration

```text
status-dot/
├── index.ts
└── status-dot-root.svelte
```

Status Dot requires no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

---

## Credits

The component is adapted from [more-shadcn-svelte Status Dot](https://more-shadcn.noair.fun/docs/components/status-dot).

---

## File organization

| File                     | Responsibility                                                                    |
| ------------------------ | --------------------------------------------------------------------------------- |
| `status-dot-root.svelte` | Variant definitions, size, optional pulse, native attributes, and rendered spans. |
| `index.ts`               | Public component, variant helper, and exported types.                             |
| `README.md`              | Usage, API, accessibility, styling, and installation guide.                       |

The component's `index.ts`, exported types, and `rootVariants` are the source of truth for the public API.

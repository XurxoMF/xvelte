# Spinner

A compact animated loading indicator that renders the project's semantic loader icon with a localized accessible name. It forwards SVG attributes so callers can adjust its size, color, role, and labelling.

Use Spinner for short indeterminate waits near the control or region being updated. Use Progress when measurable completion exists, and add visible status text when the loading operation is not obvious from context.

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
	import * as Spinner from "$lib/components/ui/spinner";
</script>
```

`index.ts` exports `Root` and `RootProps`.

---

## Anatomy

Spinner is a single semantic icon:

```svelte
<Spinner.Root />
```

It renders `LoaderIcon` from `$lib/icons` rather than importing an icon library directly.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Spinner from "$lib/components/ui/spinner";
</script>

<div class="flex items-center gap-2">
	<Spinner.Root />
	<span>Loading account</span>
</div>
```

The icon already has `role="status"` and the localized accessible label `Loading`. When adjacent visible text communicates the same state, override the icon label or hide the duplicate announcement as appropriate.

---

## Examples

### Inside a disabled button

```svelte
<button type="button" disabled class="inline-flex items-center gap-2" aria-busy="true">
	<Spinner.Root aria-hidden="true" />
	Saving changes…
</button>
```

The visible button text supplies the status, so the decorative spinner is hidden from assistive technology.

### Custom size and accessible label

```svelte
<Spinner.Root class="size-6" aria-label="Refreshing messages" />
```

### Decorative spinner

```svelte
<Spinner.Root aria-hidden="true" role={undefined} />
```

Use this only when another element already exposes the loading state.

---

## Public API

`RootProps` equals Svelte's native `SVGAttributes<SVGSVGElement>`. The component's `index.ts` and exported type are the source of truth.

| Prop         | Type                    | Default               | Behavior                                                                                          |
| ------------ | ----------------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| `role`       | SVG role                | `"status"`            | Exposes the icon as a live status object unless overridden.                                       |
| `aria-label` | `string`                | Localized `"Loading"` | Accessible name for the loading state.                                                            |
| `class`      | `string`                | —                     | Merges after the local size and spin animation.                                                   |
| `name`       | Inherited SVG attribute | —                     | Forwarded for compatibility with alternate icon component prop types. `null` becomes `undefined`. |
| `color`      | Inherited SVG attribute | —                     | Controls icon color when supplied. `null` becomes `undefined`.                                    |
| `stroke`     | Inherited SVG attribute | —                     | Controls stroke when supported by the backing icon. `null` becomes `undefined`.                   |

All remaining SVG attributes and event handlers are forwarded to `LoaderIcon`. Spinner does not expose a bindable `ref` and accepts no children.

---

## Styling and DOM contract

- Default classes: `size-4 animate-spin`.
- No `data-slot` is currently added because the rendered element is the icon component itself.
- `class` is merged with `cn()`, allowing callers to replace size or animation utilities.
- Color defaults to the inherited `currentColor` behavior of the backing icon.

The SVG structure and vendor-specific attributes belong to the configured `LoaderIcon`; use the semantic export rather than styling internal SVG paths.

---

## Accessibility

Spinner defaults to a named status. Use an action-specific `aria-label` when plain “Loading” lacks context. If visible text or a parent live region already announces the same operation, set `aria-hidden="true"` on Spinner to prevent duplicate output.

Add `aria-busy="true"` to the region whose contents are changing and restore it when loading ends. The spinner does not disable controls, manage focus, or announce completion.

---

## Localization

| Message ID         | English value | Used by               |
| ------------------ | ------------- | --------------------- |
| `lucky_cedar_load` | `Loading`     | Default `aria-label`. |

Override `aria-label` for contextual loading copy. The app translates visible status text separately.

---

## Dependencies

### Packages

```sh
# Bun
bun add @tabler/icons-svelte clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install @tabler/icons-svelte clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add @tabler/icons-svelte clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss
```

No animation package is required; `animate-spin` is provided by Tailwind CSS.

### Icon facade

Add the exact semantic export to `$lib/icons.ts`:

```ts
export { default as LoaderIcon } from "@tabler/icons-svelte/icons/loader";
```

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the message listed in [Localization](#localization) to `messages/en.json`. The complete key and value are already shown there.

### Global styles and component files

The only required global style is Tailwind's import:

```css
@import "tailwindcss";
```

```text
spinner/
├── index.ts
└── spinner-root.svelte
```

Spinner requires no other xvelte component, hook, attachment, context, semantic theme variable, shared style, image, font, or network service.

---

## Credits

The component is adapted from [shadcn-svelte Spinner](https://www.shadcn-svelte.com/docs/components/spinner).

---

## File organization

| File                  | Responsibility                                                                  |
| --------------------- | ------------------------------------------------------------------------------- |
| `spinner-root.svelte` | Loader icon, localized accessible label, SVG forwarding, and animation classes. |
| `index.ts`            | Public component and props type.                                                |
| `README.md`           | Usage, API, accessibility, localization, and installation guide.                |

The component's `index.ts` and `RootProps` are the source of truth for the public API.

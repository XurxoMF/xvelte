# Switch

An accessible binary control for turning a setting on or off. It wraps Bits UI, exposes a bindable checked state, supports form submission and validation attributes, and adds local compact and default sizes.

Use Switch for settings that take effect immediately. Use Checkbox for independent selections, acknowledgements, or values submitted together, and avoid a switch when saving requires a separate confirmation action.

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
	import * as Switch from "$lib/components/ui/switch";
</script>
```

`index.ts` exports `Root` and `RootProps`.

---

## Anatomy

Root renders the complete switch and owns its thumb:

```svelte
<Switch.Root aria-label="Enable notifications" />
```

The local wrapper removes Bits UI's `children` and `child` snippets, so the internal Thumb cannot be replaced through the public API. Place label and description content beside the Root.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Switch from "$lib/components/ui/switch";

	let enabled = $state(false);
</script>

<label class="flex items-center gap-3">
	<Switch.Root bind:checked={enabled} />
	<span>Email notifications</span>
</label>
```

The surrounding label gives the button an accessible name and a larger pointer target.

---

## Examples

### Description and controlled state

```svelte
<script lang="ts">
	import * as Switch from "$lib/components/ui/switch";

	let compactMode = $state(true);
</script>

<div class="flex items-start justify-between gap-4">
	<div>
		<label for="compact-mode" class="font-medium">Compact mode</label>
		<p id="compact-mode-description" class="text-sm text-muted-foreground">Show more items in each list.</p>
	</div>

	<Switch.Root id="compact-mode" bind:checked={compactMode} aria-describedby="compact-mode-description" />
</div>
```

### Small switch

```svelte
<label class="inline-flex items-center gap-2 text-sm">
	<Switch.Root size="sm" bind:checked={showHints} />
	Show hints
</label>
```

### Form submission

```svelte
<form method="POST" class="space-y-4">
	<label class="flex items-center gap-3">
		<Switch.Root name="weeklySummary" value="enabled" bind:checked={weeklySummary} />
		<span>Weekly summary</span>
	</label>

	<button type="submit">Save preferences</button>
</form>
```

Bits UI creates its hidden form input only when `name` is present. As with native checkboxes, an unchecked control does not submit its value.

### Invalid and disabled states

```svelte
<Switch.Root aria-label="Managed policy" disabled />

<Switch.Root aria-label="Required consent" aria-invalid="true" required />
```

Explain disabled and invalid states with adjacent translated text; styling alone is not sufficient.

---

## Public API

`RootProps` is based on the installed stable `bits-ui@2.18.1` `Switch.RootProps`, removes `children` and `child`, and adds the local `size`. See the complete [Bits UI Switch API](https://bits-ui.com/docs/components/switch#api-reference) for primitive and native button details. The component's `index.ts`, exported type, and source are the source of truth.

| Prop              | Type                         | Default     | Behavior                                                              |
| ----------------- | ---------------------------- | ----------- | --------------------------------------------------------------------- |
| `checked`         | `boolean`                    | `false`     | Bindable on/off state.                                                |
| `onCheckedChange` | `(checked: boolean) => void` | —           | Runs whenever Bits UI changes the checked state.                      |
| `size`            | `"sm" \| "default"`          | `"default"` | Local 24×14-pixel or 32×18.4-pixel layout.                            |
| `disabled`        | `boolean \| null`            | `false`     | Prevents interaction and applies disabled styling.                    |
| `required`        | `boolean`                    | `false`     | Participates in form validation when `name` creates the hidden input. |
| `name`            | `string`                     | —           | Creates and names the hidden form input.                              |
| `value`           | `unknown`                    | —           | Submitted form value while checked. This is distinct from `checked`.  |
| `ref`             | `HTMLButtonElement \| null`  | `null`      | Bindable switch button.                                               |

Native `<button>` attributes and ARIA attributes are forwarded. Root owns the Thumb and does not accept custom content.

---

## Styling and DOM contract

| Element | Stable hook                          | Local behavior                                                                          |
| ------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| Root    | `data-slot="switch"`, `data-size="sm | default"`                                                                               | Rounded track, enlarged pseudo-element hit area, focus/invalid rings, checked and disabled colors. |
| Thumb   | `data-slot="switch-thumb"`           | Rounded semantic background, size and translation selected from the root's group state. |

Bits UI supplies `data-state="checked|unchecked"`, `data-checked`, `data-unchecked`, and `data-disabled` together with button and hidden-input behavior. Root `class` uses `cn()`; Thumb has no public class prop.

The local RTL transform is driven by the primitive's state attributes. Test custom size overrides in both text directions because thumb translation assumes the built-in dimensions.

---

## Accessibility

Bits UI renders a keyboard-operable switch button and exposes checked state through switch semantics. Space toggles the focused control. Every switch needs an accessible name from a wrapping label, associated `<label for>`, `aria-label`, or `aria-labelledby`.

Use a description for consequences or constraints, preserve visible focus styling, and do not put unrelated interactive controls inside a label that wraps the switch. Disabled switches remain discoverable but cannot be changed; explain why when the reason is not obvious.

---

## Localization

Switch contains no built-in copy and requires no localization messages. The app supplies and translates labels, descriptions, validation messages, and disabled explanations.

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

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--destructive: oklch(0.577 0.245 27.325);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
	--destructive: oklch(0.704 0.191 22.216);
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-destructive: var(--destructive);
}

@custom-variant data-checked {
	&:where([data-state="checked"]),
	&:where([data-checked]:not([data-checked="false"])) {
		@slot;
	}
}

@custom-variant data-unchecked {
	&:where([data-state="unchecked"]),
	&:where([data-unchecked]:not([data-unchecked="false"])) {
		@slot;
	}
}

@custom-variant data-disabled {
	&:where([data-disabled="true"]),
	&:where([data-disabled]:not([data-disabled="false"])) {
		@slot;
	}
}
```

The semantic values may be replaced by the app's theme. No keyframe, font, or layout rule is required.

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
```

### Component files and other integration

```text
switch/
├── index.ts
└── switch-root.svelte
```

Switch requires no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

---

## Credits

The component structure and styling are adapted from [shadcn-svelte Switch](https://www.shadcn-svelte.com/docs/components/switch).

---

## File organization

| File                 | Responsibility                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `switch-root.svelte` | Bindable checked state, local sizes, complete track/thumb composition, primitive props, and styling. |
| `index.ts`           | Public component and props type.                                                                     |
| `README.md`          | Usage, API, accessibility, forms, styling, and installation guide.                                   |

The component's `index.ts` and `RootProps` are the source of truth for the public API.

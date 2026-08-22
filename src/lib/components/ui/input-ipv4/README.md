# Input IPv4

A responsive segmented IPv4 address input with four equal-width numeric octets, automatic focus movement, full-address paste handling, bindable validation state, and native form submission support. Use it when an app needs structured IPv4 entry; use a normal text input when incomplete or non-address text must remain untouched.

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
	import * as InputIPv4 from "$lib/components/ui/input-ipv4";
</script>
```

The component's `index.ts` exports `Root`, the `RootProps` and `IPv4Segments` types, and the `isValidIPv4` and `safeParseIPv4` helpers. Individual segments are internal implementation details and are not exported.

---

## Anatomy

`Root` renders four internal text inputs, three visible separators, and a visually hidden input that carries the joined value for native form submission.

```svelte
<InputIPv4.Root name="serverAddress" />
```

`Root` owns and coordinates every segment automatically. Each octet receives an equal share of the available editable width, so the component follows the width supplied by its parent or `class`.

---

## Basic usage

```svelte
<script lang="ts">
	import * as InputIPv4 from "$lib/components/ui/input-ipv4";

	let address = $state<string | null>(null);
	let valid = $state(false);
</script>

<label id="server-address-label">Server IPv4 address</label>
<InputIPv4.Root aria-labelledby="server-address-label" name="serverAddress" bind:value={address} bind:valid />

<p>{valid ? `Address: ${address}` : "Enter a complete IPv4 address."}</p>
```

---

## Examples

### Placeholder and alternate separator

```svelte
<InputIPv4.Root aria-label="Device IPv4 address" placeholder="192.168.1.1" separator="_" />
```

The visible and bound value uses the selected separator. Parsing also accepts dots, spaces, and underscores, so a complete address can be pasted in any of those forms.

### Validate an address without rendering the component

```svelte
<script lang="ts">
	import { isValidIPv4, safeParseIPv4 } from "$lib/components/ui/input-ipv4";

	const segments = safeParseIPv4("10.0.0.25");
	const valid = isValidIPv4("10.0.0.25");
</script>
```

`safeParseIPv4` returns four normalized segments and replaces invalid or missing octets with `null`. It is tolerant input normalization, not a substitute for `isValidIPv4` when completeness matters.

---

## Public API

The component's `index.ts` and exported types are the source of truth.

### `InputIPv4.Root`

Type: `RootProps`, based on native `div` attributes.

| Prop          | Type                     | Default     | Behavior                                                                           |
| ------------- | ------------------------ | ----------- | ---------------------------------------------------------------------------------- |
| `value`       | `string \| null`         | `null`      | Bindable joined address. Partial input is preserved using the selected separator.  |
| `valid`       | `boolean`                | `false`     | Bindable result of `isValidIPv4(value)`; also controls `aria-invalid` on the root. |
| `separator`   | `"." \| " " \| "_"`      | `"."`       | Character shown between octets and used in `value`.                                |
| `placeholder` | `string`                 | `undefined` | Address parsed into per-segment placeholders.                                      |
| `name`        | `string`                 | `undefined` | Name of the hidden form input containing `value`.                                  |
| `ref`         | `HTMLDivElement \| null` | `null`      | Bindable root element reference.                                                   |
| `class`       | `string`                 | `undefined` | Merged after the component's root classes.                                         |

Remaining native `div` attributes are forwarded to the visible root. `name` and `value` belong to the separate hidden input rather than the root element.

### Helpers and types

| Export          | Signature                                                   | Purpose                                                    |
| --------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `IPv4Segments`  | Four-element tuple of `string \| null`                      | Normalized octet representation.                           |
| `safeParseIPv4` | `(value: string \| undefined) => IPv4Segments \| undefined` | Parses dots, spaces, or underscores without throwing.      |
| `isValidIPv4`   | `(value: string \| null \| undefined) => boolean`           | Checks for exactly four numeric octets from 0 through 255. |

---

## Styling and DOM contract

| Element           | Stable `data-slot`   |
| ----------------- | -------------------- |
| Visible root      | `ipv4-input`         |
| Editable octet    | `ipv4-input-segment` |
| Hidden form value | `ipv4-input-value`   |

The historical slot names remain stable even though the component folder is named `input-ipv4`. The root exposes `aria-invalid`, uses semantic theme colors, applies `focus-within` ring styling, and fills its available width. Its four internal segments use `flex: 1 1 0%` with `min-width: 0`, so each receives one quarter of the editable width after the fixed separators and padding. The public `class` prop styles the root; segment classes are internal. Segment inputs also use the local `hide-ramp` class to suppress WebKit number controls.

---

## Accessibility

- Give the root an accessible name with `aria-label` or `aria-labelledby`; the component does not render a label.
- The first segment participates in normal tab order. Arrow keys, separators, completed octets, and Backspace move focus between segments.
- `aria-invalid` is set on the visible root from the bindable `valid` state.
- Do not remove visible focus styles or replace the coordinated keyboard handlers when using `Root`.
- Pair validation messages with the root through `aria-describedby` when they provide information not already visible.

---

## Localization

Input IPv4 has no built-in user-facing copy. Your app supplies and translates its label, placeholder, instructions, and validation messages. The separator and `data-slot` values are technical values and are not translated.

---

## Dependencies

Input IPv4 expects Svelte 5 and Tailwind CSS 4. It has no primitive library, icon, localization package, hook, attachment, context, or other xvelte component dependency.

```sh
# bun
bun add clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/input-ipv4` component folder, including `index.ts`, `input-ipv4-root.svelte`, the utility file, and this README.

### Shared utilities

Add these exact exports to `src/lib/utils.ts` when absent:

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

### Global CSS

Add the required semantic tokens and mappings to the global Tailwind stylesheet. The color values are replaceable theme defaults; preserve the variable names and mappings.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--primary: oklch(0.768 0.233 130.85);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-muted-foreground: var(--muted-foreground);
	--color-input: var(--input);
	--color-ring: var(--ring);
}
```

No icon export, localization message, animation import, keyframe, font, image, network service, or additional shared file is required. The app owns dark-mode activation.

---

## Credits

The original IPv4 input was adapted from [shadcn-svelte-extras](https://www.shadcn-svelte-extras.com/components/ipv4address-input). xvelte's local exports, helpers, responsive segment layout, styling, and behavior are the documented implementation.

---

## File organization

| File                     | Responsibility                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `input-ipv4-root.svelte` | Renders and coordinates four equal-width octets, focus, paste, validation, and the form value. |
| `input-ipv4-utils.ts`    | Exports IPv4 parsing, validation, and tuple types.                                             |
| `index.ts`               | Public root, types, and helper exports.                                                        |
| `README.md`              | Installation and usage guide.                                                                  |

The component's `index.ts` and its exported types are the source of truth for the public API.

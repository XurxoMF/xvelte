# Input IPv6

A responsive segmented IPv6 address input with eight equal-width hexadecimal hextets, automatic focus movement, full-address paste handling, bindable validation state, and native form submission support. Use it for guided IPv6 entry; use a normal text input when users must freely edit compressed notation without expansion.

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
- [File organization](#file-organization)

## Import

```svelte
<script lang="ts">
	import * as InputIPv6 from "$lib/components/ui/input-ipv6";
</script>
```

The component's `index.ts` exports `Root`, the `RootProps` and `IPv6Segments` types, and the `isValidIPv6` and `safeParseIPv6` helpers. Individual segments are internal implementation details and are not exported.

## Anatomy

`Root` renders eight internal text inputs, seven visible separators, and a visually hidden input that carries the joined value for native form submission.

```svelte
<InputIPv6.Root name="serverAddress" />
```

`Root` owns and coordinates every segment automatically. Each hextet receives an equal share of the available editable width, so the component follows the width supplied by its parent or `class`.

## Basic usage

```svelte
<script lang="ts">
	import * as InputIPv6 from "$lib/components/ui/input-ipv6";

	let address = $state<string | null>(null);
	let valid = $state(false);
</script>

<label id="server-address-label">Server IPv6 address</label>
<InputIPv6.Root aria-labelledby="server-address-label" name="serverAddress" bind:value={address} bind:valid />

<p>{valid ? `Address: ${address}` : "Enter a complete IPv6 address."}</p>
```

## Examples

### Paste compressed or IPv4-mapped input

```svelte
<InputIPv6.Root aria-label="Gateway IPv6 address" placeholder="2001:db8::1" />
```

Pasting a valid compressed address expands it to eight hextets. A valid dotted IPv4 tail is converted into its final two hexadecimal hextets. Direct editing remains an eight-segment experience and the bound value uses the configured separator.

### Parse and validate outside the component

```svelte
<script lang="ts">
	import { isValidIPv6, safeParseIPv6 } from "$lib/components/ui/input-ipv6";

	const segments = safeParseIPv6("2001:db8::1");
	const valid = isValidIPv6("2001:db8::1");
</script>
```

`safeParseIPv6` expands complete compressed input and preserves positions for partial expanded input. Use `isValidIPv6` when a complete address is required.

## Public API

The component's `index.ts` and exported types are the source of truth.

### `InputIPv6.Root`

Type: `RootProps`, based on native `div` attributes.

| Prop          | Type                     | Default     | Behavior                                                                           |
| ------------- | ------------------------ | ----------- | ---------------------------------------------------------------------------------- |
| `value`       | `string \| null`         | `null`      | Bindable joined address. Partial input is preserved using the selected separator.  |
| `valid`       | `boolean`                | `false`     | Bindable result of `isValidIPv6(value)`; also controls `aria-invalid` on the root. |
| `separator`   | `":" \| " " \| "_"`      | `":"`       | Character shown between hextets and used in `value`.                               |
| `placeholder` | `string`                 | `undefined` | Address parsed into per-segment placeholders.                                      |
| `name`        | `string`                 | `undefined` | Name of the hidden form input containing `value`.                                  |
| `ref`         | `HTMLDivElement \| null` | `null`      | Bindable root element reference.                                                   |
| `class`       | `string`                 | `undefined` | Merged after the component's root classes.                                         |

Remaining native `div` attributes are forwarded to the visible root. `name` and `value` belong to the separate hidden input.

### Helpers and types

| Export          | Signature                                                   | Purpose                                                                       |
| --------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `IPv6Segments`  | Eight-element tuple of `string \| null`                     | Normalized hextet representation.                                             |
| `safeParseIPv6` | `(value: string \| undefined) => IPv6Segments \| undefined` | Parses partial, expanded, compressed, and IPv4-mapped input without throwing. |
| `isValidIPv6`   | `(value: string \| null \| undefined) => boolean`           | Validates a complete expanded, compressed, or IPv4-mapped address.            |

## Styling and DOM contract

| Element           | Stable `data-slot`   |
| ----------------- | -------------------- |
| Visible root      | `ipv6-input`         |
| Editable hextet   | `ipv6-input-segment` |
| Hidden form value | `ipv6-input-value`   |

The historical slot names remain stable even though the component folder is named `input-ipv6`. The root exposes `aria-invalid`, uses semantic theme colors, and applies the Input component's `focus-within` treatment: a `ring` border and three-pixel, 50%-opacity halo without a contrasting ring offset. It fills its available width. Its eight internal segments use `flex: 1 1 0%` with `min-width: 0`, so each receives one eighth of the editable width after the fixed separators and padding. The public `class` prop styles the root; segment classes are internal.

## Accessibility

- Give the root an accessible name with `aria-label` or `aria-labelledby`; the component does not render a label.
- The first segment participates in normal tab order. Arrow keys, separators, completed hextets, and Backspace move focus between segments.
- `aria-invalid` is set on the visible root from the bindable `valid` state.
- Do not remove visible focus styles or replace the coordinated keyboard handlers when using `Root`.
- Associate additional validation guidance through `aria-describedby` when needed.

## Localization

Input IPv6 has no built-in user-facing copy. Your app supplies and translates its label, placeholder, instructions, and validation messages. Hexadecimal digits, separators, and `data-slot` values are technical values and are not translated.

## Dependencies

Input IPv6 expects Svelte 5 and Tailwind CSS 4. It has no primitive library, icon, localization package, hook, attachment, context, or other xvelte component dependency.

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

Copy the complete `src/lib/components/ui/input-ipv6` component folder, including `index.ts`, `input-ipv6-root.svelte`, the utility file, and this README.

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

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

No icon export, localization message, animation import, keyframe, font, image, network service, or additional shared file is required. The app owns dark-mode activation.

## File organization

| File                     | Responsibility                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `input-ipv6-root.svelte` | Renders and coordinates eight equal-width hextets, focus, paste, validation, and the form value. |
| `input-ipv6-utils.ts`    | Exports IPv6 parsing, expansion, validation, and tuple types.                                    |
| `index.ts`               | Public root, types, and helper exports.                                                          |
| `README.md`              | Installation and usage guide.                                                                    |

The component's `index.ts` and its exported types are the source of truth for the public API.

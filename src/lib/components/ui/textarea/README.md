# Textarea

A styled native multiline text field with bindable value, content-based field sizing, validation states, disabled styling, a configurable local slot name, and complete native textarea attribute forwarding.

Use Textarea for free-form text that may span multiple lines. Use Input for short single-line values, a rich-text editor for structured formatting, and Code or a code editor for source input that needs syntax-aware behavior.

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
	import * as Textarea from "$lib/components/ui/textarea";
</script>
```

`index.ts` exports `Root` and `RootProps`.

---

## Anatomy

Textarea renders one native element and accepts no child content:

```svelte
<Textarea.Root />
```

Use `value` or `bind:value` for content; text placed between component tags is unsupported.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Textarea from "$lib/components/ui/textarea";

	let message = $state("");
</script>

<label for="message">Message</label>
<Textarea.Root id="message" name="message" bind:value={message} placeholder="Write your message" />
```

---

## Examples

### Description and character limit

```svelte
<label for="bio">Biography</label>
<p id="bio-help" class="text-sm text-muted-foreground">Maximum 240 characters.</p>
<Textarea.Root id="bio" bind:value={bio} maxlength={240} aria-describedby="bio-help" />
<p class="text-sm">{bio.length}/240</p>
```

### Invalid state

```svelte
<label for="feedback">Feedback</label>
<Textarea.Root
	id="feedback"
	bind:value={feedback}
	aria-invalid={error ? "true" : undefined}
	aria-describedby={error ? "feedback-error" : undefined}
/>
{#if error}
	<p id="feedback-error" class="text-sm text-destructive">{error}</p>
{/if}
```

The local component styles `aria-invalid`; validation logic and translated error copy remain app-owned.

### Fixed height and manual resize

```svelte
<Textarea.Root class="field-sizing-fixed h-40 resize-y" placeholder="Meeting notes" />
```

The default `field-sizing-content` allows the control to grow with content where supported, with a minimum height of 4rem. Override it when the layout needs fixed sizing.

### Custom slot for a wrapper component

```svelte
<Textarea.Root data-slot="comment-input" />
```

Most applications should keep the default slot; wrapper components may use a role-specific value.

---

## Public API

`RootProps` is Svelte's `HTMLTextareaAttributes` with children removed and a bindable element `ref`. The component's `index.ts` and exported type are the source of truth.

| Prop        | Type                          | Default      | Behavior                                                                     |
| ----------- | ----------------------------- | ------------ | ---------------------------------------------------------------------------- |
| `value`     | Native textarea value         | —            | Bindable text content.                                                       |
| `ref`       | `HTMLTextAreaElement \| null` | `null`       | Bindable native element.                                                     |
| `data-slot` | `string`                      | `"textarea"` | Replaces the local stable hook.                                              |
| `class`     | `string`                      | —            | Merges after local dimensions, colors, focus, disabled, and invalid classes. |

All remaining native attributes and handlers—including `name`, `rows`, `cols`, `required`, `readonly`, `disabled`, `minlength`, `maxlength`, `autocomplete`, `placeholder`, `oninput`, and form attributes—are forwarded.

---

## Styling and DOM contract

- Default stable hook: `data-slot="textarea"`; callers may override it.
- Minimum height: 4rem; full width; content-based field sizing.
- Semantic tokens: `input`, `muted-foreground`, `ring`, and `destructive`.
- States: native `disabled`, `focus-visible`, placeholder, `aria-invalid`, and dark theme classes.
- Root `class` uses `cn()`, so later Tailwind utilities replace conflicting defaults.

There are no internal elements or dependency-owned state attributes.

---

## Accessibility

Textarea is a native control and preserves browser keyboard, selection, form, resize, validation, and assistive behavior. Every field needs a visible associated label or an equivalent accessible name. Connect descriptions and errors with `aria-describedby`, and set `aria-invalid` only when invalid.

Do not use placeholder text as the only label. Ensure content expansion does not push essential controls out of reach, and preserve a usable manual resize option when users may need more space.

---

## Localization

Textarea contains no built-in copy and requires no localization messages. The app supplies and translates labels, placeholders, descriptions, counters, validation messages, and entered defaults.

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

No primitive or animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--muted-foreground: oklch(0.553 0.013 58.071);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--destructive: oklch(0.577 0.245 27.325);
	--radius: 0.45rem;
}

.dark {
	--muted-foreground: oklch(0.709 0.01 56.259);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
	--destructive: oklch(0.704 0.191 22.216);
}

@theme inline {
	--color-muted-foreground: var(--muted-foreground);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-destructive: var(--destructive);
	--radius-lg: var(--radius);
}
```

Values may be replaced by the app's theme. No keyframe, custom state variant, font, or layout rule is required.

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
textarea/
├── index.ts
└── textarea-root.svelte
```

Textarea needs no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

---

## Credits

The component styling is adapted from [shadcn-svelte Textarea](https://www.shadcn-svelte.com/docs/components/textarea).

---

## File organization

| File                   | Responsibility                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `textarea-root.svelte` | Native textarea, bindable value/ref, slot override, attributes, and state styling. |
| `index.ts`             | Public component and props type.                                                   |
| `README.md`            | Usage, API, accessibility, styling, and installation guide.                        |

The component's `index.ts` and `RootProps` are the source of truth for the public API.

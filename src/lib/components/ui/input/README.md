# Input

A styled native input for collecting single-line text, numbers, dates, files, and other browser-supported values. It preserves native form behavior, forwards input attributes and events, exposes bindable value, file-list, and element references, and provides consistent focus, disabled, invalid, placeholder, and file-selector styling.

Use Input for ordinary form fields whose behavior is provided by the native `input` element. Do not use it for multiline content, compound fields with icons or actions, one-time passwords, or specialized selection controls when xvelte provides Textarea, Input Group, Input OTP, Checkbox, Radio Group, Switch, or another purpose-built component.

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

## Import

Import the component through its public `index.ts`:

```svelte
<script lang="ts">
	import * as Input from "$lib/components/ui/input";
</script>
```

`index.ts` exports `Root`, `RootProps`, and the `RootTypes` input-type alias.

## Anatomy

Input has one public part and renders exactly one native `input`:

```svelte
<label for="email">Email address</label>
<Input.Root id="email" name="email" type="email" autocomplete="email" />
```

The component has two internal render branches:

1. `type="file"` renders a file input with bindable `files` and `value`.
2. Every other type renders the same styled input with bindable `value` but no public `files` value.

There is no wrapper, internal label, description, error message, icon, prefix, or suffix. The app composes those elements and connects them through native IDs and ARIA attributes.

## Basic usage

Use a visible label, an appropriate input type, and browser autocomplete metadata:

```svelte
<script lang="ts">
	import * as Input from "$lib/components/ui/input";

	let email = $state("");
</script>

<form class="grid max-w-sm gap-2">
	<label for="account-email" class="text-sm font-medium">Email address</label>
	<Input.Root id="account-email" name="email" type="email" autocomplete="email" placeholder="name@example.com" bind:value={email} required />

	<button type="submit">Continue</button>
</form>
```

When `type` is omitted, the native browser default is `text`. `bind:value` synchronizes the app variable with Svelte's native input binding behavior; the resulting value type depends on the selected native input type.

## Examples

### Validation and an accessible error

`aria-invalid` activates the local invalid styling but does not create validation logic or announce an error by itself:

```svelte
<script lang="ts">
	import * as Input from "$lib/components/ui/input";

	let username = $state("");
	let touched = $state(false);
	let invalid = $derived(touched && username.length < 3);
</script>

<div class="grid max-w-sm gap-1.5">
	<label for="username" class="text-sm font-medium">Username</label>
	<Input.Root
		id="username"
		name="username"
		bind:value={username}
		minlength={3}
		required
		aria-invalid={invalid}
		aria-describedby={invalid ? "username-error" : undefined}
		onblur={() => (touched = true)}
	/>

	{#if invalid}
		<p id="username-error" class="text-sm text-danger">Enter at least three characters.</p>
	{/if}
</div>
```

Native attributes such as `required`, `minlength`, `maxlength`, `min`, `max`, `step`, and `pattern` continue to participate in browser constraint validation. The app owns when errors are shown and how they are localized.

### File selection

Use `bind:files`, not the file input's string `value`, to access selected files:

```svelte
<script lang="ts">
	import * as Input from "$lib/components/ui/input";

	let files = $state<FileList | undefined>();
</script>

<div class="grid max-w-sm gap-1.5">
	<label for="attachments" class="text-sm font-medium">Attachments</label>
	<Input.Root id="attachments" name="attachments" type="file" accept="image/png,image/jpeg" multiple bind:files />

	{#if files?.length}
		<p class="text-sm">{files.length} file{files.length === 1 ? "" : "s"} selected</p>
	{/if}
</div>
```

`accept` guides the file picker but is not security validation. Validate MIME type, extension, size, and content again where the upload is processed. A `FileList` is not mutated directly; assign a new browser-created `FileList` when programmatically clearing or replacing it.

### Numeric value

Svelte's native binding coerces number and range input values to numbers:

```svelte
<script lang="ts">
	import * as Input from "$lib/components/ui/input";

	let quantity = $state(1);
</script>

<label for="quantity">Quantity</label>
<Input.Root id="quantity" name="quantity" type="number" min={1} max={20} step={1} bind:value={quantity} />
```

The public `value` type follows Svelte's broad native attribute type, so TypeScript does not narrow it from `type`. Keep the bound app variable appropriate for the chosen native control.

### Read-only and disabled

These native states have different form and focus behavior:

```svelte
<div class="grid max-w-sm gap-4">
	<div class="grid gap-1.5">
		<label for="customer-id">Customer ID</label>
		<Input.Root id="customer-id" name="customerId" value="CUS-1042" readonly />
	</div>

	<div class="grid gap-1.5">
		<label for="archived-code">Archived code</label>
		<Input.Root id="archived-code" name="archivedCode" value="OLD-19" disabled />
	</div>
</div>
```

A read-only input remains focusable and is submitted with its form. A disabled input is not focusable through ordinary keyboard navigation and is omitted from form submission.

### Element reference and native methods

Bind `ref` for native focus, selection, validity, or measurement APIs:

```svelte
<script lang="ts">
	import * as Input from "$lib/components/ui/input";

	let inputRef = $state<HTMLElement | null>(null);
</script>

<button type="button" onclick={() => inputRef?.focus()}>Focus search</button>
<Input.Root bind:ref={inputRef} type="search" aria-label="Search documentation" />
```

The exported reference type is `HTMLElement | null`, while the rendered runtime element is always an `HTMLInputElement`. Narrow or cast only when an input-specific DOM method is required and the element contract is preserved.

### Checkbox and radio types

Although the native type union accepts `checkbox` and `radio`, this component's classes are designed for full-width text-like and file fields. It also declares only `value`, `files`, and `ref` as bindable component props; it does not declare component-level `checked` or `group` bindings.

Use the xvelte Checkbox and Radio Group components for normal selection controls. If a native checkbox or radio is intentionally required, manage it with forwarded native state and change handlers rather than expecting `bind:checked` or `bind:group` on `Input.Root`.

## Public API

Input wraps a native HTML `input` and has no external primitive API. It accepts the standard Svelte `HTMLInputAttributes` except that the `type="file"` branch is modeled separately for `files`. See [MDN's input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input) for native browser behavior. The component's `index.ts`, exported types, and local source are the source of truth.

### `Input.Root`

Type: `RootProps`, based on native input attributes with a bindable element reference and a discriminated file/non-file type definition.

| Prop        | Type                      | Default     | Behavior                                                                                                       |
| ----------- | ------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `type`      | `"file" \| RootTypes`     | `undefined` | Selects native input behavior. An omitted or unsupported browser value behaves according to native HTML rules. |
| `value`     | Svelte native input value | `undefined` | Bindable value passed to the native input in both render branches.                                             |
| `files`     | `FileList \| undefined`   | `undefined` | Bindable selected files, available through the public type only for the explicit `type="file"` branch.         |
| `ref`       | `HTMLElement \| null`     | `null`      | Bindable reference to the rendered input.                                                                      |
| `class`     | `string`                  | `undefined` | Merged after the component's complete local input classes.                                                     |
| `data-slot` | `string`                  | `"input"`   | Local stable hook by default; deliberately customizable for wrappers such as Input Group and Sidebar Input.    |

Every remaining native input attribute and event handler is forwarded after the local type, binding, slot, and class handling. Common examples include `id`, `name`, `autocomplete`, `placeholder`, `required`, `readonly`, `disabled`, `accept`, `multiple`, `inputmode`, `min`, `max`, `step`, `pattern`, `aria-*`, `oninput`, `onchange`, `onfocus`, and `onblur`.

`value`, `files`, and `ref` are the component's declared bindable props. Other native attributes may be forwarded as values or event handlers, but forwarding does not turn them into Svelte component bindings.

### `RootTypes`

The exported alias is defined exactly as:

```ts
type RootTypes = Exclude<HTMLInputTypeAttribute, "file">;
```

Svelte's `HTMLInputTypeAttribute` includes the standard HTML input type strings and an open string extension for forward-compatible or custom values. `file` is modeled by the separate `RootProps` branch because it enables `files`.

At runtime the component selects its file branch only when `type === "file"`. Browsers normally fall back to text behavior for an unsupported input type.

### Binding and forwarding details

- `bind:value` is connected directly to the native input in both branches.
- `bind:files` is connected only in the `type="file"` branch.
- `bind:ref` is connected directly to the rendered native element.
- The component does not own validation state, dirty/touched state, debouncing, masking, parsing, formatting, or form submission.
- The component does not expose children or render a wrapper.

For file inputs, browser security rules prevent assigning an arbitrary local path through `value`. Read selected files from `files` and let the browser own the displayed filename text.

## Styling and DOM contract

Root always renders one native `input`. Its default stable hook is:

| Part | Stable hook         | Element        |
| ---- | ------------------- | -------------- |
| Root | `data-slot="input"` | Native `input` |

The `data-slot` prop may intentionally replace the default. xvelte wrappers use this to expose context-specific hooks such as `input-group-control` and `sidebar-input`; preserve the value required by the component you are composing with.

Local styling provides:

- Full width, minimum width zero, `h-8`, `rounded-lg`, semantic input border, transparent background, and compact padding.
- Responsive text sizing: `text-base` by default and `text-sm` from the `md` breakpoint.
- Semantic placeholder and file-selector text.
- A visible semantic focus border and three-pixel ring.
- Pointer blocking, not-allowed cursor, input-tinted background, and reduced opacity when disabled.
- Danger border and ring styling when `aria-invalid` is truthy.
- Dark-mode input backgrounds and adjusted invalid colors.
- Native file-selector button layout through `file:*` Tailwind variants.

Root merges caller classes with `cn`. Later conflicting Tailwind utilities can replace ordinary local height, width, radius, border, background, padding, typography, transition, or state styles. Native `style` and other forwarded attributes are not merged by `cn`.

The component exposes no CSS variable, animation, keyframe, variant function, size prop, or additional DOM state. Browser-owned pseudo-classes and validity states remain available to app styles.

## Accessibility

Input retains native semantics, keyboard behavior, browser validation, form participation, autofill, and platform input experiences. The app remains responsible for configuring them correctly:

- Associate every visible input with a persistent label using `for` and `id`, or provide an equivalent accessible name when a visible label is genuinely inappropriate.
- Do not use `placeholder` as the only label; it disappears as people type and may have insufficient contrast.
- Select the native `type`, `autocomplete`, and `inputmode` that match the requested data. These improve mobile keyboards, autofill, validation, and password-manager behavior.
- Connect instructions and errors with `aria-describedby`. Set `aria-invalid` when the current value is invalid; local red styling alone does not explain the problem.
- Use `required`, limits, and patterns as progressive browser validation, then validate again wherever submitted data is trusted.
- Preserve visible focus styling. Do not replace the outline and ring without an equally clear keyboard-focus indicator.
- Treat `disabled` and `readonly` according to their native differences. Do not disable a field merely to make it visually read-only.
- For file inputs, provide clear accepted format and size instructions outside the control, then validate selected files independently.

Use purpose-built Checkbox and Radio Group components for choice controls because their checked state, grouping, labels, and visual geometry differ from a text field. Use Input Group when icons, buttons, prefixes, suffixes, or inline help must share the field's visual container.

## Localization

Input has no built-in user-facing copy and imports no localization messages. The app supplies and translates labels, placeholders, descriptions, errors, format hints, units, file requirements, and surrounding button text.

Native browser strings inside date, time, color, number, and file controls are provided by the browser and operating system. Their language and formatting follow the user's environment and input attributes rather than xvelte messages.

Input type names, autocomplete tokens, validation attributes, event names, and `data-slot` are technical identifiers and are not translated.

## Dependencies

Input expects a Svelte 5 project using Tailwind CSS 4. It has no external component primitive, icon package, localization package, hook, attachment, context file, or other xvelte component dependency.

Install the class-merging packages as runtime dependencies and Tailwind as a development dependency:

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

Copy the complete `src/lib/components/ui/input` component folder:

- `input-root.svelte`
- `index.ts`
- `README.md`

The examples use native labels and buttons, so no additional xvelte component is required. Follow the relevant component's README separately when choosing to compose Input with Label, Button, Field, Input Group, or another xvelte component.

### Shared utilities

Root imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class values and resolves conflicting Tailwind utilities in favor of the last value.
 *
 * @param inputs - Conditional, nested, or plain class values to merge.
 * @returns The normalized class string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block includes `clsx` and `tailwind-merge`.

### Global CSS

The global stylesheet must load Tailwind, define the dark variant, and expose the semantic colors and radius used by Input. These are xvelte's defaults; apps may replace the values while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--danger: oklch(0.704 0.191 22.216);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-lg: var(--radius);
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

The app owns dark-mode activation. Input requires the base-layer `*:focus-visible` rule shown above, but no `tw-animate-css` import, component-specific CSS variable, keyframe, icon export from `src/lib/icons.ts`, localization message, image, font, network service, or additional layout rule.

## Credits

Adapted from [shadcn-svelte's Input](https://www.shadcn-svelte.com/docs/components/input). The local namespace export, file binding, type definitions, customizable slot, dimensions, theme values, and source are the source of truth.

## File organization

| File                | Responsibility                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `input-root.svelte` | Native file/non-file rendering, value/files/reference bindings, customizable slot, local styling, and native attribute forwarding. |
| `index.ts`          | Public Root component, props type, and non-file input type exports.                                                                |
| `README.md`         | Usage, examples, API, bindings, styling, accessibility, localization, dependencies, limitations, and credits.                      |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

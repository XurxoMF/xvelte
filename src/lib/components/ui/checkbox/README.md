# Checkbox

An accessible control for choosing one or more independent options. It supports checked, unchecked, and indeterminate states, form submission, disabled and read-only behavior, validation styling, and a built-in state icon.

Use a checkbox when each choice can be turned on or off independently, such as accepting terms, enabling preferences, or selecting several items. Use a radio group instead when exactly one option must be chosen, and use a switch when an immediately applied on/off setting is easier to understand as a state than as a selection.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Checkbox from "$lib/components/ui/checkbox";
</script>
```

Checkbox's `index.ts` exports `Root` and the `RootProps` type.

---

## Anatomy

Checkbox is a single-part component:

```svelte
<Checkbox.Root />
```

`Root` renders the interactive checkbox button and creates its indicator internally. A check icon represents the checked state and a minus icon represents the indeterminate state. The indicator cannot be replaced through a child snippet in the local xvelte API.

Associate every checkbox with visible label text, either by matching `id` and `for` attributes or by wrapping the checkbox and its text in one `<label>`.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Checkbox from "$lib/components/ui/checkbox";

	let accepted = $state(false);
</script>

<div class="flex items-center gap-2">
	<Checkbox.Root id="terms" name="terms" required bind:checked={accepted} />
	<label for="terms" class="text-sm font-medium">Accept the terms and conditions</label>
</div>

<p class="mt-2 text-sm text-muted-foreground">
	{accepted ? "Terms accepted" : "Terms not accepted"}
</p>
```

Binding `checked` keeps application state synchronized with user interaction. Supplying `name` also makes Bits UI render the hidden native input used for form submission and validation.

---

## Examples

### Multiple independent choices

xvelte does not expose Bits UI's optional `Checkbox.Group` or `Checkbox.GroupLabel` parts. Render one `Checkbox.Root` for each independent choice and keep their values in shared application state instead:

```svelte
<script lang="ts">
	import * as Checkbox from "$lib/components/ui/checkbox";

	const channels = [
		{ value: "email", label: "Email" },
		{ value: "push", label: "Push notifications" },
		{ value: "sms", label: "Text messages" }
	] as const;

	type ChannelValue = (typeof channels)[number]["value"];

	let selected = $state<Record<ChannelValue, boolean>>({
		email: true,
		push: false,
		sms: false
	});

	const selectedValues = $derived(channels.filter((channel) => selected[channel.value]).map((channel) => channel.label));
</script>

<fieldset class="grid gap-3">
	<legend class="mb-1 text-sm font-medium">Notification channels</legend>

	{#each channels as channel (channel.value)}
		<div class="flex items-center gap-2">
			<Checkbox.Root id={`channel-${channel.value}`} name="channels" value={channel.value} bind:checked={selected[channel.value]} />
			<label for={`channel-${channel.value}`} class="text-sm">{channel.label}</label>
		</div>
	{/each}
</fieldset>

<p class="mt-3 text-sm text-muted-foreground">
	Selected: {selectedValues.length > 0 ? selectedValues.join(", ") : "None"}
</p>
```

Using the same `name` and a different `value` for each checkbox submits every checked value as part of the `channels` field. The surrounding `fieldset` and `legend` give the related choices a shared accessible name.

### Large clickable checkbox card

Wrap the complete card in a native label when its full area should toggle the checkbox. The `:has()` variants below also highlight the card when its nested checkbox reports `aria-checked="true"`:

```svelte
<script lang="ts">
	import * as Checkbox from "$lib/components/ui/checkbox";

	let notificationsEnabled = $state(true);
</script>

<label
	for="notifications"
	class="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 has-aria-checked:border-primary has-aria-checked:bg-primary/5"
>
	<Checkbox.Root id="notifications" bind:checked={notificationsEnabled} class="mt-0.5" />

	<span class="grid gap-1.5">
		<span class="text-sm leading-none font-medium">Enable notifications</span>
		<span class="text-sm leading-relaxed text-muted-foreground"> Receive important account and security updates by email. </span>
	</span>
</label>
```

Do not place links, buttons, or other interactive controls inside this label-card. Clicking any of them would also interact with the enclosing label and create confusing keyboard and pointer behavior.

### Indeterminate state

Use `indeterminate` for a mixed collection, such as a “select all” checkbox when only some child items are selected:

```svelte
<script lang="ts">
	import * as Checkbox from "$lib/components/ui/checkbox";

	let checked = $state(false);
	let indeterminate = $state(true);
</script>

<label for="all-documents" class="flex items-center gap-2">
	<Checkbox.Root id="all-documents" bind:checked bind:indeterminate />
	<span class="text-sm font-medium">Select all documents</span>
</label>
```

Keep `checked` and `indeterminate` synchronized with the collection they represent. If both are `true`, the local indicator displays the check icon because checked state has priority in the component's rendering logic.

---

## Public API

`RootProps` is based on `CheckboxPrimitive.RootProps`, with the primitive's `children` and `child` render props deliberately removed. The table documents the most important local and inherited options; use the [Bits UI Checkbox API reference](https://www.bits-ui.com/docs/components/checkbox#api-reference) for the complete inherited API.

### `Checkbox.Root`

| Prop                    | Type                         | Default     | xvelte behavior                                                                                                        |
| ----------------------- | ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `checked`               | `boolean`                    | `false`     | Bindable. Controls whether the checkbox is selected.                                                                   |
| `indeterminate`         | `boolean`                    | `false`     | Bindable. Displays the built-in minus icon and exposes the mixed state to assistive technology.                        |
| `onCheckedChange`       | `(checked: boolean) => void` | `undefined` | Called when the checked state changes.                                                                                 |
| `onIndeterminateChange` | `(value: boolean) => void`   | `undefined` | Called when the indeterminate state changes.                                                                           |
| `disabled`              | `boolean \| null`            | `false`     | Prevents focus and interaction and applies disabled styling.                                                           |
| `readonly`              | `boolean \| null`            | `false`     | Keeps the checkbox focusable while preventing user changes.                                                            |
| `required`              | `boolean`                    | `false`     | Applies required form validation to the hidden input.                                                                  |
| `name`                  | `any`                        | `undefined` | Enables the hidden form input and sets its submitted field name. Use a string for standard HTML form submission.       |
| `value`                 | `string`                     | `undefined` | Value submitted when checked. Browsers use `"on"` when a checkbox form value is not specified.                         |
| `ref`                   | `HTMLButtonElement \| null`  | `null`      | Bindable reference to the interactive button rendered by Bits UI.                                                      |
| `class`                 | `ClassValue`                 | `undefined` | Merged after the local layout, color, focus, validation, and state classes with `cn()`.                                |
| Native button props     | Varies                       | —           | Remaining button attributes, ARIA attributes, data attributes, and event handlers are forwarded to the primitive root. |

The visible indicator is fixed by xvelte: `children` and Bits UI's `child` render-delegation prop are not part of `RootProps`. Use `checked`, `indeterminate`, or their callbacks for controlled state; do not attempt to pass custom indicator content.

The component's `index.ts` and exported `RootProps` type are the source of truth for the public API.

---

## Styling and DOM contract

Stable xvelte hooks:

| Element               | `data-slot`          | Purpose                                                      |
| --------------------- | -------------------- | ------------------------------------------------------------ |
| Interactive root      | `checkbox`           | Styling, tests, and locating the checkbox button.            |
| Built-in icon wrapper | `checkbox-indicator` | Styling or locating the check/minus indicator independently. |

The root is a `size-4` flex container with an input-colored border, a small radius, primary checked colors, a visible focus ring, invalid-state colors, and disabled-state opacity. A positioned `::after` pseudo-element expands the pointer target beyond the visible 16-pixel square. Keep reasonable spacing between adjacent controls so these expanded targets do not overlap.

Bits UI supplies `role="checkbox"`, `aria-checked`, `aria-required`, `aria-readonly`, `data-state="checked|unchecked|indeterminate"`, `data-disabled`, and `data-readonly`. Prefer `aria-checked` or `data-state` for additional state-dependent styling. The local source currently contains `data-checked` Tailwind variants for its checked colors, while Bits UI 2.18 exposes checked state through `data-state` and `aria-checked`; verify the generated checked appearance when copying this component into a project with that installed version.

Classes passed through `class` are merged with local classes using `cn()`, so later conflicting Tailwind utilities can customize size, color, radius, and spacing. Preserve focus, disabled, invalid, and state selectors when replacing the complete class list.

---

## Accessibility

Bits UI provides checkbox semantics, ARIA state, Space-key interaction, disabled and read-only behavior, and form integration. xvelte preserves those attributes and adds visible focus and validation styles.

- Give every checkbox an accessible name through a visible `<label>`, `aria-label`, or `aria-labelledby`. Matching `id` and `for` attributes or a wrapping label both work.
- Use `fieldset` and `legend` when several checkboxes belong to one question or category.
- Keep the indeterminate state synchronized with the selected child items. Assistive technology receives it as `aria-checked="mixed"`.
- Use `disabled` for unavailable controls and `readonly` for a value that should remain focusable but cannot be changed.
- Add `name` when the checkbox participates in native form submission. Add `value` when the submitted value must be more descriptive than the browser default.
- Set `aria-invalid="true"` when validation fails and provide an associated error message separately.
- Do not put other interactive elements inside a wrapping checkbox label, including the large card pattern shown above.
- Do not use independent checkboxes for mutually exclusive options; use a radio group instead.

---

## Localization

Checkbox has no built-in user-facing copy and requires no localization messages. Your app supplies and translates labels, descriptions, validation messages, and any text that reports the current selection. Icon names, form values, and state attributes are technical values and are not translated.

---

## Dependencies

Checkbox expects a Svelte 5 project using Tailwind CSS 4. Install its runtime and styling packages with one of the following commands:

```sh
# bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss
```

### Global styles

Copy the Tailwind import, dark-mode selector, semantic variables, and theme mappings below into the app's global stylesheet. The values shown are xvelte's defaults; replace the color and radius values with the app's own theme while keeping the variable names and mappings. `--border`, `--muted`, and `--muted-foreground` are used by the examples; the Checkbox component itself uses the remaining color tokens.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-ring: var(--ring);
	--color-input: var(--input);
	--color-border: var(--border);
	--color-destructive: var(--destructive);
	--color-muted-foreground: var(--muted-foreground);
	--color-muted: var(--muted);
	--color-primary-foreground: var(--primary-foreground);
	--color-primary: var(--primary);
	--radius-sm: calc(var(--radius) * 0.6);
}
```

Checkbox requires no global keyframes, animation stylesheet, font, or shared component-specific CSS.

### Icons

Add the semantic icon exports used by the built-in indicator to `$lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as MinusIcon } from "@tabler/icons-svelte/icons/minus";
```

Both exports are backed by the installed `@tabler/icons-svelte` package. No other icons are required.

### Utilities

Add the following exports to `$lib/utils.ts`. `cn()` depends on `clsx` and `tailwind-merge`; the helper types remove the primitive render props that the local component replaces with its fixed indicator.

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

### Other project files

No other xvelte component, hook, attachment, context module, localization message, or shared style file is required. The examples deliberately use native HTML labels, so they remain complete without copying the separate Label component.

---

## Credits

Checkbox is adapted from the [shadcn-svelte Checkbox component](https://www.shadcn-svelte.com/docs/components/checkbox). Its interaction and state behavior are provided by the `bits-ui` dependency listed above.

---

## File organization

| File                   | Responsibility                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `checkbox-root.svelte` | Wraps Bits UI's checkbox root, owns local styling, forwards state and attributes, and renders icons. |
| `index.ts`             | Exports `Root` and `RootProps` as the component's public entry point.                                |
| `README.md`            | Documents installation, composition, examples, API, styling, accessibility, and dependencies.        |

The component's `index.ts` and its exported `RootProps` type are the source of truth for the public API.

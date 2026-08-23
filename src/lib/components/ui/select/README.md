# Select

An accessible custom select menu for choosing one or several values from a list. It supports controlled value and open state, keyboard navigation and typeahead, grouped and disabled options, forms, long scrollable lists, portals, collision-aware positioning, and custom item rendering through Bits UI.

Use Select when the option list needs custom styling or richer composition. Use radio controls when a short list should remain visible, Combobox when people need to filter many options, and a native select when native mobile behavior or minimal JavaScript is the priority.

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
	import * as Select from "$lib/components/ui/select";
</script>
```

`index.ts` exports `Root`, `Trigger`, `Content`, `Item`, `Group`, `GroupHeading`, `Label`, `Separator`, `ScrollUpButton`, `ScrollDownButton`, and `Portal`, together with a matching props type for every part.

The local component does not export a `Value` part. The app renders placeholder or selected text inside Trigger.

---

## Anatomy

```svelte
<Select.Root type="single">
	<Select.Trigger>Selected value or placeholder</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.GroupHeading>Group name</Select.GroupHeading>
			<Select.Item value="one" label="One">One</Select.Item>
		</Select.Group>
	</Select.Content>
</Select.Root>
```

Content creates Portal, the positioned primitive content, both scroll buttons, and Viewport internally. Item creates its selection indicator and text wrapper. Use `GroupHeading` for a heading tied to Bits UI group semantics; `Label` is a plain styled `<div>` for visual labels only.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Select from "$lib/components/ui/select";

	const themes = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
		{ value: "system", label: "System" }
	];

	let value = $state("");
	const triggerText = $derived(themes.find((theme) => theme.value === value)?.label ?? "Select a theme");
</script>

<Select.Root type="single" bind:value items={themes}>
	<Select.Trigger class="w-48" aria-label="Theme">{triggerText}</Select.Trigger>
	<Select.Content>
		{#each themes as theme (theme.value)}
			<Select.Item value={theme.value} label={theme.label}>{theme.label}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
```

Passing the same `items` array to Root enables closed-trigger typeahead and form autofill for single selection. It does not render options; Item components are still required.

---

## Examples

### Grouped and disabled options

```svelte
<Select.Root type="single" bind:value={timezone}>
	<Select.Trigger class="w-72" aria-label="Time zone">{timezone || "Select a time zone"}</Select.Trigger>
	<Select.Content class="max-h-72">
		<Select.Group>
			<Select.GroupHeading>Europe</Select.GroupHeading>
			<Select.Item value="Europe/Madrid" label="Madrid">Madrid</Select.Item>
			<Select.Item value="Europe/London" label="London">London</Select.Item>
		</Select.Group>

		<Select.Separator />

		<Select.Group>
			<Select.GroupHeading>Americas</Select.GroupHeading>
			<Select.Item value="America/New_York" label="New York">New York</Select.Item>
			<Select.Item value="America/Los_Angeles" label="Los Angeles" disabled>Los Angeles — unavailable</Select.Item>
		</Select.Group>
	</Select.Content>
</Select.Root>
```

Long content scrolls inside the internal Viewport; the up and down controls appear according to Bits UI state.

### Multiple selection

```svelte
<script lang="ts">
	import * as Select from "$lib/components/ui/select";

	let permissions = $state<string[]>([]);
	const summary = $derived(permissions.length ? `${permissions.length} selected` : "Select permissions");
</script>

<Select.Root type="multiple" bind:value={permissions}>
	<Select.Trigger class="w-56" aria-label="Permissions">{summary}</Select.Trigger>
	<Select.Content>
		<Select.Item value="read" label="Read">Read</Select.Item>
		<Select.Item value="comment" label="Comment">Comment</Select.Item>
		<Select.Item value="edit" label="Edit">Edit</Select.Item>
	</Select.Content>
</Select.Root>
```

Multiple mode keeps the menu open according to Bits UI behavior and uses a string array. Root's `items` typeahead option is only effective for single selection.

### Form field

```svelte
<form method="POST" class="space-y-2">
	<label id="language-label">Preferred language</label>

	<Select.Root type="single" name="language" bind:value={language} required>
		<Select.Trigger class="w-full" aria-labelledby="language-label">{language || "Select a language"}</Select.Trigger>
		<Select.Content>
			<Select.Item value="gl" label="Galego">Galego</Select.Item>
			<Select.Item value="en" label="English">English</Select.Item>
		</Select.Content>
	</Select.Root>

	<button type="submit">Save</button>
</form>
```

Bits UI creates the hidden form input when `name` is provided. Keep a real visible label or an equivalent accessible name on Trigger.

### Controlled open state and deselection

```svelte
<Select.Root type="single" bind:open bind:value allowDeselect onOpenChangeComplete={(open) => console.info("Animation complete", open)}>
	<Select.Trigger aria-label="Assignee">{assigneeLabel}</Select.Trigger>
	<Select.Content>
		<Select.Item value="ana" label="Ana">Ana</Select.Item>
		<Select.Item value="xoan" label="Xoán">Xoán</Select.Item>
	</Select.Content>
</Select.Root>
```

With `allowDeselect`, choosing the current item again clears a single value.

### Custom item content

```svelte
<Select.Item value="production" label="Production">
	{#snippet children({ selected })}
		<span class="flex items-center gap-2">
			<span class="size-2 rounded-full bg-primary" aria-hidden="true"></span>
			Production{selected ? " — selected" : ""}
		</span>
	{/snippet}
</Select.Item>
```

The local Item keeps its own check indicator and text wrapper. Its snippet receives `selected` and `highlighted` from Bits UI.

---

## Public API

Select wraps the installed stable `bits-ui@2.18.1` primitive. The tables document every local part and adaptation while summarizing inherited behavior; see the complete [Bits UI Select API](https://bits-ui.com/docs/components/select#api-reference). The component's `index.ts`, exported types, and source are the source of truth.

### `Select.Root`

Type: `RootProps`, equal to Bits UI `Select.RootProps`.

| Prop                   | Type                            | Default     | Behavior                                                       |
| ---------------------- | ------------------------------- | ----------- | -------------------------------------------------------------- |
| `type`                 | `"single" \| "multiple"`        | Required    | Selects `string` or `string[]` value behavior.                 |
| `value`                | `string \| string[]`            | Empty       | Bindable selection matching `type`.                            |
| `open`                 | `boolean`                       | `false`     | Bindable menu visibility.                                      |
| `onValueChange`        | `(value) => void`               | —           | Runs when the selection changes.                               |
| `onOpenChange`         | `(open: boolean) => void`       | —           | Runs as visibility changes.                                    |
| `onOpenChangeComplete` | `(open: boolean) => void`       | —           | Runs after the open/close animation completes.                 |
| `disabled`             | `boolean`                       | `false`     | Disables Trigger and Items.                                    |
| `required`             | `boolean`                       | `false`     | Enables hidden-input form validation.                          |
| `name`                 | `string`                        | —           | Creates a hidden form input.                                   |
| `autocomplete`         | HTML autocomplete value         | —           | Forwarded to the hidden input.                                 |
| `loop`                 | `boolean`                       | `false`     | Loops keyboard navigation.                                     |
| `scrollAlignment`      | `"nearest" \| "center"`         | `"nearest"` | Controls how highlighted items scroll into view.               |
| `items`                | `{ value; label; disabled? }[]` | —           | Enables closed-trigger typeahead and autofill for single mode. |
| `allowDeselect`        | `boolean`                       | `false`     | Allows a selected single item to clear itself.                 |
| `children`             | `Snippet`                       | —           | Renders Trigger and Content under shared state.                |

### `Select.Trigger`

Type: `TriggerProps`, based on Bits UI `TriggerProps` with `child` removed, plus local `size`.

| Prop       | Type                        | Default     | Behavior                                                                         |
| ---------- | --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `size`     | `"sm" \| "default"`         | `"default"` | Selects 28 or 32-pixel trigger height and local radius.                          |
| `children` | `Snippet`                   | —           | App-owned selected text or placeholder, rendered before the fixed selector icon. |
| `ref`      | `HTMLButtonElement \| null` | `null`      | Bindable trigger button.                                                         |

Native button attributes and ARIA attributes are forwarded. The trigger sets `data-size` and owns `SelectorIcon`.

### `Select.Content`

Type: `ContentProps`, based on Bits UI `ContentProps` with `child` removed, plus `portalProps`.

| Prop            | Type                           | Default | Behavior                                                                                  |
| --------------- | ------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| `portalProps`   | `PortalProps` without snippets | —       | Configures or disables/re-targets the generated Portal according to Bits UI's portal API. |
| `sideOffset`    | `number`                       | `4`     | Distance from Trigger in pixels.                                                          |
| `preventScroll` | `boolean`                      | `true`  | Locks outside document scrolling while open.                                              |
| `children`      | `Snippet`                      | —       | Groups, headings, separators, and Items rendered in the internal Viewport.                |
| `ref`           | `HTMLDivElement \| null`       | `null`  | Bindable positioned content.                                                              |

Content also inherits Bits UI floating-position options such as `side`, `align`, collision handling, sticky behavior, and escape/outside interaction callbacks. It always creates ScrollUpButton, Viewport, and ScrollDownButton.

### Item and grouping parts

| Part and type                        | Local/inherited API                                                                                                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Item` — `ItemProps`                 | Requires `value`; accepts `label`, `disabled`, `onHighlight`, `onUnhighlight`, `ref`, native div attributes, and a `children({ selected, highlighted })` snippet. `child` is removed. Falls back to `label |     | value`and owns`CheckIcon`. |
| `Group` — `GroupProps`               | Bits UI group with `children`, `child`, `ref`, and native div attributes; adds local padding and slot.                                                                                                     |
| `GroupHeading` — `GroupHeadingProps` | Bits UI semantic group heading with `children`, `child`, `ref`, and native div attributes.                                                                                                                 |
| `Label` — `LabelProps`               | Local plain `<div>` with native attributes, `children`, and bindable `ref`; visual only and not wired to group semantics.                                                                                  |
| `Separator` — `SeparatorProps`       | Reuses the xvelte Separator with its inherited orientation/decorative/native API and overrides the slot to `select-separator`.                                                                             |

### Portal and scroll parts

| Part and type                                | Local/inherited API                                                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Portal` — `PortalProps`                     | Forwards the complete Bits UI Portal API, including target and disabled behavior. Content normally creates it through `portalProps`.   |
| `ScrollUpButton` — `ScrollUpButtonProps`     | Bits UI scroll control with `delay(tick)`, `ref`, and native div attributes; custom snippets are removed and `ChevronUpIcon` is fixed. |
| `ScrollDownButton` — `ScrollDownButtonProps` | Same API and adaptation, with fixed `ChevronDownIcon`.                                                                                 |

---

## Styling and DOM contract

| Part           | Stable `data-slot`                                     | Noteworthy local hooks                                                    |
| -------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| Trigger        | `select-trigger`                                       | `data-size`, focus/invalid states, placeholder text, fixed selector icon. |
| Content        | `select-content`                                       | Floating side attributes, open/closed animation, popover tokens.          |
| Group          | `select-group`                                         | Scroll margin and padding.                                                |
| GroupHeading   | `select-group-heading`                                 | Muted 12-pixel heading.                                                   |
| Label          | `select-label`                                         | Muted plain visual label.                                                 |
| Item           | `select-item`                                          | Highlighted, disabled, and selected primitive state.                      |
| Separator      | `select-separator`                                     | Reused component boundary.                                                |
| Scroll buttons | `select-scroll-up-button`, `select-scroll-down-button` | Popover background and fixed chevrons.                                    |

Bits UI's internal Viewport has no local slot but receives anchor-derived `--bits-select-anchor-height` and `--bits-select-anchor-width` sizing. Content uses dependency-owned positioning variables and `data-side`; Portal renders outside the source DOM by default.

Every styled part merges `class` with `cn()`. Root and Portal have no visual class. Do not target private Viewport markup when a public Content or Item hook is sufficient.

---

## Accessibility

Bits UI supplies trigger/listbox semantics, active descendant handling, selection state, typeahead, keyboard navigation, escape/outside dismissal, and focus restoration. Trigger needs an accessible name even when visible placeholder text is present. `GroupHeading` should identify grouped options; `Label` is only presentational.

Do not place interactive controls inside Item. Keep every value stable and unique, provide an accurate `label` for typeahead when rendered content contains extra markup, and ensure disabled state is apparent in text when its reason matters. Test single and multiple selection with keyboard and assistive technology.

---

## Localization

Select contains no built-in human-readable copy and requires no localization messages. The app supplies and translates Trigger placeholder/summary text, option labels, group headings, disabled explanations, and validation messages.

The `value` strings submitted to forms are implementation values and normally remain untranslated; `label` and visible children are user-facing.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
pnpm add -D tailwindcss
```

### Icons

Add these exact exports to `$lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as ChevronDownIcon } from "@tabler/icons-svelte/icons/chevron-down";
export { default as ChevronUpIcon } from "@tabler/icons-svelte/icons/chevron-up";
export { default as SelectorIcon } from "@tabler/icons-svelte/icons/selector";
```

### Global styles and theme tokens

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--accent: oklch(0.841 0.238 128.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--destructive: oklch(0.577 0.245 27.325);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--accent: oklch(0.768 0.233 130.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
	--destructive: oklch(0.704 0.191 22.216);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-destructive: var(--destructive);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@custom-variant data-open {
	&:where([data-state="open"]),
	&:where([data-open]:not([data-open="false"])) {
		@slot;
	}
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}

@custom-variant data-closed {
	&:where([data-state="closed"]),
	&:where([data-closed]:not([data-closed="false"])) {
		@slot;
	}
}
```

The values may be replaced by the app's theme. No component-specific keyframe, font, or global layout rule is required.

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

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

### Required xvelte component

`Select.Separator` reuses the Separator component. Copy its folder and follow its README to install it:

```text
separator/
├── index.ts
└── separator-root.svelte
```

### Component files and other integration

```text
select/
├── index.ts
├── select-content.svelte
├── select-group-heading.svelte
├── select-group.svelte
├── select-item.svelte
├── select-label.svelte
├── select-portal.svelte
├── select-root.svelte
├── select-scroll-down-button.svelte
├── select-scroll-up-button.svelte
├── select-separator.svelte
└── select-trigger.svelte
```

Select requires no hook, attachment, local context file, localization setup, shared style, image, font, or network service. Bits UI owns its internal context and portal behavior.

---

## Credits

The component structure and styling are adapted from [shadcn-svelte Select](https://www.shadcn-svelte.com/docs/components/select).

---

## File organization

| File                               | Responsibility                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `select-root.svelte`               | Bindable open and value state plus primitive Root props.                      |
| `select-trigger.svelte`            | Styled trigger, local sizes, app text, and selector icon.                     |
| `select-content.svelte`            | Portal, overlay content, positioning defaults, scroll controls, and viewport. |
| `select-item.svelte`               | Option state, label fallback, custom snippet, check indicator, and styles.    |
| `select-group.svelte`              | Primitive option group.                                                       |
| `select-group-heading.svelte`      | Primitive group heading semantics and styles.                                 |
| `select-label.svelte`              | Plain visual label for advanced layouts.                                      |
| `select-separator.svelte`          | Select-specific wrapper around xvelte Separator.                              |
| `select-scroll-up-button.svelte`   | Fixed upper auto-scroll control.                                              |
| `select-scroll-down-button.svelte` | Fixed lower auto-scroll control.                                              |
| `select-portal.svelte`             | Public Bits UI Portal wrapper.                                                |
| `index.ts`                         | Public parts and every exported props type.                                   |
| `README.md`                        | Composition, examples, API, accessibility, styling, and installation guide.   |

The component's `index.ts` and exported types are the source of truth for the public API.

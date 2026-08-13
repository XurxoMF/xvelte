# Accordion

An accessible compound component for grouping related content into collapsible sections. It supports single-item and multiple-item expansion, controlled or uncontrolled state, disabled items, keyboard navigation, and animated content.

Use an accordion when several sections are equally important but do not need to be visible at the same time, such as FAQs or groups of settings. Do not hide information that users must compare simultaneously or critical actions whose existence should remain visible.

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
	import * as Accordion from "$lib/components/ui/accordion";
</script>
```

Accordion's `index.ts` also exports the `RootProps`, `ItemProps`, `TriggerProps`, and `ContentProps` types.

---

## Anatomy

Compose the public parts in this order:

```svelte
<Accordion.Root type="single">
	<Accordion.Item value="item-1">
		<Accordion.Trigger>Section title</Accordion.Trigger>
		<Accordion.Content>Section content</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
```

`Trigger` creates the Bits UI header internally, so xvelte does not expose a separate `Header` part. Each `Item` must contain a `Trigger` and its corresponding `Content`.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion";
</script>

<Accordion.Root type="single">
	<Accordion.Item value="shipping">
		<Accordion.Trigger>How long does shipping take?</Accordion.Trigger>
		<Accordion.Content>
			<p>Standard shipping normally takes three to five working days.</p>
		</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="returns">
		<Accordion.Trigger>Can I return an order?</Accordion.Trigger>
		<Accordion.Content>
			<p>Unused items can be returned within 30 days.</p>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
```

`type="single"` allows one open item. Use `type="multiple"` when several items may remain open.

---

## Examples

### Controlled single selection

For a single accordion, `value` is a string. Bind it when application code needs to inspect or change the open item.

```svelte
<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion";

	let value = $state("profile");
</script>

<button type="button" onclick={() => (value = "security")}>Open security</button>

<Accordion.Root type="single" bind:value>
	<Accordion.Item value="profile">
		<Accordion.Trigger>Profile</Accordion.Trigger>
		<Accordion.Content>Public profile settings.</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="security">
		<Accordion.Trigger>Security</Accordion.Trigger>
		<Accordion.Content>Password and sign-in settings.</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
```

### Multiple selection and disabled items

For a multiple accordion, `value` is a string array. Disable an individual item with `disabled` on `Item`, or the complete accordion with `disabled` on `Root`.

```svelte
<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion";

	let value = $state<string[]>(["notifications"]);
</script>

<Accordion.Root type="multiple" bind:value>
	<Accordion.Item value="notifications">
		<Accordion.Trigger level={2}>Notifications</Accordion.Trigger>
		<Accordion.Content>Email and push notification preferences.</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="billing" disabled>
		<Accordion.Trigger level={2}>Billing</Accordion.Trigger>
		<Accordion.Content>Billing is unavailable for this account.</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
```

### Searchable collapsed content

Set `hiddenUntilFound` on `Content` when closed content should remain discoverable through the browser's find-in-page feature. Browser support determines the exact behavior.

```svelte
<Accordion.Root type="single">
	<Accordion.Item value="reference">
		<Accordion.Trigger>Reference</Accordion.Trigger>
		<Accordion.Content hiddenUntilFound>
			<p>This text can be found even while the section is collapsed.</p>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
```

---

## Public API

The components forward the applicable Bits UI primitive props and native element attributes. The tables below document the xvelte-owned surface and behavior; use the [Bits UI Accordion API reference](https://www.bits-ui.com/docs/components/accordion#api-reference) for the complete inherited API.

### `Accordion.Root`

Type: `RootProps`, an alias of `AccordionPrimitive.RootProps`.

| Prop    | Type                     | Default            | xvelte behavior                                                |
| ------- | ------------------------ | ------------------ | -------------------------------------------------------------- |
| `type`  | `"single" \| "multiple"` | Required           | Determines whether `value` is a string or a string array.      |
| `value` | `string \| string[]`     | Managed by Bits UI | Bindable. Contains the open item or items according to `type`. |
| `ref`   | `HTMLDivElement \| null` | `null`             | Bindable reference to the root element.                        |
| `class` | `string`                 | `undefined`        | Merged after the local root classes.                           |

Notable inherited props include `disabled`, `loop`, `orientation`, `onValueChange`, `children`, and `child`.

### `Accordion.Item`

Type: `ItemProps`, an alias of `AccordionPrimitive.ItemProps`.

| Prop       | Type                     | Default              | xvelte behavior                                                                                           |
| ---------- | ------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------- |
| `value`    | `string`                 | Generated by Bits UI | Stable identifier used by the root state. Prefer an explicit value, especially for controlled accordions. |
| `disabled` | `boolean`                | `false`              | Prevents interaction with this item.                                                                      |
| `ref`      | `HTMLDivElement \| null` | `null`               | Bindable reference to the item element.                                                                   |
| `class`    | `string`                 | `undefined`          | Merged with the local separator styling.                                                                  |

Other inherited props include `children`, `child`, and native `div` attributes.

### `Accordion.Trigger`

Type: `TriggerProps`, which extends the Bits UI trigger props with `level` and deliberately omits the primitive `child` render-delegation prop.

| Prop       | Type                         | Default     | xvelte behavior                                                                                              |
| ---------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `level`    | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`         | Sets the `aria-level` of the header created around the trigger. Choose a level that fits the page hierarchy. |
| `children` | `Snippet`                    | `undefined` | Renders the visible trigger label before the built-in state icons.                                           |
| `ref`      | `HTMLButtonElement \| null`  | `null`      | Bindable reference to the trigger button.                                                                    |
| `class`    | `string`                     | `undefined` | Merged with the local button, focus, disabled, and icon styling.                                             |

The trigger always renders semantic open and closed chevrons; there is no prop to replace or remove them. Native button attributes and the remaining Bits UI trigger props are forwarded.

### `Accordion.Content`

Type: `ContentProps`, which forwards the Bits UI content props but deliberately omits its `child` render-delegation prop.

| Prop               | Type                     | Default            | xvelte behavior                                                                 |
| ------------------ | ------------------------ | ------------------ | ------------------------------------------------------------------------------- |
| `children`         | `Snippet`                | `undefined`        | Renders inside an additional styled content wrapper.                            |
| `forceMount`       | `boolean`                | Defined by Bits UI | Keeps the content mounted, for example when implementing custom transitions.    |
| `hiddenUntilFound` | `boolean`                | `false`            | Lets supporting browsers find collapsed content and open its item.              |
| `ref`              | `HTMLDivElement \| null` | `null`             | Bindable reference to the outer Bits UI content element, not the inner wrapper. |
| `class`            | `string`                 | `undefined`        | Applied to the inner content wrapper rather than the outer content element.     |

Native `div` attributes and other inherited props are applied to the outer Bits UI element. Because `class` is consumed by the inner wrapper, use the stable data slot to target the outer element when necessary.

---

## Styling and DOM contract

The component uses semantic Tailwind tokens and `tw-animate-css`. Opening and closing content is animated using the height exposed by Bits UI as `--bits-accordion-content-height`.

Stable xvelte hooks:

| Part                    | `data-slot`              | Additional stable class     |
| ----------------------- | ------------------------ | --------------------------- |
| `Root`                  | `accordion`              | `cn-accordion`              |
| `Item`                  | `accordion-item`         | —                           |
| `Trigger`               | `accordion-trigger`      | —                           |
| Built-in trigger icons  | `accordion-trigger-icon` | `cn-accordion-trigger-icon` |
| `Content` outer element | `accordion-content`      | —                           |

Bits UI also supplies state, orientation, disabled, and ARIA attributes. Prefer those attributes and the xvelte hooks above when styling state. Classes supplied to any public part are merged with its local styles, subject to the `Content` placement described in its API section.

---

## Accessibility

Bits UI provides the disclosure relationships, expanded state, disabled state, focus management, and keyboard navigation. xvelte adds the header wrapper automatically through `Trigger`.

- Keep trigger text concise and descriptive; it is the accessible name of the control.
- Set `level` to match the surrounding heading hierarchy. The default is `3`, not a universally correct value.
- Do not place interactive controls inside `Trigger`, which is already a button.
- Give every controlled item a stable, unique `value`.
- Preserve visible focus styles and the primitive-provided attributes when adding classes.
- Content that must always be perceived or compared should not be placed only inside collapsed items.

---

## Localization

Accordion has no built-in user-facing copy. Your app supplies and translates all trigger labels and content. Internal icon and state values are technical details and are not translated.

---

## Dependencies

Accordion expects a Svelte 5 project using Tailwind CSS 4. Install its runtime and styling packages with one of the following commands:

```sh
# bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss tw-animate-css

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css
```

### Global CSS

The application stylesheet, `src/routes/layout.css` in xvelte, must load Tailwind CSS and `tw-animate-css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
```

Accordion uses the `foreground`, `muted-foreground`, `border`, and `ring` semantic color utilities. Your theme must define and expose these tokens; the values below are xvelte's light defaults:

```css
:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--color-ring: var(--ring);
}
```

Define equivalent values inside the application's dark selector if it supports a dark theme. No accordion-specific CSS variables or keyframes need to be copied: Bits UI supplies `--bits-accordion-content-height`, and `tw-animate-css` supplies the `animate-accordion-down` and `animate-accordion-up` utilities.

### Icons

`accordion-trigger.svelte` imports semantic names from `$lib/icons`. The icon facade must contain these exports:

```ts
export { default as ChevronDownIcon } from "@tabler/icons-svelte/icons/chevron-down";
export { default as ChevronUpIcon } from "@tabler/icons-svelte/icons/chevron-up";
```

Keep these aliases in the shared facade instead of importing Tabler directly from the component.

### Shared utilities

The wrappers import `cn` and `WithoutChild` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;
```

The `any` in the conditional utility may require the same targeted ESLint exception used by xvelte. Accordion does not require hooks, attachments, context modules, localization messages, or other xvelte components.

---

## Credits

Accordion is adapted from the [shadcn-svelte Accordion](https://shadcn-svelte.com/docs/components/accordion). Its implementation has been modified to follow xvelte's local API, icon, styling, and import conventions.

---

## File organization

| File                       | Responsibility                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `accordion-root.svelte`    | Owns the accordion mode, open-value binding, root layout, and root DOM hook.              |
| `accordion-item.svelte`    | Wraps one collapsible section and supplies separator styling.                             |
| `accordion-trigger.svelte` | Creates the accessible header and trigger, applies focus styles, and renders state icons. |
| `accordion-content.svelte` | Renders and animates the collapsible panel plus its inner content wrapper.                |
| `index.ts`                 | Exports every public component part and props type.                                       |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, verify the installed dependency API and update this guide with the code change.

# Tabs

An accessible compound component for switching between related content panels. It supports bindable selection, horizontal and vertical orientation, automatic or manual activation, disabled tabs, keyboard navigation, and local filled or line-style tab lists through Bits UI.

Use Tabs when several peer panels share one context and only one should be visible at a time. Do not hide content that people must compare simultaneously, preserve across panels while editing, or discover through normal document scrolling.

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
	import * as Tabs from "$lib/components/ui/tabs";
</script>
```

`index.ts` exports `Root`, `List`, `Trigger`, `Content`, `RootProps`, `ListProps`, `ListVariants`, `TriggerProps`, `ContentProps`, and the `listVariants` styling helper.

---

## Anatomy

```svelte
<Tabs.Root value="first">
	<Tabs.List>
		<Tabs.Trigger value="first">First</Tabs.Trigger>
		<Tabs.Trigger value="second">Second</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="first">First panel</Tabs.Content>
	<Tabs.Content value="second">Second panel</Tabs.Content>
</Tabs.Root>
```

Every Trigger value must match one Content value. List contains only tab triggers; panels are siblings of List inside Root.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";

	let value = $state("overview");
</script>

<Tabs.Root bind:value>
	<Tabs.List aria-label="Project sections">
		<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
		<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="overview" class="pt-4">Project summary and status.</Tabs.Content>
	<Tabs.Content value="activity" class="pt-4">Recent project events.</Tabs.Content>
</Tabs.Root>
```

The local Root defaults to an empty value, so provide or bind an initial value when one panel should start selected.

---

## Examples

### Line variant

```svelte
<Tabs.Root value="details">
	<Tabs.List variant="line" aria-label="Record sections">
		<Tabs.Trigger value="details">Details</Tabs.Trigger>
		<Tabs.Trigger value="history">History</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="details" class="pt-4">Record details.</Tabs.Content>
	<Tabs.Content value="history" class="pt-4">Change history.</Tabs.Content>
</Tabs.Root>
```

The line variant removes the filled list background and adds an active indicator after each Trigger.

### Vertical tabs

```svelte
<Tabs.Root value="profile" orientation="vertical" class="min-h-48">
	<Tabs.List aria-label="Settings sections">
		<Tabs.Trigger value="profile">Profile</Tabs.Trigger>
		<Tabs.Trigger value="security">Security</Tabs.Trigger>
		<Tabs.Trigger value="billing">Billing</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="profile" class="pl-4">Profile settings.</Tabs.Content>
	<Tabs.Content value="security" class="pl-4">Security settings.</Tabs.Content>
	<Tabs.Content value="billing" class="pl-4">Billing settings.</Tabs.Content>
</Tabs.Root>
```

Vertical orientation changes Root layout, List direction, Trigger alignment, active indicator, and arrow-key axis.

### Manual activation and disabled tab

```svelte
<Tabs.Root value="preview" activationMode="manual" loop>
	<Tabs.List aria-label="Document modes">
		<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
		<Tabs.Trigger value="source">Source</Tabs.Trigger>
		<Tabs.Trigger value="history" disabled>History</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="preview">Rendered document.</Tabs.Content>
	<Tabs.Content value="source">Source document.</Tabs.Content>
	<Tabs.Content value="history">Unavailable history.</Tabs.Content>
</Tabs.Root>
```

Manual mode moves focus with arrow keys without changing the panel until activation. Disabled triggers are skipped.

---

## Public API

Tabs wraps the installed stable `bits-ui@2.18.1` primitive. The tables describe local additions and important inherited behavior; see the complete [Bits UI Tabs API](https://bits-ui.com/docs/components/tabs#api-reference). The component's `index.ts`, exported types/helper, and source are the source of truth.

### `Tabs.Root`

| Prop                 | Type                         | Default        | Behavior                                               |
| -------------------- | ---------------------------- | -------------- | ------------------------------------------------------ |
| `value`              | `string`                     | `""` locally   | Bindable selected tab value.                           |
| `onValueChange`      | `(value: string) => void`    | —              | Runs when selection changes.                           |
| `orientation`        | `"horizontal" \| "vertical"` | `"horizontal"` | Controls layout and keyboard axis.                     |
| `activationMode`     | `"automatic" \| "manual"`    | `"automatic"`  | Selects on focus or only on activation.                |
| `loop`               | `boolean`                    | `false`        | Wraps keyboard navigation.                             |
| `disabled`           | `boolean`                    | `false`        | Disables all triggers.                                 |
| `children` / `child` | Bits UI snippets             | —              | Renders List and panels or delegates the root element. |
| `ref`                | `HTMLDivElement \| null`     | `null`         | Bindable root element.                                 |

Root forwards native div attributes and merges class after local flex/orientation classes.

### List, Trigger, and Content

| Part and type              | Required/local props                               | Inherited behavior                                                                                             |
| -------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `List` — `ListProps`       | `variant?: "default" \| "line"`, default `default` | Bits UI tablist children/child, native div attributes, bindable ref; variant becomes `data-variant`.           |
| `Trigger` — `TriggerProps` | Required `value`; optional `disabled`              | Bits UI tab semantics, children/child, native button attributes, bindable ref, focus/active/disabled styling.  |
| `Content` — `ContentProps` | Required `value`                                   | Bits UI panel semantics, children/child, native div attributes, bindable ref, local flexible small-text class. |

### `listVariants`

`listVariants({ variant })` returns the same local List classes. `ListVariants` exposes its option type for wrappers. Callers normally use the `variant` prop rather than invoking the helper directly.

---

## Styling and DOM contract

| Part    | Stable hook                                                | State                                                                                       |
| ------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Root    | `data-slot="tabs"`, `group/tabs`                           | Bits UI `data-orientation`.                                                                 |
| List    | `data-slot="tabs-list"`, `group/tabs-list`, `data-variant` | Filled muted or transparent line presentation.                                              |
| Trigger | `data-slot="tabs-trigger"`                                 | Bits UI active and disabled attributes; local focus, dark, icon, and line indicator styles. |
| Content | `data-slot="tabs-content"`                                 | Bits UI panel visibility and relationships.                                                 |

List has stable classes `cn-tabs-list-variant-default` and `cn-tabs-list-variant-line`. Styled parts merge class with `cn()`. The Trigger's active underline is an internal pseudo-element rather than a separate DOM node.

---

## Accessibility

Bits UI supplies tablist, tab, and tabpanel roles; IDs and relationships; roving focus; disabled state; and orientation-aware keyboard navigation. List needs an accessible label when surrounding context does not name the tab set.

Keep Trigger labels concise and unique. In automatic mode, panel changes must be fast enough not to delay focus navigation. Do not put unrelated interactive controls inside List, and avoid nesting tab sets without clear labels.

---

## Localization

Tabs contains no built-in copy and requires no localization messages. The app supplies and translates tab labels, panel content, accessible labels, empty states, and disabled explanations. Values are stable implementation identifiers and should not be translated.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

No animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@custom-variant data-active {
	&:where([data-state="active"]),
	&:where([data-active]:not([data-active="false"])) {
		@slot;
	}
}

@custom-variant data-horizontal {
	&:where([data-orientation="horizontal"]) {
		@slot;
	}
}
```

Values may be replaced by the app's theme. No keyframe, font, or global layout rule is required.

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Component files and other integration

```text
tabs/
├── index.ts
├── tabs-content.svelte
├── tabs-list.svelte
├── tabs-root.svelte
└── tabs-trigger.svelte
```

Tabs needs no icon, other xvelte component, hook, attachment, context file, localization setup, shared style, image, font, or network service. Bits UI owns internal context.

---

## Credits

The local component structure and variants are adapted from [shadcn-svelte Tabs](https://www.shadcn-svelte.com/docs/components/tabs). The repeated Table of Contents URL supplied with this task does not match the local Tabs implementation.

---

## File organization

| File                  | Responsibility                                                              |
| --------------------- | --------------------------------------------------------------------------- |
| `tabs-root.svelte`    | Bindable selection, orientation layout, primitive state, and root hooks.    |
| `tabs-list.svelte`    | Filled/line variants, tablist layout, and exported helper.                  |
| `tabs-trigger.svelte` | Accessible tab button, active/disabled/focus states, and indicators.        |
| `tabs-content.svelte` | Associated tab panel and local content styling.                             |
| `index.ts`            | Public parts, props/variant types, and styling helper.                      |
| `README.md`           | Composition, examples, API, accessibility, styling, and installation guide. |

The component's `index.ts`, exported types, and `listVariants` are the source of truth for the public API.

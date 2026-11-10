# Trace

Trace presents compact, composable rows for agent activity, tool calls, tasks, sources, and other execution details. It supports running, error, and pending states plus expandable detail panels. Use Timeline for chronological events and Message for conversation content; Trace is intended for concise process activity.

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

Import every part through the component's public `index.ts`:

```svelte
<script lang="ts">
	import * as Trace from "$lib/components/ui/trace";
</script>
```

The component exports `Root`, `Line`, `Icon`, `Title`, `Description`, `Collapsible`, `CollapsibleTrigger`, and `CollapsibleContent`. It also exports the corresponding props types and `LineStatus`.

---

## Anatomy

A basic row combines an icon, primary title, and optional metadata:

```svelte
<Trace.Root>
	<Trace.Line>
		<Trace.Icon>{/* decorative icon */}</Trace.Icon>
		<Trace.Title>Read the configuration</Trace.Title>
		<Trace.Description>0.3s</Trace.Description>
	</Trace.Line>
</Trace.Root>
```

Use the collapsible parts when a row owns supporting output:

```svelte
<Trace.Collapsible>
	<Trace.CollapsibleTrigger>
		<Trace.Line>
			<Trace.Title>Inspected three files</Trace.Title>
		</Trace.Line>
	</Trace.CollapsibleTrigger>

	<Trace.CollapsibleContent>Detailed output</Trace.CollapsibleContent>
</Trace.Collapsible>
```

`CollapsibleTrigger` adds its own trailing chevron. Place `Trace.Line` directly inside the trigger so Root's wrapper styling and the trigger's error treatment can detect it.

---

## Basic usage

```svelte
<script lang="ts">
	import { CheckIcon, LoaderIcon } from "$lib/icons";

	import * as Trace from "$lib/components/ui/trace";
</script>

<Trace.Root>
	<Trace.Line>
		<Trace.Icon><CheckIcon /></Trace.Icon>
		<Trace.Title>Loaded project context</Trace.Title>
		<Trace.Description>0.2s</Trace.Description>
	</Trace.Line>

	<Trace.Line status="running">
		<Trace.Icon><LoaderIcon class="animate-spin" /></Trace.Icon>
		<Trace.Title>Checking the implementation</Trace.Title>
	</Trace.Line>
</Trace.Root>
```

`running` animates the title with the shared Shimmer style. The status does not choose an icon or change the text, so application code remains responsible for a meaningful visible label.

---

## Examples

### Statuses

```svelte
<script lang="ts">
	import { AlertErrorIcon, CircleIcon, LoaderIcon } from "$lib/icons";

	import * as Trace from "$lib/components/ui/trace";
</script>

<Trace.Root>
	<Trace.Line status="running">
		<Trace.Icon><LoaderIcon class="animate-spin" /></Trace.Icon>
		<Trace.Title>Generating the report</Trace.Title>
	</Trace.Line>

	<Trace.Line status="pending">
		<Trace.Icon><CircleIcon /></Trace.Icon>
		<Trace.Title>Publish the report</Trace.Title>
	</Trace.Line>

	<Trace.Line status="error">
		<Trace.Icon><AlertErrorIcon /></Trace.Icon>
		<Trace.Title>Could not read the data source</Trace.Title>
	</Trace.Line>
</Trace.Root>
```

### Expandable detail

```svelte
<script lang="ts">
	import { SearchIcon } from "$lib/icons";

	import * as Trace from "$lib/components/ui/trace";
</script>

<Trace.Root>
	<Trace.Collapsible>
		<Trace.CollapsibleTrigger>
			<Trace.Line>
				<Trace.Icon><SearchIcon /></Trace.Icon>
				<Trace.Title>Inspected the component directory</Trace.Title>
				<Trace.Description>12 files</Trace.Description>
			</Trace.Line>
		</Trace.CollapsibleTrigger>

		<Trace.CollapsibleContent>
			<p>Found reusable primitives, guides, and preview examples.</p>
		</Trace.CollapsibleContent>
	</Trace.Collapsible>
</Trace.Root>
```

The detail panel accepts arbitrary content, including lists and Code Block. Keep interactive controls outside `CollapsibleTrigger`, because it renders a button.

### Controlled expansion

```svelte
<script lang="ts">
	import * as Trace from "$lib/components/ui/trace";

	let open = $state(true);
</script>

<Trace.Collapsible bind:open>
	<Trace.CollapsibleTrigger>
		<Trace.Line>
			<Trace.Title>{open ? "Hide" : "Show"} validation output</Trace.Title>
		</Trace.Line>
	</Trace.CollapsibleTrigger>

	<Trace.CollapsibleContent>All checks passed.</Trace.CollapsibleContent>
</Trace.Collapsible>
```

### Linked row

Wrap a line in a real anchor when the whole row navigates:

```svelte
<Trace.Root>
	<a href="/reports/quarterly" aria-label="Open the quarterly report">
		<Trace.Line>
			<Trace.Title>Quarterly report</Trace.Title>
			<Trace.Description>PDF</Trace.Description>
		</Trace.Line>
	</a>
</Trace.Root>
```

Root styles direct wrappers that contain a line, while the anchor supplies navigation semantics and keyboard behavior.

---

## Public API

All native attributes and event handlers not listed below are forwarded. `class` is merged with the local classes by `cn()`, and each `ref` is bindable. The component's `index.ts` and exported types are the source of truth.

### `Trace.Root`

Type: `RootProps`, based on native `div` attributes with `ref?: HTMLDivElement | null`.

| Prop       | Type                     | Default     | Behavior                                                    |
| ---------- | ------------------------ | ----------- | ----------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders trace lines, collapsibles, or interactive wrappers. |
| `class`    | `ClassValue`             | `undefined` | Merges onto the vertical trace container.                   |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable root element reference.                            |

### `Trace.Line`

Type: `LineProps`, based on native `span` attributes.

| Prop       | Type                                | Default     | Behavior                                              |
| ---------- | ----------------------------------- | ----------- | ----------------------------------------------------- |
| `status`   | `"running" \| "error" \| "pending"` | `undefined` | Sets `data-status` and the matching visual treatment. |
| `children` | `Snippet`                           | `undefined` | Normally contains `Icon`, `Title`, and `Description`. |
| `class`    | `ClassValue`                        | `undefined` | Merges onto the row.                                  |
| `ref`      | `HTMLSpanElement \| null`           | `null`      | Bindable row reference.                               |

`LineStatus` is the exported status union. A line without `status` uses the normal completed/default treatment.

### `Trace.Icon`

Type: `IconProps`, based on native `span` attributes. It provides a fixed decorative icon cell and defaults to `aria-hidden="true"`. Its `children`, `class`, `ref`, and remaining native span attributes are forwarded; a supplied `aria-hidden` may override the default.

### `Trace.Title`

Type: `TitleProps`, based on native `span` attributes. It renders the primary text, truncates overflow by default, and receives the shimmer effect from a parent running line. Its `children`, `class`, `ref`, and remaining native span attributes are forwarded.

### `Trace.Description`

Type: `DescriptionProps`, based on native `span` attributes. It renders short secondary metadata with muted color and tabular numbers. Its `children`, `class`, `ref`, and remaining native span attributes are forwarded.

### `Trace.Collapsible`

Type: `CollapsibleProps`, an alias of the local Collapsible component's `RootProps`.

| Prop                   | Type                      | Default     | Behavior                                 |
| ---------------------- | ------------------------- | ----------- | ---------------------------------------- |
| `open`                 | `boolean`                 | `false`     | Bindable open state.                     |
| `onOpenChange`         | `(open: boolean) => void` | `undefined` | Runs when open state changes.            |
| `onOpenChangeComplete` | `(open: boolean) => void` | `undefined` | Runs after the presence cycle completes. |
| `disabled`             | `boolean`                 | `false`     | Disables its trigger.                    |
| `children`             | `Snippet`                 | `undefined` | Renders the trigger and detail panel.    |
| `class`                | `ClassValue`              | `undefined` | Merges onto the collapsible root.        |
| `ref`                  | `HTMLDivElement \| null`  | `null`      | Bindable default root reference.         |

Other local Collapsible root props, including render delegation through `child`, are forwarded unchanged. See the local Collapsible guide and the [Bits UI Collapsible API](https://www.bits-ui.com/docs/components/collapsible#api-reference).

### `Trace.CollapsibleTrigger`

Type: `CollapsibleTriggerProps`, the local Collapsible trigger props without its `child` render-delegation snippet. It always renders the primitive's default button, forwards native button props, renders `children`, and appends a decorative chevron. `class` merges onto the button and `ref` is bindable.

### `Trace.CollapsibleContent`

Type: `CollapsibleContentProps`, the local Collapsible content props without its `child` render-delegation snippet.

| Prop               | Type                     | Default     | Behavior                                                                |
| ------------------ | ------------------------ | ----------- | ----------------------------------------------------------------------- |
| `forceMount`       | `boolean`                | `false`     | Uses the inherited Collapsible mounting behavior.                       |
| `hiddenUntilFound` | `boolean`                | `false`     | Keeps closed text discoverable by browser find-in-page where supported. |
| `children`         | `Snippet`                | `undefined` | Renders inside the indented inner detail wrapper.                       |
| `class`            | `ClassValue`             | `undefined` | Merges onto the inner wrapper, not the primitive content element.       |
| `ref`              | `HTMLDivElement \| null` | `null`      | Bindable primitive content reference.                                   |

Remaining content attributes are forwarded to the outer primitive element. The component owns the animated outer classes and does not expose Collapsible's `child` snippet because the inner wrapper is part of Trace's stable layout.

---

## Styling and DOM contract

| Part                  | Default element | Stable xvelte hook                                  |
| --------------------- | --------------- | --------------------------------------------------- |
| `Root`                | `div`           | `data-slot="trace"`                                 |
| `Line`                | `span`          | `data-slot="trace-line"` and optional `data-status` |
| `Icon`                | `span`          | `data-slot="trace-icon"`                            |
| `Title`               | `span`          | `data-slot="trace-title"`                           |
| `Description`         | `span`          | `data-slot="trace-description"`                     |
| `Collapsible`         | `div`           | `data-slot="trace-collapsible"`                     |
| `CollapsibleTrigger`  | `button`        | `data-slot="trace-collapsible-trigger"`             |
| `CollapsibleContent`  | `div`           | `data-slot="trace-collapsible-content"`             |
| Content inner wrapper | `div`           | `data-slot="trace-collapsible-content-inner"`       |

Root detects direct wrappers containing a line so anchors, buttons, and component triggers keep the same compact layout. Line detects whether it sits inside an anchor or button to add pointer and hover styling. These selectors depend on the documented `data-slot` values and the direct composition shown above.

`data-status="running"` applies Shimmer only to the title; `error` uses the semantic `danger` color; `pending` lowers opacity. Collapsible adds dependency-owned `data-state`, `data-open`, `data-closed`, `aria-expanded`, and `aria-controls` hooks. Its chevron rotates from `aria-expanded`, and its panel uses the Bits UI height variable with the shared accordion animation utilities.

The layout uses logical inline spacing and borders, so it adapts to left-to-right and right-to-left documents. Consumer classes are merged last with `cn()`, although Tailwind Merge decides conflicts between equivalent utilities.

---

## Accessibility

`Root` and `Line` are presentational `div` and `span` elements. If the trace is semantically a list, add `role="list"` to Root and `role="listitem"` to each Line. A bare line is not interactive: wrap it in an anchor for navigation or use `CollapsibleTrigger` for disclosure instead of adding click behavior to the span.

CollapsibleTrigger inherits Bits UI's button semantics, keyboard activation, focus behavior, disabled handling, and `aria-expanded`/`aria-controls` relationship. Do not put links, buttons, or other interactive controls inside it. CollapsibleContent retains the primitive's visibility and find-in-page behavior.

Icon is decorative by default. Put the essential meaning in Title, including words such as “Failed”, “Running”, or “Pending”; color, opacity, animation, and icon shape must not be the only status indicators. Shimmer stops under reduced-motion preferences. Keep error text legible against the configured background and avoid rapidly changing live traces unless the surrounding application provides an appropriate live-region strategy.

---

## Localization

Trace contains no built-in human-readable copy and requires no Paraglide messages. The application supplies and translates every title, description, accessible label, and detail. Prefer complete translated status phrases instead of concatenating a translated status with dynamic text.

---

## Dependencies

This component requires the shared Animations style. Copy `src/lib/styles/animations.css` and `src/lib/styles/animations.md`, then follow the `animations.md` guide to import it.

Install the runtime packages and Tailwind dependencies used by Trace, Collapsible, the icon facade, and `cn()`:

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss
```

### Required xvelte components and styles

Copy the complete `src/lib/components/ui/collapsible` folder: `collapsible-root.svelte`, `collapsible-trigger.svelte`, `collapsible-content.svelte`, `index.ts`, and `collapsible.md`. Follow its `collapsible.md` guide for installation and inherited API details.

Copy `src/lib/styles/shimmer.css` and `src/lib/styles/shimmer.md`, then follow that guide. Import Tailwind, the animation package, and Shimmer from the application's global stylesheet; adjust the relative Shimmer path for the destination project:

```css
@import "tailwindcss";
@import "../lib/styles/animations.css";
@import "../lib/styles/shimmer.css";
```

Trace uses `foreground`, `muted-foreground`, `danger`, `border`, and `ring`. Define the corresponding variables for every theme and map them into Tailwind. Replace these sample values with the app's own accessible palette:

```css
:root {
	--foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(65.6% 0.241 354.308);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-ring: var(--ring);
}
```

### Icon facade

CollapsibleTrigger requires the semantic chevron export in `src/lib/icons.ts`:

```ts
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
```

Icons shown in examples are application choices and are not required by Trace itself.

### Utilities

Trace imports `cn`, `WithoutChild`, and `WithElementRef` from `$lib/utils`. Ensure that module includes these exports and their imports:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

Trace requires no hook, attachment, context file, localization message, asset, font, network service, or Tauri integration. The preview's optional icons are not component dependencies.

---

## Credits

Trace is adapted from the [shadcn-svelte Trace component](https://www.shadcn-svelte.com/docs/components/trace). Its semantic token, icon facade, logical spacing, public types, documentation, and local Collapsible integration follow xvelte's conventions.

---

## File organization

| File                               | Responsibility                                     |
| ---------------------------------- | -------------------------------------------------- |
| `trace-root.svelte`                | Vertical container and interactive-wrapper layout. |
| `trace-line.svelte`                | One status-aware activity row and `LineStatus`.    |
| `trace-icon.svelte`                | Decorative icon cell.                              |
| `trace-title.svelte`               | Primary text and reduced-motion shimmer fallback.  |
| `trace-description.svelte`         | Secondary metadata.                                |
| `trace-collapsible.svelte`         | Expandable Trace group.                            |
| `trace-collapsible-trigger.svelte` | Disclosure button and rotating chevron.            |
| `trace-collapsible-content.svelte` | Animated, indented detail panel.                   |
| `index.ts`                         | Public component and type exports.                 |
| `trace.md`                         | Installation, API, behavior, and usage guide.      |

The component's `index.ts` and exported types are the source of truth for the public API.

# Resizable

An accessible compound component for arranging content in horizontal or vertical panes that people can resize with a pointer, touch, or keyboard. It supports pane size constraints, collapsible panes, nested groups, persisted layouts, resize callbacks, and programmatic group layouts through PaneForge.

Use Resizable for adjustable workspaces such as sidebars, editors, inspectors, and split previews. Do not use it when the content should simply reflow at responsive breakpoints, and avoid making essential content unreachable by allowing a pane to collapse without a clear way to expand it again.

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

Import the component from its public `index.ts`:

```svelte
<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
</script>
```

`index.ts` exports `PaneGroup`, `Pane`, and `Handle`, together with the `PaneGroupProps`, `PaneProps`, and `HandleProps` types.

---

## Anatomy

Place one `Handle` between every pair of adjacent panes:

```svelte
<Resizable.PaneGroup direction="horizontal">
	<Resizable.Pane>First pane</Resizable.Pane>
	<Resizable.Handle />
	<Resizable.Pane>Second pane</Resizable.Pane>
</Resizable.PaneGroup>
```

`PaneGroup` supplies the shared layout and resize state. `Pane` defines one adjustable area, while `Handle` controls the two panes immediately beside it. A group can contain another complete `PaneGroup` inside one of its panes for nested layouts.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
</script>

<Resizable.PaneGroup direction="horizontal" class="h-72 rounded-lg border">
	<Resizable.Pane defaultSize={35} minSize={20}>
		<div class="flex h-full items-center justify-center p-6">Navigation</div>
	</Resizable.Pane>

	<Resizable.Handle withHandle />

	<Resizable.Pane defaultSize={65} minSize={30}>
		<div class="flex h-full items-center justify-center p-6">Workspace</div>
	</Resizable.Pane>
</Resizable.PaneGroup>
```

Pane sizes are percentages of the group. Give the group or one of its ancestors a definite height for a horizontal split; the local group otherwise uses `h-full`.

---

## Examples

### Vertical layout

Set the direction on the group. The local handle and optional visual grip rotate automatically:

```svelte
<Resizable.PaneGroup direction="vertical" class="h-96 rounded-lg border">
	<Resizable.Pane defaultSize={60} minSize={25}>
		<div class="flex h-full items-center justify-center p-6">Preview</div>
	</Resizable.Pane>

	<Resizable.Handle withHandle />

	<Resizable.Pane defaultSize={40} minSize={20}>
		<div class="flex h-full items-center justify-center p-6">Console</div>
	</Resizable.Pane>
</Resizable.PaneGroup>
```

### Collapsible pane

`collapsible` allows the pane before a handle to toggle between its minimum and collapsed sizes when the focused handle receives <kbd>Enter</kbd>:

```svelte
<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";

	let status = $state("Sidebar expanded");
</script>

<Resizable.PaneGroup direction="horizontal" class="h-72 rounded-lg border">
	<Resizable.Pane
		defaultSize={30}
		minSize={20}
		collapsedSize={5}
		collapsible
		onCollapse={() => (status = "Sidebar collapsed")}
		onExpand={() => (status = "Sidebar expanded")}
	>
		<div class="h-full overflow-auto p-4">Sidebar</div>
	</Resizable.Pane>

	<Resizable.Handle withHandle />

	<Resizable.Pane defaultSize={70} minSize={30}>
		<div class="h-full overflow-auto p-4">Main content</div>
	</Resizable.Pane>
</Resizable.PaneGroup>

<p class="mt-2 text-sm" aria-live="polite">{status}</p>
```

Keep enough collapsed content visible to make the boundary understandable, or provide another clearly labelled control that restores the layout.

### Persisted layout

`autoSaveId` stores pane sizes in browser local storage and restores them on a later visit. Use a stable ID that is unique to this layout:

```svelte
<Resizable.PaneGroup direction="horizontal" autoSaveId="project-editor-layout" class="h-72 rounded-lg border">
	<Resizable.Pane defaultSize={25}>Files</Resizable.Pane>
	<Resizable.Handle />
	<Resizable.Pane defaultSize={75}>Editor</Resizable.Pane>
</Resizable.PaneGroup>
```

Pass a `storage` object with compatible `getItem` and `setItem` methods when the layout must use another storage mechanism. PaneForge performs persistence only when `autoSaveId` is present.

### Controlled group layout

Bind the group instance when application controls need to read or replace the complete percentage layout:

```svelte
<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
	import type { PaneGroupProps } from "$lib/components/ui/resizable";

	let group = $state<PaneGroupProps["this"]>();
</script>

<button type="button" onclick={() => group?.setLayout([25, 75])}>Reset layout</button>

<Resizable.PaneGroup bind:this={group} direction="horizontal" class="mt-3 h-72 rounded-lg border">
	<Resizable.Pane>Navigation</Resizable.Pane>
	<Resizable.Handle />
	<Resizable.Pane>Workspace</Resizable.Pane>
</Resizable.PaneGroup>

<button type="button" onclick={() => console.info(group?.getLayout())}>Log current layout</button>
```

`getLayout()` returns percentages in pane order, `setLayout()` applies a complete layout, and `getId()` returns the PaneForge group ID. The local `Pane` wrapper does not expose PaneForge's imperative pane instance; use pane props and callbacks for pane-level behavior.

### Nested groups

```svelte
<Resizable.PaneGroup direction="horizontal" class="h-96 rounded-lg border">
	<Resizable.Pane defaultSize={30}>Navigation</Resizable.Pane>
	<Resizable.Handle />

	<Resizable.Pane defaultSize={70}>
		<Resizable.PaneGroup direction="vertical">
			<Resizable.Pane defaultSize={70}>Editor</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={30}>Console</Resizable.Pane>
		</Resizable.PaneGroup>
	</Resizable.Pane>
</Resizable.PaneGroup>
```

Each nested group owns its direction, constraints, callbacks, and optional persistence ID.

---

## Public API

Resizable wraps the installed stable `paneforge@1.0.2` components. The tables describe the local API and important inherited behavior; see the complete PaneForge references for [PaneGroup](https://www.paneforge.com/docs/components/pane-group), [Pane](https://www.paneforge.com/docs/components/pane), and [PaneResizer](https://paneforge.com/docs/components/pane-resizer). The component's `index.ts`, exported types, and source are the source of truth.

All three parts forward their remaining native `<div>` attributes, support a bindable `ref` to the rendered `HTMLDivElement`, and merge a supplied `class` after local classes. `PaneGroup` and `Pane` inherit PaneForge's `children` and advanced `child` rendering snippet. `Handle` deliberately removes both snippets so its contents remain controlled by `withHandle`.

### `Resizable.PaneGroup`

Type: `PaneGroupProps`, based on `PaneForge.PaneGroupProps` plus the local bindable `this` instance.

| Prop                 | Type                                                            | Default               | Behavior                                                                                                                   |
| -------------------- | --------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `direction`          | `"horizontal" \| "vertical"`                                    | Required              | Sets the split axis and propagates `data-direction` to the group and handles.                                              |
| `autoSaveId`         | `string \| null`                                                | `null`                | Persists and restores the layout under a stable storage ID.                                                                |
| `keyboardResizeBy`   | `number \| null`                                                | `null`                | Percentage moved by an arrow key. PaneForge uses 10 when this is `null`; Shift plus an arrow moves to the available limit. |
| `onLayoutChange`     | `(layout: number[]) => void`                                    | —                     | Runs after layout changes with pane sizes as percentages in pane order.                                                    |
| `storage`            | `{ getItem(name): string \| null; setItem(name, value): void }` | Browser local storage | Replaces the persistence backend used with `autoSaveId`.                                                                   |
| `this`               | `PaneForge.PaneGroup`                                           | `undefined`           | Bind with `bind:this` to access `getId()`, `getLayout()`, and `setLayout(layout)`.                                         |
| `ref`                | `HTMLDivElement \| null`                                        | `null`                | Bindable reference to the rendered group element.                                                                          |
| `children` / `child` | PaneForge snippets                                              | —                     | Render normal children or replace the underlying element through PaneForge's advanced child snippet.                       |

The group forwards native `<div>` attributes. It does not expose a bindable `value`; use `onLayoutChange`, `getLayout()`, and `setLayout()` when application state needs the sizes.

### `Resizable.Pane`

Type: `PaneProps`, equal to `PaneForge.PaneProps`.

| Prop                 | Type                                                        | Default                               | Behavior                                                                                                   |
| -------------------- | ----------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `defaultSize`        | `number`                                                    | PaneForge distributes available space | Initial percentage of the group.                                                                           |
| `minSize`            | `number`                                                    | `0`                                   | Minimum expanded percentage.                                                                               |
| `maxSize`            | `number`                                                    | `100`                                 | Maximum percentage.                                                                                        |
| `collapsible`        | `boolean`                                                   | `false`                               | Allows the pane to enter its collapsed size.                                                               |
| `collapsedSize`      | `number`                                                    | `0`                                   | Percentage used while collapsed.                                                                           |
| `order`              | `number`                                                    | DOM order                             | Keeps pane ordering stable when panes render conditionally. Give every conditional pane an explicit order. |
| `onCollapse`         | `() => void`                                                | —                                     | Runs when the pane reaches its collapsed state.                                                            |
| `onExpand`           | `() => void`                                                | —                                     | Runs when a collapsed pane expands.                                                                        |
| `onResize`           | `(size: number, previousSize: number \| undefined) => void` | —                                     | Reports percentage changes and the prior size.                                                             |
| `ref`                | `HTMLDivElement \| null`                                    | `null`                                | Bindable reference to the rendered pane element.                                                           |
| `children` / `child` | PaneForge snippets                                          | —                                     | Render pane content or replace the underlying element through PaneForge's advanced child snippet.          |

The pane forwards native `<div>` attributes. Although PaneForge itself has pane instance methods, the local wrapper does not expose a `this` binding for them.

### `Resizable.Handle`

Type: `HandleProps`, based on `PaneForge.PaneResizerProps` with `children` and `child` removed.

| Prop               | Type                            | Default | Behavior                                                                                                                 |
| ------------------ | ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `withHandle`       | `boolean`                       | `false` | Adds the local rounded visual grip inside the resize boundary. It does not change the hit area or behavior.              |
| `disabled`         | `boolean`                       | `false` | Prevents pointer, touch, and keyboard resizing.                                                                          |
| `onDraggingChange` | `(isDragging: boolean) => void` | —       | Reports the start and end of pointer or touch dragging.                                                                  |
| `tabindex`         | `number`                        | `0`     | Changes the handle's keyboard tab order. Preserve keyboard reachability unless another accessible resize control exists. |
| `ref`              | `HTMLDivElement \| null`        | `null`  | Bindable reference to the rendered separator element.                                                                    |

The handle forwards native `<div>` attributes, but it does not accept custom child content. Use `withHandle` for the built-in grip and style the public hooks for another visual treatment.

---

## Styling and DOM contract

The following hooks are local and stable:

| Part        | `data-slot`            | Stable class               | Local layout                                                                                       |
| ----------- | ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| `PaneGroup` | `resizable-pane-group` | `cn-resizable-panel-group` | Full width and height, flex row by default and flex column for vertical groups.                    |
| `Pane`      | `resizable-pane`       | `cn-resizable-pane`        | Flexible pane with clipped overflow. Add an inner scrolling element when pane content must scroll. |
| `Handle`    | `resizable-handle`     | `cn-resizable-handle`      | One-pixel `border`-token divider, focus ring, and a four-pixel pseudo-element hit area.            |

`withHandle` adds an empty four-by-24-pixel rounded element using the `border` token. It rotates for a vertical group. The handle uses the `ring` token for keyboard focus and PaneForge supplies axis-appropriate cursor, touch-action, and selection-blocking inline styles.

PaneForge also supplies state and relationship attributes. These are dependency-owned and should be checked when upgrading PaneForge:

- Group: `data-pane-group`, `data-pane-group-id`, and `data-direction`.
- Pane: `data-pane`, `data-pane-id`, and `data-pane-group-id`.
- Handle: `data-pane-resizer`, `data-pane-resizer-id`, `data-pane-group-id`, `data-direction`, `data-enabled`, and `data-active="pointer|keyboard"`.

All `class` props pass through `cn()`, so later Tailwind utilities replace conflicting local utilities. PaneForge owns essential inline flex sizing and interaction styles; avoid overriding them unless the complete resize behavior has been tested.

---

## Accessibility

PaneForge renders each handle as a focusable separator and maintains `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` from the adjacent pane constraints. Pointer dragging, touch dragging, and keyboard resizing share the same constrained layout logic.

Keyboard behavior on a focused handle:

- Arrow keys resize on the group's axis by `keyboardResizeBy`, or 10 percentage points by default.
- <kbd>Shift</kbd> plus an arrow moves toward the available constraint limit.
- <kbd>Home</kbd> and <kbd>End</kbd> move toward the two limits.
- <kbd>Enter</kbd> toggles the pane before the handle between its collapsed and minimum size when that pane is collapsible.
- <kbd>F6</kbd> moves to the next handle in the group; <kbd>Shift</kbd>+<kbd>F6</kbd> moves to the previous one.

Render exactly one handle between adjacent panes, keep it keyboard focusable, and do not replace its role or PaneForge ARIA attributes. `withHandle` is decorative and introduces no label or text. Pane contents remain the app's responsibility: use semantic landmarks and headings where they help people understand each region, preserve useful content at narrow sizes, and provide a discoverable recovery path for collapsed panes.

See the [PaneForge documentation](https://paneforge.com/docs) for the underlying interaction implementation.

---

## Localization

Resizable contains no built-in human-readable copy and requires no localization messages. The app supplies and translates all pane content, headings, status announcements, and any external controls that change or reset the layout.

---

## Dependencies

### Packages

Install PaneForge and the packages required by the local `cn()` helper. Tailwind CSS is a development dependency:

```sh
# Bun
bun add paneforge clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install paneforge clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add paneforge clsx tailwind-merge
pnpm add -D tailwindcss
```

PaneForge installs its own `runed` and `svelte-toolbelt` runtime dependencies transitively; this component does not import them directly. It does not require `tw-animate-css`.

### Global styles and theme tokens

Copy the minimal Tailwind import, semantic values, and theme mappings below into the app's global stylesheet. The color and radius values are xvelte defaults and may be replaced by the app's theme:

```css
@import "tailwindcss";

:root {
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-border: var(--border);
	--color-ring: var(--ring);
	--radius-lg: var(--radius);
}
```

No global keyframes, animation classes, layout rules, font imports, or other stylesheet code are required.

### Shared utilities

Copy these exports from `$lib/utils`. `cn()` depends on the installed `clsx` and `tailwind-merge` packages; the types remove unsupported snippets from `HandleProps`:

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

### Icons, other components, and app integration

Resizable uses no icons from `$lib/icons` and no icon package. It does not require another xvelte component, hook, attachment, context module, localization message, shared style, image, font, network request, or app-level integration.

Copy the complete `src/lib/components/ui/resizable` component folder. The required source files are:

```text
resizable/
├── index.ts
├── resizable-handle.svelte
├── resizable-pane-group.svelte
└── resizable-pane.svelte
```

---

## Credits

The component structure and styling are adapted from [shadcn-svelte Resizable](https://www.shadcn-svelte.com/docs/components/resizable).

---

## File organization

| File                          | Responsibility                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `resizable-pane-group.svelte` | Wraps the PaneForge group, direction layout, persistence options, callbacks, and group instance binding. |
| `resizable-pane.svelte`       | Wraps one constrained, resizable content pane.                                                           |
| `resizable-handle.svelte`     | Wraps the accessible resizer and adds the optional local visual grip.                                    |
| `index.ts`                    | Exports every public component part and props type.                                                      |
| `README.md`                   | Documents installation, composition, API, behavior, and dependencies.                                    |

The component's `index.ts` and exported types are the source of truth for the public API.

# WidgetGrid

WidgetGrid is a dynamic dashboard layout for arbitrary Svelte content. It registers declarative items, positions them on a responsive cell grid, resolves collisions, supports pointer and keyboard movement through an explicit DragHandle, supports pointer and keyboard resizing through one ResizeHandle per item, and reports complete layout snapshots for persistence. Use it for dashboards and customizable workspaces; do not use it when ordinary document flow or a simple sortable list communicates the content more clearly.

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

---

## Import

Import every public part through the component's `index.ts`:

```svelte
<script lang="ts">
	import type { WidgetGridItemState, WidgetGridMode } from "$lib/components/ui/widget-grid";

	import * as WidgetGrid from "$lib/components/ui/widget-grid";
</script>
```

The component exports `Root`, `Item`, `DragHandle`, and `ResizeHandle`. It also exports `RootProps`, `ItemProps`, `DragHandleProps`, `ResizeHandleProps`, `WidgetGridItemState`, `WidgetGridBreakpoint`, and `WidgetGridMode`.

---

## Anatomy

Declare Items directly under Root. Each movable Item needs a DragHandle, and each resizable Item needs exactly one ResizeHandle:

```svelte
<WidgetGrid.Root columns={12}>
	<WidgetGrid.Item id="sales" x={0} y={0} width={4} height={2}>
		<WidgetGrid.DragHandle />
		<p>Sales chart</p>
		<WidgetGrid.ResizeHandle />
	</WidgetGrid.Item>
</WidgetGrid.Root>
```

Item registers with its nearest Root when mounted and unregisters when destroyed. Handles register with their nearest Item. Root does not accept an item array and does not know the app's widget types or payloads.

---

## Basic usage

Item is headless: its default `div` has no visual or layout classes. Add the surface and sizing required by your app:

```svelte
<script lang="ts">
	import * as WidgetGrid from "$lib/components/ui/widget-grid";
</script>

<WidgetGrid.Root columns={6} gap={12}>
	<WidgetGrid.Item id="activity" x={0} y={0} width={3} height={2} class="size-full rounded-xl border bg-card p-4">
		<WidgetGrid.DragHandle class="absolute top-2 right-2" />
		<h2 class="font-medium">Recent activity</h2>
		<p class="text-muted-foreground">No new events.</p>
		<WidgetGrid.ResizeHandle />
	</WidgetGrid.Item>
</WidgetGrid.Root>
```

Movement never falls back to the complete Item. Removing or conditionally hiding DragHandle makes that Item non-movable by pointer or keyboard. Resize interaction requires one ResizeHandle and never falls back to invisible borders.

---

## Examples

### Delegated Item with Card

The `child` snippet replaces Item's default `div`. Spread every supplied prop so native attributes, state attributes, and the reference attachment remain connected:

```svelte
<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import * as WidgetGrid from "$lib/components/ui/widget-grid";
</script>

<WidgetGrid.Root columns={12}>
	<WidgetGrid.Item id="sales" width={4} height={3} class="size-full">
		{#snippet child({ props })}
			<Card.Root {...props}>
				<WidgetGrid.DragHandle>
					{#snippet child({ props: handleProps })}
						<Card.Header {...handleProps}>
							<Card.Title>Sales</Card.Title>
						</Card.Header>
					{/snippet}
				</WidgetGrid.DragHandle>

				<Card.Content>€24,800 this month</Card.Content>
				<WidgetGrid.ResizeHandle />
			</Card.Root>
		{/snippet}
	</WidgetGrid.Item>
</WidgetGrid.Root>
```

The delegated Card receives Item's `class` unchanged. WidgetGrid does not impose Card, size, positioning, or surface styles on it. DragHandle delegation similarly keeps cursor, registration, and accessibility props without imposing Button styling or the default icon.

### Default and custom ResizeHandle

Render exactly one component in each resizable Item. It controls the bottom-right corner through GridStack's native resize interaction and defaults to the same compact ghost Button as DragHandle, with a resize icon and an extended 44-pixel pointer target:

```svelte
<WidgetGrid.Item id="report" width={4} height={2}>
	<WidgetGrid.DragHandle />
	<p>Quarterly report</p>
	<WidgetGrid.ResizeHandle />
</WidgetGrid.Item>
```

Delegate rendering for a custom visual. The supplied inline structural style preserves edge placement and the compact handle size even when the replacement supplies its own class:

```svelte
<WidgetGrid.ResizeHandle>
	{#snippet child({ props })}
		<span {...props} class="rounded-full bg-primary ring-2 ring-background"></span>
	{/snippet}
</WidgetGrid.ResizeHandle>
```

Always spread every supplied prop. Use WidgetGrid's `class` prop when you want its class to be merged with the structural utilities.

### Keyboard movement and resizing

Focus the appropriate handle, then use the same pick-up and drop pattern as Sortable:

1. Press Enter or Space to start.
2. Use the arrow keys to change the layout one cell at a time.
3. Press Enter or Space again to commit, or Escape to restore the initial position or size.

DragHandle maps Left and Right to the horizontal grid coordinate and Up and Down to the vertical coordinate. ResizeHandle controls its bottom-right corner: Right and Down grow by one column or row, while Left and Up shrink by one column or row. Moving focus away commits the current change.

```svelte
<WidgetGrid.Item id="sales" x={0} y={0} width={4} height={2}>
	<WidgetGrid.DragHandle aria-label="Move Sales widget" />
	<p>Sales</p>
	<WidgetGrid.ResizeHandle aria-label="Resize Sales widget" />
</WidgetGrid.Item>
```

Keyboard changes go through GridStack's public update API, so current columns, collisions, minimums, maximums, static state, and enabled settings still apply. A polite built-in live region announces the interaction instructions, resolved one-based position or size, and completion or cancellation.

### Responsive columns and gap

Responsive keys are minimum widths measured from Root, not the viewport. They align with the local Tailwind breakpoints: `xs` 0, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, and `2xl` 1536 pixels.

```svelte
<WidgetGrid.Root
	columns={{
		xs: 1,
		sm: 2,
		md: 6,
		xl: 12
	}}
	gap={16}
>
	<!-- Items -->
</WidgetGrid.Root>
```

Missing keys are valid. The most recent configured minimum-width value remains active; widths below the first configured key use one column. Gap is a non-negative number applied equally in both axes. Cell height is internal and always automatic, so a row follows the current cell width.

### Stack and free modes

```svelte
<WidgetGrid.Root mode="stack"><!-- compact dashboard --></WidgetGrid.Root>
<WidgetGrid.Root mode="free"><!-- preserve open positions --></WidgetGrid.Root>
```

`stack` is the default and compacts widgets toward the top with native collision packing. `free` enables the engine's closest robust position-preserving behavior and avoids deliberate compaction. GridStack can still move a non-static widget to resolve an actual collision; `free` is not an overlapping absolute-position canvas.

### Static items and dimension constraints

```svelte
<WidgetGrid.Root columns={12}>
	<WidgetGrid.Item id="navigation" x={0} y={0} width={3} height={2} static>
		<p>Fixed navigation</p>
	</WidgetGrid.Item>

	<WidgetGrid.Item id="chart" x={3} y={0} width={6} height={3} minWidth={3} maxWidth={9} minHeight={2} maxHeight={5}>
		<WidgetGrid.DragHandle />
		<p>Revenue chart</p>
		<WidgetGrid.ResizeHandle />
	</WidgetGrid.Item>
</WidgetGrid.Root>
```

`static` overrides every Root and Item interaction setting. A static Item cannot be dragged or resized, cannot be pushed by another widget, and keeps its coordinates during collision resolution. Width and height default to one cell; omitted coordinates request automatic placement.

### Root and Item lifecycle callbacks

Root receives the directly affected state plus a current snapshot of every registered Item. End callbacks are the normal persistence boundary:

```svelte
<script lang="ts">
	import type { WidgetGridItemState } from "$lib/components/ui/widget-grid";

	import * as WidgetGrid from "$lib/components/ui/widget-grid";

	function saveLayout(states: WidgetGridItemState[]) {
		localStorage.setItem("dashboard-layout", JSON.stringify(states));
	}
</script>

<WidgetGrid.Root
	onMoveStart={(state, states) => console.info("Moving", state.id, states.length)}
	onMoving={(state, states) => console.info(state.x, state.y, states)}
	onMoveEnd={(state, states) => saveLayout(states)}
	onResizeStart={(state, states) => console.info("Resizing", state.id, states.length)}
	onResizing={(state, states) => console.info(state.width, state.height, states)}
	onResizeEnd={(state, states) => saveLayout(states)}
>
	<WidgetGrid.Item
		id="summary"
		onMoveStart={(state) => console.info("Item move started", state.id)}
		onMoving={(state) => console.info("Item moved", state.x, state.y)}
		onMoveEnd={(state) => console.info("Item move ended", state.id)}
		onResizeStart={(state) => console.info("Item resize started", state.id)}
		onResizing={(state) => console.info("Item size", state.width, state.height)}
		onResizeEnd={(state) => console.info("Item resize ended", state.id)}
	>
		<WidgetGrid.DragHandle />
		<p>Summary</p>
		<WidgetGrid.ResizeHandle />
	</WidgetGrid.Item>
</WidgetGrid.Root>
```

The engine is the temporary source of truth during a direct pointer or keyboard interaction. External prop changes update a mounted Item without remounting, while unchanged app props do not overwrite an active move or resize. Keyboard interaction invokes the same start, progress, and end callbacks as pointer interaction; Escape reports the restored state through the progress and end callbacks.

### Dynamic items

```svelte
<script lang="ts">
	import * as WidgetGrid from "$lib/components/ui/widget-grid";

	let widgets = $state([
		{ id: "sales", title: "Sales", x: 0, y: 0 },
		{ id: "traffic", title: "Traffic", x: 2, y: 0 }
	]);
</script>

<WidgetGrid.Root columns={6}>
	{#each widgets as widget (widget.id)}
		<WidgetGrid.Item id={widget.id} x={widget.x} y={widget.y} width={2} height={2}>
			<WidgetGrid.DragHandle aria-label={`Move ${widget.title}`} />
			<p>{widget.title}</p>
			<WidgetGrid.ResizeHandle aria-label={`Resize ${widget.title}`} />
		</WidgetGrid.Item>
	{/each}
</WidgetGrid.Root>
```

Adding, removing, and reordering keyed Items needs no Root reinitialization. DragHandle may appear conditionally. Mount the single ResizeHandle together with its Item so GridStack can bind its native resizer directly to that element. Item generates a hydration-stable local ID when `id` is omitted, but persistent layouts should always provide an app-owned stable ID.

---

## Public API

WidgetGrid uses GridStack internally, but no GridStack type, option name, class, node, or event is public. The [official GridStack API](https://gridstackjs.com/doc/html/classes/GridStack.html) describes dependency-owned collision behavior. WidgetGrid's `index.ts`, exported types, and source are the source of truth for the xvelte API.

### `WidgetGrid.Root`

| Prop            | Type                                                      | Default   | Behavior                                                                                           |
| --------------- | --------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `columns`       | `number \| Partial<Record<WidgetGridBreakpoint, number>>` | `12`      | Fixed or Root-width-responsive column count.                                                       |
| `gap`           | `number`                                                  | `16`      | Uniform horizontal and vertical pixel gap.                                                         |
| `mode`          | `"stack" \| "free"`                                       | `"stack"` | Compacts holes or preserves positions as robustly as the collision engine allows.                  |
| `disabled`      | `boolean`                                                 | `false`   | Disables all pointer and keyboard movement and resizing.                                           |
| `draggable`     | `boolean`                                                 | `true`    | Global drag default; an Item override and an explicit DragHandle are still respected.              |
| `resizable`     | `boolean`                                                 | `true`    | Global resize default; an Item override and exactly one explicit ResizeHandle are still respected. |
| `onMoveStart`   | `(state, states) => void`                                 | —         | Reports the affected state and complete snapshot when movement starts.                             |
| `onMoving`      | `(state, states) => void`                                 | —         | Reports active movement.                                                                           |
| `onMoveEnd`     | `(state, states) => void`                                 | —         | Reports committed movement; suitable for persistence.                                              |
| `onResizeStart` | `(state, states) => void`                                 | —         | Reports the affected state and complete snapshot when resizing starts.                             |
| `onResizing`    | `(state, states) => void`                                 | —         | Reports active resizing.                                                                           |
| `onResizeEnd`   | `(state, states) => void`                                 | —         | Reports committed resizing; suitable for persistence.                                              |
| `children`      | `Snippet`                                                 | —         | Declarative Item content.                                                                          |
| `ref`           | `HTMLDivElement \| null`                                  | `null`    | Bindable Root element.                                                                             |
| `class`         | `string`                                                  | —         | Merged with the required structural engine class; Root adds no visual surface styles.              |

Root forwards remaining native `div` attributes. It observes its own width, never the viewport. `cellHeight` and an `items` array are intentionally not public props.

### `WidgetGrid.Item`

| Prop                                             | Type                     | Default             | Behavior                                                                       |
| ------------------------------------------------ | ------------------------ | ------------------- | ------------------------------------------------------------------------------ |
| `id`                                             | `string \| number`       | Hydration-stable ID | Snapshot and persistence identifier. Provide it explicitly for saved layouts.  |
| `x`, `y`                                         | `number`                 | Automatic           | Zero-based grid coordinates.                                                   |
| `width`, `height`                                | `number`                 | `1`                 | Dimensions in grid cells.                                                      |
| `minWidth`, `maxWidth`, `minHeight`, `maxHeight` | `number`                 | —                   | Resize constraints in grid cells.                                              |
| `draggable`                                      | `boolean`                | Root default        | Overrides Root drag enablement; a DragHandle remains required.                 |
| `resizable`                                      | `boolean`                | Root default        | Overrides Root resize enablement; one ResizeHandle remains required.           |
| `static`                                         | `boolean`                | `false`             | Fully locks movement, resize, collision displacement, and coordinates.         |
| `onMoveStart`, `onMoving`, `onMoveEnd`           | `(state) => void`        | —                   | Item-only movement lifecycle.                                                  |
| `onResizeStart`, `onResizing`, `onResizeEnd`     | `(state) => void`        | —                   | Item-only resize lifecycle.                                                    |
| `children`                                       | `Snippet`                | —                   | Arbitrary content and handles rendered in the default headless `div`.          |
| `child`                                          | `Snippet<[{ props }]>`   | —                   | Replaces the default `div`; spread all props on the delegated element.         |
| `ref`                                            | `HTMLDivElement \| null` | `null`              | Bindable default or delegated visible element, not the private engine wrapper. |
| `class`                                          | `string`                 | —                   | Forwarded unchanged; Item adds no classes.                                     |

Item forwards compatible native `div` attributes to its visible default or delegated element. All listed state props reactively update a mounted Item. Public state deliberately excludes snippets, DOM refs, classes, callbacks, and engine objects.

### `WidgetGrid.DragHandle`

| Prop         | Type                   | Default                   | Behavior                                                                                     |
| ------------ | ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------- |
| `aria-label` | `string`               | Localized `"Move widget"` | Accessible name; provide a widget-specific override when several handles are present.        |
| `children`   | `Snippet`              | Grip icon                 | Replaces only the default icon inside the ghost Button.                                      |
| `child`      | `Snippet<[{ props }]>` | —                         | Replaces Button and icon while preserving registration, cursor, state, and accessible props. |
| `ref`        | `HTMLElement \| null`  | `null`                    | Bindable rendered handle.                                                                    |
| `class`      | `string`               | —                         | Merged with the move cursor, active grabbing feedback, and touch behavior.                   |

The default element is `Button.Root` with `variant="ghost"`, `size="icon-sm"`, and `type="button"`. Remaining compatible native attributes are forwarded. Without a mounted DragHandle, the Item cannot be moved manually even when Root and Item enable dragging. The handle exposes `aria-pressed`, `aria-keyshortcuts`, and `data-keyboard-active="true"` while its keyboard movement mode is active.

### `WidgetGrid.ResizeHandle`

| Prop         | Type                   | Default                     | Behavior                                                                                  |
| ------------ | ---------------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| `aria-label` | `string`               | Localized `"Resize widget"` | Accessible name; provide a widget-specific override when useful.                          |
| `children`   | `Snippet`              | Resize icon                 | Replaces only the default icon inside the ghost Button.                                   |
| `child`      | `Snippet<[{ props }]>` | —                           | Replaces Button and icon while preserving placement, cursor, state, and registration.     |
| `ref`        | `HTMLElement \| null`  | `null`                      | Bindable rendered handle.                                                                 |
| `class`      | `string`               | —                           | Merged with bottom-right placement, resize cursor, and extended pointer-target utilities. |

Render at most one ResizeHandle per Item. It always controls the bottom-right corner through GridStack's native pointer resizer and through direction-matched keyboard changes. The default element is `Button.Root` with `variant="ghost"`, `size="icon-sm"`, `type="button"`, a resize icon, and an invisible extension that increases its pointer target to 44 pixels. Root `disabled`, Item `resizable={false}`, and Item `static` disable the native Button and both interaction modes. The handle exposes `aria-pressed`, `aria-keyshortcuts`, and `data-keyboard-active="true"` while keyboard resizing is active.

### Public state types

```ts
type WidgetGridItemState = {
	id: string | number;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	draggable?: boolean;
	resizable?: boolean;
	static?: boolean;
};

type WidgetGridBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type WidgetGridMode = "stack" | "free";
```

Lifecycle snapshots always contain resolved `x`, `y`, `width`, and `height`, even when the corresponding input coordinates were omitted for automatic placement.

---

## Styling and DOM contract

| Part         | Stable hook                             | Default element                        |
| ------------ | --------------------------------------- | -------------------------------------- |
| Root         | `data-slot="widget-grid"`               | `div`                                  |
| Item         | `data-slot="widget-grid-item"`          | Headless `div` inside private wrappers |
| DragHandle   | `data-slot="widget-grid-drag-handle"`   | xvelte ghost Button                    |
| ResizeHandle | `data-slot="widget-grid-resize-handle"` | xvelte ghost Button                    |

Root also contains an internal `data-slot="widget-grid-announcement"` polite live region. It is visually hidden and must not be used as an app styling or content hook.

Root exposes `data-moving`, `data-resizing`, and `data-disabled` as `"true"` only while active. Item exposes `data-moving`, `data-resizing`, `data-disabled`, and `data-static` the same way. Both handles expose `data-disabled` and `data-keyboard-active`; their `aria-pressed` values expose inactive and active keyboard modes.

Root is visually transparent and adds only the structural class needed by the internal layout engine. Its private content wrapper clips overflow so absolute handles and full-size delegated elements do not create a second scrollbar around Item; add an app-owned scrolling region inside Item when its content must scroll. During movement or resizing, Root overrides GridStack's private placeholder with the semantic `muted` background and the local `rounded-md` radius (`calc(var(--radius) * 0.8)`) so its occupied cells remain visible in both color modes. Private direct-child wrappers receive engine-owned classes, coordinate attributes, inline positioning, and animation state; these are implementation details and must not be selected from app CSS. The public Item remains nested inside those wrappers.

Root and Item are headless. Without `child`, Item renders a `div`; with `child`, it renders only the delegated element. In both cases Item forwards its `class` unchanged and adds no visual, sizing, or positioning classes. DragHandle shows the four-direction `move` cursor while available and `grabbing` throughout active pointer or keyboard movement. ResizeHandle keeps its southeast resize cursor. Both handles default to compact ghost Buttons and allow their complete visual elements to be replaced; their public classes are merged with `cn`.

WidgetGrid imports GridStack's structural stylesheet inside Root. Apps do not add GridStack classes, attributes, wrappers, or stylesheet imports themselves.

---

## Accessibility

- Default DragHandle is a native `button` with `type="button"`, disabled propagation, focus styling from Button, a localized accessible name, and pointer plus keyboard movement.
- The default ResizeHandle is a native Button with Button's focus styling, disabled behavior, a 44-pixel extended pointer target, and pointer plus keyboard resizing. Delegated replacements receive the equivalent role, tab stop, accessible name, disabled state, keyboard state, shortcuts, and southeast resize cursor.
- Enter or Space starts and commits the focused handle's keyboard mode. Arrow keys change one cell, Escape cancels, and moving focus away commits. Keep focus visible throughout the interaction.
- Root's polite live region announces localized instructions, resolved positions or dimensions, completion, and cancellation. Coordinates are announced one-based even though public state uses zero-based `x` and `y`.
- Override handle labels with widget-specific text when the generic default would make several controls indistinguishable.
- Keep interactive buttons, links, fields, and menus outside a DragHandle. The handle should describe moving, not perform another action.
- `static` and disabled values remove handles from the tab order and prevent pointer interaction.
- Item is a headless container, not a landmark or heading. Add app-owned semantics and labelled regions only where the content structure requires them.
- Collision movement is spatial. Persist and announce important layout changes in app code when users need confirmation beyond the visible animation.

---

## Localization

WidgetGrid uses these Paraglide messages from `messages/en.json`:

| Message ID                        | English value                                                                               | Used by                                |
| --------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| `blue_heron_move`                 | `Move widget`                                                                               | Default DragHandle accessible label.   |
| `green_otter_resize_bottom_right` | `Resize widget`                                                                             | Default ResizeHandle accessible label. |
| `cobalt_badger_move_keys`         | `Moving widget. Use arrow keys to move, Enter or Space to finish, or Escape to cancel.`     | Keyboard movement instructions.        |
| `dusky_tern_resize_keys`          | `Resizing widget. Use arrow keys to resize, Enter or Space to finish, or Escape to cancel.` | Keyboard resize instructions.          |
| `ember_fox_position`              | `Widget moved to column {column}, row {row}.`                                               | Resolved one-based keyboard position.  |
| `frosty_owl_dimensions`           | `Widget resized to {width} columns by {height} rows.`                                       | Resolved keyboard dimensions.          |
| `mossy_lark_layout_done`          | `Widget layout change complete.`                                                            | Keyboard commit result.                |
| `quiet_puma_layout_cancel`        | `Widget layout change cancelled.`                                                           | Escape cancellation result.            |

Override `aria-label` for contextual names. Widget content, empty states, persistence feedback, and alternative layout controls are app-supplied and use the app's localization system.

---

## Dependencies

### Packages

Install the runtime layout, icon, class-merging, and variant packages first, then the development packages:

```sh
# Bun
bun add gridstack @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install gridstack @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add gridstack @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss
```

The local component targets `gridstack@13.2.0`. Root imports `gridstack/dist/gridstack.css` itself and initializes the engine only in the browser. Consult the [official GridStack options](https://gridstackjs.com/doc/html/interfaces/GridStackOptions.html) when maintaining dependency-owned behavior.

### Component files

Copy the complete `src/lib/components/ui/widget-grid` folder. WidgetGrid also requires this xvelte component folder:

- `src/lib/components/ui/button`: `button-root.svelte`, `index.ts`, and `README.md`. Follow Button's README for its full package, token, and utility setup.

Card is used only by one optional example and is not a WidgetGrid dependency. WidgetGrid requires no other xvelte component, hook, public attachment, shared component stylesheet, image, font, network service, or route-level integration. Its context and adapter files are private files copied with the component folder.

### Shared utilities

WidgetGrid imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges conditional classes and resolves conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block includes both packages imported by this code. `WithoutChildren` is also imported by Root from the local `$lib/utils` entry point; copy its existing generic from xvelte together with the definitions above:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;
```

### Icons

DragHandle uses the existing `DragHandleIcon`; ResizeHandle uses `ResizeHandleIcon`. Add these exact semantic exports to `src/lib/icons.ts`:

```ts
export { default as DragHandleIcon } from "@tabler/icons-svelte/icons/grip-vertical";
export { default as ResizeHandleIcon } from "@tabler/icons-svelte/icons/resize";
```

The package block includes `@tabler/icons-svelte`.

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated, and add every key listed in [Localization](#localization) to `messages/en.json`. Their complete keys and values are already shown there and are not duplicated here.

### Global styles

Root imports all GridStack-specific structural CSS, prevents its private Item wrapper from creating an outer scrollbar, and restyles its interaction placeholder with `--muted` and `--radius`. WidgetGrid's handles use Button's `muted`, `muted-foreground`, and `foreground` semantic colors. Copy and configure Button first; its README includes the exact `layout.css` variables, `@theme` mappings, border base rule, and replaceable theme values required by the handles.

WidgetGrid adds no component-specific CSS variable, global class, keyframe, animation import, or font. The app remains responsible for light/dark theme activation.

---

## File organization

| File                               | Responsibility                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `widget-grid-root.svelte`          | Root props, transparent structural DOM, responsive engine lifecycle, state attributes, and callbacks.     |
| `widget-grid-item.svelte`          | Headless Item wrapper, declarative registration, reactive state, private engine wrappers, and delegation. |
| `widget-grid-drag-handle.svelte`   | Explicit pointer and keyboard movement, default ghost Button, grip icon, label, and delegation.           |
| `widget-grid-resize-handle.svelte` | Bottom-right pointer and keyboard resizing, extended target, ghost Button, icon, label, and delegation.   |
| `widget-grid-context.svelte.ts`    | Contexts, handle registries, keyboard state and announcements, reactive interaction state, and callbacks. |
| `widget-grid-adapter.ts`           | GridStack translation, responsive columns, pointer and keyboard updates, collisions, and snapshots.       |
| `widget-grid-types.ts`             | Public engine-independent item, breakpoint, and mode types.                                               |
| `index.ts`                         | Public components and exported props and state types.                                                     |
| `README.md`                        | Installation, composition, examples, API, styling, accessibility, localization, and dependencies.         |

The component's `index.ts`, exported props types, `WidgetGridItemState`, and other exported types are the source of truth for the public API.

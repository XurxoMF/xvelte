# WidgetGrid

WidgetGrid is a dynamic dashboard layout for arbitrary Svelte content. It registers declarative items, positions them on a responsive cell grid, resolves collisions, supports explicit drag and one touch-friendly resize handle per item, and reports complete layout snapshots for persistence. Use it for dashboards and customizable workspaces; do not use it when ordinary document flow or a simple sortable list communicates the content more clearly.

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

Item has a Card-like default surface, so a separate Card is not required:

```svelte
<script lang="ts">
	import * as WidgetGrid from "$lib/components/ui/widget-grid";
</script>

<WidgetGrid.Root columns={6} gap={12}>
	<WidgetGrid.Item id="activity" x={0} y={0} width={3} height={2} class="p-4">
		<WidgetGrid.DragHandle class="absolute top-2 right-2" />
		<h2 class="font-medium">Recent activity</h2>
		<p class="text-muted-foreground">No new events.</p>
		<WidgetGrid.ResizeHandle />
	</WidgetGrid.Item>
</WidgetGrid.Root>
```

Drag interaction never falls back to the complete Item. Removing or conditionally hiding DragHandle makes that Item non-draggable. Resize interaction requires one ResizeHandle and never falls back to invisible borders.

---

## Examples

### Custom Item with Card

The `child` snippet replaces Item's default Card-like visual surface. Spread every supplied prop so the structural size, state attributes, native attributes, and reference attachment remain connected:

```svelte
<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import * as WidgetGrid from "$lib/components/ui/widget-grid";
</script>

<WidgetGrid.Root columns={12}>
	<WidgetGrid.Item id="sales" width={4} height={3}>
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

The delegated Card receives Item's required `relative` and full-size structure but not another copy of Item's default visual styles. DragHandle delegation similarly keeps cursor, registration, and accessibility props without imposing Button styling or the default icon.

### Default and custom ResizeHandle

Render exactly one component in each resizable Item. It controls the bottom-right corner through GridStack's native resize interaction, positions itself automatically, and shows a compact icon inside a 44-pixel touch target:

```svelte
<WidgetGrid.Item id="report" width={4} height={2}>
	<WidgetGrid.DragHandle />
	<p>Quarterly report</p>
	<WidgetGrid.ResizeHandle />
</WidgetGrid.Item>
```

Delegate rendering for a custom visual. The supplied inline structural style preserves edge placement and the pointer hit area even when the replacement supplies its own class:

```svelte
<WidgetGrid.ResizeHandle>
	{#snippet child({ props })}
		<span {...props} class="rounded-full bg-primary ring-2 ring-background"></span>
	{/snippet}
</WidgetGrid.ResizeHandle>
```

Always spread every supplied prop. Use WidgetGrid's `class` prop when you want its class to be merged with the structural utilities.

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

The engine is the temporary source of truth during a direct interaction. External prop changes update a mounted Item without remounting, while unchanged app props do not overwrite an active drag or resize.

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
| `disabled`      | `boolean`                                                 | `false`   | Disables all manual movement and resizing.                                                         |
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

| Prop                                             | Type                   | Default             | Behavior                                                                                 |
| ------------------------------------------------ | ---------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| `id`                                             | `string \| number`     | Hydration-stable ID | Snapshot and persistence identifier. Provide it explicitly for saved layouts.            |
| `x`, `y`                                         | `number`               | Automatic           | Zero-based grid coordinates.                                                             |
| `width`, `height`                                | `number`               | `1`                 | Dimensions in grid cells.                                                                |
| `minWidth`, `maxWidth`, `minHeight`, `maxHeight` | `number`               | —                   | Resize constraints in grid cells.                                                        |
| `draggable`                                      | `boolean`              | Root default        | Overrides Root drag enablement; a DragHandle remains required.                           |
| `resizable`                                      | `boolean`              | Root default        | Overrides Root resize enablement; one ResizeHandle remains required.                     |
| `static`                                         | `boolean`              | `false`             | Fully locks movement, resize, collision displacement, and coordinates.                   |
| `onMoveStart`, `onMoving`, `onMoveEnd`           | `(state) => void`      | —                   | Item-only movement lifecycle.                                                            |
| `onResizeStart`, `onResizing`, `onResizeEnd`     | `(state) => void`      | —                   | Item-only resize lifecycle.                                                              |
| `children`                                       | `Snippet`              | —                   | Arbitrary content and handles rendered in the default surface.                           |
| `child`                                          | `Snippet<[{ props }]>` | —                   | Replaces the default visual element; spread all props on the delegated element.          |
| `ref`                                            | `HTMLElement \| null`  | `null`              | Bindable default or delegated visible element, not the private engine wrapper.           |
| `class`                                          | `string`               | —                   | Merged with structural classes; also customizes the default Card-like surface when used. |

Item forwards compatible native `div` attributes to its visible default or delegated element. All listed state props reactively update a mounted Item. Public state deliberately excludes snippets, DOM refs, classes, callbacks, and engine objects.

### `WidgetGrid.DragHandle`

| Prop         | Type                   | Default                   | Behavior                                                                                     |
| ------------ | ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------- |
| `aria-label` | `string`               | Localized `"Move widget"` | Accessible name; provide a widget-specific override when several handles are present.        |
| `children`   | `Snippet`              | Grip icon                 | Replaces only the default icon inside the ghost Button.                                      |
| `child`      | `Snippet<[{ props }]>` | —                         | Replaces Button and icon while preserving registration, cursor, state, and accessible props. |
| `ref`        | `HTMLElement \| null`  | `null`                    | Bindable rendered handle.                                                                    |
| `class`      | `string`               | —                         | Merged with grab cursor and touch behavior.                                                  |

The default element is `Button.Root` with `variant="ghost"`, `size="icon-sm"`, and `type="button"`. Remaining compatible native attributes are forwarded. Without a mounted DragHandle, the Item cannot be manually dragged even when Root and Item enable dragging.

### `WidgetGrid.ResizeHandle`

| Prop         | Type                   | Default                     | Behavior                                                                                    |
| ------------ | ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| `aria-label` | `string`               | Localized `"Resize widget"` | Accessible name; provide a widget-specific override when useful.                            |
| `children`   | `Snippet`              | Resize icon                 | Replaces only the default icon.                                                             |
| `child`      | `Snippet<[{ props }]>` | —                           | Replaces the visual element while preserving placement, hit area, cursor, and registration. |
| `ref`        | `HTMLElement \| null`  | `null`                      | Bindable rendered handle.                                                                   |
| `class`      | `string`               | —                           | Merged with bottom-right structural utilities.                                              |

Render at most one ResizeHandle per Item. It always controls the bottom-right corner through GridStack's native resizer. The default lightweight `span` has a 44-pixel pointer area and a 16-pixel icon; it is not a Button. Root `disabled`, Item `resizable={false}`, and Item `static` disable its interaction.

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

| Part         | Stable hook                             | Default element                         |
| ------------ | --------------------------------------- | --------------------------------------- |
| Root         | `data-slot="widget-grid"`               | `div`                                   |
| Item         | `data-slot="widget-grid-item"`          | Card-like `div` inside private wrappers |
| DragHandle   | `data-slot="widget-grid-drag-handle"`   | xvelte ghost Button                     |
| ResizeHandle | `data-slot="widget-grid-resize-handle"` | Lightweight `span`                      |

Root exposes `data-moving`, `data-resizing`, and `data-disabled` as `"true"` only while active. Item exposes `data-moving`, `data-resizing`, `data-disabled`, and `data-static` the same way. Both handles expose `data-disabled`.

Root is visually transparent and adds only the structural class needed by the internal layout engine. Private direct-child wrappers receive engine-owned classes, coordinate attributes, inline positioning, and animation state; these are implementation details and must not be selected from app CSS. The public Item remains nested inside those wrappers and always receives `relative size-full`.

Without `child`, Item reuses Card Root's surface, radius, semantic colors, ring, spacing, and overflow behavior. With `child`, no Card visual classes are supplied. DragHandle and ResizeHandle follow the same distinction between required structure and replaceable default visuals. Public classes are merged with `cn`; ResizeHandle also passes essential placement as inline style so delegated elements remain positioned when they replace the supplied class.

WidgetGrid imports GridStack's structural stylesheet inside Root. Apps do not add GridStack classes, attributes, wrappers, or stylesheet imports themselves.

---

## Accessibility

- Default DragHandle is a native `button` with `type="button"`, disabled propagation, focus styling from Button, and localized accessible name.
- ResizeHandle and its delegated replacement receive a role, tab stop, accessible name, disabled state, 44-pixel touch target, and southeast resize cursor. Pointer dragging and resizing are the interaction mechanisms supplied in this version; provide ordinary move/resize controls when keyboard-only layout editing is required.
- Override handle labels with widget-specific text when the generic default would make several controls indistinguishable.
- Keep interactive buttons, links, fields, and menus outside a DragHandle. The handle should describe moving, not perform another action.
- `static` and disabled values remove handles from the tab order and prevent pointer interaction.
- Item is a visual container, not a landmark or heading. Add app-owned semantics and labelled regions only where the content structure requires them.
- Collision movement is spatial. Persist and announce important layout changes in app code when users need confirmation beyond the visible animation.

---

## Localization

WidgetGrid uses these Paraglide messages from `messages/en.json`:

| Message ID                        | English value   | Used by                                |
| --------------------------------- | --------------- | -------------------------------------- |
| `blue_heron_move`                 | `Move widget`   | Default DragHandle accessible label.   |
| `green_otter_resize_bottom_right` | `Resize widget` | Default ResizeHandle accessible label. |

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

Copy the complete `src/lib/components/ui/widget-grid` folder. WidgetGrid also requires these xvelte component folders:

- `src/lib/components/ui/button`: `button-root.svelte`, `index.ts`, and `README.md`. Follow Button's README for its full package, token, and utility setup.
- `src/lib/components/ui/card`: `card-root.svelte`, `card-header.svelte`, `card-title.svelte`, `card-description.svelte`, `card-action.svelte`, `card-content.svelte`, `card-footer.svelte`, `index.ts`, and `README.md`. Follow Card's README for its full package, token, and utility setup.

WidgetGrid requires no other xvelte component, hook, public attachment, shared component stylesheet, image, font, network service, or route-level integration. Its context and adapter files are private files copied with the component folder.

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

Root imports all GridStack-specific structural CSS. WidgetGrid's own default ResizeHandle uses the same `muted`, `muted-foreground`, and `foreground` semantic colors as Button and Card. Copy and configure those components first; their READMEs include the exact `layout.css` variables, `@theme` mappings, border base rule, and replaceable theme values required by the complete composition.

WidgetGrid adds no component-specific CSS variable, global class, keyframe, animation import, or font. The app remains responsible for light/dark theme activation.

---

## File organization

| File                               | Responsibility                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `widget-grid-root.svelte`          | Root props, transparent structural DOM, responsive engine lifecycle, state attributes, and callbacks.     |
| `widget-grid-item.svelte`          | Declarative registration, reactive state, private wrappers, default Card surface, and delegation.         |
| `widget-grid-drag-handle.svelte`   | Required explicit drag registration, default ghost Button, grip icon, label, and delegation.              |
| `widget-grid-resize-handle.svelte` | Single native bottom-right handle, touch target, resize icon, localized label, and delegation.            |
| `widget-grid-context.svelte.ts`    | Native Svelte contexts, item and handle registries, reactive interaction state, and callback routing.     |
| `widget-grid-adapter.ts`           | Private GridStack translation, responsive columns, native interactions, collision updates, and snapshots. |
| `widget-grid-types.ts`             | Public engine-independent item, breakpoint, and mode types.                                               |
| `index.ts`                         | Public components and exported props and state types.                                                     |
| `README.md`                        | Installation, composition, examples, API, styling, accessibility, localization, and dependencies.         |

The component's `index.ts`, exported props types, `WidgetGridItemState`, and other exported types are the source of truth for the public API.

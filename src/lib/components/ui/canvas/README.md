# Canvas

An interactive workspace for node editors, diagrams, whiteboards, and other interfaces that need pannable, zoomable content. Canvas provides draggable nodes, SVG connections, fixed viewport controls, a minimap, coordinate helpers, optional snapping, and a background grid.

Use Canvas when items need positions in a shared two-dimensional space. Do not use it for ordinary page layout, static illustrations, pixel drawing, or bitmap rendering: despite its name, this component uses accessible HTML and SVG rather than the browser's `<canvas>` element.

<!-- xvelte-example: overview -->

## Contents

- [Import](#import)
- [Anatomy](#anatomy)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Coordinates and viewport behavior](#coordinates-and-viewport-behavior)
- [Background and grid](#background-and-grid)
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
	import * as Canvas from "$lib/components/ui/canvas";
</script>
```

Canvas's `index.ts` exports `Root`, `Node`, `Edge`, `Controls`, and `Minimap`, their matching props types, shared canvas types, and the `getCanvasContext`, `edgePath`, `nodeBounds`, and `snapTo` helpers.

---

## Anatomy

`Root` provides the viewport and shared state required by every other Canvas component:

```svelte
<Canvas.Root>
	<Canvas.Edge />
	<Canvas.Node>...</Canvas.Node>
	<Canvas.Controls />
	<Canvas.Minimap />
</Canvas.Root>
```

The rendered layers are organized as follows:

```text
Root (viewport)
├── grid (dots or lines)
├── transformed content
│   ├── Edge
│   ├── Edge label
│   └── Node
└── fixed overlay
    ├── Controls
    └── Minimap
```

Nodes and edges move and scale with the canvas content. Controls and the minimap are rendered into the fixed overlay, so they remain anchored to the selected viewport corner while the canvas moves.

Give Canvas a real height through its parent or its own `class`; `Root` uses `size-full`, so an unsized parent can collapse to zero height.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Canvas from "$lib/components/ui/canvas";
</script>

<div class="h-96 overflow-hidden rounded-lg border">
	<Canvas.Root>
		<Canvas.Node id="welcome" x={80} y={80} class="w-56 rounded-lg border bg-popover p-4 shadow-sm">
			<h2 class="font-semibold">Welcome</h2>
			<p class="mt-1 text-sm text-muted-foreground">Drag this node or move it with the arrow keys.</p>
		</Canvas.Node>

		<Canvas.Controls />
	</Canvas.Root>
</div>
```

The default canvas starts at `{ x: 0, y: 0, zoom: 1 }`, supports background and middle-button panning, zooms with the wheel, and renders a 24-unit dotted grid.

---

## Examples

### Controlled viewport and node positions

`x`, `y`, and `zoom` on `Root`, and `x`, `y`, and `selected` on `Node`, are bindable:

```svelte
<script lang="ts">
	import * as Canvas from "$lib/components/ui/canvas";

	let viewportX = $state(0);
	let viewportY = $state(0);
	let zoom = $state(1);
	let nodeX = $state(96);
	let nodeY = $state(72);
	let selected = $state(false);
</script>

<div class="h-96 rounded-lg border">
	<Canvas.Root bind:x={viewportX} bind:y={viewportY} bind:zoom snap={16}>
		<Canvas.Node id="profile" bind:x={nodeX} bind:y={nodeY} bind:selected class="w-48 rounded-lg border bg-popover p-4 shadow-sm">
			Profile
		</Canvas.Node>

		<Canvas.Controls />
	</Canvas.Root>
</div>
```

Root offsets use screen pixels. Node positions and the `snap` interval use canvas-space units, so dragging remains accurate at every zoom level.

### Connected nodes

```svelte
<div class="h-96 rounded-lg border">
	<Canvas.Root>
		<Canvas.Edge fromNode="source" toNode="target" type="bezier" animated>
			{#snippet label()}Active{/snippet}
		</Canvas.Edge>

		<Canvas.Node id="source" x={64} y={96} class="w-40 rounded-lg border bg-popover p-4 shadow-sm">Source</Canvas.Node>

		<Canvas.Node id="target" x={360} y={220} class="w-40 rounded-lg border bg-popover p-4 shadow-sm">Target</Canvas.Node>
	</Canvas.Root>
</div>
```

An edge linked with `fromNode` and `toNode` follows the registered nodes automatically. It leaves the right-center of the source and enters the left-center of the target. Explicit `from` and `to` points act as fallbacks when an ID is absent or has not registered yet.

### Controls and minimap

```svelte
<div class="h-128 rounded-lg border">
	<Canvas.Root minZoom={0.4} maxZoom={2.5}>
		<Canvas.Node id="one" x={80} y={80} class="size-28 rounded-lg border bg-popover p-3">One</Canvas.Node>
		<Canvas.Node id="two" x={520} y={320} class="size-28 rounded-lg border bg-popover p-3">Two</Canvas.Node>

		<Canvas.Controls position="top-left" step={1.2} />
		<Canvas.Minimap position="bottom-right" width={180} height={120} />
	</Canvas.Root>
</div>
```

Clicking the minimap recenters the viewport. Pressing Enter while the minimap is focused fits all registered nodes into view. Set `interactive={false}` to make it display-only.

### Line grid, custom spacing, or no grid

```svelte
<Canvas.Root grid="lines" gridSize={32} snap={32}>...</Canvas.Root>

<Canvas.Root grid="none">...</Canvas.Root>
```

`gridSize` controls visual spacing; `snap` controls node alignment. They are independent, so set both to the same value when nodes should align with visible grid intersections.

### Programmatic canvas actions

Create a small descendant component when custom tools need access to the canvas state:

```svelte
<!-- CanvasToolbar.svelte -->
<script lang="ts">
	import { getCanvasContext } from "$lib/components/ui/canvas";

	const canvas = getCanvasContext("CanvasToolbar");
</script>

<button type="button" onclick={() => canvas.fitView(64)}>Fit with extra padding</button>
<button type="button" onclick={() => canvas.panTo(0, 0)}>Return to origin</button>
```

Render that component inside `Canvas.Root`. Calling `getCanvasContext` outside a root throws an error identifying the supplied component name.

---

## Public API

Canvas is implemented locally. Bits UI is used only for the portals in `Controls` and `Minimap`, so there is no external Canvas API to combine with these options. Native attributes described below are still forwarded by each component.

### `Canvas.Root`

Type: `RootProps`, based on native `div` attributes with `children` replaced by a required Svelte snippet.

| Prop               | Type                            | Default     | Behavior                                                                         |
| ------------------ | ------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `x`                | `number`                        | `0`         | Bindable horizontal viewport offset in screen pixels.                            |
| `y`                | `number`                        | `0`         | Bindable vertical viewport offset in screen pixels.                              |
| `zoom`             | `number`                        | `1`         | Bindable viewport scale. Interactive zoom is clamped to `minZoom` and `maxZoom`. |
| `minZoom`          | `number`                        | `0.2`       | Minimum interactive zoom.                                                        |
| `maxZoom`          | `number`                        | `3`         | Maximum interactive zoom.                                                        |
| `zoomSpeed`        | `number`                        | `0.0015`    | Wheel sensitivity used by the exponential zoom calculation.                      |
| `grid`             | `"dots" \| "lines" \| "none"`   | `"dots"`    | Selects the built-in background pattern.                                         |
| `gridSize`         | `number`                        | `24`        | Grid interval in canvas-space units.                                             |
| `snap`             | `number`                        | `0`         | Node drag interval in canvas-space units; `0` disables snapping.                 |
| `pannable`         | `boolean`                       | `true`      | Enables pointer panning.                                                         |
| `zoomable`         | `boolean`                       | `true`      | Enables wheel zoom. Programmatic zoom actions remain available.                  |
| `panOnMiddleClick` | `boolean`                       | `true`      | Allows middle-button panning from any point in the viewport.                     |
| `onpan`            | `(offset: CanvasPoint) => void` | `undefined` | Runs after panning, fit, reset, or zoom changes the viewport offset.             |
| `onzoom`           | `(zoom: number) => void`        | `undefined` | Runs after interactive or programmatic zoom changes.                             |
| `children`         | `Snippet`                       | Required    | Canvas content, nodes, edges, controls, and minimap.                             |
| `ref`              | `HTMLDivElement \| null`        | `null`      | Bindable viewport element.                                                       |
| `class`            | `string`                        | `undefined` | Merged with the local full-size viewport classes.                                |

Native `div` attributes and event handlers are forwarded. Local wheel and pointer handling runs before a matching handler supplied by the app. An `aria-label` supplied through the native attributes replaces the localized default when a more specific workspace name is available.

### `Canvas.Node`

Type: `NodeProps`, based on native `div` attributes with a required Svelte snippet.

| Prop          | Type                              | Default         | Behavior                                                                                                           |
| ------------- | --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`          | `string`                          | Generated ID    | Registers the node for edges, fit-to-view, and the minimap. Keep it stable and unique.                             |
| `x`           | `number`                          | `0`             | Bindable horizontal position in canvas coordinates.                                                                |
| `y`           | `number`                          | `0`             | Bindable vertical position in canvas coordinates.                                                                  |
| `selected`    | `boolean`                         | `false`         | Bindable pressed/selected state and selected stacking order. Canvas does not deselect sibling nodes automatically. |
| `draggable`   | `boolean`                         | `true`          | Enables pointer dragging and arrow-key movement.                                                                   |
| `selectable`  | `boolean`                         | `true`          | Selects the node on an eligible primary-button press.                                                              |
| `width`       | `number`                          | Measured width  | Fixes the node width in pixels and its registered boundary.                                                        |
| `height`      | `number`                          | Measured height | Fixes the node height in pixels and its registered boundary.                                                       |
| `ondragstart` | `(position: CanvasPoint) => void` | `undefined`     | Runs when pointer dragging starts.                                                                                 |
| `ondrag`      | `(position: CanvasPoint) => void` | `undefined`     | Runs for each pointer or keyboard position update.                                                                 |
| `ondragend`   | `(position: CanvasPoint) => void` | `undefined`     | Runs when pointer dragging finishes.                                                                               |
| `children`    | `Snippet`                         | Required        | Node content.                                                                                                      |
| `ref`         | `HTMLDivElement \| null`          | `null`          | Bindable node element.                                                                                             |
| `class`       | `string`                          | `undefined`     | Merged with positioning, pointer, focus, and drag classes.                                                         |

Native `div` attributes and event handlers are forwarded. Buttons, links, inputs, textareas, selects, editable content, and descendants marked with `data-no-drag` keep their normal interaction and do not start node dragging.

Focused draggable nodes move one unit with an arrow key, use the root's `snap` value when set, and move ten units while Shift is held.

### `Canvas.Edge`

Type: `EdgeProps`, based on native SVG attributes without `children`.

| Prop          | Type                                     | Default          | Behavior                                                          |
| ------------- | ---------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `from`        | `CanvasPoint`                            | `{ x: 0, y: 0 }` | Explicit source point or fallback when `fromNode` is unavailable. |
| `to`          | `CanvasPoint`                            | `{ x: 0, y: 0 }` | Explicit target point or fallback when `toNode` is unavailable.   |
| `fromNode`    | `string`                                 | `undefined`      | Uses the right-center anchor of a registered source node.         |
| `toNode`      | `string`                                 | `undefined`      | Uses the left-center anchor of a registered target node.          |
| `type`        | `"bezier" \| "smoothstep" \| "straight"` | `"bezier"`       | Selects the SVG path algorithm.                                   |
| `strokeWidth` | `number`                                 | `2`              | Connector stroke width.                                           |
| `animated`    | `boolean`                                | `false`          | Applies the built-in moving dashed-line animation.                |
| `arrow`       | `boolean`                                | `true`           | Adds an arrow marker to the target end.                           |
| `selected`    | `boolean`                                | `false`          | Changes the connector from the muted color to the primary color.  |
| `label`       | `Snippet`                                | `undefined`      | Renders a pill at the arithmetic midpoint between both endpoints. |
| `ref`         | `SVGSVGElement \| null`                  | `null`           | Bindable edge SVG element.                                        |
| `class`       | `string`                                 | `undefined`      | Merged with the edge SVG's positioning classes.                   |

Native SVG attributes are forwarded to the wrapper SVG. The SVG is hidden from assistive technology; when an edge carries meaningful information, expose that relationship in the node content or another accessible description. The label is positioned between the endpoints, not sampled from the visual center of a curved path.

### `Canvas.Controls`

Type: `ControlsProps`, based on native `div` attributes.

| Prop        | Type                                                           | Default         | Behavior                                                     |
| ----------- | -------------------------------------------------------------- | --------------- | ------------------------------------------------------------ |
| `position`  | `"bottom-left" \| "bottom-right" \| "top-left" \| "top-right"` | `"bottom-left"` | Anchors the controls inside the fixed overlay.               |
| `step`      | `number`                                                       | `1.25`          | Zoom multiplier; zoom-out uses its reciprocal.               |
| `showZoom`  | `boolean`                                                      | `true`          | Shows zoom-out, percentage, and zoom-in controls.            |
| `showFit`   | `boolean`                                                      | `true`          | Shows the fit-to-content button.                             |
| `showReset` | `boolean`                                                      | `true`          | Shows the reset-view button.                                 |
| `ref`       | `HTMLDivElement \| null`                                       | `null`          | Bindable controls element after its portal mounts.           |
| `class`     | `string`                                                       | `undefined`     | Merged with the toolbar surface and selected corner classes. |

Native `div` attributes are forwarded. Controls uses the local Button component and is rendered only when a surrounding `Canvas.Root` overlay is available.

### `Canvas.Minimap`

Type: `MinimapProps`, based on native `div` attributes.

| Prop          | Type                     | Default          | Behavior                                                     |
| ------------- | ------------------------ | ---------------- | ------------------------------------------------------------ |
| `position`    | `CanvasPosition`         | `"bottom-right"` | Anchors the minimap inside the fixed overlay.                |
| `width`       | `number`                 | `160`            | Minimap width in pixels.                                     |
| `height`      | `number`                 | `110`            | Minimap height in pixels.                                    |
| `padding`     | `number`                 | `12`             | Inner space around the projected world in pixels.            |
| `interactive` | `boolean`                | `true`           | Enables click-to-center and keyboard focus.                  |
| `ref`         | `HTMLDivElement \| null` | `null`           | Bindable minimap element after its portal mounts.            |
| `class`       | `string`                 | `undefined`      | Merged with the minimap surface and selected corner classes. |

Native `div` attributes and handlers are forwarded. Local click and keyboard handling runs before matching handlers supplied by the app. The minimap includes both registered node boundaries and the current viewport when calculating its world bounds.

### Types and helpers

| Export             | Signature or shape                                        | Purpose                                                                      |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `CanvasPoint`      | `{ x: number; y: number }`                                | A point in canvas coordinates unless the calling method says otherwise.      |
| `CanvasRect`       | `{ x: number; y: number; width: number; height: number }` | A registered node boundary in canvas coordinates.                            |
| `CanvasGrid`       | `"dots" \| "lines" \| "none"`                             | Available root background patterns.                                          |
| `CanvasPosition`   | Four viewport corners                                     | Available positions for controls and the minimap.                            |
| `EdgePathType`     | `"bezier" \| "smoothstep" \| "straight"`                  | Available connector algorithms.                                              |
| `getCanvasContext` | `(component?: string) => CanvasContext`                   | Reads the nearest root's reactive state and actions.                         |
| `edgePath`         | `(from, to, type?) => string`                             | Builds stable SVG path data between two points.                              |
| `nodeBounds`       | `(nodes) => CanvasRect \| null`                           | Returns the union of registered node boundaries.                             |
| `snapTo`           | `(value, step) => number`                                 | Rounds a coordinate to an interval; a non-positive step leaves it unchanged. |

`CanvasContext` exposes read-only `x`, `y`, `zoom`, limits, snapping, panning state, viewport, overlay, and registered nodes. Its actions are `toCanvas`, `toScreen`, `panBy`, `panTo`, `zoomBy`, `zoomTo`, `fitView`, `reset`, `registerNode`, and `unregisterNode`.

Use `index.ts` and the exported props types as the source of truth for the local API.

---

## Coordinates and viewport behavior

- Node positions, dimensions, edge points, grid intervals, and snapping use canvas coordinates.
- Root `x` and `y`, pan deltas, and zoom origins use viewport-relative screen pixels.
- `toCanvas(clientX, clientY)` accepts browser client coordinates and accounts for the root's page position, pan, and zoom.
- `toScreen(point)` returns a point relative to the Canvas viewport; add the viewport's bounding rectangle when browser client coordinates are needed.
- Wheel zoom stays centered beneath the pointer. Button and programmatic zoom defaults to the viewport center.
- Primary-button dragging pans only when the pointer starts on the empty root background. Holding Space allows primary-button panning over descendants; middle-button panning can also start over descendants when enabled.
- `fitView(padding)` measures registered nodes, clamps the calculated zoom, and centers their combined boundary. It does nothing when there are no measurable nodes.
- `reset()` restores `x = 0`, `y = 0`, and `zoom = 1`.

Persist controlled values in app state when positions or the viewport must survive navigation or reloads; Canvas does not provide storage, history, undo/redo, multi-selection, or automatic sibling deselection.

---

## Background and grid

The dotted background shown in the more-shadcn example belongs to Canvas itself, not to the surrounding documentation page. `Root` renders a dedicated absolute grid layer behind its content.

The local default background has two parts:

- `bg-background` supplies the solid surface from the global `--background` token.
- `grid="dots"` overlays dots using `radial-gradient(currentColor, transparent)` in the `--border` color, with `gridSize={24}` at zoom `1`.

The pattern follows pan and zoom: its position tracks `x` and `y`, while its spacing is `gridSize * zoom`. Dot radius also scales with zoom but is clamped between `0.5px` and `2px`. `grid="lines"` replaces it with horizontal and vertical one-pixel gradients. `grid="none"` removes only the pattern; the solid `bg-background` surface remains.

Override `class`, `grid`, and `gridSize`, or change the semantic `--background` and `--border` variables, to customize the result. A class such as `bg-muted/30` replaces the solid surface without changing the grid overlay.

---

## Styling and DOM contract

Canvas uses semantic Tailwind colors and exposes stable `data-slot` selectors:

| `data-slot`         | Element                   | Purpose                                                        |
| ------------------- | ------------------------- | -------------------------------------------------------------- |
| `canvas`            | `div[role="application"]` | Full viewport, solid background, input handling, and clipping. |
| `canvas-grid`       | `div`                     | Non-interactive dotted or line background layer.               |
| `canvas-content`    | `div`                     | Shared translated and scaled content layer.                    |
| `canvas-overlay`    | `div`                     | Fixed portal target for viewport tools.                        |
| `canvas-node`       | `div[role="button"]`      | Positioned, focusable node.                                    |
| `canvas-edge`       | `svg`                     | Connector path and optional arrow marker.                      |
| `canvas-edge-label` | `div`                     | Interactive label positioned between edge endpoints.           |
| `canvas-controls`   | `div[role="group"]`       | Fixed zoom, fit, and reset controls.                           |
| `canvas-minimap`    | `div[role="button"]`      | Fixed SVG overview of nodes and viewport.                      |

`class` is merged onto each public wrapper. Width, height, transforms, and other functional inline styles may take precedence over utility classes, so use the matching props for those values. The animated edge keyframes are colocated in `canvas-edge.svelte`; no global animation CSS is required.

---

## Accessibility

- Root uses `role="application"`, a localized accessible name, and programmatic focusability. Supply a specific `aria-label` when multiple workspaces may appear on a page.
- Nodes are keyboard-focusable buttons with `aria-pressed` bound to `selected`. Arrow keys move draggable nodes; Shift uses a ten-unit step.
- Interactive descendants inside a node retain their own pointer behavior. Add `data-no-drag` to any other descendant that must not initiate node movement.
- Controls use real Button elements with localized labels and titles. Zoom buttons become disabled at the configured limits.
- The minimap exposes a localized label, disabled state, and keyboard focus. Enter fits all nodes into view; pointer activation centers on the selected point.
- Edges are decorative SVGs with `aria-hidden="true"`. Describe meaningful relationships in accessible node content or adjacent text.
- Canvas does not announce node position changes or selection changes. Add an appropriate live region or status message when those updates are important to the workflow.

Test pointer capture, wheel behavior, keyboard movement, focus visibility, zoom limits, and interactive controls inside nodes in the final composition.

---

## Localization

Canvas uses Paraglide messages for its built-in accessible labels. Keep these entries in `messages/en.json` and provide translations for every supported locale:

| Message ID             | English value     | Used by                       |
| ---------------------- | ----------------- | ----------------------------- |
| `keen_spruce_canvas`   | `Canvas`          | Root accessible name.         |
| `misty_acorn_controls` | `Canvas controls` | Controls group label.         |
| `north_lark_zoomout`   | `Zoom out`        | Zoom-out label and title.     |
| `opal_shark_zoomin`    | `Zoom in`         | Zoom-in label and title.      |
| `proud_reed_fit`       | `Fit to content`  | Fit button label and title.   |
| `quick_stork_reset`    | `Reset view`      | Reset button label and title. |
| `light_cobra_map`      | `Canvas minimap`  | Minimap accessible name.      |

Visible node content and edge labels belong to the app and should be localized there when required.

---

## Dependencies

Canvas requires Svelte 5, Bits UI for fixed overlay portals, the Tabler Svelte icon package, Tailwind Variants through Button, the local utility helpers, Paraglide messages, and Tailwind CSS. Install its runtime and development packages with one of these command groups:

```sh
# bun
bun add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

### Required UI component

Copy the complete Button UI component from `src/lib/components/ui/button`. `Canvas.Controls` uses it for every viewport action. Copy these files:

- `src/lib/components/ui/button/button-root.svelte`
- `src/lib/components/ui/button/index.ts`

Follow the Button component's README to install it and understand its API. Canvas requires no other xvelte UI component, hook, or attachment. Keep `canvas-context.svelte.ts` with the Canvas component files because it provides their shared state and exported coordinate helpers.

### Shared utilities

Canvas imports `cn`, `WithElementRef`, and `WithoutChildren` from `$lib/utils`; Button also uses `cn` and `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block above includes `clsx` and `tailwind-merge`, which this code imports.

### Icons

Add these exact semantic exports to `src/lib/icons.ts`:

```ts
export { default as FullscreenIcon } from "@tabler/icons-svelte/icons/maximize";
export { default as MinusIcon } from "@tabler/icons-svelte/icons/minus";
export { default as PlusIcon } from "@tabler/icons-svelte/icons/plus";
export { default as ResetIcon } from "@tabler/icons-svelte/icons/restore";
```

The package block above includes `@tabler/icons-svelte`. Canvas imports icons only through this shared semantic file.

### Global CSS

Your global stylesheet must import Tailwind, define the dark variant, set the default border color, and expose the semantic colors and radius scale used by Canvas and its Button dependency. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--accent: oklch(0.841 0.238 128.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--accent: oklch(0.768 0.233 130.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
}
```

The app remains responsible for applying its `.dark` class, normally through root-level theme management.

No `tw-animate-css` import, global animation keyframe, shared component stylesheet, or additional package is required. Edge animation is defined inside `canvas-edge.svelte`; the dotted and line grids are generated by `Canvas.Root` with inline CSS gradients.

---

## Credits

Canvas is adapted from the [more-shadcn Canvas](https://more-shadcn.noair.fun/docs/components/canvas). Its viewport, node, edge, control, minimap, and grid ideas have been adapted to xvelte's local API, icon facade, localization, styling, and component conventions.

---

## File organization

| File                       | Responsibility                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `canvas-root.svelte`       | Provides viewport state, pan and zoom behavior, transformed content, overlay, and grid rendering. |
| `canvas-node.svelte`       | Registers, selects, positions, measures, and moves a node.                                        |
| `canvas-edge.svelte`       | Connects points or nodes with SVG paths, arrows, labels, and optional animation.                  |
| `canvas-controls.svelte`   | Renders fixed zoom, fit, and reset buttons into the root overlay.                                 |
| `canvas-minimap.svelte`    | Projects registered nodes and the visible viewport into a fixed overview.                         |
| `canvas-context.svelte.ts` | Owns shared types, context access, coordinate actions, bounds, snapping, and path helpers.        |
| `index.ts`                 | Exports all components, props types, shared types, and public helpers.                            |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, update the guide with the code change.

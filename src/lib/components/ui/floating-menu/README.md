# Floating Menu

A lightweight layout component for placing one or more groups of controls along any edge or corner of a containing surface. It supports eight positions, horizontal or vertical flow, semantic theme colors, native element attributes, and class overrides without owning menu state or interaction behavior.

Use Floating Menu for canvas controls, map tools, media actions, preview controls, or other compact actions that must float over content. Do not use it as a dropdown, context menu, focus-managed application menu, or popup: it does not open or close, portal content, manage focus, add menu roles, or implement keyboard navigation.

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

## Import

Import both public parts from the component's `index.ts`:

```svelte
<script lang="ts">
	import * as FloatingMenu from "$lib/components/ui/floating-menu";
</script>
```

`index.ts` exports `Root` and `Group`, their `RootProps` and `GroupProps` types, and the `RootPositions` and `RootOrientations` unions.

## Anatomy

Place one or more Group components inside Root. Root positions the complete collection; every Group supplies its own themed surface:

```svelte
<div class="relative min-h-64">
	<FloatingMenu.Root>
		<FloatingMenu.Group>
			<button type="button">Zoom out</button>
			<button type="button">Reset</button>
			<button type="button">Zoom in</button>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</div>
```

Root uses `position: absolute`. Its nearest positioned ancestor establishes the coordinate system, so an ordinary in-content menu normally needs a wrapper with `position: relative`. Without one, the menu may position itself relative to an unexpected ancestor or the initial containing block.

Group must remain a descendant of Root when it should inherit Root's orientation and positional alignment. Root may contain several sibling groups or other app content.

## Basic usage

This example creates a labeled action group in the bottom-right corner of a preview:

```svelte
<script lang="ts">
	import * as FloatingMenu from "$lib/components/ui/floating-menu";

	let zoom = $state(100);
</script>

<div class="relative min-h-64 overflow-hidden rounded-lg border">
	<div class="grid min-h-64 place-items-center" aria-live="polite">
		Preview at {zoom}%
	</div>

	<FloatingMenu.Root position="bottom-right" orientation="horizontal">
		<FloatingMenu.Group role="group" aria-label="Preview zoom">
			<button type="button" aria-label="Zoom out" class="rounded-lg px-3 py-2 hover:bg-background" onclick={() => (zoom = Math.max(25, zoom - 25))}>
				−
			</button>
			<button type="button" class="rounded-lg px-3 py-2 hover:bg-background" onclick={() => (zoom = 100)}>
				{zoom}%
			</button>
			<button type="button" aria-label="Zoom in" class="rounded-lg px-3 py-2 hover:bg-background" onclick={() => (zoom = Math.min(200, zoom + 25))}>
				+
			</button>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</div>
```

The component only handles placement and grouping. The app owns button behavior, disabled states, labels, tooltips, active state, and any selection logic.

## Examples

### Vertical controls on the left

Set `orientation="vertical"` to stack Root's children and the contents of every Group:

```svelte
<div class="relative min-h-80">
	<FloatingMenu.Root position="left" orientation="vertical">
		<FloatingMenu.Group role="group" aria-label="Drawing tools">
			<button type="button">Select</button>
			<button type="button">Draw</button>
			<button type="button">Erase</button>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</div>
```

`left` and `right` vertically center Root with `top: 50%` and a negative Y translation. `top` and `bottom` horizontally center it with `left: 50%` and a negative X translation.

### Multiple visual groups

Root's `gap-1` separates sibling groups while each Group keeps its own background and shadow:

```svelte
<div class="relative min-h-64">
	<FloatingMenu.Root position="top" orientation="horizontal">
		<FloatingMenu.Group role="group" aria-label="History">
			<button type="button">Undo</button>
			<button type="button">Redo</button>
		</FloatingMenu.Group>

		<FloatingMenu.Group role="group" aria-label="View">
			<button type="button">Fit</button>
			<button type="button">Fullscreen</button>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</div>
```

Root and Group both allow wrapping. A narrow containing surface can therefore move controls or complete groups onto additional lines.

### Controlled position

Use the exported position type when app state chooses the active edge:

```svelte
<script lang="ts">
	import * as FloatingMenu from "$lib/components/ui/floating-menu";

	let position = $state<FloatingMenu.RootPositions>("bottom-left");
</script>

<select bind:value={position} aria-label="Floating menu position">
	<option value="top-left">Top left</option>
	<option value="top">Top</option>
	<option value="top-right">Top right</option>
	<option value="right">Right</option>
	<option value="bottom-right">Bottom right</option>
	<option value="bottom">Bottom</option>
	<option value="bottom-left">Bottom left</option>
	<option value="left">Left</option>
</select>

<div class="relative min-h-64">
	<FloatingMenu.Root {position}>
		<FloatingMenu.Group>
			<button type="button">Action</button>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</div>
```

Changing the prop updates `data-position` and the matching Tailwind positioning utilities reactively.

### Fixed viewport controls

The default `absolute` class can be replaced through `class` when the menu should use the viewport instead of a local container:

```svelte
<FloatingMenu.Root position="top-right" class="fixed m-6">
	<FloatingMenu.Group role="group" aria-label="Page tools">
		<button type="button">Help</button>
		<button type="button">Preferences</button>
	</FloatingMenu.Group>
</FloatingMenu.Root>
```

`cn` resolves the conflicting `fixed` and `absolute` utilities in favor of the caller's later class. Check stacking contexts and safe areas before using a viewport-fixed menu.

### Custom group surface

Group classes are merged after the defaults, so theme and shape utilities can be replaced without rebuilding Root:

```svelte
<FloatingMenu.Root>
	<FloatingMenu.Group class="rounded-full bg-background p-2 shadow-lg">
		<button type="button">Previous</button>
		<button type="button">Play</button>
		<button type="button">Next</button>
	</FloatingMenu.Group>
</FloatingMenu.Root>
```

Keep the custom Group inside a Root if it should inherit orientation and alignment.

## Public API

Floating Menu is implemented with native `div` elements and has no external primitive API. The component's `index.ts`, exported types, and local source are the source of truth.

### `FloatingMenu.Root`

Type: `RootProps`, combining xvelte-owned placement options with native `HTMLAttributes<HTMLDivElement>` and a bindable element reference.

| Prop          | Type                     | Default          | Behavior                                                                         |
| ------------- | ------------------------ | ---------------- | -------------------------------------------------------------------------------- |
| `position`    | `RootPositions`          | `"bottom-right"` | Selects one of eight edge or corner placements and writes `data-position`.       |
| `orientation` | `RootOrientations`       | `"horizontal"`   | Controls Root and descendant Group flex direction and writes `data-orientation`. |
| `ref`         | `HTMLDivElement \| null` | `null`           | Bindable rendered root element.                                                  |
| `children`    | `Snippet`                | `undefined`      | Renders groups and any other app content.                                        |
| `class`       | `string`                 | `undefined`      | Merged after Root's positioning and layout classes.                              |

Remaining native `div` attributes are forwarded. Root always writes `data-slot="floating-menu-root"`, `data-position`, and `data-orientation` before forwarding them. Do not pass conflicting versions of those `data-*` attributes through the native attribute surface: because the spread is rendered last, they can replace the values derived from the public props and make DOM state disagree with the requested API.

`RootPositions` is:

```ts
type RootPositions = "bottom-right" | "top-left" | "top" | "top-right" | "right" | "bottom" | "bottom-left" | "left";
```

Placement behavior:

| Position       | Anchoring                           |
| -------------- | ----------------------------------- |
| `top-left`     | Top and left edges.                 |
| `top`          | Top edge, horizontally centered.    |
| `top-right`    | Top and right edges.                |
| `right`        | Right edge, vertically centered.    |
| `bottom-right` | Bottom and right edges.             |
| `bottom`       | Bottom edge, horizontally centered. |
| `bottom-left`  | Bottom and left edges.              |
| `left`         | Left edge, vertically centered.     |

There is no centered position. Root's margin, content dimensions, wrapping, caller classes, and containing block determine the final offset and footprint.

`RootOrientations` is exactly `"horizontal" | "vertical"`.

### `FloatingMenu.Group`

Type: `GroupProps`, combining native `HTMLAttributes<HTMLDivElement>` with a bindable element reference.

| Prop       | Type                     | Default     | Behavior                                                      |
| ---------- | ------------------------ | ----------- | ------------------------------------------------------------- |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable rendered group element.                              |
| `children` | `Snippet`                | `undefined` | Renders the controls or other app content.                    |
| `class`    | `string`                 | `undefined` | Merged after the themed surface and inherited layout classes. |

Remaining native `div` attributes are forwarded. Group has no direct `position` or `orientation` props. It reads the nearest ancestor carrying Root's named Tailwind group state and responds to that ancestor's `data-position` and `data-orientation` attributes.

Group writes `data-slot="floating-menu-group"` before forwarding native attributes. Do not supply a conflicting `data-slot`, because the final native spread can replace the stable hook.

Group uses `justify-start` for left-anchored positions, `justify-end` for right-anchored positions, and `justify-center` for `top` or `bottom`. Horizontal orientation uses a row; vertical orientation uses a column. Its base `flex-wrap` remains active in either mode.

Group renders no role. Add `role="group"` and an accessible name when its controls form a meaningful related set.

## Styling and DOM contract

Root is an absolute, wrapping flex container with `z-20`, `m-3`, `gap-1`, and the stable named group class `group/floating-menu-root`. The `position` prop selects edge utilities through `data-position`, while `orientation` selects `flex-row` or `flex-col` through `data-orientation`.

Group is a wrapping flex surface with `gap-1`, `rounded-xl`, `bg-popover/90`, `p-1`, and a small shadow colored with `background`. It carries the stable named class `group/floating-menu-group` and uses Root's named group attributes to choose alignment and direction.

Stable xvelte hooks:

| Part  | Stable hook or attribute                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------- |
| Root  | `data-slot="floating-menu-root"`, `data-position`, `data-orientation`, and `group/floating-menu-root` |
| Group | `data-slot="floating-menu-group"` and `group/floating-menu-group`                                     |

Both parts merge caller classes with `cn`. Later conflicting Tailwind utilities can replace defaults, including positioning, margin, direction, radius, surface color, padding, gap, shadow, and z-index. Native `style` and other attributes are forwarded unchanged.

The literal implementation class `group-group-data-` on Group has no documented behavior and is not a stable styling hook. Do not depend on it.

The component defines no animation, transition lifecycle, CSS variable, keyframe, attachment, context, or shared component stylesheet. It relies on the global position and orientation variants listed in [Dependencies](#dependencies).

## Accessibility

Floating Menu is layout-only. Root and Group render generic `div` elements and do not add menu semantics, focus management, roving tabindex, keyboard shortcuts, active state, tooltips, or accessible names.

- Use semantic `button` or `a` elements for actions and navigation.
- Give icon-only controls accessible names.
- Use `role="group"` plus `aria-label` or `aria-labelledby` for a meaningful cluster of related controls.
- Use `nav` semantics through an app wrapper when the floating content is navigation; Root itself cannot change its rendered element.
- Preserve visible focus styles and a logical DOM/tab order. Visual edge placement does not change reading order.
- Avoid covering essential content, browser zoom controls, or other interactive elements. Add sufficient padding to the underlying surface when overlap would hide content.
- Verify pointer target size, contrast against changing content beneath the translucent Group, high zoom, wrapping, and narrow viewports.

Do not assign `role="menu"` unless the app also implements the complete menu keyboard and focus pattern. For actual popup or context-menu behavior, use the corresponding accessible xvelte component.

## Localization

Floating Menu has no built-in user-facing copy and imports no localization messages. The app supplies and translates button labels, accessible names, tooltips, status text, and any other content rendered inside Root or Group.

Position and orientation strings, `data-*` values, class names, and `data-slot` values are implementation identifiers and are not translated.

## Dependencies

Floating Menu expects a Svelte 5 project using Tailwind CSS 4. It has no runtime component primitive, icon package, localization package, hook, attachment, or other xvelte component dependency.

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

Copy the complete `src/lib/components/ui/floating-menu` folder:

- `floating-menu-root.svelte`
- `floating-menu-group.svelte`
- `index.ts`
- `README.md`

No internal context, standalone helper file, icon export, localization message, hook, attachment, other UI component, image, font, network service, or `tw-animate-css` installation is required.

### Shared utilities

Root and Group import `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

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

The application stylesheet must load Tailwind:

```css
@import "tailwindcss";
```

Group uses the `popover` and `background` semantic colors and the shared extra-large radius. These are xvelte's values; apps may replace them while preserving the variable names and mappings:

```css
:root {
	--background: oklch(1 0 0);
	--popover: oklch(1 0 0);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--popover: oklch(0.216 0.006 56.043);
}

@theme inline {
	--color-popover: var(--popover);
	--color-background: var(--background);
	--radius-xl: calc(var(--radius) * 1.4);
}

@custom-variant data-horizontal {
	&:where([data-orientation="horizontal"]) {
		@slot;
	}
}

@custom-variant data-vertical {
	&:where([data-orientation="vertical"]) {
		@slot;
	}
}

@custom-variant data-top-left {
	&:where([data-position="top-left"]) {
		@slot;
	}
}

@custom-variant data-top {
	&:where([data-position="top"]) {
		@slot;
	}
}

@custom-variant data-top-right {
	&:where([data-position="top-right"]) {
		@slot;
	}
}

@custom-variant data-right {
	&:where([data-position="right"]) {
		@slot;
	}
}

@custom-variant data-bottom-right {
	&:where([data-position="bottom-right"]) {
		@slot;
	}
}

@custom-variant data-bottom {
	&:where([data-position="bottom"]) {
		@slot;
	}
}

@custom-variant data-bottom-left {
	&:where([data-position="bottom-left"]) {
		@slot;
	}
}

@custom-variant data-left {
	&:where([data-position="left"]) {
		@slot;
	}
}
```

All ten custom variants are required: Root uses them to interpret `data-position` and `data-orientation`, and Group combines the same variants with Root's named Tailwind group. No global base rule, component-specific CSS variable, keyframe, animation import, or other layout stylesheet is required. The app owns dark-mode activation.

### Layout requirement

For the default absolute positioning, the app must provide a containing block:

```svelte
<div class="relative">
	<!-- Surface content -->
	<FloatingMenu.Root>
		<FloatingMenu.Group>...</FloatingMenu.Group>
	</FloatingMenu.Root>
</div>
```

The containing block needs usable dimensions, and `overflow-hidden` will clip the menu if it extends outside those bounds. This is app layout rather than shared CSS and should be chosen per use case.

## File organization

| File                         | Responsibility                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `floating-menu-root.svelte`  | Edge/corner placement, orientation state, absolute layout, stable DOM attributes, children, and native prop forwarding. |
| `floating-menu-group.svelte` | Themed control surface, inherited alignment/orientation, children, and native prop forwarding.                          |
| `index.ts`                   | Public components, props types, and placement/orientation type exports.                                                 |
| `README.md`                  | Composition, examples, API, styling, accessibility, localization, and installation requirements.                        |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

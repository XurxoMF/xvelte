# Drawer

A touch-friendly modal panel that slides from any viewport edge and can be dragged, dismissed, snapped between preset sizes, nested, or controlled from application state. It combines Vaul Svelte's gesture and viewport behavior with local xvelte layout, semantic colors, Svelte 5 snippets, bindable refs, and accessible dialog parts.

Use Drawer for compact forms, filters, navigation, details, and mobile or tablet workflows that benefit from direct manipulation. Prefer Dialog for centered desktop content, Alert Dialog for consequential confirmation, and a permanent panel when the content should remain continuously visible.

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

Import all parts from the component's public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer";
</script>
```

Drawer's `index.ts` exports `Root`, `NestedRoot`, `Trigger`, `Portal`, `Overlay`, `Content`, `Header`, `Title`, `Description`, `Footer`, and `Close`, together with the corresponding `RootProps`, `NestedProps`, `TriggerProps`, `PortalProps`, `OverlayProps`, `ContentProps`, `HeaderProps`, `TitleProps`, `DescriptionProps`, `FooterProps`, and `CloseProps` types.

---

## Anatomy

Compose a Trigger and Content below one Root:

```svelte
<Drawer.Root>
	<Drawer.Trigger>Open drawer</Drawer.Trigger>

	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Drawer title</Drawer.Title>
			<Drawer.Description>Explain what can be done here.</Drawer.Description>
		</Drawer.Header>

		<!-- Drawer body -->

		<Drawer.Footer>
			<Drawer.Close>Close</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
```

Content automatically renders Portal and Overlay. Do not wrap ordinary Content in another Portal or add a second Overlay. Unlike Dialog, Drawer does not generate any close button; include a clearly labeled Close in the content.

Header and Footer are native layout containers. Root and NestedRoot own state and gestures, while Trigger, Content, Overlay, Title, Description, Close, and Portal adapt Vaul Svelte's legacy component API to local Svelte 5 usage.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer";

	let open = $state(false);
	let displayName = $state("Ada Lovelace");
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger class="rounded-lg border px-3 py-2 text-sm">Edit profile</Drawer.Trigger>

	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Edit profile</Drawer.Title>
			<Drawer.Description>Update the name displayed on your public profile.</Drawer.Description>
		</Drawer.Header>

		<label class="grid gap-1 px-4 text-sm">
			Display name
			<input class="rounded-md border px-2 py-1" bind:value={displayName} />
		</label>

		<Drawer.Footer>
			<Drawer.Close class="rounded-lg border px-3 py-2">Done</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
```

Trigger and Close render native buttons with `type="button"` but have no local visual styles. Closing does not save, validate, or submit anything by itself; connect application behavior to the appropriate controls.

---

## Examples

### Direction

Root supports every viewport edge. Content applies direction-specific position, border, radius, size, and maximum-width classes from Vaul's `data-vaul-drawer-direction` attribute:

```svelte
<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer";
</script>

<Drawer.Root direction="right" shouldScaleBackground={false}>
	<Drawer.Trigger>Open filters</Drawer.Trigger>

	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Filters</Drawer.Title>
			<Drawer.Description>Narrow the visible results.</Drawer.Description>
		</Drawer.Header>

		<!-- Filter controls -->
		<Drawer.Footer><Drawer.Close>Close filters</Drawer.Close></Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
```

Valid directions are `"bottom"`, `"top"`, `"left"`, and `"right"`; bottom is the default. The local drag-handle bar is displayed only for a bottom drawer.

### Snap points

Use viewport fractions or pixel strings ordered from least to most visible:

```svelte
<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer";

	const snapPoints = [0.25, 0.55, 0.9];
	let activeSnapPoint = $state<number | string | null>(snapPoints[1]);
</script>

<Drawer.Root {snapPoints} bind:activeSnapPoint fadeFromIndex={1}>
	<Drawer.Trigger>Open trip details</Drawer.Trigger>

	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Trip details</Drawer.Title>
			<Drawer.Description>Drag to expand or collapse the itinerary.</Drawer.Description>
		</Drawer.Header>

		<div class="overflow-y-auto px-4 pb-4"><!-- Itinerary --></div>
		<Drawer.Footer><Drawer.Close>Done</Drawer.Close></Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
```

In the installed Vaul Svelte runtime, numeric snap points are viewport fractions such as `0.25`, while strings such as `"320px"` are parsed as pixel sizes. They apply to viewport height for top/bottom drawers and viewport width for left/right drawers. Keep `activeSnapPoint` equal to one of the array values or `null`.

### Scrolling and drag exclusion

Vaul detects scrollable descendants and prevents a downward close gesture until a vertical scroller reaches its start. Use `data-vaul-no-drag` when interaction within a region must never start drawer dragging:

```svelte
<Drawer.Root>
	<Drawer.Trigger>Choose a price range</Drawer.Trigger>

	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Choose a range</Drawer.Title>
			<Drawer.Description>Scroll the list or adjust the range without moving the drawer.</Drawer.Description>
		</Drawer.Header>

		<div class="max-h-72 overflow-y-auto px-4">
			<!-- Long scrollable list -->
		</div>

		<div data-vaul-no-drag class="p-4">
			<label>
				Maximum price
				<input type="range" min="0" max="500" />
			</label>
		</div>

		<Drawer.Footer><Drawer.Close>Close range picker</Drawer.Close></Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
```

Do not place `data-vaul-no-drag` on the complete Content unless all swipe interaction should be disabled.

### Scaled page background

xvelte sets `shouldScaleBackground` to `true` by default. Vaul can scale only an element marked with `data-vaul-drawer-wrapper`:

```svelte
<div data-vaul-drawer-wrapper class="min-h-screen">
	<!-- Page content, including Drawer.Root and Drawer.Trigger -->
</div>
```

When the drawer opens, Vaul temporarily changes the wrapper's inline transform, radius, overflow, and transition, and sets the document body background to `backgroundColor`. Set `shouldScaleBackground={false}` when the app does not provide this wrapper or does not want document-level style changes.

### Custom portal target

The portal destination belongs to Root's legacy `portal` prop, not Content's `portalProps`:

```svelte
<Drawer.Root portal="#drawer-root">
	<Drawer.Trigger>Open drawer</Drawer.Trigger>
	<Drawer.Content portalProps={{ class: "drawer-portal" }}>
		<Drawer.Header>
			<Drawer.Title>Custom portal</Drawer.Title>
			<Drawer.Description>This drawer is mounted below the selected target.</Drawer.Description>
		</Drawer.Header>
		<Drawer.Footer><Drawer.Close>Close</Drawer.Close></Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<div id="drawer-root"></div>
```

`portalProps` configures the rendered legacy Portal wrapper, such as its `class` or native `div` attributes. It does not accept Bits UI 2's `to` or `disabled` options.

### Nested drawer

NestedRoot must be rendered below an outer Root and coordinates drag and scaling with its parent:

```svelte
<Drawer.Root>
	<Drawer.Trigger>Open order</Drawer.Trigger>

	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Order details</Drawer.Title>
			<Drawer.Description>Review the selected order.</Drawer.Description>
		</Drawer.Header>

		<Drawer.NestedRoot>
			<Drawer.Trigger>Choose delivery address</Drawer.Trigger>

			<Drawer.Content>
				<Drawer.Header>
					<Drawer.Title>Delivery address</Drawer.Title>
					<Drawer.Description>Select where this order should be delivered.</Drawer.Description>
				</Drawer.Header>
				<Drawer.Footer><Drawer.Close>Close address picker</Drawer.Close></Drawer.Footer>
			</Drawer.Content>
		</Drawer.NestedRoot>

		<Drawer.Footer><Drawer.Close>Close order</Drawer.Close></Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
```

Using NestedRoot outside Root throws an error. Prefer NestedRoot rather than manually setting `nested` on an ordinary Root because it installs the parent coordination callbacks.

---

## Public API

Drawer wraps `vaul-svelte` 0.3.2, which internally uses a legacy Bits UI/Melt dialog API. The tables summarize local behavior and the important installed options; consult the [Vaul Svelte repository](https://github.com/huntabyte/vaul-svelte) for background, but treat this component's `index.ts`, exported types, installed package source, and local wrappers as the source of truth.

Do not apply the current Bits UI 2 Dialog API directly to Drawer. Legacy `asChild` props remain visible in several inherited types, but the xvelte wrappers replace Vaul's slots with plain Svelte 5 children snippets and do not expose Vaul's `builder`. Setting `asChild={true}` on Trigger, Close, Content, Overlay, Portal, Title, or Description therefore drops required attributes or rendering and is unsupported.

### `Drawer.Root`

Type: `RootProps`, based on Vaul Svelte Root props plus a local children snippet.

| Prop                       | Type                                                        | Default         | xvelte behavior                                                                                            |
| -------------------------- | ----------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| `open`                     | `boolean`                                                   | `false`         | Bindable open state.                                                                                       |
| `onOpenChange`             | `(open: boolean) => void`                                   | `undefined`     | Runs when Vaul changes open state.                                                                         |
| `activeSnapPoint`          | `number \| string \| null`                                  | `null`          | Bindable active value when snap points are configured.                                                     |
| `onActiveSnapPointChange`  | `(point: number \| string \| null) => void`                 | `undefined`     | Runs when the active snap point changes.                                                                   |
| `snapPoints`               | `(number \| string)[]`                                      | `undefined`     | Ordered viewport fractions or pixel strings.                                                               |
| `fadeFromIndex`            | `number`                                                    | last point      | Snap-point index at which overlay fading begins.                                                           |
| `closeThreshold`           | `number`                                                    | `0.25`          | Dragged proportion required to dismiss a drawer without snap points.                                       |
| `scrollLockTimeout`        | `number`                                                    | `100`           | Milliseconds during which dragging remains blocked after scrolling. This is the installed runtime default. |
| `direction`                | `"bottom" \| "top" \| "left" \| "right"`                    | `"bottom"`      | Selects opening edge, gesture axis, dimensions, and local Content styling.                                 |
| `dismissible`              | `boolean`                                                   | `true`          | Allows swipe and outside-click dismissal. Explicit Close and Escape still close in the installed runtime.  |
| `shouldScaleBackground`    | `boolean`                                                   | `true`          | Local default enables Vaul's page-wrapper scaling when `data-vaul-drawer-wrapper` exists.                  |
| `backgroundColor`          | `string`                                                    | `"black"`       | Temporary body background while scaled-background mode is active.                                          |
| `onDrag`                   | `(event, percentageDragged: number) => void`                | `undefined`     | Receives Vaul drag progress when the dependency invokes its drag callback.                                 |
| `onRelease`                | `(event, remainsOpen: boolean) => void`                     | `undefined`     | Receives release state after a drag gesture.                                                               |
| `onClose`                  | `() => void`                                                | `undefined`     | Runs when Vaul begins its close routine.                                                                   |
| `closeOnOutsideClick`      | `boolean`                                                   | `true`          | Enables the installed legacy outside-click handler.                                                        |
| `onOutsideClick`           | `(event: PointerEvent \| MouseEvent \| TouchEvent) => void` | `undefined`     | Runs before normal outside dismissal; prevent default to keep the drawer open.                             |
| `portal`                   | `HTMLElement \| string \| null`                             | `document.body` | Sets the target used by the legacy Portal.                                                                 |
| `openFocus` / `closeFocus` | Vaul's inherited focus options                              | `undefined`     | Customize opening and closing focus behavior through the installed legacy dialog layer.                    |
| `children`                 | `Snippet`                                                   | `undefined`     | Renders Trigger and Content within Root state.                                                             |

Root renders no element of its own but loads Vaul's global drawer transition rules and may mutate the document body and `[data-vaul-drawer-wrapper]`. The local defaults intentionally differ from Vaul's component declaration for `shouldScaleBackground` and `activeSnapPoint`.

Vaul owns body scroll locking regardless of the inherited legacy `preventScroll` prop. Its document Escape listener closes the drawer regardless of the inherited `closeOnEscape` value. Leave those two legacy options alone rather than using them to infer modern Bits UI behavior.

### `Drawer.NestedRoot`

Type: `NestedProps`, based on the same Vaul props plus a local children snippet. It exposes the same local bindable `open` and `activeSnapPoint` defaults and `shouldScaleBackground={true}`, but must be inside another Root. Vaul forces nested coordination, forwards the child's `onDrag` and `onOpenChange`, and adjusts the parent drawer while the child opens, drags, and closes.

Do not override `nested`, `onRelease`, or the parent-coordination behavior on NestedRoot unless the installed Vaul source has been reviewed. NestedRoot renders no DOM element.

### `Drawer.Trigger`

Type: `TriggerProps`, derived from the installed Vaul Trigger props after replacing its legacy `el` with a local ref and its slot with a Svelte 5 snippet.

| Prop       | Type                | Default     | xvelte behavior                                                                 |
| ---------- | ------------------- | ----------- | ------------------------------------------------------------------------------- |
| `children` | `Snippet`           | `undefined` | Renders content inside the default native button.                               |
| `ref`      | `HTMLButtonElement` | `undefined` | Bindable default button reference, translated internally to Vaul's legacy `el`. |
| `disabled` | `boolean`           | `undefined` | Forwards native disabled behavior.                                              |
| `class`    | `string`            | `undefined` | Forwarded without local visual classes.                                         |

Remaining compatible native button attributes and legacy component events are forwarded. Trigger renders `type="button"`, adds `data-slot="drawer-trigger"`, and receives expanded/dialog behavior from Vaul's internal dialog layer. It does not expose xvelte's `child` render-delegation API.

### `Drawer.Content`

Type: `ContentProps`, based on installed Vaul Content props after replacing `el` and children, plus local portal configuration.

| Prop          | Type                                  | Default     | xvelte behavior                                                                                                          |
| ------------- | ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `portalProps` | Portal wrapper props without children | `undefined` | Passed to the automatic legacy Portal wrapper. The portal target remains Root's `portal` prop.                           |
| `children`    | `Snippet`                             | `undefined` | Renders below the internal bottom-only drag-handle bar.                                                                  |
| `ref`         | `HTMLDivElement`                      | `undefined` | Bindable drawer element reference, translated internally to Vaul's legacy `el`.                                          |
| `class`       | `string`                              | `undefined` | Merged after local fixed positioning, direction-aware dimensions, borders, radii, surface, layout, and responsive width. |
| `style`       | Native style input                    | `undefined` | Forwarded through Vaul, which appends its internal `--snap-point-height` value when snap points exist.                   |

Content forwards remaining compatible native `div`, legacy transition, and pointer/touch event props. It automatically renders Portal and an unconfigured Overlay. Its internal `asChild` path is unsupported because the required builder is not exposed.

The bottom handle is a decorative local `div` with no public prop, ref, class, `data-slot`, or independent drag behavior. It is hidden for top, left, and right directions. Content itself does not add overflow scrolling; create a scrollable descendant when the body can exceed the available height.

### `Drawer.Overlay`

Type: `OverlayProps`, based on installed Vaul Overlay props after replacing legacy `el` with `ref`.

| Prop    | Type             | Default     | xvelte behavior                                                                                                  |
| ------- | ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `ref`   | `HTMLDivElement` | `undefined` | Bindable overlay reference, translated to Vaul's legacy `el`.                                                    |
| `class` | `string`         | `undefined` | Merged after fixed coverage, `z-50`, translucent black background, optional backdrop blur, and state animations. |

Remaining compatible native `div` and legacy transition props are forwarded. The wrapper exposes no children snippet. Content creates Overlay automatically without forwarding public Overlay props, so customize the standard overlay through `[data-slot="drawer-overlay"]`; adding a standalone Overlay beside Content creates a duplicate.

### `Drawer.Portal`

Type: `PortalProps`, derived from the installed legacy Portal component plus a local children snippet. It renders a real wrapper `div` with Vaul/Bits' `data-portal` attribute at Root's `portal` target and forwards compatible wrapper attributes such as `class`.

Portal has no xvelte `ref`, `to`, or `disabled` prop. In standard composition it is created by Content and configured through `portalProps`. Its inherited legacy `asChild` mode is unsupported.

### `Drawer.Title`

Type: `TitleProps`, based on installed Vaul Title props after replacing legacy `el` and children.

| Prop       | Type                                           | Default     | xvelte behavior                                                          |
| ---------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `level`    | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"`      | Selects the native heading element.                                      |
| `children` | `Snippet`                                      | `undefined` | Renders accessible title content.                                        |
| `ref`      | `HTMLHeadingElement`                           | `undefined` | Bindable heading reference, translated internally to Vaul's legacy `el`. |
| `class`    | `string`                                       | `undefined` | Merged after local base size, medium weight, and foreground color.       |

Remaining compatible heading attributes are forwarded. Title adds `data-slot="drawer-title"` and supplies the accessible name relationship for Content. Its inherited `asChild` path is unsupported.

### `Drawer.Description`

Type: `DescriptionProps`, based on installed Vaul Description props after replacing legacy `el` and children.

| Prop       | Type             | Default     | xvelte behavior                                                         |
| ---------- | ---------------- | ----------- | ----------------------------------------------------------------------- |
| `children` | `Snippet`        | `undefined` | Renders accessible supporting text.                                     |
| `ref`      | `HTMLDivElement` | `undefined` | Bindable default `div` reference, translated internally to legacy `el`. |
| `class`    | `string`         | `undefined` | Merged after local text size and muted foreground color.                |

Remaining compatible native `div` attributes are forwarded. Description adds `data-slot="drawer-description"` and supplies Content's accessible description relationship. Its inherited `asChild` path is unsupported.

### `Drawer.Header`

Type: `HeaderProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                  | Default     | xvelte behavior                                                                                |
| ---------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `children` | `Snippet`             | `undefined` | Renders Title, Description, and other header content.                                          |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable native `div` reference through the shared helper type.                                |
| `class`    | `string`              | `undefined` | Merged after padding, compact vertical spacing, and direction-aware responsive text alignment. |

All remaining native `div` attributes and events are forwarded. Header adds `data-slot="drawer-header"`.

### `Drawer.Footer`

Type: `FooterProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                  | Default     | xvelte behavior                                                              |
| ---------- | --------------------- | ----------- | ---------------------------------------------------------------------------- |
| `children` | `Snippet`             | `undefined` | Renders app-provided actions.                                                |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable native `div` reference through the shared helper type.              |
| `class`    | `string`              | `undefined` | Merged after automatic top margin, vertical action layout, gap, and padding. |

All remaining native `div` attributes and events are forwarded. Footer adds `data-slot="drawer-footer"` and generates no controls.

### `Drawer.Close`

Type: `CloseProps`, based on installed Vaul Close props after replacing legacy `el` and children.

| Prop       | Type                | Default     | xvelte behavior                                                                 |
| ---------- | ------------------- | ----------- | ------------------------------------------------------------------------------- |
| `children` | `Snippet`           | `undefined` | Renders content inside the default native button.                               |
| `ref`      | `HTMLButtonElement` | `undefined` | Bindable default button reference, translated internally to Vaul's legacy `el`. |
| `disabled` | `boolean`           | `undefined` | Forwards native disabled behavior.                                              |
| `class`    | `string`            | `undefined` | Forwarded without local visual classes.                                         |

Remaining compatible native button attributes and legacy events are forwarded. Close renders `type="button"`, adds `data-slot="drawer-close"`, and invokes Vaul's animated close routine. Its inherited `asChild` path is unsupported.

---

## Styling and DOM contract

Drawer combines local Tailwind classes with Vaul Svelte's component-scoped global CSS, inline transforms, and dependency-owned attributes. It exposes no xvelte-specific CSS variables.

| Part                 | Stable xvelte hook or class                                    |
| -------------------- | -------------------------------------------------------------- |
| `Root`, `NestedRoot` | No element; Vaul installs global transition and gesture styles |
| `Trigger`            | `data-slot="drawer-trigger"`; visually unstyled                |
| Portal wrapper       | Dependency-owned `data-portal`; no local `data-slot`           |
| `Overlay`            | `data-slot="drawer-overlay"`                                   |
| `Content`            | `data-slot="drawer-content"`, group name `drawer-content`      |
| Bottom drag bar      | No public hook; visible only for `direction="bottom"`          |
| `Header`             | `data-slot="drawer-header"`                                    |
| `Title`              | `data-slot="drawer-title"`                                     |
| `Description`        | `data-slot="drawer-description"`                               |
| `Footer`             | `data-slot="drawer-footer"`                                    |
| `Close`              | `data-slot="drawer-close"`; visually unstyled                  |

Vaul additionally owns `data-vaul-drawer`, `data-vaul-drawer-direction`, `data-vaul-drawer-visible`, `data-vaul-overlay`, snap-point attributes, `data-escapee`, `.vaul-dragging`, `.vaul-scrollable`, `--snap-point-height`, dialog state, IDs, roles, ARIA relationships, transitions, inline transforms, and document-level style changes. `data-vaul-no-drag` is a documented app-facing opt-out for gesture regions.

Styled parts merge `class` with `cn`, so later Tailwind utilities can replace compatible local classes. Trigger, Close, and Portal forward class without merging local visual classes. Forwarded props are spread after local `data-slot` values and can override them; preserve the documented slots because local styles and app integrations may target them.

Bottom and top drawers span horizontally, stop at `80vh`, and receive edge-specific rounded corners and borders. Left and right drawers use `75%` viewport width and cap at `sm:max-w-sm`. Overlay and Content share `z-50`. Overlay uses hard-coded `black/10`; Content uses semantic popover colors. Vaul's built-in drawer transform and overlay-opacity transitions last `500ms`, while its close-state bookkeeping includes separate internal timing.

---

## Accessibility

Vaul Svelte's legacy Bits/Melt dialog layer supplies modal dialog semantics, Trigger expanded state, native button behavior, Title and Description relationships, focus containment, outside-click handling, Escape handling, body scroll locking, and hidden/visible state. Title defaults to a real `h2`.

App responsibilities:

- Include one meaningful Title and normally a Description so the drawer has an accessible name and useful context.
- Include a visible, clearly labeled Close. Drawer does not create one automatically, and the visual bottom drag bar is decorative rather than keyboard operable.
- Style focus indicators for unstyled Trigger and Close controls, and preserve native button semantics.
- Keep important actions operable without drag gestures. Snap points and swipe dismissal have no equivalent specialized keyboard controls.
- Use `data-vaul-no-drag` for sliders, canvases, selection surfaces, and other interactions that conflict with pointer dragging.
- Label form fields and report validation, pending state, and errors through the app.
- Do not use unsupported `asChild` paths; they omit the builder attributes that carry behavior and accessibility.

`dismissible={false}` prevents outside-click and natural swipe dismissal in the installed runtime, but Escape and an explicit Close still close the drawer. There is no reliable local prop for disabling Vaul's document-level Escape handler; always design Escape as an available exit.

---

## Localization

Drawer contains no built-in human-readable copy and does not use Paraglide messages. The app supplies and translates Trigger text, Title, Description, Close labels, form labels, action labels, instructions, progress, errors, and all drawer body content.

Direction names, state values, snap-point values, `data-*` attributes, CSS variables, and internal class names are implementation values and must not be translated.

---

## Dependencies

Drawer requires Vaul Svelte 0.3, the shared `cn` and utility types, Tailwind CSS, and `tw-animate-css`. Vaul Svelte includes its compatible legacy Bits UI dependency internally; do not add a separate modern Bits UI package solely for Drawer. Install every package requirement with one of these command groups:

```sh
# bun
bun add vaul-svelte clsx tailwind-merge
bun add -D tailwindcss tw-animate-css

# npm
npm install vaul-svelte clsx tailwind-merge
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add vaul-svelte clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css
```

### Shared utilities

Drawer imports `cn`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block includes `clsx` and `tailwind-merge`, which `cn` imports.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, define the xvelte open/closed variants used by Overlay, apply the shared border default, and expose the semantic colors and radius used by Drawer. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
	* {
		@apply border-border;
	}
}

@custom-variant data-open {
	&:where([data-state="open"]),
	&:where([data-open]:not([data-open="false"])) {
		@slot;
	}
}

@custom-variant data-closed {
	&:where([data-state="closed"]),
	&:where([data-closed]:not([data-closed="false"])) {
		@slot;
	}
}
```

`tw-animate-css` supplies Overlay's enter, exit, and fade utilities. Vaul Svelte ships the drawer transform, snap-point, overlay-opacity, drag, and direction styles inside its Root component, so no Vaul stylesheet or keyframe must be copied separately.

### Background-scaling setup

Because xvelte defaults `shouldScaleBackground` to `true`, either add the required wrapper to the application's page layout:

```svelte
<div data-vaul-drawer-wrapper>
	{@render children?.()}
</div>
```

or set `shouldScaleBackground={false}` on each Root and NestedRoot that should not scale the page. This is markup required by Vaul behavior, not a CSS attachment.

### Other requirements

Drawer requires no other xvelte component, icon export, hook, attachment, localization message, Paraglide setup, custom context file, shared component stylesheet, or external asset. Vaul Svelte owns its internal contexts, legacy Bits/Melt integration, gesture state, document listeners, and scroll lock.

---

## Credits

Drawer is adapted from [shadcn-svelte's Drawer component](https://www.shadcn-svelte.com/docs/components/drawer). Local xvelte API adaptations, defaults, composition, styling, dependencies, Vaul version constraints, and documented limitations take precedence.

---

## File organization

| File                        | Responsibility                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `drawer-root.svelte`        | Bindable open/snap state, local background-scaling default, children snippet, and Vaul Root forwarding.          |
| `drawer-nested.svelte`      | Nested bindable state and parent-drawer gesture coordination.                                                    |
| `drawer-trigger.svelte`     | Native trigger button, Svelte 5 children, and local ref-to-legacy-el translation.                                |
| `drawer-portal.svelte`      | Svelte 5 children around Vaul's rendered legacy portal wrapper.                                                  |
| `drawer-overlay.svelte`     | Bindable ref, local backdrop styling, state animation, and Vaul overlay forwarding.                              |
| `drawer-content.svelte`     | Automatic Portal/Overlay, bindable ref, direction-aware panel styling, bottom handle, and Svelte 5 body snippet. |
| `drawer-header.svelte`      | Native direction-aware header layout.                                                                            |
| `drawer-title.svelte`       | Accessible native heading, bindable ref, and typography.                                                         |
| `drawer-description.svelte` | Accessible description, bindable ref, and muted text.                                                            |
| `drawer-footer.svelte`      | Native footer action layout.                                                                                     |
| `drawer-close.svelte`       | Native close button, Svelte 5 children, and local ref-to-legacy-el translation.                                  |
| `index.ts`                  | Public component and props-type exports.                                                                         |
| `README.md`                 | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits.       |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

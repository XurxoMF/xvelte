# Sonner

A globally mounted toast renderer built on `svelte-sonner`. It follows the application's current `mode-watcher` theme, maps success, error, warning, information, and loading states to semantic project icons, exposes the complete toaster configuration API, and provides the complete toast runtime through the local component entry point.

Use Sonner for brief asynchronous feedback that does not block the current task, such as a saved preference or failed background action. Use inline validation, Alert, or Dialog when information must remain visible, be associated with a field, or require an explicit decision.

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

## Import

Import the component and toast runtime from the local entry point:

```svelte
<script lang="ts">
	import * as Sonner from "$lib/components/ui/sonner";
</script>
```

`index.ts` exports `Root`, `RootProps`, and `toast`. The local `toast` wrapper forwards the callable API and all installed helpers, so application code does not import `svelte-sonner` directly.

## Anatomy

Render one Root near the application's top-level layout:

```svelte
<Sonner.Root />
```

The component renders the package Toaster with local theme variables and icon snippets. Individual toasts are created from any descendant or application module with `Sonner.toast()`, `Sonner.toast.success()`, `Sonner.toast.error()`, and the other forwarded helpers.

## Basic usage

In the root layout:

```svelte
<script lang="ts">
	import { ModeWatcher } from "mode-watcher";

	import * as Sonner from "$lib/components/ui/sonner";

	let { children } = $props();
</script>

<ModeWatcher />
<Sonner.Root />

{@render children()}
```

From a page or component:

```svelte
<script lang="ts">
	import { toast } from "$lib/components/ui/sonner";
</script>

<button type="button" onclick={() => toast.success("Profile saved")}>Save profile</button>
```

Keep one Toaster mounted. Calling `toast` does not require passing the Root through context.

## Examples

### Description and action

```svelte
<button
	type="button"
	onclick={() =>
		toast("Message archived", {
			description: "The conversation was moved to Archive.",
			action: {
				label: "Undo",
				onClick: restoreMessage
			}
		})}
>
	Archive
</button>
```

Action labels, descriptions, and toast titles come from the app and must be translated there.

### Promise lifecycle

```svelte
<button
	type="button"
	onclick={() =>
		toast.promise(saveReport(), {
			loading: "Saving report…",
			success: "Report saved",
			error: "Could not save the report"
		})}
>
	Save report
</button>
```

The local loading icon spins automatically. Promise copy should describe the operation rather than repeating a generic status.

### Global toaster options

```svelte
<Sonner.Root position="top-right" visibleToasts={4} closeButton richColors duration={6000} pauseWhenPageIsHidden />
```

### Dismiss and update

```svelte
<script lang="ts">
	import { toast } from "$lib/components/ui/sonner";

	function runExport() {
		const id = toast.loading("Preparing export…");

		void exportData().then(
			() => toast.success("Export ready", { id }),
			() => toast.error("Export failed", { id })
		);
	}
</script>
```

Reuse the ID to update the same notification instead of stacking each lifecycle state.

## Public API

`RootProps` equals the installed `svelte-sonner@1.1.1` `ToasterProps`. The local Root fixes the icon snippets, defaults `theme` from `mode.current`, supplies theme CSS variables, and adds subtle semantic status borders before forwarding caller props. Caller `toastOptions.classes` are merged after the local status classes, so each status class can be intentionally replaced; other forwarded props can override `theme`, `class`, `style`, or icon snippets.

The table summarizes the commonly used options; see the complete [svelte-sonner documentation](https://svelte-sonner.vercel.app/) and [package source](https://github.com/wobsoriano/svelte-sonner). The component's `index.ts`, exported `RootProps` and `toast`, and installed package types are the source of truth.

| Prop                      | Type                                         | Default                     | Behavior                                                            |
| ------------------------- | -------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| `theme`                   | `"light" \| "dark" \| "system"`              | Current `mode-watcher` mode | Controls toast palette.                                             |
| `position`                | Six corner/center positions                  | `"bottom-right"`            | Places the toast stack.                                             |
| `duration`                | `number`                                     | `4000`                      | Default visibility in milliseconds.                                 |
| `visibleToasts`           | `number`                                     | `3`                         | Maximum visibly stacked notifications.                              |
| `expand`                  | `boolean`                                    | `false`                     | Keeps the stack expanded.                                           |
| `gap`                     | `number`                                     | `14`                        | Expanded spacing in pixels.                                         |
| `offset` / `mobileOffset` | number, string, or side object               | `32px` / `16px`             | Distance from viewport edges.                                       |
| `richColors`              | `boolean`                                    | `false`                     | Uses stronger success/error colors.                                 |
| `invert`                  | `boolean`                                    | `false`                     | Inverts toast theme relative to the selected mode.                  |
| `closeButton`             | `boolean`                                    | `false`                     | Shows a close control on all toasts.                                |
| `toastOptions`            | `ToastOptions`                               | Semantic status borders     | Default class, style, duration, close button, and per-part classes. |
| `hotkey`                  | `string[]`                                   | Alt/Option + T              | Moves focus to the toaster region.                                  |
| `dir`                     | `"ltr" \| "rtl" \| "auto"`                   | `"auto"`                    | Text and swipe direction.                                           |
| `swipeDirections`         | `("top" \| "right" \| "bottom" \| "left")[]` | All directions              | Allowed dismiss gestures.                                           |
| `pauseWhenPageIsHidden`   | `boolean`                                    | `false`                     | Suspends timers while the document is hidden.                       |
| `containerAriaLabel`      | `string`                                     | `"Notifications"`           | Accessible name for the toaster region.                             |
| `closeButtonAriaLabel`    | `string`                                     | `"Close toast"`             | Accessible name for close controls.                                 |

Native ordered-list attributes are also accepted. Per-toast options, custom components, actions, cancellation, callbacks, IDs, dismissal, and promise APIs belong to the exported `toast` runtime rather than `Sonner.Root`.

### `toast`

The exported `toast` callable forwards directly to the installed `svelte-sonner` runtime and returns its toast identifier. Its attached helpers are forwarded too:

| API                        | Behavior                                                      |
| -------------------------- | ------------------------------------------------------------- |
| `toast(message, options?)` | Creates or updates a normal toast.                            |
| `toast.message(...)`       | Creates the package's explicit message variant.               |
| `toast.success(...)`       | Creates a success toast.                                      |
| `toast.info(...)`          | Creates an informational toast.                               |
| `toast.warning(...)`       | Creates a warning toast.                                      |
| `toast.error(...)`         | Creates an error toast.                                       |
| `toast.loading(...)`       | Creates a loading toast.                                      |
| `toast.custom(...)`        | Creates a toast from a Svelte component.                      |
| `toast.promise(...)`       | Connects loading, success, and error states to a promise.     |
| `toast.dismiss(id?)`       | Dismisses one toast or all toasts.                            |
| `toast.getActiveToasts()`  | Returns the active toast records from the underlying runtime. |

Arguments, return values, generic component support, options, and helper behavior remain those of the installed package. Import this wrapper from `$lib/components/ui/sonner` instead of importing `svelte-sonner` in application code.

## Styling and DOM contract

The local Root supplies:

- `class="toaster group"`.
- `--normal-bg: var(--color-popover)`.
- `--normal-text: var(--color-popover-foreground)`.
- `--normal-border: var(--color-border)`.
- Success, error, warning, and information background, text, and border variables derived from the matching xvelte semantic color tokens. These replace Sonner's built-in rich-color palette while preserving its toast types.
- A subtle 30%-opacity semantic border on success, error, warning, and information toasts, including when `richColors` is disabled. Override the corresponding `toastOptions.classes` status key to replace it.
- Semantic `LoaderIcon`, `AlertSuccessIcon`, `AlertErrorIcon`, `AlertInfoIcon`, and `AlertWarningIcon` snippets, each sized to 1rem. Status icons use their matching semantic text color, while the loader spins with the normal toast color.

Root adds `data-slot="sonner"` to the rendered toaster. Toast markup, state attributes, swipe variables, and per-part classes are owned by `svelte-sonner`; use its `toastOptions.classes` API instead of depending on undocumented nested selectors. Passing `class`, `style`, icon props, or `data-slot` to Root replaces the local value because props are forwarded last.

## Accessibility

`svelte-sonner` manages live announcements, focus hotkeys, dismissal, pause behavior, actions, and close controls. Keep toast titles concise, avoid repeatedly announcing high-frequency background events, and do not move focus into ordinary informational toasts.

Actions must have clear labels and remain possible elsewhere when the consequence is important. A toast that disappears must not be the only place to find an error or required instruction. Translate `containerAriaLabel` and `closeButtonAriaLabel` when the app language is not English.

## Localization

The local wrapper adds no Paraglide messages. All toast titles, descriptions, action labels, and promise states are supplied and translated by the app.

`svelte-sonner` defaults `containerAriaLabel` to `Notifications` and `closeButtonAriaLabel` to `Close toast`. Override both props with translated text for localized applications.

## Dependencies

### Packages

```sh
# Bun
bun add svelte-sonner mode-watcher @tabler/icons-svelte
bun add -D tailwindcss

# npm
npm install svelte-sonner mode-watcher @tabler/icons-svelte
npm install -D tailwindcss

# pnpm
pnpm add svelte-sonner mode-watcher @tabler/icons-svelte
pnpm add -D tailwindcss
```

`clsx`, `tailwind-merge`, `tw-animate-css`, and Paraglide are not used by this wrapper.

### Icon facade

Add these exact exports to `$lib/icons.ts`:

```ts
export { default as AlertErrorIcon } from "@tabler/icons-svelte/icons/alert-octagon";
export { default as AlertInfoIcon } from "@tabler/icons-svelte/icons/info-circle";
export { default as AlertSuccessIcon } from "@tabler/icons-svelte/icons/circle-check";
export { default as AlertWarningIcon } from "@tabler/icons-svelte/icons/alert-triangle";
export { default as LoaderIcon } from "@tabler/icons-svelte/icons/loader";
```

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--border: oklch(0.923 0.003 48.717);
	--danger: oklch(0.577 0.245 27.325);
	--warning: oklch(0.555 0.163 48.998);
	--success: oklch(0.527 0.154 150.069);
	--info: oklch(0.546 0.245 262.881);
}

.dark {
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--border: oklch(1 0 0 / 10%);
	--danger: oklch(0.704 0.191 22.216);
	--warning: oklch(0.828 0.189 84.429);
	--success: oklch(0.723 0.219 149.579);
	--info: oklch(0.707 0.165 254.624);
}

@theme inline {
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-border: var(--border);
	--color-danger: var(--danger);
	--color-warning: var(--warning);
	--color-success: var(--success);
	--color-info: var(--info);
}
```

The values may be replaced by the app's theme. Root maps them to Sonner's `--error-*`, `--warning-*`, `--success-*`, and `--info-*` variables with `color-mix()` for the tinted surfaces and borders. The package supplies its own toast styles; no xvelte keyframe, custom variant, font, or shared utility is required.

### Mode integration

Mount `ModeWatcher` once above Sonner so `mode.current` tracks the app theme:

```svelte
<script lang="ts">
	import { ModeWatcher } from "mode-watcher";

	import * as Sonner from "$lib/components/ui/sonner";
</script>

<ModeWatcher />
<Sonner.Root />
```

### Component files and other integration

```text
sonner/
├── index.ts
└── sonner-root.svelte
```

Sonner requires no other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

## Credits

The local wrapper is adapted from [shadcn-svelte Sonner](https://www.shadcn-svelte.com/docs/components/sonner).

## File organization

| File                 | Responsibility                                                                         |
| -------------------- | -------------------------------------------------------------------------------------- |
| `sonner-root.svelte` | Toaster theme integration, semantic CSS variables, icon snippets, and prop forwarding. |
| `index.ts`           | Public component, Toaster props type, and fully forwarded toast runtime.               |
| `README.md`          | Mounting, toast usage, API, accessibility, styling, and installation guide.            |

The component's `index.ts`, `RootProps`, exported `toast`, and installed `svelte-sonner` types are the source of truth for the public API.

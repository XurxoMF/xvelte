# Kbd

A small semantic component for displaying keyboard keys and shortcut sequences. It provides an individual `Key` and a `Group` that arranges several keys or separators while preserving the meaning of keyboard input.

Use Kbd in instructions, menus, buttons, tooltips, command palettes, and help content to show shortcuts people can press. Do not use it as an interactive control: it presents a key or shortcut but does not listen for keyboard input or trigger an action.

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

Import the component through its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Kbd from "$lib/components/ui/kbd";
</script>
```

Kbd's `index.ts` exports `Key`, `Group`, and their `KeyProps` and `GroupProps` types. Unlike the upstream shadcn-svelte component, the local xvelte API names the individual key `Key`, not `Root`.

---

## Anatomy

Render a single key directly:

```svelte
<Kbd.Key>Esc</Kbd.Key>
```

Use Group for a shortcut made from multiple keys and optional visible separators:

```svelte
<Kbd.Group aria-label="Control plus K">
	<Kbd.Key>Ctrl</Kbd.Key>
	<span aria-hidden="true">+</span>
	<Kbd.Key>K</Kbd.Key>
</Kbd.Group>
```

Both parts render semantic `kbd` elements. A Group containing Keys represents a complete input sequence whose nested Keys represent its individual inputs.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Kbd from "$lib/components/ui/kbd";
</script>

<p>
	Press <Kbd.Key>Esc</Kbd.Key> to close the dialog.
</p>
```

Kbd only displays the instruction. The dialog or application must implement the corresponding keyboard behavior separately.

---

## Examples

### Shortcut sequence

```svelte
<p>
	Open search with
	<Kbd.Group aria-label="Control plus K">
		<Kbd.Key>Ctrl</Kbd.Key>
		<span aria-hidden="true">+</span>
		<Kbd.Key>K</Kbd.Key>
	</Kbd.Group>
</p>
```

Mark a purely visual `+` as hidden from assistive technology and give the complete group an accessible name that reads naturally.

### Several alternative shortcuts

```svelte
<p>
	Save with
	<Kbd.Group aria-label="Control plus S">
		<Kbd.Key>Ctrl</Kbd.Key>
		<span aria-hidden="true">+</span>
		<Kbd.Key>S</Kbd.Key>
	</Kbd.Group>
	or <Kbd.Key aria-label="Enter">↵</Kbd.Key>.
</p>
```

Use `aria-label` when a symbol may be unclear or pronounced inconsistently by screen readers.

### Inside a button

```svelte
<button type="button">
	Accept
	<Kbd.Key aria-hidden="true">↵</Kbd.Key>
</button>
```

The button's visible text already communicates the action, so the decorative shortcut hint can be hidden from assistive technology. Keep it visible to sighted keyboard users, and implement the advertised key behavior in application code.

### Platform-specific copy

```svelte
<script lang="ts">
	import * as Kbd from "$lib/components/ui/kbd";

	let macOS = $state(false);
</script>

<Kbd.Group aria-label={macOS ? "Command plus K" : "Control plus K"}>
	<Kbd.Key>{macOS ? "⌘" : "Ctrl"}</Kbd.Key>
	<span aria-hidden="true">+</span>
	<Kbd.Key>K</Kbd.Key>
</Kbd.Group>
```

Detect the platform in application code when needed. Kbd does not choose platform-specific modifier names automatically.

---

## Public API

Both public parts forward native attributes for the semantic `kbd` element. The component's `index.ts` and exported types are the source of truth.

### `Kbd.Key`

Type: `KeyProps`, based on native `HTMLAttributes<HTMLElement>`.

| Prop       | Type                  | Default     | xvelte behavior                                                                  |
| ---------- | --------------------- | ----------- | -------------------------------------------------------------------------------- |
| `children` | `Snippet`             | `undefined` | Renders the visible key label or icon.                                           |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable reference to the rendered `kbd` element.                                |
| `class`    | `string`              | `undefined` | Merged after the local key, typography, tooltip-context, and nested-SVG classes. |

All remaining native attributes, including `aria-label`, `aria-hidden`, `title`, `id`, and `data-*`, are forwarded to the `kbd` element. Key has no value, pressed state, keyboard listener, callback, or variant prop.

### `Kbd.Group`

Type: `GroupProps`, based on native `HTMLAttributes<HTMLElement>`.

| Prop       | Type                  | Default     | xvelte behavior                                                  |
| ---------- | --------------------- | ----------- | ---------------------------------------------------------------- |
| `children` | `Snippet`             | `undefined` | Renders Keys and optional shortcut separators in one inline row. |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable reference to the outer `kbd` element.                   |
| `class`    | `string`              | `undefined` | Merged with the local inline-flex alignment and gap.             |

All remaining native attributes are forwarded. Group does not parse its children, insert `+` characters, normalize modifier order, or select labels for the current operating system.

---

## Styling and DOM contract

Stable xvelte hooks:

| Part    | Element | `data-slot` |
| ------- | ------- | ----------- |
| `Key`   | `kbd`   | `kbd`       |
| `Group` | `kbd`   | `kbd-group` |

Key uses semantic `muted`, `muted-foreground`, and `background` colors. Its default dimensions are `h-5`, `min-w-5`, and content-width with compact horizontal padding. It deliberately disables text selection and pointer events because it is presentational, not interactive.

SVG elements inside Key receive a `size-3` default unless their class already contains a `size-` utility. When Key is anywhere inside an element with `data-slot="tooltip-content"`, it automatically switches to translucent background-based colors, including a darker-mode adjustment.

Group only controls inline alignment and a small gap. Classes supplied to either part are merged with `cn()`, so later conflicting Tailwind utilities normally win.

---

## Accessibility

- Both parts use the native `kbd` element, which semantically represents user input such as a keyboard key or shortcut.
- Kbd is not interactive and has `pointer-events: none`. Put click handlers, keyboard listeners, focus behavior, and disabled state on the real control.
- Write shortcuts in the same order people should press them.
- Use a natural `aria-label` for symbol-only keys or groups when their spoken output could be ambiguous, such as `⌘`, `⌥`, `⇧`, `↵`, or `⌫`.
- Hide visual separators such as `+` with `aria-hidden="true"` when the group's accessible name already describes the complete shortcut.
- When a shortcut is only a redundant hint inside a clearly named button, it may be hidden from assistive technology. Do not hide it when it contains instructions unavailable elsewhere.
- Do not advertise a shortcut that the application has not implemented.

---

## Localization

Kbd has no built-in user-facing copy. Your app supplies and translates surrounding instructions, accessible names, and textual key names such as “Control”, “Shift”, “Enter”, or “Escape”.

Key symbols and labels often vary by operating system, keyboard layout, language, and product convention. Select those values in application code; Kbd does not detect the platform or localize shortcut notation. The `data-slot` values are technical identifiers and are not translated.

---

## Dependencies

Kbd expects a Svelte 5 project using Tailwind CSS 4. It has no primitive library, icon package, localization package, hook, attachment, context, or other xvelte component dependency.

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

Copy the complete `src/lib/components/ui/kbd` component folder:

- `kbd-key.svelte`
- `kbd-group.svelte`
- `index.ts`
- `README.md`

Buttons, tooltips, input groups, menus, and other components shown around Kbd are optional compositions. Copy them and follow their own README only when using them.

### Shared utilities

Both parts import `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

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

The package installation block includes `clsx` and `tailwind-merge`.

### Global CSS

The global stylesheet must load Tailwind, define xvelte's dark selector for the tooltip-specific class, and expose the semantic colors used by Key. These are xvelte's defaults; apps may replace the values while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-background: var(--background);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
}
```

The app owns dark-mode activation. Kbd requires no icon export from `src/lib/icons.ts`, localization message, shared style, animation import, keyframe, CSS variable beyond those shown above, image, font, network service, or additional layout rule.

---

## Credits

Kbd is adapted from [shadcn-svelte's Kbd component](https://www.shadcn-svelte.com/docs/components/kbd). The local xvelte names, exports, styling, and behavior documented here are the source of truth.

---

## File organization

| File               | Responsibility                                     |
| ------------------ | -------------------------------------------------- |
| `kbd-key.svelte`   | Semantic and styled individual key.                |
| `kbd-group.svelte` | Semantic inline grouping for key sequences.        |
| `index.ts`         | Public components and props-type exports.          |
| `README.md`        | Installation, API, accessibility, and usage guide. |

The component's `index.ts` and exported types are the source of truth for the public API.

# Button

A native action control with ten visual variants, including five semantic status tones, eight sizes, predictable form behavior, disabled and invalid states, and automatic spacing for inline icons. It also exports its Tailwind Variants function so your own elements can use the same visual style.

Use Button to trigger an immediate action, submit or reset a form, open an interface, or control application state. Do not use it for navigation, passive labels, toggled state without the corresponding ARIA contract, or actions that are unavailable but still need an explanation outside the native disabled state.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
</script>
```

Button's `index.ts` exports `Root`, the `RootProps`, `RootVariants`, and `RootSizes` types, and the `rootVariants` styling function.

---

## Anatomy

Button has one public component part and always renders a native `button`:

```svelte
<Button.Root type="button" variant="default" size="default">
	<!-- Optional leading icon -->
	Action
	<!-- Optional trailing icon -->
</Button.Root>
```

`type="button"`, `variant="default"`, and `size="default"` are built-in defaults, so the minimal form is:

```svelte
<Button.Root>Action</Button.Root>
```

Use the exported `rootVariants` function when another semantic element, such as an anchor, must look like a button.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";

	let saved = $state(false);
</script>

<Button.Root onclick={() => (saved = true)}>
	{saved ? "Saved" : "Save changes"}
</Button.Root>
```

The component forwards native button events and attributes. It does not add loading, confirmation, toggle, or asynchronous state; your app manages those behaviors.

---

## Examples

### Variants

```svelte
<div class="flex flex-wrap gap-2">
	<Button.Root variant="default">Save</Button.Root>
	<Button.Root variant="outline">Preview</Button.Root>
	<Button.Root variant="secondary">Duplicate</Button.Root>
	<Button.Root variant="ghost">Cancel</Button.Root>
	<Button.Root variant="danger">Delete</Button.Root>
	<Button.Root variant="warning">Review</Button.Root>
	<Button.Root variant="success">Approve</Button.Root>
	<Button.Root variant="info">Details</Button.Root>
	<Button.Root variant="important">Featured</Button.Root>
	<Button.Root variant="link">Learn more</Button.Root>
</div>
```

`variant="link"` changes only the presentation; the element is still a button and still represents an action. Use a real anchor styled with `rootVariants` for navigation.

### Text and icon sizes

The local API includes four text sizes and four square icon sizes:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import { PlusIcon } from "$lib/icons";
</script>

<div class="flex flex-wrap items-center gap-2">
	<Button.Root size="xs">Extra small</Button.Root>
	<Button.Root size="sm">Small</Button.Root>
	<Button.Root size="default">Default</Button.Root>
	<Button.Root size="lg">Large</Button.Root>

	<Button.Root size="icon-xs" aria-label="Add item">
		<PlusIcon />
	</Button.Root>
	<Button.Root size="icon-sm" aria-label="Add item">
		<PlusIcon />
	</Button.Root>
	<Button.Root size="icon" aria-label="Add item">
		<PlusIcon />
	</Button.Root>
	<Button.Root size="icon-lg" aria-label="Add item">
		<PlusIcon />
	</Button.Root>
</div>
```

Icon-only buttons require an accessible name. Direct SVG children without an explicit size class inherit a size appropriate to the selected button size.

### Inline icon placement

Add `data-icon` to the icon wrapper or icon itself to activate the local edge-padding adjustment:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import { PlusIcon } from "$lib/icons";
</script>

<Button.Root variant="outline">
	<PlusIcon data-icon="inline-start" aria-hidden="true" />
	Add member
</Button.Root>
```

`inline-start` and `inline-end` are logical positions for layout styling. Button does not reorder content in right-to-left layouts; author the DOM order appropriate to the label and icon.

### Form actions

The default `type="button"` prevents accidental submission. Opt into native form actions explicitly:

```svelte
<form onsubmit={saveProfile}>
	<!-- Form fields -->

	<div class="flex gap-2">
		<Button.Root type="reset" variant="outline">Reset</Button.Root>
		<Button.Root type="submit">Save profile</Button.Root>
	</div>
</form>
```

Native form attributes such as `form`, `formaction`, `formmethod`, `name`, and `value` are forwarded.

### Disabled and invalid states

```svelte
<Button.Root disabled>Saving…</Button.Root>

<Button.Root aria-invalid="true" aria-describedby="delete-error" variant="danger">Delete account</Button.Root>
<p id="delete-error" class="text-sm text-danger">Confirm your password before deleting the account.</p>
```

`disabled` uses native button behavior and local opacity/pointer-event styles. `aria-invalid` changes the border and focus ring but does not create or associate an error message.

### Button-styled link

The local component has no `href` prop and never changes its native element. Apply `rootVariants` to a real anchor for navigation:

```svelte
<script lang="ts">
	import { rootVariants } from "$lib/components/ui/button";
</script>

<a href="/documentation" class={rootVariants({ variant: "outline", size: "sm" })}>Read documentation</a>
```

The function supplies classes only. Your app must provide the correct element, attributes, navigation behavior, and any additional class merging.

---

## Public API

### `Button.Root`

Type: `RootProps`, based on Svelte's native `HTMLButtonAttributes` with a bindable element reference and local variant and size props.

| Prop       | Type                                                                                                                        | Default     | xvelte behavior                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `variant`  | `"default" \| "outline" \| "secondary" \| "ghost" \| "danger" \| "warning" \| "success" \| "info" \| "important" \| "link"` | `"default"` | Selects the visual treatment generated by `rootVariants`.                                            |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"`                                        | `"default"` | Selects height, spacing, typography, radius, and automatic icon size.                                |
| `type`     | `"button" \| "submit" \| "reset"`                                                                                           | `"button"`  | Sets native form behavior and intentionally avoids implicit submission.                              |
| `disabled` | `boolean`                                                                                                                   | `undefined` | Forwards native disabled semantics and activates disabled styling.                                   |
| `children` | `Snippet`                                                                                                                   | `undefined` | Renders the button's label, icon, spinner, or other concise content.                                 |
| `ref`      | `HTMLElement \| null`                                                                                                       | `null`      | Bindable reference to the native button; the local shared helper exposes the broader element type.   |
| `class`    | `string`                                                                                                                    | `undefined` | Merged after the generated classes with `cn`, allowing Tailwind utilities from your app to override. |

All remaining native button attributes and events are forwarded, including `onclick`, `aria-*`, `autofocus`, `form*`, `name`, and `value`.

Button does not support `href`, render delegation, `child`, `asChild`, a polymorphic element, built-in icons, loading state, pressed state, or confirmation behavior. Add those behaviors in your app or use `rootVariants` with the correct native element.

### Variants

Type: `RootVariants`.

| Variant     | Local visual behavior                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | Primary background and primary foreground. Its additional opacity-hover selector targets anchors, so the local button has no color change on hover. |
| `outline`   | Background with border; muted hover and expanded states, plus input-tinted dark-mode styling.                                                       |
| `secondary` | Secondary background and foreground with opacity hover; preserves that treatment while expanded.                                                    |
| `ghost`     | Transparent until hover or expanded, then uses a muted surface and foreground.                                                                      |
| `danger`    | Tinted red surface and text for dangerous or failed actions.                                                                                        |
| `warning`   | Tinted amber surface and text for actions that require caution.                                                                                     |
| `success`   | Tinted green surface and text for positive or confirming actions.                                                                                   |
| `info`      | Tinted blue surface and text for informational actions.                                                                                             |
| `important` | Tinted violet surface and text for actions that need special emphasis without implying risk.                                                        |
| `link`      | Primary text with an underline on hover; native semantics remain those of a button.                                                                 |

The default variant's anchor-only hover is part of the current local implementation. Add a hover class if your primary button needs a hover color change.

### Sizes

Type: `RootSizes`.

| Size      | Dimensions and behavior                                                                 |
| --------- | --------------------------------------------------------------------------------------- |
| `xs`      | `1.5rem` height, extra-small text/icons, compact padding, and constrained local radius. |
| `sm`      | `1.75rem` height, `0.8rem` text, compact padding, and constrained local radius.         |
| `default` | `2rem` height with standard text, icon gap, and horizontal padding.                     |
| `lg`      | `2.25rem` height with standard text and wider vertical presence.                        |
| `icon-xs` | `1.5rem` square with extra-small default SVG size and constrained local radius.         |
| `icon-sm` | `1.75rem` square with constrained local radius.                                         |
| `icon`    | `2rem` square.                                                                          |
| `icon-lg` | `2.25rem` square.                                                                       |

The exact radius of `xs`, `sm`, `icon-xs`, and `icon-sm` is capped with `min(var(--radius-md), ...)`. Inside an element with `data-slot="button-group"`, these compact sizes use the standard large radius expected by the local Button Group composition.

### `rootVariants`

`rootVariants` is the exported Tailwind Variants function used internally by `Root`:

```ts
rootVariants({ variant: "secondary", size: "sm" });
```

| Option    | Type           | Default     | Result                                                          |
| --------- | -------------- | ----------- | --------------------------------------------------------------- |
| `variant` | `RootVariants` | `"default"` | Adds the base and selected visual-variant classes.              |
| `size`    | `RootSizes`    | `"default"` | Adds the selected dimension and spacing classes.                |
| `class`   | Class input    | `undefined` | Appends classes supplied by your app through Tailwind Variants. |

The function does not render an element, add `data-slot`, merge a ref, or provide disabled/navigation behavior. Use `index.ts`, the exported types, and this function as the source of truth for the public API.

---

## Styling and DOM contract

Button uses Tailwind Variants and semantic theme tokens. It exposes no component-specific CSS variables.

| Part   | Stable hook          | Element  | Notable behavior                                                       |
| ------ | -------------------- | -------- | ---------------------------------------------------------------------- |
| `Root` | `data-slot="button"` | `button` | Receives the bound ref, native props, generated classes, and children. |

The stable `group/button` class namespace lets your app style descendants based on the button group. The base class also provides:

- Visible focus border and three-pixel focus ring.
- Danger border/ring styling for `aria-invalid="true"`.
- A one-pixel active downward translation, except when `aria-haspopup` is present.
- Native disabled pointer-event suppression and 50% opacity.
- Selection prevention and single-line content.
- Pointer-event suppression and shrink prevention on descendant SVG elements.
- A `1rem` default size for SVG descendants that do not already contain a `size-*` class, with smaller overrides for compact sizes.
- Reduced edge padding when a descendant has `data-icon="inline-start"` or `data-icon="inline-end"`.
- Expanded-state surfaces for `outline`, `secondary`, and `ghost` through `aria-expanded="true"`.

Classes supplied through `class` are merged after generated classes using `cn`, so conflicting Tailwind utilities normally favor your values. The active transform, descendant selectors, and state variants may require equally specific selectors when overriding them.

---

## Accessibility

Button relies on native button semantics and interaction. It adds styling for common ARIA states but does not manage those states.

- Keep concise visible text whenever possible. Icon-only buttons must have an `aria-label` or another valid accessible-name source.
- Use `type="submit"` or `type="reset"` deliberately in forms; the safe local default is `type="button"`.
- Use `disabled` when the action must be unavailable and does not need focus. Native disabled buttons are removed from the tab sequence and do not expose their reason, so provide nearby explanatory text when needed.
- Use `aria-pressed` only when your app makes the button a toggle, and keep its value synchronized. Button does not implement toggle state.
- Use `aria-expanded` and `aria-controls` for disclosure/menu triggers as appropriate. Local variants style expanded state, but your app must provide the controlled element, keyboard behavior, and state changes.
- An `aria-haspopup` trigger does not receive the local active translation, avoiding movement on popup controls; it still requires the full menu, listbox, dialog, or tree interaction contract.
- `aria-invalid` is visual only. Associate an actual error description with `aria-describedby` when the button participates in an invalid workflow.
- Do not use `variant="link"` as navigation. It remains a button; use an anchor styled with `rootVariants` for a destination.
- Decorative icons should be hidden from assistive technology. Icons conveying unique meaning need accessible text, not color or shape alone.

Keyboard activation, disabled behavior, focus order, and form submission are supplied by the native button. There are no custom shortcuts.

---

## Localization

Button contains no built-in user-facing copy and uses no localization messages. Your app supplies visible labels, icon-only accessible names, loading text, error descriptions, confirmation copy, and dynamic state announcements.

Allow enough width for translated labels or override the default `whitespace-nowrap` only when wrapping is intentionally supported by the surrounding layout. Do not translate the technical variant names, size names, or `data-slot`/`data-icon` values.

---

## Dependencies

Button requires Svelte 5, Tailwind Variants, the local utility helpers, and Tailwind CSS. Install its runtime and development packages with one of the following command groups:

```sh
# bun
bun add tailwind-variants clsx tailwind-merge
bun add @tabler/icons-svelte # Optional: only for the icon examples
bun add -D tailwindcss

# npm
npm install tailwind-variants clsx tailwind-merge
npm install @tabler/icons-svelte # Optional: only for the icon examples
npm install -D tailwindcss

# pnpm
pnpm add tailwind-variants clsx tailwind-merge
pnpm add @tabler/icons-svelte # Optional: only for the icon examples
pnpm add -D tailwindcss
```

### Shared utilities

The component imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block above includes the `clsx` and `tailwind-merge` imports used by this code.

Button itself imports no icon. The examples use the semantic `PlusIcon` export from `$lib/icons`; copying them requires this optional facade entry:

```ts
export { default as PlusIcon } from "@tabler/icons-svelte/icons/plus";
```

Your global stylesheet must import Tailwind, define the dark variant, and expose the semantic colors and radius scale used by Button. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(65.6% 0.241 354.308);
	--primary-foreground: oklch(0.985 0 0);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--danger: oklch(0.577 0.245 27.325);
	--warning: oklch(0.555 0.163 48.998);
	--success: oklch(0.527 0.154 150.069);
	--info: oklch(0.546 0.245 262.881);
	--important: oklch(0.541 0.281 293.009);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(65.6% 0.241 354.308);
	--primary-foreground: oklch(0.985 0 0);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--danger: oklch(0.704 0.191 22.216);
	--warning: oklch(0.828 0.189 84.429);
	--success: oklch(0.723 0.219 149.579);
	--info: oklch(0.707 0.165 254.624);
	--important: oklch(0.702 0.183 293.541);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-danger: var(--danger);
	--color-warning: var(--warning);
	--color-success: var(--success);
	--color-info: var(--info);
	--color-important: var(--important);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

The application remains responsible for applying its `.dark` class, normally through root-level theme management.

No Bits UI package, `tw-animate-css` import, animation, keyframe, other xvelte component, hook, attachment, context module, localization message, or shared component stylesheet is required. Button Group is an optional composition: Button merely reacts when an ancestor exposes `data-slot="button-group"`.

---

## Credits

Button is adapted from the [shadcn-svelte Button](https://www.shadcn-svelte.com/docs/components/button). Its element contract, dimensions, variants, exports, and local interaction details have been adapted for xvelte.

---

## File organization

| File                 | Responsibility                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `button-root.svelte` | Defines variants and sizes, renders the native button, forwards props, and exposes its reference. |
| `index.ts`           | Exports `Root`, its public types, and the `rootVariants` styling function.                        |

Use `index.ts`, the exported types, and `rootVariants` as the source of truth for the public API. If this guide and the implementation disagree, update the guide together with the code change.

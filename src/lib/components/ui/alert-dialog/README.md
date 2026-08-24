# Alert Dialog

An accessible modal confirmation dialog for important decisions that require an explicit response. It manages open state, portal rendering, overlay, focus trapping, scroll locking, accessible title and description relationships, confirmation and cancellation controls, two content sizes, and an optional media area.

Use an alert dialog when a consequential action must be confirmed or when proceeding without a response would be unsafe, such as deleting data or abandoning unsaved work. Do not use it for ordinary information, non-blocking feedback, complex multi-step forms, or actions that can be reversed easily; use Alert, Dialog, or a toast when interruption is unnecessary.

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
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
</script>
```

Alert Dialog's `index.ts` exports `Root`, `Trigger`, `Content`, `Header`, `Media`, `Title`, `Description`, `Footer`, `Cancel`, `Action`, `Portal`, and `Overlay`, together with a named props type for every part: `RootProps`, `TriggerProps`, `ContentProps`, `HeaderProps`, `MediaProps`, `TitleProps`, `DescriptionProps`, `FooterProps`, `CancelProps`, `ActionProps`, `PortalProps`, and `OverlayProps`.

---

## Anatomy

Compose the public parts in this order:

```svelte
<AlertDialog.Root>
	<AlertDialog.Trigger>Open confirmation</AlertDialog.Trigger>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<!-- Optional AlertDialog.Media -->
			<AlertDialog.Title>Confirmation title</AlertDialog.Title>
			<AlertDialog.Description>Explain the consequence clearly.</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

Unlike the underlying Bits UI anatomy, xvelte's `Content` automatically renders `Portal` and `Overlay`. Do not wrap ordinary `Content` in another `AlertDialog.Portal` or add a sibling `AlertDialog.Overlay`; the standalone exports exist for lower-level composition and maintenance. `Header`, `Footer`, and `Media` are local layout parts rather than Bits UI primitives.

---

## Basic usage

```svelte
<script lang="ts">
	import { rootVariants as buttonVariants } from "$lib/components/ui/button";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger class={buttonVariants({ variant: "outline" })}>Delete project</AlertDialog.Trigger>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete this project?</AlertDialog.Title>
			<AlertDialog.Description>This permanently removes the project and its deployment history.</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action variant="danger">Delete project</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

`Trigger` is an unstyled Bits UI trigger, so apply button classes or compose it with another accessible control. `Cancel` closes without confirming. `Action` communicates the affirmative choice but does not close automatically; your app must perform the work and update `open` when appropriate.

---

## Examples

### Controlled state and asynchronous action

Bind `open` when application code must open or close the dialog or wait for asynchronous work before dismissing it.

```svelte
<script lang="ts">
	import { rootVariants as buttonVariants } from "$lib/components/ui/button";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";

	let open = $state(false);
	let deleting = $state(false);

	async function deleteAccount() {
		deleting = true;

		try {
			await removeAccount();
			open = false;
		} finally {
			deleting = false;
		}
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant: "danger" })}>Delete account</AlertDialog.Trigger>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete your account?</AlertDialog.Title>
			<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={deleting}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action variant="danger" disabled={deleting} onclick={deleteAccount}>
				{deleting ? "Deleting…" : "Delete account"}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

`removeAccount` represents application code. Keep the dialog open when the operation fails, present an accessible error, and let the user retry or cancel.

### Compact content with media

`size="sm"` keeps the narrow width and changes `Footer` to a two-column grid at every viewport. `Media` provides a fixed visual container inside `Header`.

```svelte
<script lang="ts">
	import { AlertWarningIcon } from "$lib/icons";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>Discard changes</AlertDialog.Trigger>

	<AlertDialog.Content size="sm">
		<AlertDialog.Header>
			<AlertDialog.Media>
				<AlertWarningIcon aria-hidden="true" />
			</AlertDialog.Media>

			<AlertDialog.Title>Discard changes?</AlertDialog.Title>
			<AlertDialog.Description>Your unsaved edits will be lost.</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>Keep editing</AlertDialog.Cancel>
			<AlertDialog.Action variant="danger">Discard</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

You provide any icons. `Media` sizes an SVG to `1.5rem` unless the SVG already has a class containing `size-`.

### Content inside a form

`Content` portals to `document.body` by default. Disable its internal portal when the content must remain a descendant of a form, for example so an `Action` with `type="submit"` submits that form.

```svelte
<form method="POST" action="?/delete-project">
	<AlertDialog.Root>
		<AlertDialog.Trigger type="button">Delete project</AlertDialog.Trigger>

		<AlertDialog.Content portalProps={{ disabled: true }}>
			<AlertDialog.Header>
				<AlertDialog.Title>Delete this project?</AlertDialog.Title>
				<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
			</AlertDialog.Header>

			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit" variant="danger">Delete project</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</form>
```

Disabling the portal also changes stacking and clipping behavior. Ensure the form's ancestors do not clip or obscure the fixed overlay and content.

---

## Public API

The primitive-backed parts forward the applicable Bits UI props and native attributes. The tables below document the xvelte-owned surface and adaptations; use the [Bits UI Alert Dialog API reference](https://www.bits-ui.com/docs/components/alert-dialog#api-reference) for the complete inherited API.

### `AlertDialog.Root`

Type: `RootProps`, an alias of `AlertDialogPrimitive.RootProps`.

| Prop                   | Type                      | Default     | xvelte behavior                                                 |
| ---------------------- | ------------------------- | ----------- | --------------------------------------------------------------- |
| `open`                 | `boolean`                 | `false`     | Bindable open state.                                            |
| `onOpenChange`         | `(open: boolean) => void` | `undefined` | Called when the state changes.                                  |
| `onOpenChangeComplete` | `(open: boolean) => void` | `undefined` | Called after the opening or closing animation completes.        |
| `children`             | `Snippet`                 | `undefined` | Renders the trigger and content within the shared dialog state. |

`Root` renders no DOM element.

### `AlertDialog.Trigger`

Type: `TriggerProps`, an alias of the Bits UI trigger props.

| Prop       | Type                        | Default     | xvelte behavior                                             |
| ---------- | --------------------------- | ----------- | ----------------------------------------------------------- |
| `children` | `Snippet`                   | `undefined` | Renders the trigger label or content.                       |
| `child`    | `Snippet<{ props: ... }>`   | `undefined` | Delegates rendering while preserving primitive behavior.    |
| `ref`      | `HTMLButtonElement \| null` | `null`      | Bindable reference to the default trigger button.           |
| `class`    | `string`                    | `undefined` | Forwarded without local visual styles; style it explicitly. |

The wrapper adds `data-slot="alert-dialog-trigger"` and forwards native button attributes.

### `AlertDialog.Content`

Type: `ContentProps`, the Bits UI content props without the primitive `child` render-delegation prop, plus local `size` and `portalProps`.

| Prop          | Type                                       | Default     | xvelte behavior                                                                                 |
| ------------- | ------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------- |
| `size`        | `"default" \| "sm"`                        | `"default"` | Sets `data-size` and controls the responsive content, header, title, media, and footer layouts. |
| `portalProps` | `Omit<PortalProps, "children" \| "child">` | `undefined` | Passed to the automatically rendered `Portal`; supports `to` and `disabled`.                    |
| `children`    | `Snippet`                                  | `undefined` | Renders the dialog body.                                                                        |
| `ref`         | `HTMLDivElement \| null`                   | `null`      | Bindable reference to the content element.                                                      |
| `class`       | `string`                                   | `undefined` | Merged with local positioning, surface, responsive size, and open/closed animation styles.      |

`Content` automatically renders `Portal` and `Overlay`, and its own primitive `child` prop is intentionally unavailable. Important inherited props include `onOpenAutoFocus`, `onCloseAutoFocus`, `trapFocus`, `preventScroll`, `forceMount`, `onEscapeKeydown`, `escapeKeydownBehavior`, `onInteractOutside`, and `interactOutsideBehavior`.

### `AlertDialog.Header`

Type: `HeaderProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                                      |
| ---------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------ |
| `children` | `Snippet`                | `undefined` | Renders optional media followed by title and description.                            |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the header wrapper.                                            |
| `class`    | `string`                 | `undefined` | Merged with size-aware grid, alignment, media-detection, and responsive text styles. |

`Header` is a visual grouping `div`; accessible naming comes from `Title` and `Description`.

### `AlertDialog.Media`

Type: `MediaProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                              |
| ---------- | ------------------------ | ----------- | ---------------------------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders an icon or other compact visual supplied by your app.                |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the media wrapper.                                     |
| `class`    | `string`                 | `undefined` | Merged with fixed size, muted background, icon sizing, and grid-span styles. |

`Media` is optional and does not provide an icon or accessible name.

### `AlertDialog.Title`

Type: `TitleProps`, an alias of the Bits UI title props.

| Prop       | Type                         | Default     | xvelte behavior                                             |
| ---------- | ---------------------------- | ----------- | ----------------------------------------------------------- |
| `level`    | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`         | Sets the accessible heading level through Bits UI.          |
| `children` | `Snippet`                    | `undefined` | Renders the accessible title.                               |
| `ref`      | `HTMLDivElement \| null`     | `null`      | Bindable reference to the title element.                    |
| `class`    | `string`                     | `undefined` | Merged with typography and size/media-aware grid placement. |

Keep exactly one meaningful title in normal use so the content receives an accessible name.

### `AlertDialog.Description`

Type: `DescriptionProps`, an alias of the Bits UI description props.

| Prop       | Type                     | Default     | xvelte behavior                                                        |
| ---------- | ------------------------ | ----------- | ---------------------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Renders the accessible explanation of the choice and its consequences. |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the description element.                         |
| `class`    | `string`                 | `undefined` | Merged with muted text, responsive wrapping, and direct-link styles.   |

### `AlertDialog.Footer`

Type: `FooterProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                     | Default     | xvelte behavior                                                            |
| ---------- | ------------------------ | ----------- | -------------------------------------------------------------------------- |
| `children` | `Snippet`                | `undefined` | Usually renders `Cancel` followed by `Action`.                             |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the footer wrapper.                                  |
| `class`    | `string`                 | `undefined` | Merged with inset surface styling and size-aware responsive button layout. |

The default mobile column uses `flex-col-reverse`, so writing `Cancel` before `Action` keeps the affirmative action visually prominent while desktop layout preserves source order.

### `AlertDialog.Cancel`

Type: `CancelProps`, which extends the Bits UI cancel props with xvelte Button variants and sizes.

| Prop      | Type                        | Default     | xvelte behavior                           |
| --------- | --------------------------- | ----------- | ----------------------------------------- |
| `variant` | `Button.RootVariants`       | `"outline"` | Applies any public Button visual variant. |
| `size`    | `Button.RootSizes`          | `"default"` | Applies any public Button size.           |
| `ref`     | `HTMLButtonElement \| null` | `null`      | Bindable reference to the default button. |
| `class`   | `string`                    | `undefined` | Merged after Button classes.              |

`Cancel` closes the dialog without confirming. It also forwards `children`, `child`, `disabled`, event handlers, and native button attributes.

### `AlertDialog.Action`

Type: `ActionProps`, which extends the Bits UI action props with xvelte Button variants and sizes.

| Prop      | Type                        | Default     | xvelte behavior                           |
| --------- | --------------------------- | ----------- | ----------------------------------------- |
| `variant` | `Button.RootVariants`       | `"default"` | Applies any public Button visual variant. |
| `size`    | `Button.RootSizes`          | `"default"` | Applies any public Button size.           |
| `ref`     | `HTMLButtonElement \| null` | `null`      | Bindable reference to the default button. |
| `class`   | `string`                    | `undefined` | Merged after Button classes.              |

`Action` does not close the dialog automatically. It forwards `children`, `child`, `disabled`, `type`, event handlers, and other native button attributes so your app can run synchronous, asynchronous, or form actions and then update `open`.

### `AlertDialog.Portal`

Type: `PortalProps`, an alias of the Bits UI portal props.

| Prop       | Type                | Default         | xvelte behavior                                       |
| ---------- | ------------------- | --------------- | ----------------------------------------------------- |
| `to`       | `Element \| string` | `document.body` | Selects the portal target.                            |
| `disabled` | `boolean`           | `false`         | Renders children in place instead of portalling them. |
| `children` | `Snippet`           | `undefined`     | Renders portal content.                               |

Ordinary composition configures this internal part through `Content.portalProps` instead of rendering it directly.

### `AlertDialog.Overlay`

Type: `OverlayProps`, an alias of the Bits UI overlay props.

| Prop         | Type                      | Default     | xvelte behavior                                                             |
| ------------ | ------------------------- | ----------- | --------------------------------------------------------------------------- |
| `forceMount` | `boolean`                 | `false`     | Keeps the overlay mounted for custom presence handling.                     |
| `children`   | `Snippet`                 | `undefined` | Forwards optional overlay content.                                          |
| `child`      | `Snippet<{ props: ... }>` | `undefined` | Delegates rendering while retaining the primitive behavior.                 |
| `ref`        | `HTMLDivElement \| null`  | `null`      | Bindable reference to the overlay element.                                  |
| `class`      | `string`                  | `undefined` | Merged with fixed coverage, backdrop, stacking, and state animation styles. |

Ordinary composition receives the default internal overlay from `Content`.

Use `index.ts` and the exported props types as the source of truth for the local API. The installed Bits UI types define all inherited options, while Button's `index.ts` defines valid action and cancel variants and sizes.

---

## Styling and DOM contract

Alert Dialog uses semantic Tailwind tokens, `tw-animate-css`, Bits UI state attributes, and parent group/data selectors. `Content` and `Overlay` fade in and out; `Content` also scales between 95% and 100%.

Stable xvelte hooks:

| Part          | `data-slot`                | Additional stable contract                                                   |
| ------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `Trigger`     | `alert-dialog-trigger`     | Unstyled by xvelte.                                                          |
| `Overlay`     | `alert-dialog-overlay`     | Fixed at `z-50`; rendered automatically by `Content`.                        |
| `Content`     | `alert-dialog-content`     | `data-size` is `default` or `sm`; group name `alert-dialog-content`; `z-50`. |
| `Header`      | `alert-dialog-header`      | Detects `Media` and responds to the content size.                            |
| `Media`       | `alert-dialog-media`       | Controls the media-aware header grid and default SVG size.                   |
| `Title`       | `alert-dialog-title`       | Responds to the content size and presence of media.                          |
| `Description` | `alert-dialog-description` | Styles direct links and semantic supporting text.                            |
| `Footer`      | `alert-dialog-footer`      | Responds to `data-size` on `Content`.                                        |
| `Cancel`      | `alert-dialog-cancel`      | Uses Button variants.                                                        |
| `Action`      | `alert-dialog-action`      | Uses Button variants.                                                        |

Bits UI also supplies `data-state`, `data-open`/`data-closed`-compatible state, nested-dialog attributes, ARIA relationships, and `--bits-dialog-depth`/`--bits-dialog-nested-count`. Treat the state and nesting details as dependency-owned; use the exact [Bits UI Alert Dialog documentation](https://www.bits-ui.com/docs/components/alert-dialog) before relying on advanced nesting behavior.

Classes passed to styled parts are merged after local classes with `cn`, so conflicting Tailwind utilities favor classes from your app. Preserve `data-slot` and `data-size`: local cross-part selectors depend on them.

---

## Accessibility

Bits UI provides modal dialog semantics, the accessible title and description relationships, focus trapping, initial focus, focus restoration, Escape handling, outside-interaction behavior, and body scroll locking.

- Always provide a concise `Title` and a `Description` that states the consequence in concrete language. Do not rely on an icon or button labels alone.
- Choose a `Title.level` that fits the surrounding heading hierarchy; the primitive default is `3`.
- Use specific action labels such as “Delete project” instead of vague labels such as “Yes” or “Continue”. Make the safer escape clear with `Cancel`.
- Keep `Cancel` available unless the user truly cannot leave the decision. By default, Escape also closes the dialog and outside interaction is ignored.
- `Action` does not close automatically. Keep the dialog open during failed or pending work, prevent duplicate submissions, announce errors, and close only after the operation reaches the intended state.
- Decorative media icons should use `aria-hidden="true"`. Meaningful media needs an accessible name, but the title and description must still make the decision understandable without it.
- Avoid disabling `trapFocus`, `preventScroll`, Escape handling, or focus restoration unless the alternative behavior has been tested with keyboard and assistive technology.
- When using render delegation through `Trigger`, `Action`, `Cancel`, or `Overlay`, apply every primitive-provided prop to the rendered element so semantics and event handling are preserved.

---

## Localization

Alert Dialog has no built-in user-facing copy or localization messages. Your app provides and translates trigger text, title, description, cancel and action labels, pending/error feedback, and accessible media names. Keep action labels explicit after translation and parameterize dynamic object names inside your app's messages.

The `default`, `sm`, Button variant/size names, state values, and `data-slot` identifiers are implementation values and must not be translated.

---

## Dependencies

Alert Dialog expects a Svelte 5 project using Tailwind CSS 4. Install its runtime and styling packages with one of the following commands:

```sh
# bun
bun add bits-ui tailwind-variants clsx tailwind-merge
bun add @tabler/icons-svelte # Optional: only for the compact icon example
bun add -D tailwindcss tw-animate-css

# npm
npm install bits-ui tailwind-variants clsx tailwind-merge
npm install @tabler/icons-svelte # Optional: only for the compact icon example
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui tailwind-variants clsx tailwind-merge
pnpm add @tabler/icons-svelte # Optional: only for the compact icon example
pnpm add -D tailwindcss tw-animate-css
```

### Required xvelte components

Copy the complete Button UI component from `$lib/components/ui/button`. `Action` and `Cancel` import it through `index.ts` and use `Button.rootVariants`, `Button.RootVariants`, and `Button.RootSizes`; copying only Alert Dialog will not compile. Copy these Button files:

- `src/lib/components/ui/button/button-root.svelte`
- `src/lib/components/ui/button/index.ts`

Copy those files unchanged and follow the Button component's README to install its dependencies.

The Button component is why `tailwind-variants` is required and why the full set of Button theme tokens below must be present. No other xvelte component is required.

### Global CSS

The application stylesheet, `src/routes/layout.css` in xvelte, must load Tailwind CSS and `tw-animate-css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
```

xvelte's `data-open:` and `data-closed:` utilities also depend on these custom variants:

```css
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

Alert Dialog itself uses `popover`, `popover-foreground`, `foreground`, `muted`, and `muted-foreground`. Its required Button component additionally uses `background`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `danger`, `border`, `input`, and `ring`, plus the shared radius scale. Your theme must define and expose all of them:

```css
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
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
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
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
}
```

Define equivalent values inside the application's dark selector if it supports a dark theme. The values above are xvelte's light defaults and may be replaced while preserving the semantic variable and `@theme` names. No alert-dialog-specific keyframes or CSS variables need to be copied; `tw-animate-css` supplies the fade/zoom utilities and Bits UI supplies dialog state.

### Icons

Alert Dialog does not import or require an icon. Your app provides any icon placed in `Media`.

The compact example uses xvelte's semantic icon facade. Copying that example requires `@tabler/icons-svelte` and this export in `$lib/icons`:

```ts
export { default as AlertWarningIcon } from "@tabler/icons-svelte/icons/alert-triangle";
```

The optional package commands are included in the single installation block above. You may omit them or use another icon already exposed through your semantic icon file.

### Shared utilities

The wrappers import `cn`, `WithoutChild`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. The Button dependency also imports `cn` and `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The `any` conditional types may require the same targeted ESLint exceptions used by xvelte. Alert Dialog does not require hooks, attachments, custom context modules, localization messages, or additional shared styles.

---

## Credits

Alert Dialog is adapted from the [shadcn-svelte Alert Dialog](https://www.shadcn-svelte.com/docs/components/alert-dialog). Its implementation has been modified to follow xvelte's local composition, content sizing, media, Button, portal, styling, utility, and import conventions.

---

## File organization

| File                              | Responsibility                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `alert-dialog-root.svelte`        | Owns and exposes the bindable open state through the Bits UI root.                  |
| `alert-dialog-trigger.svelte`     | Opens the dialog while forwarding trigger semantics and native button attributes.   |
| `alert-dialog-content.svelte`     | Creates the portal and overlay, then renders the positioned, sized, animated modal. |
| `alert-dialog-portal.svelte`      | Wraps the Bits UI portal for custom targets or inline rendering.                    |
| `alert-dialog-overlay.svelte`     | Renders and animates the modal backdrop.                                            |
| `alert-dialog-header.svelte`      | Arranges media, title, and description according to content size and viewport.      |
| `alert-dialog-media.svelte`       | Provides an optional visual container and controls media-aware header layout.       |
| `alert-dialog-title.svelte`       | Supplies the accessible title and its size/media-aware placement.                   |
| `alert-dialog-description.svelte` | Supplies the accessible description and supporting text/link styles.                |
| `alert-dialog-footer.svelte`      | Arranges cancel and action controls in responsive or compact layouts.               |
| `alert-dialog-cancel.svelte`      | Closes without confirming and applies xvelte Button variants and sizes.             |
| `alert-dialog-action.svelte`      | Represents confirmation without auto-closing and applies Button variants and sizes. |
| `index.ts`                        | Exports every public component part and props type.                                 |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, verify the installed Bits UI and Button APIs and update this guide with the code change.

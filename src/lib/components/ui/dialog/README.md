# Dialog

An accessible modal window for focused content, forms, settings, and short workflows. It manages controlled or uncontrolled open state, portal rendering, an overlay, keyboard focus, scroll locking, outside and Escape dismissal, accessible title and description relationships, and optional built-in close buttons.

Use Dialog when people must interact with content without leaving the current page. Use Alert Dialog instead for consequential confirmations that require an explicit choice, and avoid a dialog when inline content, navigation to a dedicated page, or non-blocking feedback would be clearer.

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

Import all parts from the component's public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
</script>
```

Dialog's `index.ts` exports `Root`, `Trigger`, `Portal`, `Overlay`, `Content`, `Header`, `Title`, `Description`, `Footer`, and `Close`, together with the corresponding `RootProps`, `TriggerProps`, `PortalProps`, `OverlayProps`, `ContentProps`, `HeaderProps`, `TitleProps`, `DescriptionProps`, `FooterProps`, and `CloseProps` types.

## Anatomy

Compose a trigger and modal content below one Root:

```svelte
<Dialog.Root>
	<Dialog.Trigger>Open dialog</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Dialog title</Dialog.Title>
			<Dialog.Description>Explain the purpose of this dialog.</Dialog.Description>
		</Dialog.Header>

		<!-- Dialog body -->

		<Dialog.Footer>
			<Dialog.Close>Cancel</Dialog.Close>
			<!-- Primary action -->
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

Content automatically renders Portal, Overlay, and a top-right icon Close. Do not wrap ordinary Content in another Portal or add a second Overlay. Set `showCloseButton={false}` only when the dialog provides another clear way to close, and pass portal configuration through `portalProps`.

Header and Footer are native layout containers. Title, Description, Trigger, Close, Content, Overlay, Portal, and Root wrap Bits UI primitives.

## Basic usage

```svelte
<script lang="ts">
	import { rootVariants as buttonVariants } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";

	let open = $state(false);
	let displayName = $state("Ada Lovelace");

	function saveProfile() {
		console.info("Save profile", displayName);
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: "outline" })}>Edit profile</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit profile</Dialog.Title>
			<Dialog.Description>Update the name displayed on your public profile.</Dialog.Description>
		</Dialog.Header>

		<label class="grid gap-1 text-sm">
			Display name
			<input class="rounded-md border px-2 py-1" bind:value={displayName} />
		</label>

		<Dialog.Footer>
			<Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
			<button class={buttonVariants()} type="button" onclick={saveProfile}>Save changes</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

Trigger and the public Close are behavior components without local visual styles, so the example applies Button's exported classes. The automatic top-right close button remains available. Application code owns form state, validation, saving, pending feedback, and errors.

## Examples

### Controlled state and asynchronous work

Keep the dialog open while work is pending or after an error, then close it explicitly after success:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";

	let open = $state(false);
	let saving = $state(false);
	let error = $state("");

	async function saveSettings() {
		saving = true;
		error = "";

		try {
			await updateSettings();
			open = false;
		} catch {
			error = "The settings could not be saved. Try again.";
		} finally {
			saving = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>Open settings</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Notification settings</Dialog.Title>
			<Dialog.Description>Choose how the app contacts you.</Dialog.Description>
		</Dialog.Header>

		<!-- Settings fields -->
		{#if error}<p role="alert" class="text-sm text-danger">{error}</p>{/if}

		<Dialog.Footer>
			<Dialog.Close disabled={saving}>Cancel</Dialog.Close>
			<Button.Root disabled={saving} onclick={saveSettings}>{saving ? "Saving…" : "Save settings"}</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

`updateSettings` represents app code. A Button action does not close Dialog automatically; update the bound `open` value when the operation reaches the intended state.

### Footer-provided close button

Footer can append a localized outline Button after its children:

```svelte
<Dialog.Root>
	<Dialog.Trigger>View keyboard shortcuts</Dialog.Trigger>

	<Dialog.Content showCloseButton={false}>
		<Dialog.Header>
			<Dialog.Title>Keyboard shortcuts</Dialog.Title>
			<Dialog.Description>Commands available in the editor.</Dialog.Description>
		</Dialog.Header>

		<!-- Shortcut list -->

		<Dialog.Footer showCloseButton />
	</Dialog.Content>
</Dialog.Root>
```

`Content.showCloseButton={false}` removes the icon close. `Footer.showCloseButton` adds a text button using the localized `Close` message. When Footer also has children, the generated close button is appended after them in DOM order.

### Prevent outside dismissal

Use the inherited Bits UI behavior when outside interaction must not close a workflow:

```svelte
<Dialog.Root>
	<Dialog.Trigger>Show import progress</Dialog.Trigger>

	<Dialog.Content interactOutsideBehavior="ignore">
		<Dialog.Header>
			<Dialog.Title>Import in progress</Dialog.Title>
			<Dialog.Description>Keep this dialog open until the import finishes.</Dialog.Description>
		</Dialog.Header>

		<!-- Progress and actions -->
	</Dialog.Content>
</Dialog.Root>
```

Escape still closes by default. Set `escapeKeydownBehavior="ignore"` only when another visible, keyboard-accessible close control remains available. For conditional behavior, use `onInteractOutside` or `onEscapeKeydown` and call `event.preventDefault()` when dismissal should be cancelled.

### Content inside a form

Content portals to `document.body` by default. Disable the internal portal when the modal must remain a descendant of a form:

```svelte
<form method="POST" action="?/invite-member">
	<Dialog.Root>
		<Dialog.Trigger type="button">Invite member</Dialog.Trigger>

		<Dialog.Content portalProps={{ disabled: true }}>
			<Dialog.Header>
				<Dialog.Title>Invite a team member</Dialog.Title>
				<Dialog.Description>Enter the email address that should receive the invitation.</Dialog.Description>
			</Dialog.Header>

			<input name="email" type="email" required />

			<Dialog.Footer>
				<Dialog.Close type="button">Cancel</Dialog.Close>
				<button type="submit">Send invitation</button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</form>
```

Disabling the portal changes stacking and clipping behavior. Ensure the form's ancestors do not clip or obscure the fixed Overlay and Content.

### Delegated trigger

Trigger renders a button by default. Its `child` snippet can delegate behavior to another suitable interactive element:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button.Root variant="outline" {...props}>Review account details</Button.Root>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Account details</Dialog.Title>
			<Dialog.Description>Review the information associated with your account.</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
```

Spread every supplied prop onto the delegated element so its ref, expanded state, controls relationship, disabled state, and event handling remain connected. Avoid nested interactive elements.

## Public API

Parts backed by Bits UI forward compatible Bits UI and native element props unless a local adaptation below states otherwise. The tables summarize local behavior and important inherited options; use the complete [Bits UI Dialog API reference](https://www.bits-ui.com/docs/components/dialog#api-reference) for dependency-owned details.

### `Dialog.Root`

Type: `RootProps`, matching Bits UI Dialog Root props.

| Prop                   | Type                      | Default     | xvelte behavior                                         |
| ---------------------- | ------------------------- | ----------- | ------------------------------------------------------- |
| `open`                 | `boolean`                 | `false`     | Bindable modal open state.                              |
| `onOpenChange`         | `(open: boolean) => void` | `undefined` | Runs when open state changes.                           |
| `onOpenChangeComplete` | `(open: boolean) => void` | `undefined` | Runs after the opening or closing transition completes. |
| `children`             | `Snippet`                 | `undefined` | Renders Trigger and Content in the shared dialog state. |

Root renders no DOM element.

### `Dialog.Trigger`

Type: `TriggerProps`, matching Bits UI Dialog Trigger props.

| Prop                 | Type                  | Default     | xvelte behavior                                                                                |
| -------------------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `type`               | Native button type    | `"button"`  | Local default prevents accidental form submission.                                             |
| `disabled`           | `boolean`             | `false`     | Prevents opening and forwards native disabled behavior on the default button.                  |
| `ref`                | `HTMLElement \| null` | `null`      | Bindable element reference; the default rendered element is a button.                          |
| `class`              | `string`              | `undefined` | Forwarded without local visual classes.                                                        |
| `children` / `child` | Bits UI snippets      | `undefined` | Render the default button content or delegate the element while spreading every supplied prop. |

Remaining compatible native button attributes and events are forwarded. Trigger adds `data-slot="dialog-trigger"` and Bits UI supplies its dialog state, ID, `aria-haspopup`, `aria-expanded`, and `aria-controls` attributes.

### `Dialog.Content`

Type: `ContentProps`, based on Bits UI Content after replacing its render snippets and adding local portal and close-button options.

| Prop                      | Type                                 | Default     | xvelte behavior                                                                                                         |
| ------------------------- | ------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `portalProps`             | Portal props without children        | `undefined` | Passed to the Portal that always wraps Overlay and Content.                                                             |
| `showCloseButton`         | `boolean`                            | `true`      | Adds a top-right ghost Button with CloseIcon and a localized screen-reader label.                                       |
| `children`                | `Snippet`                            | required    | Renders the modal body without exposing the primitive's `open` snippet value.                                           |
| `forceMount`              | `boolean`                            | `false`     | Keeps Content mounted for app-managed presence or transition handling.                                                  |
| `trapFocus`               | `boolean`                            | `true`      | Keeps focus inside while open.                                                                                          |
| `preventScroll`           | `boolean`                            | `true`      | Locks body scrolling while open.                                                                                        |
| `onOpenAutoFocus`         | `(event: Event) => void`             | `undefined` | Runs before automatic opening focus; prevent default to manage focus manually.                                          |
| `onCloseAutoFocus`        | `(event: Event) => void`             | `undefined` | Runs before focus restoration; prevent default to manage it manually.                                                   |
| `onEscapeKeydown`         | `(event: KeyboardEvent) => void`     | `undefined` | Runs on Escape; prevent default to cancel the normal close.                                                             |
| `escapeKeydownBehavior`   | Bits UI escape behavior              | `"close"`   | Controls closing or delegation among nested escape layers.                                                              |
| `onInteractOutside`       | `(event: PointerEvent) => void`      | `undefined` | Runs after outside interaction; prevent default to cancel the normal close.                                             |
| `interactOutsideBehavior` | Bits UI outside-interaction behavior | `"close"`   | Controls closing or delegation among nested dismissible layers.                                                         |
| `onFocusOutside`          | `(event: FocusEvent) => void`        | `undefined` | Runs when focus leaves the dismissible layer.                                                                           |
| `ref`                     | `HTMLElement \| null`                | `null`      | Bindable modal content reference; local Content always renders the default `div`.                                       |
| `class`                   | `string`                             | `undefined` | Merged after local fixed centering, width, grid, surface, spacing, ring, responsive maximum width, and state animation. |

Content forwards remaining compatible native `div`, presence, text-selection, scroll-lock, and layer props. Bits UI render delegation (`child`) and the stateful `{ open }` children snippet are intentionally unavailable. The inherited `restoreScrollDelay` prop remains in the type, but Bits UI applies it only on the removed delegated-child path, so it has no effect with this local Content.

The internal Overlay receives no public props. Style it through its stable `data-slot` selector, or change the component if its behavior must differ. The standalone Overlay does not replace the automatic one and would create a second overlay in ordinary composition.

### `Dialog.Header`

Type: `HeaderProps`, based on native `div` attributes with a bindable element reference.

| Prop       | Type                  | Default     | xvelte behavior                                      |
| ---------- | --------------------- | ----------- | ---------------------------------------------------- |
| `children` | `Snippet`             | `undefined` | Renders Title, Description, and any header content.  |
| `ref`      | `HTMLElement \| null` | `null`      | Bindable reference to the native header `div`.       |
| `class`    | `string`              | `undefined` | Merged after the local vertical flex layout and gap. |

All remaining native `div` attributes and events are forwarded. Header adds `data-slot="dialog-header"` and has no dialog semantics of its own.

### `Dialog.Title`

Type: `TitleProps`, matching Bits UI Dialog Title props.

| Prop                 | Type                         | Default     | xvelte behavior                                                                       |
| -------------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| `level`              | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`         | Sets `aria-level` on the default role-heading `div`.                                  |
| `children` / `child` | Bits UI snippets             | `undefined` | Render title content or delegate the element while preserving its ID and heading API. |
| `ref`                | `HTMLElement \| null`        | `null`      | Bindable element reference; the default rendered element is a `div`.                  |
| `class`              | `string`                     | `undefined` | Merged after local base size, line height, and medium weight.                         |

Remaining compatible native `div` attributes are forwarded. Title adds `data-slot="dialog-title"`; Bits UI associates its generated ID with Content's `aria-labelledby`.

### `Dialog.Description`

Type: `DescriptionProps`, matching Bits UI Dialog Description props.

| Prop                 | Type                  | Default     | xvelte behavior                                                                                      |
| -------------------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `children` / `child` | Bits UI snippets      | `undefined` | Render supporting text or delegate the element while preserving its generated ID.                    |
| `ref`                | `HTMLElement \| null` | `null`      | Bindable element reference; the default rendered element is a `div`.                                 |
| `class`              | `string`              | `undefined` | Merged after muted text and direct-link underline, offset, foreground-hover, and typography classes. |

Remaining compatible native `div` attributes are forwarded. Description adds `data-slot="dialog-description"`; Bits UI associates its generated ID with Content's `aria-describedby`.

### `Dialog.Footer`

Type: `FooterProps`, based on native `div` attributes with a bindable element reference and one local option.

| Prop              | Type                  | Default     | xvelte behavior                                                                                       |
| ----------------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `showCloseButton` | `boolean`             | `false`     | Appends an outline Button labeled with the built-in localized Close message.                          |
| `children`        | `Snippet`             | `undefined` | Renders app-provided actions before the optional generated Close button.                              |
| `ref`             | `HTMLElement \| null` | `null`      | Bindable reference to the native footer `div`.                                                        |
| `class`           | `string`              | `undefined` | Merged after inset margins, responsive action layout, top border, muted surface, padding, and radius. |

All remaining native `div` attributes and events are forwarded. Footer adds `data-slot="dialog-footer"`. Its mobile `flex-col-reverse` changes visual order without changing DOM order; from the `sm` breakpoint it uses a normal horizontal row aligned to the end.

### `Dialog.Close`

Type: `CloseProps`, matching Bits UI Dialog Close props.

| Prop                 | Type                  | Default     | xvelte behavior                                                                                |
| -------------------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `type`               | Native button type    | `"button"`  | Local default prevents accidental form submission.                                             |
| `disabled`           | `boolean`             | `false`     | Prevents closing and forwards native disabled behavior on the default button.                  |
| `ref`                | `HTMLElement \| null` | `null`      | Bindable element reference; the default rendered element is a button.                          |
| `class`              | `string`              | `undefined` | Forwarded without local visual classes.                                                        |
| `children` / `child` | Bits UI snippets      | `undefined` | Render the default button content or delegate the element while spreading every supplied prop. |

Remaining compatible native button attributes and events are forwarded. Close adds `data-slot="dialog-close"` and closes Root when activated. It is a generic behavior component; the app supplies its visible label and styling.

### `Dialog.Portal`

Type: `PortalProps`, matching Bits UI Portal props.

| Prop       | Type                | Default         | xvelte behavior                                       |
| ---------- | ------------------- | --------------- | ----------------------------------------------------- |
| `to`       | `Element \| string` | `document.body` | Selects the portal target.                            |
| `disabled` | `boolean`           | `false`         | Renders children in place instead of portalling them. |
| `children` | `Snippet`           | `undefined`     | Renders portal content.                               |

Standard Content configures this internal Portal through `portalProps`; wrapping Content in another Portal is unnecessary.

### `Dialog.Overlay`

Type: `OverlayProps`, matching Bits UI Dialog Overlay props.

| Prop         | Type                           | Default     | xvelte behavior                                                                                 |
| ------------ | ------------------------------ | ----------- | ----------------------------------------------------------------------------------------------- |
| `forceMount` | `boolean`                      | `false`     | Keeps the overlay mounted for custom presence handling.                                         |
| `children`   | `Snippet<[{ open: boolean }]>` | `undefined` | Renders optional content and exposes open state.                                                |
| `child`      | Bits UI delegated snippet      | `undefined` | Delegates the overlay element and exposes its props and open state.                             |
| `ref`        | `HTMLElement \| null`          | `null`      | Bindable element reference; the default rendered element is a `div`.                            |
| `class`      | `string`                       | `undefined` | Merged after fixed coverage, isolation, stacking, translucent black background, blur, and fade. |

Remaining compatible native `div` attributes are forwarded. Overlay adds `data-slot="dialog-overlay"`. Content creates an unconfigured Overlay automatically, so this export is mainly useful for additional low-level compositions and must not be added beside ordinary Content.

The component's `index.ts`, exported types, and local source are the source of truth for the public API.

## Styling and DOM contract

Dialog uses semantic Tailwind tokens, `tw-animate-css`, local `data-slot` hooks, and dependency-owned Bits UI state and nesting attributes. It exposes no xvelte-specific CSS variables.

| Part                       | Stable xvelte hook or class                                   |
| -------------------------- | ------------------------------------------------------------- |
| `Root`, `Portal`           | No rendered wrapper                                           |
| `Trigger`                  | `data-slot="dialog-trigger"`; no local visual styles          |
| Automatic/internal Overlay | `data-slot="dialog-overlay"`; fixed at `z-50`                 |
| `Content`                  | `data-slot="dialog-content"`; fixed at `z-50`                 |
| `Header`                   | `data-slot="dialog-header"`                                   |
| `Title`                    | `data-slot="dialog-title"`                                    |
| `Description`              | `data-slot="dialog-description"`                              |
| `Footer`                   | `data-slot="dialog-footer"`                                   |
| Public/automatic `Close`   | `data-slot="dialog-close"`; public Close is visually unstyled |
| Footer-generated close     | `data-slot="button"`; outline Button styling                  |

Bits UI additionally supplies dependency-owned `data-state`, starting/ending style, nested-dialog, ID, role, and ARIA attributes, plus `--bits-dialog-depth` and `--bits-dialog-nested-count`. The local `data-open:` and `data-closed:` variants recognize Bits UI's state for animations. Treat dependency-owned attributes and variables as implementation details unless the upstream API documents them.

Styled parts merge `class` with `cn`, allowing app Tailwind classes to replace conflicting local utilities. Trigger and public Close simply forward class. Rest props on primitive wrappers are spread after local `data-slot` and can override it; preserve the documented slots because styles and app integrations may target them.

Overlay uses `bg-black/10` rather than a semantic background token and adds backdrop blur when the browser supports it. Content is centered, limited to the viewport minus `2rem`, and capped at `sm:max-w-sm`. Footer extends through Content's padding with negative margins. Content and Overlay animate for `100ms`; Content fades and scales, while Overlay fades.

## Accessibility

Bits UI supplies `role="dialog"`, `aria-modal="true"`, title and description relationships, focus trapping and looping, initial focus, focus restoration, Escape handling, outside-interaction dismissal, text-selection containment, scroll locking, nested-dialog coordination, and Trigger expanded/controls state.

App responsibilities:

- Include one concise Title so Content has an accessible name. Choose `level` to fit the surrounding heading hierarchy; the primitive default is `2`.
- Add Description when supporting context is useful. If the dialog has no visible description, provide equivalent accessible context deliberately rather than leaving the purpose ambiguous.
- Keep a clearly named close or cancel control. The default icon close uses the localized `Close` label; if it is hidden, provide another keyboard-accessible Close.
- Label every form control and present validation or asynchronous errors accessibly. Dialog does not manage form state or submission.
- Avoid nesting interactive elements when delegating Trigger or Close, and spread every supplied primitive prop.
- Avoid disabling focus trapping, scroll locking, Escape dismissal, or focus restoration unless the replacement behavior has been tested with keyboard and assistive technology.
- Do not use ordinary Dialog for a dangerous decision that requires an explicit response; use Alert Dialog.

The SVG inside the top-right button ignores pointer events through Button's icon rules; the button itself remains interactive and receives its accessible name from the adjacent screen-reader-only message. The public Close has no built-in label because the app supplies its children.

## Localization

Dialog uses one reusable-library message from `messages/en.json`:

| Message ID        | English value | Used by                                                                                      |
| ----------------- | ------------- | -------------------------------------------------------------------------------------------- |
| `amber_fox_glide` | `Close`       | Screen-reader label for Content's icon close and visible label for Footer's generated close. |

There is no prop for overriding this built-in label. Add translations for the same message ID or adapt the two local message calls when integrating another localization system.

Your app supplies and translates Trigger text, Title, Description, form labels, public Close labels, action labels, validation, progress, errors, and all other dialog body content. Do not translate `data-slot`, state, variant, or behavior values.

## Dependencies

Dialog expects a Svelte 5 project using Tailwind CSS 4. It requires Bits UI, the shared Button component, the Tabler close icon, shared utility helpers, generated Paraglide messages, and `tw-animate-css`. Install every package requirement with one of these command groups:

```sh
# bun
bun add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
bun add -D tailwindcss tw-animate-css @inlang/paraglide-js

# npm
npm install bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
npm install -D tailwindcss tw-animate-css @inlang/paraglide-js

# pnpm
pnpm add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css @inlang/paraglide-js
```

### Shared utilities

Dialog imports `cn`, `WithoutChildrenOrChild`, and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

### Icon

Dialog imports the semantic CloseIcon name from `$lib/icons`. Add this exact export to `src/lib/icons.ts`:

```ts
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
```

The package block includes `@tabler/icons-svelte`. Keep the semantic alias in the shared icon facade instead of importing Tabler directly from component files.

### Button component

Copy the complete `$lib/components/ui/button` component with Dialog. The required source files are:

```text
src/lib/components/ui/button/
├── button-root.svelte
└── index.ts
```

Follow the Button component's colocated README to install and understand its complete API and requirements. Dialog uses Button for Content's icon close and Footer's optional text close; Button is required even when both options are disabled at runtime.

### Localization setup

Copy the `amber_fox_glide` key and its English value from [Localization](#localization) into `messages/en.json`, add the equivalent key to every supported locale, and compile the messages so `$lib/paraglide/messages.js` exports `amber_fox_glide()`.

If the app uses another localization system, replace both `$lib/paraglide/messages.js` imports and calls while preserving localized close labels. No other message is required by Dialog itself.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, define dark and Bits UI state variants, apply the shared border/outline defaults, and expose the semantic colors and radii used by Dialog and its required internal Buttons. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
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
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--danger: oklch(0.704 0.191 22.216);
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

@layer base {
	* {
		@apply border-border outline-ring/50;
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

`tw-animate-css` supplies the enter, exit, fade, and zoom utilities. No Dialog-specific keyframe, hook, attachment, context file, shared component stylesheet, or external asset must be copied. Bits UI owns the dialog context, focus and dismissal layers, presence state, and scroll lock.

## Credits

Dialog is adapted from [shadcn-svelte's Dialog component](https://www.shadcn-svelte.com/docs/components/dialog). Local xvelte composition, API, built-in close controls, localization, dependencies, styling, and behavior documented here take precedence.

## File organization

| File                        | Responsibility                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `dialog-root.svelte`        | Bindable open state, callbacks, and shared Bits UI dialog state.                                                |
| `dialog-trigger.svelte`     | Unstyled default or delegated trigger with local button-type default.                                           |
| `dialog-portal.svelte`      | Portal target and inline-rendering configuration.                                                               |
| `dialog-overlay.svelte`     | Fixed translucent, blurred, animated backdrop.                                                                  |
| `dialog-content.svelte`     | Automatic Portal and Overlay, modal positioning and animation, body snippet, and optional localized icon close. |
| `dialog-header.svelte`      | Native vertical layout for Title, Description, and other header content.                                        |
| `dialog-title.svelte`       | Accessible heading relationship and local title typography.                                                     |
| `dialog-description.svelte` | Accessible description relationship, muted text, and direct-link styles.                                        |
| `dialog-footer.svelte`      | Responsive action layout and optional localized outline Close button.                                           |
| `dialog-close.svelte`       | Unstyled default or delegated close behavior with local button-type default.                                    |
| `index.ts`                  | Public component and props-type exports.                                                                        |
| `README.md`                 | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits.      |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

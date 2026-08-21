# Sheet

An accessible modal or non-modal panel that slides in from any viewport edge. It combines Bits UI Dialog behavior with local side animations, an overlay, structured header/footer parts, and an optional localized close button.

Use Sheet for secondary tasks or navigation that should remain connected to the current screen, such as filters, details, or mobile menus. Use Dialog for centered decisions, Drawer for gesture-oriented bottom panels, and a normal page or persistent sidebar for large primary workflows.

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

```svelte
<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
</script>
```

`index.ts` exports `Root`, `Trigger`, `Portal`, `Overlay`, `Content`, `Close`, `Header`, `Footer`, `Title`, and `Description`, together with matching props types. It also exports the `ContentSides` type through `ContentProps`' source module only indirectly; `ContentSides` is not re-exported by `index.ts`, so applications should normally infer `side` from `ContentProps`.

---

## Anatomy

```svelte
<Sheet.Root>
	<Sheet.Trigger>Open sheet</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Panel title</Sheet.Title>
			<Sheet.Description>Helpful description.</Sheet.Description>
		</Sheet.Header>

		Panel content

		<Sheet.Footer>Panel actions</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
```

Content automatically renders Portal and Overlay, then creates its required panel content and optional close button. Do not wrap Content in a second Portal or add a second Overlay for normal use.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
</script>

<Sheet.Root>
	<Sheet.Trigger>Open profile settings</Sheet.Trigger>

	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Profile settings</Sheet.Title>
			<Sheet.Description>Update how your name appears to other people.</Sheet.Description>
		</Sheet.Header>

		<form id="profile-form" class="space-y-4 px-4">
			<label class="grid gap-2">
				<span>Name</span>
				<input name="name" class="rounded-md border px-3 py-2" />
			</label>
		</form>

		<Sheet.Footer>
			<button type="submit" form="profile-form">Save changes</button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
```

The default side is right. `Header` and `Footer` provide spacing but do not submit or associate forms automatically.

---

## Examples

### Other sides

```svelte
<Sheet.Root>
	<Sheet.Trigger>Show activity</Sheet.Trigger>
	<Sheet.Content side="left">
		<Sheet.Header>
			<Sheet.Title>Recent activity</Sheet.Title>
			<Sheet.Description>Events from the last seven days.</Sheet.Description>
		</Sheet.Header>
		<div class="overflow-auto px-4">Activity list</div>
	</Sheet.Content>
</Sheet.Root>
```

`side` accepts `top`, `right`, `bottom`, or `left`. Left/right panels use three quarters of the viewport width with a `sm:max-w-sm`; top/bottom panels size to their content.

### Controlled state

```svelte
<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";

	let open = $state(false);
</script>

<button type="button" onclick={() => (open = true)}>Edit filters</button>

<Sheet.Root bind:open onOpenChange={(next) => console.info("Sheet open", next)}>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Filters</Sheet.Title>
			<Sheet.Description>Limit the results shown on this page.</Sheet.Description>
		</Sheet.Header>
		<div class="px-4">Filter controls</div>
	</Sheet.Content>
</Sheet.Root>
```

### Custom close action

Disable the fixed close button and render a contextual close control where it belongs:

```svelte
<Sheet.Content showCloseButton={false}>
	<Sheet.Header>
		<Sheet.Title>Share report</Sheet.Title>
		<Sheet.Description>Choose who can access this report.</Sheet.Description>
	</Sheet.Header>

	<div class="px-4">Sharing controls</div>

	<Sheet.Footer>
		<Sheet.Close>
			{#snippet child({ props })}
				<button type="button" {...props}>Done</button>
			{/snippet}
		</Sheet.Close>
	</Sheet.Footer>
</Sheet.Content>
```

Spread every Bits UI `child` prop so closing, keyboard, and focus behavior remain attached.

### Custom portal target

```svelte
<script lang="ts">
	let portalTarget = $state<HTMLElement | null>(null);
</script>

<div bind:this={portalTarget}></div>

<Sheet.Root>
	<Sheet.Trigger>Open contained sheet</Sheet.Trigger>
	<Sheet.Content portalProps={{ to: portalTarget }}>
		<Sheet.Title>Contained panel</Sheet.Title>
		<Sheet.Description>This sheet portals into the selected element.</Sheet.Description>
		<div class="p-4">Content</div>
	</Sheet.Content>
</Sheet.Root>
```

Portal target behavior is inherited from Bits UI. The local Content and Overlay remain `fixed`, so test containing blocks and stacking contexts when targeting something other than `body`.

### Non-modal sheet

```svelte
<Sheet.Root modal={false}>
	<Sheet.Trigger>Open reference panel</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Title>Reference</Sheet.Title>
		<Sheet.Description>Keep working while this panel remains open.</Sheet.Description>
		<div class="p-4">Reference content</div>
	</Sheet.Content>
</Sheet.Root>
```

Non-modal mode changes focus and outside interaction. The local overlay still renders; hide or restyle it through `data-slot="sheet-overlay"` if a non-modal visual treatment requires it.

---

## Public API

Sheet wraps the installed stable `bits-ui@2.18.1` Dialog primitive. The tables document local adaptations and important inherited options; see the complete [Bits UI Dialog API](https://bits-ui.com/docs/components/dialog#api-reference). The component's `index.ts`, exported types, and source are the source of truth.

### Root and controls

| Part and type              | Public API                                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Root` — `RootProps`       | Bits UI Root: bindable `open` (default false), `onOpenChange`, `onOpenChangeComplete`, `modal`, and `children`. Supplies shared dialog state and renders no element. |
| `Trigger` — `TriggerProps` | Bits UI Trigger props, bindable button `ref`, native button attributes, `children`/`child`; adds `data-slot="sheet-trigger"`.                                        |
| `Close` — `CloseProps`     | Bits UI Close props, bindable button `ref`, native button attributes, `children`/`child`; adds `data-slot="sheet-close"`.                                            |
| `Portal` — `PortalProps`   | Complete Bits UI Portal target/disabled API. Content normally creates it through `portalProps`.                                                                      |

### `Sheet.Content`

Type: `ContentProps`, based on Bits UI `Dialog.ContentProps` with primitive `children` and `child` removed, plus local composition.

| Prop              | Type                                     | Default   | Behavior                                                        |
| ----------------- | ---------------------------------------- | --------- | --------------------------------------------------------------- |
| `children`        | `Snippet`                                | Required  | Panel contents rendered before the optional fixed close button. |
| `side`            | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Selects edge, dimensions, border, and enter/exit direction.     |
| `showCloseButton` | `boolean`                                | `true`    | Adds the local ghost icon button in the top-right corner.       |
| `portalProps`     | Portal props without snippets            | —         | Configures the generated Portal.                                |
| `ref`             | `HTMLDivElement \| null`                 | `null`    | Bindable panel element.                                         |

Content forwards native div attributes and important Dialog options such as escape handling, outside interaction, focus auto-management, and focus trapping. It always creates one local Overlay and has no `overlayProps`; customize that generated overlay through its stable hook.

### Overlay and labelled content

| Part and type                      | Public API                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Overlay` — `OverlayProps`         | Complete Bits UI Overlay props, `ref`, `children`/`child`, native div attributes, and merged `class`. Content's generated instance receives no custom props. |
| `Title` — `TitleProps`             | Bits UI Title semantics, `ref`, `children`/`child`, native heading attributes, and merged class.                                                             |
| `Description` — `DescriptionProps` | Bits UI Description semantics, `ref`, `children`/`child`, native attributes, and merged class.                                                               |
| `Header` — `HeaderProps`           | Local div with children, native div attributes, merged class, and bindable ref.                                                                              |
| `Footer` — `FooterProps`           | Local div with children, native div attributes, merged class, and bindable ref.                                                                              |

Header and Footer are layout helpers only. They do not add dialog semantics or button behavior.

---

## Styling and DOM contract

| Part        | Stable `data-slot`           | Local behavior                                                                   |
| ----------- | ---------------------------- | -------------------------------------------------------------------------------- |
| Trigger     | `sheet-trigger`              | Unstyled primitive button.                                                       |
| Portal      | —                            | Dependency-owned portal wrapper.                                                 |
| Overlay     | `sheet-overlay`              | Fixed `z-50`, translucent black, backdrop blur when supported.                   |
| Content     | `sheet-content`, `data-side` | Fixed `z-50` flex panel, popover tokens, shadow, side dimensions and animations. |
| Close       | `sheet-close`                | Public Close hook; generated icon close uses Button styling.                     |
| Header      | `sheet-header`               | Vertical stack with 1rem padding.                                                |
| Footer      | `sheet-footer`               | Bottom-pushed vertical actions with 1rem padding.                                |
| Title       | `sheet-title`                | Medium 1rem foreground text.                                                     |
| Description | `sheet-description`          | Muted 0.875rem text.                                                             |

Bits UI supplies `data-state="open|closed"` and dialog relationship attributes. Every styled part merges `class` with `cn()`. Content's `side` is local and becomes `data-side`; it is not a Bits UI positioning prop.

---

## Accessibility

Bits UI provides dialog semantics, focus trapping in modal mode, escape dismissal, outside interaction, focus restoration, and Title/Description relationships. Every Content needs a meaningful Title. Include Description when extra context helps; visually hide either with `sr-only` rather than omitting required semantics.

The generated close button uses the localized accessible name “Close”. If `showCloseButton={false}`, ensure another reachable Close control exists unless dismissal through escape/outside interaction is intentionally sufficient. Do not place focus behind a modal sheet or override dialog roles and generated IDs.

---

## Localization

| Message ID        | English value | Used by                                           |
| ----------------- | ------------- | ------------------------------------------------- |
| `amber_fox_glide` | `Close`       | Screen-reader text in the generated close button. |

Title, Description, panel content, action labels, and custom close text are supplied and translated by the app.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
pnpm add -D @inlang/paraglide-js tailwindcss
```

### Icon facade

```ts
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
```

### Global styles and theme tokens

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
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

The values may be replaced by the app's theme. The overlay uses fixed black with opacity; no component-specific keyframe, font, or global layout rule is required.

### Shared utilities

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

### Required xvelte component

The generated close control uses Button. Copy its component folder and follow Button's README to install its API, icons, tokens, and dependencies:

```text
button/
├── button-root.svelte
└── index.ts
```

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the key listed in [Localization](#localization) to `messages/en.json`. Its complete key and value are already shown there.

### Component files and other integration

```text
sheet/
├── index.ts
├── sheet-close.svelte
├── sheet-content.svelte
├── sheet-description.svelte
├── sheet-footer.svelte
├── sheet-header.svelte
├── sheet-overlay.svelte
├── sheet-portal.svelte
├── sheet-root.svelte
├── sheet-title.svelte
└── sheet-trigger.svelte
```

Sheet requires no hook, attachment, local context file, shared style, image, font, or network service. Bits UI owns its internal dialog context.

---

## Credits

The component structure and styling are adapted from [shadcn-svelte Sheet](https://www.shadcn-svelte.com/docs/components/sheet).

---

## File organization

| File                       | Responsibility                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `sheet-root.svelte`        | Shared bindable dialog state.                                                                      |
| `sheet-trigger.svelte`     | Public primitive trigger.                                                                          |
| `sheet-portal.svelte`      | Public Portal wrapper.                                                                             |
| `sheet-overlay.svelte`     | Modal overlay and backdrop styling.                                                                |
| `sheet-content.svelte`     | Portal/overlay composition, side layout, animations, required content, and generated close button. |
| `sheet-close.svelte`       | Public primitive close control.                                                                    |
| `sheet-header.svelte`      | Header layout helper.                                                                              |
| `sheet-footer.svelte`      | Footer/action layout helper.                                                                       |
| `sheet-title.svelte`       | Accessible dialog title and local typography.                                                      |
| `sheet-description.svelte` | Accessible dialog description and muted typography.                                                |
| `index.ts`                 | Public component parts and props types.                                                            |
| `README.md`                | Composition, examples, API, accessibility, localization, styling, and installation guide.          |

The component's `index.ts` and exported types are the source of truth for the public API.

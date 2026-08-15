# Collapsible

An accessible compound component for showing and hiding one section of content. It supports controlled or uncontrolled open state, disabled interaction, browser find-in-page integration, custom transitions, render delegation, and complete native attribute forwarding.

Use Collapsible for optional details, advanced settings, compact metadata, or a single expandable panel. Use Accordion when several related sections need coordinated disclosure behavior, and do not hide critical information or actions that users must always notice.

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
	import * as Collapsible from "$lib/components/ui/collapsible";
</script>
```

Collapsible's `index.ts` exports `Root`, `Trigger`, and `Content`, together with the `RootProps`, `TriggerProps`, and `ContentProps` types.

---

## Anatomy

Compose the public parts beneath one root:

```svelte
<Collapsible.Root>
	<Collapsible.Trigger>Toggle details</Collapsible.Trigger>
	<Collapsible.Content>Optional details</Collapsible.Content>
</Collapsible.Root>
```

`Root` owns and shares the open state. `Trigger` renders the button that changes it, and `Content` renders or hides the associated panel. A root may contain other visible content outside `Content`; only the content part is collapsed.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible";
</script>

<Collapsible.Root>
	<Collapsible.Trigger>Show shipping information</Collapsible.Trigger>

	<Collapsible.Content>
		<p>Standard delivery normally takes three to five working days.</p>
	</Collapsible.Content>
</Collapsible.Root>
```

The root starts closed. Bits UI automatically connects the trigger and content with `aria-expanded`, `aria-controls`, generated IDs, and matching state attributes.

---

## Examples

### Controlled open state

Bind `open` when application code needs to read or change the current state:

```svelte
<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible";

	let open = $state(false);
</script>

<button type="button" onclick={() => (open = true)}>Open account details</button>

<Collapsible.Root bind:open>
	<Collapsible.Trigger>{open ? "Hide" : "Show"} account details</Collapsible.Trigger>
	<Collapsible.Content>
		<p>Your billing profile was updated yesterday.</p>
	</Collapsible.Content>
</Collapsible.Root>
```

Use `onOpenChange` when a callback is enough. `onOpenChangeComplete` runs after Bits UI finishes the opening or closing presence cycle.

### Disabled collapsible

```svelte
<Collapsible.Root disabled>
	<Collapsible.Trigger>Show archived results</Collapsible.Trigger>
	<Collapsible.Content>Archived results are unavailable while synchronization is running.</Collapsible.Content>
</Collapsible.Root>
```

The disabled state is managed by `Root` and propagated to its trigger and content state attributes. The trigger becomes a disabled button and cannot toggle the panel.

### Searchable collapsed content

Use `hiddenUntilFound` when closed content should remain discoverable through the browser's find-in-page feature:

```svelte
<Collapsible.Root>
	<Collapsible.Trigger>Show troubleshooting details</Collapsible.Trigger>

	<Collapsible.Content hiddenUntilFound>
		<p>Reset the device only after exporting its recovery key.</p>
	</Collapsible.Content>
</Collapsible.Root>
```

Supporting browsers apply `hidden="until-found"` while the panel is closed and open it when a search match is revealed. Browser support determines the exact find-in-page behavior. `hiddenUntilFound` takes precedence over `forceMount`.

### Svelte transition

The local `Content` forwards Bits UI's `forceMount` and `child` snippet API. Combine them when Svelte must control mounting and transitions:

```svelte
<script lang="ts">
	import { fade } from "svelte/transition";

	import * as Collapsible from "$lib/components/ui/collapsible";
</script>

<Collapsible.Root>
	<Collapsible.Trigger>Show release notes</Collapsible.Trigger>

	<Collapsible.Content forceMount>
		{#snippet child({ props, open })}
			{#if open}
				<div {...props} transition:fade={{ duration: 150 }}>
					<p>This release improves startup time and keyboard navigation.</p>
				</div>
			{/if}
		{/snippet}
	</Collapsible.Content>
</Collapsible.Root>
```

Always spread the supplied `props` onto the delegated element. They contain the ID, state, disabled state, dimensions, and accessibility behavior required by the primitive.

### Style from state

All public parts expose `data-state="open|closed"`, so the trigger and panel can be styled without duplicating state in application code:

```svelte
<Collapsible.Root class="grid gap-2">
	<Collapsible.Trigger class="text-left font-medium data-[state=open]:underline">Advanced options</Collapsible.Trigger>

	<Collapsible.Content class="rounded-lg border p-4 data-[state=closed]:opacity-0">Advanced configuration belongs here.</Collapsible.Content>
</Collapsible.Root>
```

These Tailwind classes are application styling, not built-in xvelte styles.

---

## Public API

The local props types are aliases of the corresponding Bits UI props and add no xvelte-specific options. The tables summarize the important behavior; use the [Bits UI Collapsible API reference](https://www.bits-ui.com/docs/components/collapsible#api-reference) for the complete inherited API.

### `Collapsible.Root`

Type: `RootProps`, an alias of `CollapsiblePrimitive.RootProps`.

| Prop                   | Type                      | Default     | xvelte behavior                                                                                        |
| ---------------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `open`                 | `boolean`                 | `false`     | Bindable. Controls whether `Content` is visible.                                                       |
| `onOpenChange`         | `(open: boolean) => void` | `undefined` | Called when the open state changes.                                                                    |
| `onOpenChangeComplete` | `(open: boolean) => void` | `undefined` | Called after the open or close presence cycle and any recognized animation completes.                  |
| `disabled`             | `boolean`                 | `false`     | Prevents the trigger from changing state and propagates disabled state to descendants.                 |
| `children`             | `Snippet`                 | `undefined` | Renders the trigger, content, and any content that should remain visible.                              |
| `child`                | `Snippet<{ props }>`      | `undefined` | Delegates the root to a custom element. Spread the supplied props onto that element.                   |
| `ref`                  | `HTMLDivElement \| null`  | `null`      | Bindable reference to the default root `div`; the actual type changes when render delegation is used.  |
| Native div props       | Varies                    | —           | Remaining attributes, events, styles, and classes are forwarded without local merging or modification. |

### `Collapsible.Trigger`

Type: `TriggerProps`, an alias of `CollapsiblePrimitive.TriggerProps`.

| Prop                | Type                        | Default     | xvelte behavior                                                                     |
| ------------------- | --------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `children`          | `Snippet`                   | `undefined` | Renders the trigger's accessible visible label and optional decorative content.     |
| `child`             | `Snippet<{ props }>`        | `undefined` | Delegates rendering. The supplied props must be applied to the interactive element. |
| `ref`               | `HTMLButtonElement \| null` | `null`      | Bindable reference to the default trigger button.                                   |
| Native button props | Varies                      | —           | Remaining button attributes and events are forwarded without local styling.         |

The default element is a `type="button"` button. Bits UI owns its click and keyboard handlers, disabled state, `aria-controls`, `aria-expanded`, and state attributes. Do not replace those handlers when adding application behavior.

### `Collapsible.Content`

Type: `ContentProps`, an alias of `CollapsiblePrimitive.ContentProps`.

| Prop               | Type                                | Default     | xvelte behavior                                                                                        |
| ------------------ | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `forceMount`       | `boolean`                           | `false`     | Keeps content available to a delegated child so application code can control mounting or transitions.  |
| `hiddenUntilFound` | `boolean`                           | `false`     | Uses `hidden="until-found"` while closed and lets supporting browsers reveal a search match.           |
| `children`         | `Snippet`                           | `undefined` | Renders inside the default content `div`.                                                              |
| `child`            | `Snippet<{ props; open: boolean }>` | `undefined` | Delegates the content element and exposes the current state. Spread `props` onto the rendered element. |
| `ref`              | `HTMLDivElement \| null`            | `null`      | Bindable reference to the default content `div`.                                                       |
| Native div props   | Varies                              | —           | Remaining attributes, events, styles, and classes are forwarded without local merging or modification. |

Closed content is normally removed from the DOM after its presence cycle. `forceMount` and `hiddenUntilFound` change that mounting behavior. The installed Bits UI 2.18.1 runtime defaults `hiddenUntilFound` to `false`; its published type comment currently states a conflicting default, so runtime behavior and the exported component implementation are authoritative here.

The component's `index.ts`, exported props types, and installed Bits UI version are the source of truth for the public API.

---

## Styling and DOM contract

Collapsible is intentionally unstyled. xvelte adds only stable `data-slot` attributes and does not merge classes, define variants, consume semantic theme tokens, or add transitions.

| Part      | Default element | Stable xvelte hook                |
| --------- | --------------- | --------------------------------- |
| `Root`    | `div`           | `data-slot="collapsible"`         |
| `Trigger` | `button`        | `data-slot="collapsible-trigger"` |
| `Content` | `div`           | `data-slot="collapsible-content"` |

Bits UI additionally supplies dependency-owned hooks:

- `data-state="open|closed"` on all three parts.
- `data-disabled` on disabled parts.
- `data-collapsible-root`, `data-collapsible-trigger`, and `data-collapsible-content` identifying the primitive parts.
- `data-starting-style` during the first opening frame and `data-ending-style` during the closing frame on `Content`.
- `--bits-collapsible-content-height` and `--bits-collapsible-content-width` on `Content` for CSS animations.

Classes and styles are forwarded directly to the default primitive element. Because xvelte supplies no classes, there is no `cn()` conflict resolution. Do not override `data-slot`, primitive IDs, ARIA relationships, `hidden`, or the dimension variables unless replacing their behavior deliberately.

---

## Accessibility

Bits UI supplies disclosure semantics and keyboard behavior. The default trigger is a button connected to its panel through `aria-controls` and reports its state through `aria-expanded`.

- Give `Trigger` a concise accessible name that describes the content it reveals. Icon-only triggers require `aria-label` or another valid name.
- Enter and Space activate the default trigger. Preserve its primitive-provided props and handlers when using the `child` snippet.
- Do not place buttons, links, or other interactive controls inside the default trigger, which is already a button.
- `disabled` prevents activation and applies native disabled button behavior.
- Collapsible does not move focus, trap focus, label the content as a region, or announce application-specific state changes. Add those behaviors only when the surrounding interface requires them.
- If application code closes the panel while focus is inside it, move focus to a logical visible control, normally the trigger.
- Use `hiddenUntilFound` for content that should be searchable while collapsed, but do not rely on it as the only route to essential information because browser support varies.
- Do not communicate open state only through animation, rotation, or color; the trigger needs understandable text or an accessible name.

---

## Localization

Collapsible has no built-in user-facing copy and requires no localization messages. Your app supplies and translates trigger labels, panel content, state-dependent text, descriptions, and icon-only accessible names. The values of `data-state`, `data-slot`, IDs, and CSS variables are technical details and are not translated.

---

## Dependencies

Collapsible requires only Svelte 5 and Bits UI. Install the runtime package with one of the following commands:

```sh
# bun
bun add bits-ui

# npm
npm install bits-ui

# pnpm
pnpm add bits-ui
```

No Tailwind CSS installation, global stylesheet import, semantic variable, `@theme` mapping, keyframe, animation stylesheet, font, icon package, `$lib/icons` export, `$lib/utils` helper, other xvelte component, hook, attachment, context module, localization message, or shared style file is required.

The Svelte transition example uses the framework's built-in `svelte/transition` module and requires no additional package. If the app adds Tailwind classes, icons, or an xvelte Button to its own trigger presentation, install and configure those application choices separately by following their component guides.

---

## Credits

Collapsible is adapted from the [shadcn-svelte Collapsible component](https://www.shadcn-svelte.com/docs/components/collapsible).

---

## File organization

| File                         | Responsibility                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `collapsible-root.svelte`    | Wraps the Bits UI root, forwards props, and exposes bindable open state and element ref. |
| `collapsible-trigger.svelte` | Wraps the Bits UI trigger and forwards its interactive props and bindable element ref.   |
| `collapsible-content.svelte` | Wraps the Bits UI content and forwards mounting, search, snippet, and native props.      |
| `index.ts`                   | Exports all three public parts and their props types.                                    |
| `README.md`                  | Documents composition, examples, API, styling, accessibility, and installation.          |

The component's `index.ts` and exported `RootProps`, `TriggerProps`, and `ContentProps` types are the source of truth for the public API.

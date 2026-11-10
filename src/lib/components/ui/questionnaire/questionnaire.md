# Questionnaire

A multi-step native form for single-choice, multiple-choice, freeform, skippable, validated, shortcut-enabled, and server-rendered questions. Use it when a short sequence should reveal one question at a time; use ordinary Field components when every field should remain visible together.

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

Import all parts and types through the component's public `index.ts`:

```svelte
<script lang="ts">
	import * as Questionnaire from "$lib/components/ui/questionnaire";
</script>
```

The component exports `Root`, `Progress`, `Item`, `Title`, `Description`, `Choices`, `Choice`, `ChoiceDescription`, `Input`, `Error`, `Actions`, `Previous`, `Skip`, `Next`, and `Submit`; a named props type for each part; and the `ChoiceDefinition`, `InputType`, `ItemDefinition`, `ItemStatus`, and `ShortcutMode` helper types.

---

## Anatomy

```svelte
<Questionnaire.Root>
	<Questionnaire.Progress />

	<Questionnaire.Item name="question">
		<Questionnaire.Title>Question prompt</Questionnaire.Title>
		<Questionnaire.Description>Supporting instructions</Questionnaire.Description>
		<Questionnaire.Choices>
			<Questionnaire.Choice value="answer">
				Answer
				<Questionnaire.ChoiceDescription>Optional detail</Questionnaire.ChoiceDescription>
			</Questionnaire.Choice>
			<Questionnaire.Input aria-label="Another answer" />
		</Questionnaire.Choices>
		<Questionnaire.Error />
	</Questionnaire.Item>

	<Questionnaire.Actions>
		<Questionnaire.Previous />
		<Questionnaire.Skip />
		<Questionnaire.Next />
		<Questionnaire.Submit />
	</Questionnaire.Actions>
</Questionnaire.Root>
```

Root owns the form, ordered items, active item, answer state, validation, shortcuts, and navigation. Each Item is a native `fieldset`; Title is its `legend`. The surrounding page, Card, Dialog, or Drawer owns persistence, transport, cancellation, branching, and dismissal.

---

## Basic usage

Define the item collection once and pass it to Root. This makes the active step, progress, navigation, and shortcuts correct during server rendering before descendant parts register in the browser.

```svelte
<script lang="ts">
	import * as Questionnaire from "$lib/components/ui/questionnaire";

	const items = [
		{
			name: "approach",
			required: true,
			choices: [{ value: "incremental" }, { value: "complete" }]
		},
		{
			name: "timing",
			required: true,
			choices: [{ value: "now" }, { value: "later" }]
		}
	] as const;

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const answers = new FormData(event.currentTarget as HTMLFormElement);
		console.log(answers.get("approach"), answers.get("timing"));
	}
</script>

<Questionnaire.Root {items} onSubmit={handleSubmit}>
	<Questionnaire.Progress />

	<Questionnaire.Item name="approach" required>
		<Questionnaire.Title>How should we approach the change?</Questionnaire.Title>
		<Questionnaire.Choices>
			<Questionnaire.Choice value="incremental">Make the smallest safe change</Questionnaire.Choice>
			<Questionnaire.Choice value="complete">Implement the complete flow</Questionnaire.Choice>
		</Questionnaire.Choices>
		<Questionnaire.Error />
	</Questionnaire.Item>

	<Questionnaire.Item name="timing" required>
		<Questionnaire.Title>When should work begin?</Questionnaire.Title>
		<Questionnaire.Choices>
			<Questionnaire.Choice value="now">Start now</Questionnaire.Choice>
			<Questionnaire.Choice value="later">Schedule it for later</Questionnaire.Choice>
		</Questionnaire.Choices>
		<Questionnaire.Error />
	</Questionnaire.Item>

	<Questionnaire.Actions>
		<Questionnaire.Previous />
		<Questionnaire.Next />
		<Questionnaire.Submit>Save answers</Questionnaire.Submit>
	</Questionnaire.Actions>
</Questionnaire.Root>
```

Root renders a real form. Submission validates every enabled item, prevents invalid submission, returns to the first invalid item, and focuses an available answer control.

---

## Examples

### Multiple answers

Set `multiple` on Item to render its fixed choices as checkboxes. Read them with `FormData.getAll()`:

```svelte
<Questionnaire.Item name="signals" multiple required>
	<Questionnaire.Title>Which signals should be included?</Questionnaire.Title>
	<Questionnaire.Choices>
		<Questionnaire.Choice value="progress">Progress</Questionnaire.Choice>
		<Questionnaire.Choice value="decisions">Decisions</Questionnaire.Choice>
		<Questionnaire.Choice value="risks">Risks</Questionnaire.Choice>
	</Questionnaire.Choices>
	<Questionnaire.Error />
</Questionnaire.Item>
```

### Freeform answer

Input participates in the owning Item's form name automatically. Give it an accessible name; a placeholder is not a label.

```svelte
<Questionnaire.Choices>
	<Questionnaire.Choice value="incremental">Incremental change</Questionnaire.Choice>
	<Questionnaire.Choice value="rewrite">Complete rewrite</Questionnaire.Choice>
	<Questionnaire.Input aria-label="Another approach" placeholder="Describe another approach…" />
</Questionnaire.Choices>
```

A filled Input counts as an answer. It may coexist with fixed choices, and its native value is submitted under the Item's `name`.

### Optional item and explicit skip

An unanswered optional item may be advanced normally. Add Skip when the interface should record an intentional skip and move immediately:

```svelte
<Questionnaire.Item name="notes">
	<Questionnaire.Title>Anything else?</Questionnaire.Title>
	<Questionnaire.Input aria-label="Additional notes" />
	<Questionnaire.Error />
</Questionnaire.Item>

<Questionnaire.Actions>
	<Questionnaire.Previous />
	<Questionnaire.Skip />
	<Questionnaire.Next />
	<Questionnaire.Submit />
</Questionnaire.Actions>
```

Skip is hidden for required items. Its status is `"skipped"`, and its controls are removed from submitted answers until the item is answered again.

### Controlled navigation and resume

Bind `item` when the host needs to persist the active step or return to a specific question:

```svelte
<script lang="ts">
	let item = $state("scope");
</script>

<Questionnaire.Root bind:item {items}>
	<!-- items and actions -->
</Questionnaire.Root>
```

Use `defaultItem` for an uncontrolled restored position. Use `defaultChecked` and `defaultValue` to restore saved answers; native form reset returns controls to those defaults.

### Conditional items

Set `disabled` both in the Root definition and matching Item. Disabled items are removed from navigation and progress:

```svelte
<script lang="ts">
	let includeDetails = $state(false);

	const items = $derived([
		{ name: "overview", required: true },
		{ name: "details", disabled: !includeDetails }
	]);
</script>

<Questionnaire.Root {items}>
	<Questionnaire.Item name="overview" required>...</Questionnaire.Item>
	<Questionnaire.Item name="details" disabled={!includeDetails}>...</Questionnaire.Item>
</Questionnaire.Root>
```

Keep Root's `items` metadata and rendered Item props synchronized. The primitive reports mismatches in development.

### Shortcuts

```svelte
<Questionnaire.Root {items} shortcuts="letters">
	<!-- A, B, C… are assigned to enabled fixed choices. -->
</Questionnaire.Root>
```

Use `"numbers"` for numeric shortcuts. Shortcuts apply only to the active item and are displayed by Choice. Selected multiple answers remain keyboard reachable; Enter activates Next or Submit when available, and Arrow Left returns to the previous item when focus is not editing text.

### External validation

Set `invalid` on an Item to return to it during submission and show its Error. Supply custom error copy as children:

```svelte
<Questionnaire.Item name="email" required invalid={emailExists}>
	<Questionnaire.Title>Which email should receive the report?</Questionnaire.Title>
	<Questionnaire.Input type="email" aria-label="Report email" />
	<Questionnaire.Error>This address already belongs to another report.</Questionnaire.Error>
</Questionnaire.Item>
```

### Render state

Primitive-backed parts expose state through `child`. Always spread `props` onto the correct semantic element:

```svelte
<Questionnaire.Progress>
	{#snippet child({ props, current, total })}
		<div {...props}>Step {current} / {total}</div>
	{/snippet}
</Questionnaire.Progress>
```

Root exposes `current`, `first`, `last`, and `total`; Item exposes `active`, `disabled`, `invalid`, `multiple`, `required`, and `status`; Choice exposes `checked`, `disabled`, `invalid`, `shortcut`, and `type`; navigation actions expose `disabled`, `shortcut`, `status`, and `visible`.

---

## Public API

Primitive-backed parts inherit native attributes, event handlers, `children`, render delegation through `child`, and a bindable `ref`. Local classes are merged with `cn()`. The component's `index.ts`, exported types, and installed `@shadcn-svelte/primitives` version are the source of truth.

### `Questionnaire.Root`

Type: `RootProps`. Default element: `form`.

| Prop           | Type                        | Default            | Behavior                                                                     |
| -------------- | --------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `items`        | `readonly ItemDefinition[]` | `undefined`        | Ordered metadata required for complete SSR, progress, and shortcut behavior. |
| `item`         | `string`                    | `undefined`        | Bindable controlled active item name.                                        |
| `defaultItem`  | `string`                    | first enabled item | Initial uncontrolled item.                                                   |
| `onItemChange` | `(item: string) => void`    | `undefined`        | Runs whenever navigation changes the active item.                            |
| `shortcuts`    | `"letters" \| "numbers"`    | `undefined`        | Assigns shortcuts to active fixed choices.                                   |
| `noValidate`   | `boolean`                   | `true`             | Sets native `novalidate` so primitive validation owns navigation.            |
| `onSubmit`     | form submit handler         | `undefined`        | Runs after every enabled item validates.                                     |
| `onReset`      | form reset handler          | `undefined`        | Runs before items restore their default answers.                             |
| `children`     | `Snippet`                   | `undefined`        | Renders progress, items, and actions.                                        |
| `child`        | state snippet               | `undefined`        | Delegates the form; spread `props` onto a form element.                      |
| `ref`          | `HTMLFormElement \| null`   | `null`             | Bindable form reference.                                                     |

Native `onsubmit` is accepted as an alternative to `onSubmit`; the primitive composes its validation first. Root's child state contains `current`, `first`, `last`, and `total`.

### `Questionnaire.Progress`

Type: `ProgressProps`. Default element: `div` with progressbar semantics.

It forwards native div attributes and exposes Root's `current`, `first`, `last`, and `total` through `child`. Without custom content, xvelte renders the localized “Question {current} of {total}” label. Its localized `aria-label` defaults to “Questionnaire progress”; `aria-live`, value attributes, and `aria-valuetext` come from the primitive.

### `Questionnaire.Item`

Type: `ItemProps`. Default element: `fieldset`.

| Prop                 | Type                           | Default     | Behavior                                             |
| -------------------- | ------------------------------ | ----------- | ---------------------------------------------------- |
| `name`               | `string`                       | required    | Unique item and native form field name.              |
| `required`           | `boolean`                      | `false`     | Requires an answer before advancing or submitting.   |
| `multiple`           | `boolean`                      | `false`     | Changes fixed answers from radios to checkboxes.     |
| `disabled`           | `boolean`                      | `false`     | Removes the item from navigation and progress.       |
| `invalid`            | `boolean`                      | `false`     | Marks external validation failure and reveals Error. |
| `onStatusChange`     | `(status: ItemStatus) => void` | `undefined` | Reports `unanswered`, `answered`, or `skipped`.      |
| `children` / `child` | snippet                        | `undefined` | Item content or delegated fieldset with state.       |
| `ref`                | `HTMLFieldSetElement \| null`  | `null`      | Bindable fieldset reference.                         |

Item owns its `aria-describedby`, `aria-invalid`, and shortcut relationship. Inactive items are hidden and inert. Child state exposes `active`, `disabled`, `invalid`, `multiple`, `required`, and `status`.

### `Questionnaire.Title`

Type: `TitleProps`. It renders a native `legend`, forwards legend attributes, merges classes, and binds `HTMLLegendElement | null`. It must be a direct semantic title for the owning Item.

### `Questionnaire.Description`

Type: `DescriptionProps`. It renders a `p`, forwards paragraph attributes, and registers its generated or supplied `id` with the owning Item's accessible description.

### `Questionnaire.Choices`

Type: `ChoicesProps`. It renders a `div` containing Choice and Input parts. Its `child` state exposes the active shortcut mode as `shortcuts`. Remaining native div props and `ref` are forwarded.

### `Questionnaire.Choice`

Type: `ChoiceProps`. The styled component renders a primitive `label` containing an invisible native input, a visual indicator, a label wrapper, and an optional shortcut badge.

| Prop             | Type                       | Default     | Behavior                                          |
| ---------------- | -------------------------- | ----------- | ------------------------------------------------- |
| `value`          | `string`                   | required    | Submitted value under the owning Item's name.     |
| `checked`        | `boolean`                  | `undefined` | Controlled selected state.                        |
| `defaultChecked` | `boolean`                  | `false`     | Initial uncontrolled state and form-reset target. |
| `disabled`       | `boolean`                  | `false`     | Excludes this choice from answers and shortcuts.  |
| `onChange`       | `(event: Event) => void`   | `undefined` | Runs for the underlying native change event.      |
| `children`       | `Snippet`                  | `undefined` | Visible label content.                            |
| `child`          | state snippet              | `undefined` | Replaces the complete styled label composition.   |
| `ref`            | `HTMLLabelElement \| null` | `null`      | Bindable default label reference.                 |

Choice child state exposes `checked`, `disabled`, `invalid`, `shortcut`, and `type`. When `child` is used, the app owns the input, visible state, and full styling contract supplied through `props`.

### `Questionnaire.ChoiceDescription`

Type: `ChoiceDescriptionProps`, based on native span attributes with a bindable ref. It adds muted supporting text inside Choice and activates the local indicator alignment selector. It does not create a separate accessible-description relationship because its content is already inside the native label.

### `Questionnaire.Input`

Type: `InputProps`. Default element: native `input` inside a stable wrapper.

| Prop           | Type                       | Default     | Behavior                                                                                                  |
| -------------- | -------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| `type`         | `InputType`                | `"text"`    | Safe native single-line type; file, checkbox, radio, range, color, hidden, and button types are excluded. |
| `value`        | `string`                   | `undefined` | Controlled value.                                                                                         |
| `defaultValue` | `string`                   | `undefined` | Initial uncontrolled value and reset target.                                                              |
| `disabled`     | `boolean`                  | `false`     | Excludes the answer and prevents interaction.                                                             |
| `onChange`     | `(event: Event) => void`   | `undefined` | Runs for native input events.                                                                             |
| `child`        | state snippet              | `undefined` | Delegates the input and exposes `disabled`, `filled`, and `invalid`.                                      |
| `ref`          | `HTMLInputElement \| null` | `null`      | Bindable input reference.                                                                                 |

The primitive supplies the owning Item's form name. Remaining applicable native input attributes are forwarded. `class` applies to the input; the outer `data-slot="questionnaire-input-wrapper"` remains structural.

### `Questionnaire.Error`

Type: `ErrorProps`. It renders a `p`, registers its ID with Item, and appears only while that Item is invalid. Default copy is localized and changes between required and optional items. Custom children replace that copy; `child` exposes `invalid` and delegates the paragraph.

### `Questionnaire.Actions`

Type: `ActionsProps`, based on native div attributes. It is a styled-only three-column layout for the navigation buttons and exposes a bindable `HTMLDivElement | null` ref. It owns no navigation state.

### Navigation actions

`PreviousProps`, `SkipProps`, `NextProps`, and `SubmitProps` inherit the corresponding primitive button props and add xvelte Button's `variant` and `size`.

| Part       | Native type | Default variant | Default label        | Visibility                  |
| ---------- | ----------- | --------------- | -------------------- | --------------------------- |
| `Previous` | `button`    | `outline`       | localized “Previous” | Except on first item.       |
| `Skip`     | `button`    | `outline`       | localized “Skip”     | Optional active items only. |
| `Next`     | `button`    | `default`       | localized “Next”     | Except on last item.        |
| `Submit`   | `submit`    | `default`       | localized “Submit”   | Last item only.             |

All four accept `disabled?: boolean`, native button props, custom children, `child`, `class`, a bindable button ref, every `Button.RootVariants` value, and every `Button.RootSizes` value. Their child state exposes `disabled`, `shortcut`, `status`, and `visible`. Hidden actions receive `aria-hidden`, `hidden`, `inert`, and a negative tabindex from the primitive.

### Helper types

| Type               | Purpose                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `ChoiceDefinition` | `{ value; disabled? }` metadata used inside Root's item definitions. |
| `ItemDefinition`   | `{ name; choices?; disabled?; required? }` ordered Root metadata.    |
| `ItemStatus`       | `"unanswered" \| "answered" \| "skipped"`.                           |
| `ShortcutMode`     | `"letters" \| "numbers"`.                                            |
| `InputType`        | Supported native freeform input type union.                          |

---

## Styling and DOM contract

| Part                | Default element | Stable xvelte hook                             |
| ------------------- | --------------- | ---------------------------------------------- |
| `Root`              | `form`          | `data-slot="questionnaire"`                    |
| `Progress`          | `div`           | `data-slot="questionnaire-progress"`           |
| `Item`              | `fieldset`      | `data-slot="questionnaire-item"`               |
| `Title`             | `legend`        | `data-slot="questionnaire-title"`              |
| `Description`       | `p`             | `data-slot="questionnaire-description"`        |
| `Choices`           | `div`           | `data-slot="questionnaire-choices"`            |
| `Choice`            | `label`         | `data-slot="questionnaire-choice"`             |
| Choice native input | `input`         | `data-slot="questionnaire-choice-input"`       |
| Choice indicator    | `span`          | `data-slot="questionnaire-choice-indicator"`   |
| Choice dot/check    | `span` / `svg`  | `data-slot="questionnaire-choice-indicator-dot | check"` |
| Choice label        | `span`          | `data-slot="questionnaire-choice-label"`       |
| Choice shortcut     | `span`          | `data-slot="questionnaire-choice-shortcut"`    |
| `ChoiceDescription` | `span`          | `data-slot="questionnaire-choice-description"` |
| Input wrapper       | `div`           | `data-slot="questionnaire-input-wrapper"`      |
| `Input`             | `input`         | `data-slot="questionnaire-input"`              |
| `Error`             | `p`             | `data-slot="questionnaire-error"`              |
| `Actions`           | `div`           | `data-slot="questionnaire-actions"`            |
| Navigation actions  | `button`        | `data-slot="questionnaire-previous             | skip    | next | submit"` |

The primitive supplies behavior state attributes:

- Root and Progress: `data-current`, `data-total`, `data-first`, and `data-last`; Root also has `data-shortcuts`.
- Item: `data-active`, `data-disabled`, `data-invalid`, `data-multiple`, `data-required`, and `data-status`.
- Choice and its input: `data-checked`, `data-unchecked`, `data-disabled`, `data-invalid`, `data-shortcut`, and `data-type="radio|checkbox"`.
- Choices: `data-shortcuts`; Input: `data-empty`, `data-filled`, `data-disabled`, and `data-invalid`.
- Error: `data-invalid`; navigation buttons: `data-disabled`, `data-hidden`, `data-visible`, `data-shortcut`, and `data-status`.
- Navigation wrappers add stable `data-size` and `data-variant` values.

Choice's invisible native input covers the label and owns focus. The styled label reacts to its focus, selection, invalid, disabled, and radio/checkbox states. Error uses xvelte's `danger` token rather than upstream's `destructive` name. Consumer classes merge last, although Tailwind Merge decides equivalent conflicts.

---

## Accessibility

Questionnaire preserves native form semantics. Root is a form, Item is a fieldset, Title is its legend, fixed choices use native radios or checkboxes, Input is native, and navigation uses buttons. Description and visible Error IDs are associated with the Item; invalid items and controls expose `aria-invalid`.

Inactive items and irrelevant navigation actions are hidden and inert. Successful navigation focuses the new fieldset; failed validation focuses an answer control. Progress is a localized, polite progressbar. Shortcuts are exposed through `aria-keyshortcuts`, and the visible shortcut badge is decorative.

- Always give Input a visible label, `aria-label`, or `aria-labelledby`; placeholder text is insufficient.
- Keep one Title inside every Item and do not replace its legend semantics without recreating the association.
- Custom `child` snippets must spread `props` onto the documented semantic element.
- Do not rely on color alone for invalid or selected state; the component retains native control semantics, visible indicators, and error text.
- Keep shortcut keys unique within the active choices and avoid enabling them in contexts where single-letter commands conflict with surrounding application shortcuts.
- When Questionnaire is inside Dialog or Drawer, keep cancellation and dismissal outside its submission controls.

---

## Localization

Questionnaire contains these localized defaults:

| Message ID                            | English value                             | Used by                   |
| ------------------------------------- | ----------------------------------------- | ------------------------- |
| `steady_finch_questionnaire_progress` | `Questionnaire progress`                  | Progress accessible name. |
| `tender_fox_question_progress`        | `Question {current} of {total}`           | Default visible progress. |
| `vivid_brook_choose_or_skip`          | `Choose an answer or skip this question.` | Optional Item error.      |
| `wise_marten_choose_answer`           | `Choose an answer to continue.`           | Required Item error.      |
| `young_willow_previous`               | `Previous`                                | Previous default label.   |
| `zesty_heron_skip`                    | `Skip`                                    | Skip default label.       |
| `agile_pine_next`                     | `Next`                                    | Next default label.       |
| `bold_otter_submit`                   | `Submit`                                  | Submit default label.     |

The app supplies and translates question titles, descriptions, choices, placeholders, custom errors, custom navigation copy, submission feedback, and accessible labels for freeform inputs. Shortcut characters are interaction tokens rather than translated copy.

---

## Dependencies

Install the primitive, localization compiler, styling packages, and icon package:

```sh
# Bun
bun add @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @shadcn-svelte/primitives tailwindcss @inlang/paraglide-js

# npm
npm install @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @shadcn-svelte/primitives tailwindcss @inlang/paraglide-js

# pnpm
pnpm add @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @shadcn-svelte/primitives tailwindcss @inlang/paraglide-js
```

Questionnaire is implemented against `@shadcn-svelte/primitives` 0.0.1. That package owns its form state, internal context, collection registration, keyboard interaction, validation, generated IDs, and native prop composition.

Copy the complete `src/lib/components/ui/button` folder, including its `.svelte` files, `index.ts`, and `button.md`, then follow its guide. Navigation actions use `Button.rootVariants`, `Button.RootVariants`, and `Button.RootSizes`.

### Icon facade

Choice requires this semantic export in `src/lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
```

### Utilities

Questionnaire imports `cn` and `WithElementRef` from `$lib/utils`:

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

### Theme and localization

The global stylesheet must import Tailwind, define the dark variant and shared focus treatment, and map the semantic tokens used by Questionnaire. These sample values may be replaced while preserving the names:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(65.6% 0.241 354.308);
	--primary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(65.6% 0.241 354.308);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
}

@layer base {
	*:focus-visible {
		@apply rounded-sm border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

Button's guide lists the additional semantic variants and radius variables needed by every selectable action variant.

Add the eight exact messages from [Localization](#localization) to `messages/en.json`, configure Paraglide, and compile it so `$lib/paraglide/messages.js` exports each function. Generated Paraglide output must be built by the app rather than copied manually.

Questionnaire requires no xvelte hook, attachment, authored context file, shared stylesheet, asset, font, network service, or Tauri integration. Card, Dialog, Drawer, Field, and toast components are optional host compositions and should be copied with their own guides only when used.

---

## Credits

Questionnaire is adapted from the [shadcn-svelte Questionnaire](https://www.shadcn-svelte.com/docs/components/questionnaire) and its [`@shadcn-svelte/primitives` implementation](https://github.com/huntabyte/shadcn-svelte/tree/main/packages/primitives/src/lib/questionnaire). The local wrapper adds xvelte namespaces, named prop types, semantic danger styling, the Tabler icon facade, localized defaults, stable slots, and installation documentation.

---

## File organization

| File                                      | Responsibility                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `questionnaire-root.svelte`               | Form state, collection metadata, active item, validation, and submission. |
| `questionnaire-progress.svelte`           | Localized progressbar and custom progress delegation.                     |
| `questionnaire-item.svelte`               | One fieldset, answer status, validation, and active-step boundary.        |
| `questionnaire-title.svelte`              | Item legend.                                                              |
| `questionnaire-description.svelte`        | Associated supporting instructions.                                       |
| `questionnaire-choices.svelte`            | Fixed and freeform answer layout.                                         |
| `questionnaire-choice.svelte`             | Native radio/checkbox answer with indicator and shortcut.                 |
| `questionnaire-choice-description.svelte` | Supporting choice text.                                                   |
| `questionnaire-input.svelte`              | Freeform native input and structural wrapper.                             |
| `questionnaire-error.svelte`              | Associated localized or custom validation message.                        |
| `questionnaire-actions.svelte`            | Three-column navigation layout.                                           |
| `questionnaire-previous.svelte`           | Previous-step action.                                                     |
| `questionnaire-skip.svelte`               | Explicit optional-item skip action.                                       |
| `questionnaire-next.svelte`               | Next-step validation and navigation action.                               |
| `questionnaire-submit.svelte`             | Last-step form submission action.                                         |
| `index.ts`                                | Public components, props, and helper types.                               |
| `questionnaire.md`                        | Installation, behavior, API, and usage guide.                             |

The component's `index.ts`, exported types, and installed primitive version are the source of truth for the public API.

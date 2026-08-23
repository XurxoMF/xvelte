# Radio Group

An accessible single-choice control for selecting one value from a related set. It supports controlled state, native form submission, required, disabled and read-only modes, vertical or horizontal orientation, looping keyboard navigation, per-item disabling, validation styling, and a fixed built-in selection indicator.

Use Radio Group when the available options are visible and mutually exclusive. Use Select when a long option list should remain compact, Checkbox when choices are independent or multiple values may be selected, and Toggle Group when the controls behave as a compact toolbar or view switcher rather than a form question.

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

Import all public parts through the component's `index.ts`:

```svelte
<script lang="ts">
	import * as RadioGroup from "$lib/components/ui/radio-group";
</script>
```

The component exports `Root` and `Item`, together with the `RootProps` and `ItemProps` types.

---

## Anatomy

Place every Item inside Root and associate it with visible label text:

```svelte
<RadioGroup.Root>
	<div class="flex items-center gap-2">
		<RadioGroup.Item id="option-one" value="one" />
		<label for="option-one">Option one</label>
	</div>

	<div class="flex items-center gap-2">
		<RadioGroup.Item id="option-two" value="two" />
		<label for="option-two">Option two</label>
	</div>
</RadioGroup.Root>
```

Root owns the selected string value and the roving keyboard focus. Item renders a button with radio semantics and creates its circular indicator internally. The local Item API removes Bits UI's `children` and `child` props, so labels must remain outside Item and its indicator cannot be replaced.

---

## Basic usage

```svelte
<script lang="ts">
	import * as RadioGroup from "$lib/components/ui/radio-group";

	let density = $state("comfortable");
</script>

<div class="grid gap-2">
	<p id="density-label" class="text-sm font-medium">Interface density</p>

	<RadioGroup.Root bind:value={density} aria-labelledby="density-label">
		<div class="flex items-center gap-2">
			<RadioGroup.Item id="density-default" value="default" />
			<label for="density-default">Default</label>
		</div>

		<div class="flex items-center gap-2">
			<RadioGroup.Item id="density-comfortable" value="comfortable" />
			<label for="density-comfortable">Comfortable</label>
		</div>

		<div class="flex items-center gap-2">
			<RadioGroup.Item id="density-compact" value="compact" />
			<label for="density-compact">Compact</label>
		</div>
	</RadioGroup.Root>

	<p class="text-sm text-muted-foreground">Selected: {density}</p>
</div>
```

`value` is bindable and defaults locally to an empty string. Give every Item a unique `value`, a stable `id`, and an associated label.

---

## Examples

### Native form submission

Set `name` to render Bits UI's visually hidden form input. Add `required` when the form must reject an empty selection:

```svelte
<form method="post">
	<p id="plan-label" class="text-sm font-medium">Subscription plan</p>

	<RadioGroup.Root name="plan" required aria-labelledby="plan-label">
		<div class="flex items-center gap-2">
			<RadioGroup.Item id="plan-monthly" value="monthly" />
			<label for="plan-monthly">Monthly</label>
		</div>

		<div class="flex items-center gap-2">
			<RadioGroup.Item id="plan-yearly" value="yearly" />
			<label for="plan-yearly">Yearly</label>
		</div>
	</RadioGroup.Root>

	<button type="submit">Continue</button>
</form>
```

Without `name`, no hidden input is rendered and Radio Group does not contribute a value to native form data. `required` should therefore be paired with `name` for form validation.

### Horizontal layout

`orientation` configures the declared orientation and navigation context; change the local grid layout separately:

```svelte
<RadioGroup.Root orientation="horizontal" class="flex w-fit gap-4" aria-label="Text alignment">
	<div class="flex items-center gap-2">
		<RadioGroup.Item id="align-left" value="left" />
		<label for="align-left">Left</label>
	</div>

	<div class="flex items-center gap-2">
		<RadioGroup.Item id="align-center" value="center" />
		<label for="align-center">Center</label>
	</div>

	<div class="flex items-center gap-2">
		<RadioGroup.Item id="align-right" value="right" />
		<label for="align-right">Right</label>
	</div>
</RadioGroup.Root>
```

Root always has a local `grid` class. The example's later `flex` utility replaces it through `cn()`.

### Disabled options and group

Disable one unavailable Item without affecting the others:

```svelte
<RadioGroup.Root value="email" aria-label="Notification channel">
	<div class="flex items-center gap-2">
		<RadioGroup.Item id="channel-email" value="email" />
		<label for="channel-email">Email</label>
	</div>

	<div class="flex items-center gap-2">
		<RadioGroup.Item id="channel-sms" value="sms" disabled />
		<label for="channel-sms">Text message unavailable</label>
	</div>
</RadioGroup.Root>
```

Set `disabled` on Root to disable every Item and the hidden form input. Disabled items are removed from roving keyboard navigation and use reduced opacity and a not-allowed cursor.

### Read-only selection

Read-only groups remain focusable and navigable but do not allow selection changes:

```svelte
<RadioGroup.Root value="approved" readonly aria-label="Review status">
	<div class="flex items-center gap-2">
		<RadioGroup.Item id="review-pending" value="pending" />
		<label for="review-pending">Pending</label>
	</div>

	<div class="flex items-center gap-2">
		<RadioGroup.Item id="review-approved" value="approved" />
		<label for="review-approved">Approved</label>
	</div>
</RadioGroup.Root>
```

`readonly` belongs to Root; Item has no separate read-only prop. Use `disabled` instead when the controls should be non-focusable and excluded from interaction.

### Observe value changes

```svelte
<RadioGroup.Root
	value="system"
	aria-label="Color preference"
	onValueChange={(value) => {
		console.info("Color preference", value);
	}}
>
	<div class="flex items-center gap-2">
		<RadioGroup.Item id="theme-system" value="system" />
		<label for="theme-system">System</label>
	</div>

	<div class="flex items-center gap-2">
		<RadioGroup.Item id="theme-dark" value="dark" />
		<label for="theme-dark">Dark</label>
	</div>
</RadioGroup.Root>
```

The callback runs after Bits UI changes the selected value. Use `bind:value` when the app must retain the new selection in local state.

---

## Public API

Radio Group wraps the installed stable Bits UI Radio Group primitive. The tables summarize the local behavior and important inherited options; use the [Bits UI Radio Group API](https://bits-ui.com/docs/components/radio-group#api-reference) for the complete primitive API. The component's `index.ts` and exported types remain the source of truth.

### `RadioGroup.Root`

Type: `RootProps`, equal to `RadioGroupPrimitive.RootProps`.

| Prop            | Type                         | Default      | Behavior                                                                                      |
| --------------- | ---------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `value`         | `string`                     | `""`         | Bindable value of the selected Item. An empty string represents no selection.                 |
| `onValueChange` | `(value: string) => void`    | —            | Runs when Bits UI changes `value`.                                                            |
| `orientation`   | `"vertical" \| "horizontal"` | `"vertical"` | Declared orientation used by the primitive's navigation context and public data attribute.    |
| `loop`          | `boolean`                    | `true`       | Wraps keyboard navigation from the last enabled Item to the first and vice versa.             |
| `name`          | `string`                     | —            | Renders the visually hidden form input and supplies its submitted field name.                 |
| `required`      | `boolean`                    | `false`      | Marks the group and hidden input as required. Pair it with `name` for native form validation. |
| `disabled`      | `boolean`                    | `false`      | Disables every Item and the hidden form input.                                                |
| `readonly`      | `boolean`                    | `false`      | Keeps Items focusable and navigable while preventing selection changes.                       |
| `children`      | `Snippet`                    | —            | Renders Items, labels, descriptions, and app-owned layout inside the default Root.            |
| `child`         | `Snippet<[{ props }]>`       | —            | Replaces the Root element; spread every supplied prop on the delegated element.               |
| `ref`           | `HTMLDivElement \| null`     | `null`       | Bindable default Root reference; delegated-element typing follows the primitive.              |
| `class`         | `string`                     | —            | Merged after the local full-width grid and `0.5rem` gap.                                      |

Root forwards compatible native `div` attributes, ARIA props, data attributes, styles, and event handlers. It renders `role="radiogroup"`, required/disabled/read-only ARIA state, orientation state, and roving-focus behavior through Bits UI.

The installed `bits-ui@2.18.1` source defaults `loop` to `true`. This local installed behavior takes precedence over documentation for another dependency version.

### `RadioGroup.Item`

Type: `ItemProps`, based on `RadioGroupPrimitive.ItemProps` with `children` and `child` removed.

| Prop       | Type                        | Default  | Behavior                                                                                 |
| ---------- | --------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `value`    | `string`                    | Required | Unique value selected on Root when this Item is activated.                               |
| `disabled` | `boolean \| null`           | `false`  | Disables this Item; Root's disabled state also applies.                                  |
| `ref`      | `HTMLButtonElement \| null` | `null`   | Bindable reference to the primitive radio button.                                        |
| `class`    | `string`                    | —        | Merged after local shape, color, pointer-target, focus, disabled, and validation styles. |

Item forwards compatible native button and ARIA attributes. It always renders the local indicator, so it has no `children`, `child`, `checked`, bindable value, label, indicator class, or selection callback prop. Read and control selection through Root.

### Selection and focus behavior

- Clicking an enabled Item selects its value.
- Space selects the focused enabled Item.
- The group uses one tab stop. Tab enters at the selected Item, or the first enabled Item when no selection exists.
- Home and End move focus to the first and last enabled Items.
- The installed Bits UI implementation accepts all four arrow keys for previous/next movement. `ArrowUp` and `ArrowLeft` move backward; `ArrowDown` and `ArrowRight` move forward in left-to-right layouts.
- Moving focus by arrow key also changes the selection once the group already has a value. When the group starts empty, use Space or click to establish the first selection.
- `loop={true}` wraps at the ends; set it to `false` to stop there.
- Read-only mode allows focus movement without changing `value`.

Directional behavior follows the dependency's document-direction handling. Re-test exact arrow direction when using right-to-left layouts or a different Bits UI version.

---

## Styling and DOM contract

Stable xvelte hooks:

| Element            | Stable hook                         | Local behavior                                                                     |
| ------------------ | ----------------------------------- | ---------------------------------------------------------------------------------- |
| Root               | `data-slot="radio-group"`           | Full-width grid with `0.5rem` gap.                                                 |
| Interactive Item   | `data-slot="radio-group-item"`      | Circular 16px button with expanded pseudo-element pointer target and state styles. |
| Built-in indicator | `data-slot="radio-group-indicator"` | Always rendered wrapper; contains the icon only while checked.                     |

Bits UI additionally supplies dependency-owned hooks:

- Root: `data-radio-group-root`, `data-orientation`, `data-disabled`, and `data-readonly`.
- Item: `data-radio-group-item`, `data-value`, `data-orientation`, `data-state="checked|unchecked"`, `data-disabled`, and `data-readonly`.
- ARIA and native attributes include `role="radiogroup"`, `role="radio"`, `aria-checked`, disabled state, generated IDs, and roving `tabindex` values.

Item's checked styles use xvelte's `data-checked:` custom Tailwind variant, which recognizes Bits UI's `data-state="checked"`. Checked Items use primary border, background, foreground, and the fixed `CircleIcon`; invalid state uses destructive border and ring utilities. A checked invalid Item restores a primary border while keeping the invalid ring.

The Item's `::after` pseudo-element extends the pointer target by `0.75rem` horizontally and `0.5rem` vertically beyond the visible circle. Leave enough space between neighboring controls to avoid overlapping targets.

Root and Item classes are merged with `cn()`. The indicator and icon have no public class prop, but the stable indicator slot can be targeted from an Item class with a descendant selector. Preserve the local slots, focus ring, disabled state, checked state, and ARIA-invalid styling when customizing.

---

## Accessibility

Bits UI supplies radiogroup/radio roles, checked state, required, disabled and read-only state, roving focus, keyboard interaction, and form integration.

- Give Root an accessible group name through `aria-labelledby` connected to a visible question or through `aria-label`.
- Give every Item a visible associated label by matching its `id` with a native label's `for`. `aria-label` and `aria-labelledby` are available when visible labels are impossible.
- Use unique Item values and IDs. Duplicate values make checked state ambiguous; duplicate IDs break label association.
- Keep labels and any descriptions outside Item because the local Item API does not accept children.
- Use `name` when the selection must participate in native form submission, and pair `required` with a visible validation message.
- Use `disabled` for unavailable groups or options. Use `readonly` when the current choice should remain focusable and reviewable but cannot change.
- When validation fails, apply `aria-invalid="true"` to Root for group semantics and to Items when the local destructive visual treatment is desired. Connect explanatory text with `aria-describedby`.
- Do not use Radio Group for actions that execute immediately or for options where selecting zero or several values is meaningful.

Visible label text, not the circle icon, provides each radio's accessible name. Preserve the primitive-generated props when delegating Root through `child`.

---

## Localization

Radio Group contains no built-in human-readable copy and uses no localization message. Your app supplies and translates the group question, option labels, descriptions, validation errors, selection summaries, and related actions.

Item values, form names, orientation values, `data-state`, and other implementation attributes are technical identifiers and are not translated.

---

## Dependencies

### Packages

Install runtime dependencies first and development dependencies second:

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss
```

Implement against the stable Bits UI version installed by your project. See the [Bits UI Radio Group documentation](https://bits-ui.com/docs/components/radio-group) for the complete dependency-owned API.

### Component files

Copy the complete `src/lib/components/ui/radio-group` component folder:

- `radio-group-root.svelte`
- `radio-group-item.svelte`
- `index.ts`
- `README.md`

Radio Group requires no other xvelte component, hook, attachment, context module, localization message, shared style file, font, image, or external network service. The examples use native labels, so the separate Label component is optional; use it and follow its README when consistent label styling is desired.

### Shared utilities

Radio Group imports `cn` and `WithoutChildrenOrChild` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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
```

### Icons

Add the semantic icon export used by the built-in checked indicator to `src/lib/icons.ts`:

```ts
export { default as CircleIcon } from "@tabler/icons-svelte/icons/circle";
```

The export is backed by the installed `@tabler/icons-svelte` package. No other icon is required.

### Global styles

Load Tailwind CSS, configure the class-based dark variant, expose the checked-state variant, and map the semantic colors used by Item. The values below are xvelte's defaults and may be replaced with your own theme:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.577 0.245 27.325);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.704 0.191 22.216);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-destructive: var(--destructive);
	--color-input: var(--input);
	--color-ring: var(--ring);
}

@custom-variant data-checked {
	&:where([data-state="checked"]),
	&:where([data-checked]:not([data-checked="false"])) {
		@slot;
	}
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

No keyframe, `tw-animate-css` import, font, radius variable, or component-specific CSS variable is required.

---

## Credits

Radio Group is adapted from the [shadcn-svelte Radio Group](https://www.shadcn-svelte.com/docs/components/radio-group). Its implementation has been modified to follow xvelte's local indicator, icon, styling, type, and import conventions.

---

## File organization

| File                      | Responsibility                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `radio-group-root.svelte` | Bindable selection, group layout, form configuration, shared state, and Root DOM hook.          |
| `radio-group-item.svelte` | Primitive radio button, fixed indicator and icon, pointer target, state styling, and Item hook. |
| `index.ts`                | Public Root and Item components plus their exported props types.                                |
| `README.md`               | Composition, examples, API, interaction, styling, accessibility, dependencies, and credits.     |

The component's `index.ts` and exported types are the source of truth for the public API.

# Field

A composable form layout for labels, controls, descriptions, validation errors, related groups, and semantic fieldsets. It supports vertical, horizontal, and container-responsive arrangements, choice-card composition, invalid and disabled styling hooks, and single or multiple error messages.

Use Field to organize accessible form controls without coupling their values or validation to a particular form library. It supplies structure and presentation, but the app must connect labels, descriptions, errors, disabled state, and validation state to each control. Do not use it as a substitute for native form semantics or validation logic.

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
	import * as Field from "$lib/components/ui/field";
</script>
```

Field's `index.ts` exports `Field`, `Set`, `Legend`, `Group`, `Content`, `Label`, `Title`, `Description`, `Separator`, and `Error`. The main wrapper is therefore rendered as `Field.Field`, not `Field.Root`.

The same entry point exports `RootProps`, `FieldSetProps`, `LegendProps`, `GroupProps`, `ContentProps`, `LabelProps`, `TitleProps`, `DescriptionProps`, `SeparatorProps`, and `ErrorProps`, together with the `rootVariants` styling function.

## Anatomy

A single control normally uses Field, Label, the app's control, and optional Description and Error parts:

```svelte
<Field.Field>
	<Field.Label for="email">Email address</Field.Label>
	<input id="email" name="email" type="email" aria-describedby="email-description email-error" />
	<Field.Description id="email-description">Used for account notifications.</Field.Description>
	<Field.Error id="email-error">Enter a valid email address.</Field.Error>
</Field.Field>
```

Group stacks related Field instances. Set and Legend create a native fieldset and legend for a related set of controls. Content keeps a label/title and description together beside controls in horizontal layouts. Separator visually divides sections.

Field does not render an input, select, textarea, checkbox, radio, switch, or button. Compose it with native controls or the appropriate xvelte control component.

## Basic usage

```svelte
<script lang="ts">
	import * as Field from "$lib/components/ui/field";

	let username = $state("");
</script>

<Field.Field>
	<Field.Label for="profile-username">Username</Field.Label>
	<input
		id="profile-username"
		name="username"
		type="text"
		bind:value={username}
		aria-describedby="profile-username-description"
		class="h-8 rounded-lg border px-2.5"
	/>
	<Field.Description id="profile-username-description">Choose a unique name between 3 and 30 characters.</Field.Description>
</Field.Field>
```

`for` and `id` create the label relationship. `aria-describedby` associates helper text with the control; visual proximity alone does not create that relationship.

## Examples

### Validation and errors

Set invalid state on both the Field and the actual form control, then reference the error from the control:

```svelte
<script lang="ts">
	import * as Field from "$lib/components/ui/field";

	let email = $state("");
	let submitted = $state(false);

	let emailErrors = $derived(submitted && !email.includes("@") ? [{ message: "Enter a valid email address." }] : []);
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		submitted = true;
	}}
>
	<Field.Field data-invalid={emailErrors.length > 0}>
		<Field.Label for="contact-email">Email address</Field.Label>
		<input
			id="contact-email"
			name="email"
			type="email"
			bind:value={email}
			aria-invalid={emailErrors.length > 0}
			aria-describedby="contact-email-description contact-email-error"
		/>
		<Field.Description id="contact-email-description">We will send the receipt to this address.</Field.Description>
		<Field.Error id="contact-email-error" errors={emailErrors} />
	</Field.Field>

	<button type="submit">Continue</button>
</form>
```

`data-invalid` changes Field's text color only; it does not set `aria-invalid` on the control or connect Error automatically. Error renders `role="alert"` when it has content. For server-side validation or an already visible error, consider whether a live alert is necessary or whether a normal described message is less disruptive.

Pass custom children instead of `errors` when the error needs links or richer markup. Children take precedence over the array.

### Semantic fieldset and grouped fields

Use Set and Legend for controls that form one semantic question or section:

```svelte
<script lang="ts">
	import * as Field from "$lib/components/ui/field";

	let street = $state("");
	let city = $state("");
</script>

<Field.Set aria-describedby="delivery-description">
	<Field.Legend>Delivery address</Field.Legend>
	<Field.Description id="delivery-description">Enter the address where the order should be delivered.</Field.Description>

	<Field.Group>
		<Field.Field>
			<Field.Label for="delivery-street">Street address</Field.Label>
			<input id="delivery-street" name="street" bind:value={street} />
		</Field.Field>

		<Field.Field>
			<Field.Label for="delivery-city">City</Field.Label>
			<input id="delivery-city" name="city" bind:value={city} />
		</Field.Field>
	</Field.Group>
</Field.Set>
```

Keep Legend as the first meaningful child of Set. `variant="label"` changes Legend's typography to label size but does not stop it from being a native `legend`.

### Horizontal and responsive layouts

Content groups explanatory text so it can sit beside a control. Responsive orientation remains vertical until its containing Field.Group reaches Tailwind's `@md` container threshold:

```svelte
<script lang="ts">
	import * as Field from "$lib/components/ui/field";

	let notifications = $state(true);
</script>

<Field.Group>
	<Field.Field orientation="responsive">
		<Field.Content>
			<Field.Label for="account-notifications">Account notifications</Field.Label>
			<Field.Description id="account-notifications-description">Receive important security and billing updates.</Field.Description>
		</Field.Content>

		<input id="account-notifications" type="checkbox" bind:checked={notifications} aria-describedby="account-notifications-description" />
	</Field.Field>
</Field.Group>
```

`orientation="horizontal"` is horizontal at every width. `orientation="responsive"` needs a Field.Group ancestor because Group creates the named CSS container used by the responsive classes; without it, the Field stays vertical.

### Selectable choice card

Wrap a direct Field child in Label to activate the local card layout. Add the control's checked state as `data-checked` so Label can style the selected card:

```svelte
<script lang="ts">
	import * as Field from "$lib/components/ui/field";

	let plan = $state("monthly");
</script>

<Field.Group>
	<Field.Label for="plan-monthly">
		<Field.Field orientation="horizontal">
			<Field.Content>
				<Field.Title>Monthly</Field.Title>
				<Field.Description>Pay each month and cancel at any time.</Field.Description>
			</Field.Content>
			<input id="plan-monthly" type="radio" name="plan" value="monthly" bind:group={plan} data-checked={plan === "monthly"} />
		</Field.Field>
	</Field.Label>

	<Field.Label for="plan-yearly">
		<Field.Field orientation="horizontal">
			<Field.Content>
				<Field.Title>Yearly</Field.Title>
				<Field.Description>Pay once a year at a discounted rate.</Field.Description>
			</Field.Content>
			<input id="plan-yearly" type="radio" name="plan" value="yearly" bind:group={plan} data-checked={plan === "yearly"} />
		</Field.Field>
	</Field.Label>
</Field.Group>
```

Title is presentational text, not a native label. The outer Field.Label provides the control association in this pattern. xvelte Checkbox and Radio Group items already expose checked-state data attributes; native controls need an equivalent attribute when the selected-card styling is wanted.

### Sections and separators

Separator wraps the local Separator component and is horizontal by default:

```svelte
<Field.Group>
	<Field.Field>
		<Field.Title>Profile</Field.Title>
		<Field.Description>Public name and avatar settings.</Field.Description>
	</Field.Field>

	<Field.Separator decorative />

	<Field.Field>
		<Field.Title>Security</Field.Title>
		<Field.Description>Password and sign-in settings.</Field.Description>
	</Field.Field>
</Field.Group>
```

Use `decorative` when the line has no semantic meaning. Without it, Bits UI exposes the inner separator to assistive technology with separator semantics.

### Reusing the Field layout classes

The exported `rootVariants` function applies the same layout to app-owned markup:

```svelte
<script lang="ts">
	import { rootVariants } from "$lib/components/ui/field";
</script>

<section class={rootVariants({ orientation: "horizontal", class: "items-start" })}>
	<strong>Storage</strong>
	<span>12 GB used</span>
</section>
```

This reuses classes only. It does not add `role="group"`, `data-slot="field"`, `data-orientation`, or a bindable reference.

## Public API

Most parts are native elements and forward their compatible attributes and events. Their shared props are:

| Prop       | Type                      | Default     | xvelte behavior                                    |
| ---------- | ------------------------- | ----------- | -------------------------------------------------- |
| `ref`      | Element reference or null | `null`      | Bindable reference to the rendered public element. |
| `children` | `Snippet`                 | `undefined` | Renders app-provided content.                      |
| `class`    | `string`                  | `undefined` | Merged after local classes through `cn`.           |

### `Field.Field`

Type: `RootProps`, based on native `div` attributes with one local layout option.

| Prop          | Type                                         | Default      | xvelte behavior                                                           |
| ------------- | -------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `orientation` | `"vertical" \| "horizontal" \| "responsive"` | `"vertical"` | Selects the field layout and writes the same value to `data-orientation`. |
| `ref`         | `HTMLDivElement \| null`                     | `null`       | Bindable root `div` reference.                                            |
| `class`       | `string`                                     | `undefined`  | Merged after the selected `rootVariants` classes.                         |

Field renders a native `div` with `role="group"`, `data-slot="field"`, and the `group/field` Tailwind group name. Remaining native `div` attributes are forwarded.

Orientation behavior:

- `vertical` uses a column and makes direct children full-width except `.sr-only`.
- `horizontal` uses a centered row, lets a direct Label flex, and aligns to the start when Content is present.
- `responsive` begins with the vertical rules and switches to the horizontal rules at the named Field.Group container's `@md` threshold.

Set `data-invalid="true"` to activate the local danger text color and `data-disabled="true"` to activate descendant Field Label and Title opacity. These attributes are styling hooks only: Field does not validate values, disable descendants, or set ARIA state.

### `Field.Set`

Type: `FieldSetProps`, based on native `fieldset` attributes.

Set renders a native `fieldset` with `data-slot="field-set"`, a vertical layout, and `1rem` gaps. It reduces the gap when a direct child exposes `data-slot="checkbox-group"` or `data-slot="radio-group"`. Native attributes such as `disabled`, `form`, and `name` are forwarded; native fieldset behavior determines how `disabled` affects descendant controls.

Its bindable `ref` is `HTMLFieldSetElement | null`.

### `Field.Legend`

Type: `LegendProps`, based on native `legend` attributes.

| Prop      | Type                        | Default    | xvelte behavior                                                       |
| --------- | --------------------------- | ---------- | --------------------------------------------------------------------- |
| `variant` | `"legend" \| "label"`       | `"legend"` | Writes `data-variant`; uses base-size or small label-size typography. |
| `ref`     | `HTMLLegendElement \| null` | `null`     | Bindable native legend reference.                                     |

Legend adds `data-slot="field-legend"`, bottom margin, and medium font weight. A Description placed immediately after `variant="legend"` receives a local negative top margin. Both variants remain native legends with the same fieldset semantics.

### `Field.Group`

Type: `GroupProps`, based on native `div` attributes.

Group renders `data-slot="field-group"`, `group/field-group`, and the named `@container/field-group` container. It is a full-width vertical stack with `1.25rem` gaps. Direct nested Field.Group children use `1rem` gaps. Overriding its slot to `checkbox-group` activates a local `0.75rem` gap, but changing the stable slot is generally not recommended; dedicated choice-group components already provide their own slots.

Its bindable `ref` is `HTMLDivElement | null`. Group has no local `variant` prop, but native `data-variant="outline"` can activate the matching Separator spacing hook.

### `Field.Content`

Type: `ContentProps`, based on native `div` attributes.

Content renders `data-slot="field-content"` and `group/field-content`. It is a flexible vertical column with `0.125rem` gaps and compact line height. In horizontal and responsive Fields, its presence changes alignment and applies a one-pixel top adjustment to direct checkbox or radio roles placed beside it.

Its bindable `ref` is `HTMLDivElement | null`.

### `Field.Label`

Type: `LabelProps`, matching the required local Label component's `RootProps`.

Label normally renders a native `label`, forwards `for`, child delegation, compatible label attributes, and bindable `ref`, and adds `data-slot="field-label"`. Its local styles provide compact label layout and react to Field's disabled state.

When Label has a direct Field child, it becomes a full-width vertical choice card with a border, `rounded-lg`, and padding on that child. A checked descendant changes the card's border and background through `has-data-checked`, including dark-mode adaptations. These card styles depend on stable descendant slots and checked-state attributes.

See the [Bits UI Label API](https://www.bits-ui.com/docs/components/label#api-reference) for the inherited Label behavior.

### `Field.Title`

Type: `TitleProps`, based on native `div` attributes.

Title is a presentational `div` for choice-card or non-control headings. It adds medium small text and disabled-state opacity. Its stable slot is intentionally `data-slot="field-label"`, the same value used by Field.Label; it does not render a native `label` and has no `for` behavior.

Its bindable `ref` is `HTMLDivElement | null`. Use Label when text must label a control, and Title only when another element supplies the accessible relationship.

### `Field.Description`

Type: `DescriptionProps`, based on native paragraph attributes.

Description renders a `p` with `data-slot="field-description"`, relaxed small text, normal weight, left alignment, and muted foreground. Direct anchor children receive underline and primary hover styles. Horizontal Fields balance the text. Its position near the end of a container and placement immediately after a legend adjust local negative margins.

Its bindable `ref` is `HTMLParagraphElement | null`. Description does not associate itself with a control; add an `id` and reference it from `aria-describedby`.

### `Field.Separator`

Type: `SeparatorProps`.

| Prop          | Type                         | Default        | xvelte behavior                                                                |
| ------------- | ---------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Passed to the inner Separator component.                                       |
| `decorative`  | `boolean`                    | `false`        | Passed to the inner Separator; hides it from assistive technology when `true`. |
| `ref`         | `HTMLDivElement \| null`     | `null`         | Bindable reference to the outer positioning wrapper, not the inner separator.  |
| `class`       | `string`                     | `undefined`    | Merged on the outer wrapper; it does not style the inner line directly.        |

Separator renders an outer native `div` with `data-slot="field-separator"`, relative positioning, negative vertical margin, fixed `1.25rem` height, and an absolutely centered local Separator.Root. Remaining native attributes apply to the outer wrapper. The inner line has its own default `data-slot="separator"`. Although the native outer type accepts a `children` snippet, this wrapper does not render caller-provided children.

### `Field.Error`

Type: `ErrorProps`, based on native `div` attributes with custom content options.

| Prop       | Type                          | Default     | xvelte behavior                                                                 |
| ---------- | ----------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `children` | `Snippet`                     | `undefined` | Custom error content; takes precedence over `errors`.                           |
| `errors`   | `Array<{ message?: string }>` | `undefined` | Renders one message directly or several meaningful messages as a bulleted list. |
| `ref`      | `HTMLDivElement \| null`      | `null`      | Bindable only while the conditional error wrapper is rendered.                  |
| `class`    | `string`                      | `undefined` | Merged after small danger-text styles.                                          |

Error renders nothing for no content, an empty array, or one error without a message. One message is rendered directly. More than one array entry creates a list and omits entries without a message; because rendering is based on the original array length, an array containing several blank errors can still produce an empty alert wrapper.

When rendered, Error creates a `div` with `role="alert"` and `data-slot="field-error"`. Native attributes are spread after those values and can override them. Error does not set an ID, `aria-describedby`, `aria-errormessage`, `aria-invalid`, or Field's `data-invalid`; the app must connect those pieces.

### `rootVariants`

`rootVariants` is the Tailwind Variants function used by Field.Field. It accepts `orientation` and an optional `class` value and returns the merged class string:

```ts
const className = rootVariants({
	orientation: "responsive",
	class: "gap-4"
});
```

The underlying source declares a `RootOrientations` helper type, but the component's `index.ts` does not currently re-export it. Use `RootProps["orientation"]` when a public orientation type is needed. The component's `index.ts`, exported types, and `rootVariants` are the source of truth for the public API.

## Styling and DOM contract

Field uses Tailwind utilities, semantic theme tokens, named groups, a named container, stable slot attributes, and app-supplied invalid, disabled, and checked attributes. It exposes no component-specific CSS variables or animations.

| Part              | Stable xvelte hook                                                       |
| ----------------- | ------------------------------------------------------------------------ |
| `Field`           | `data-slot="field"`, `data-orientation`, `role="group"`, `group/field`   |
| `Set`             | `data-slot="field-set"`                                                  |
| `Legend`          | `data-slot="field-legend"`, `data-variant="legend"` or `"label"`         |
| `Group`           | `data-slot="field-group"`, `group/field-group`, `@container/field-group` |
| `Content`         | `data-slot="field-content"`, `group/field-content`                       |
| `Label`           | `data-slot="field-label"`, `group/field-label`, `peer/field-label`       |
| `Title`           | `data-slot="field-label"`                                                |
| `Description`     | `data-slot="field-description"`                                          |
| `Separator` outer | `data-slot="field-separator"`                                            |
| Separator inner   | `data-slot="separator"`, dependency-provided role/orientation attributes |
| `Error`           | `data-slot="field-error"`, `role="alert"` only while rendered            |

Important state contracts:

- `data-invalid="true"` belongs on Field for danger text styling; `aria-invalid="true"` belongs on the actual invalid control.
- `data-disabled="true"` on Field dims descendant Label and Title, but each form control still needs its real disabled state.
- A checked descendant with the project's `data-checked` contract activates Label's choice-card colors.
- `orientation="responsive"` depends on the named container created by an ancestor Field.Group.
- `data-variant="outline"` on Group changes Separator's bottom spacing even though Group has no dedicated variant prop.

Classes supplied to every part are merged after local classes through `cn`. Most native props are spread after local slot/state attributes and can override them; preserve the documented hooks when styling or composing fields.

## Accessibility

Field supplies some native structure but does not automatically create a complete accessible relationship between controls and supporting text.

App responsibilities:

- Match each Label's `for` with the labeled control's unique `id`, or use a valid wrapping-label composition.
- Give descriptions and errors stable IDs and reference them from the control's `aria-describedby` or `aria-errormessage` as appropriate.
- Set `aria-invalid="true"` on invalid controls and `data-invalid="true"` on Field when the local danger styling is wanted.
- Disable the actual controls. `data-disabled` changes descendant presentation only; Set's native `disabled` prop does disable most descendant form controls according to browser behavior.
- Use Set and Legend for semantically related checkbox or radio questions. Keep Legend as the fieldset's first meaningful child.
- Use Title only for presentational headings. It shares Label's slot for layout but does not label a control.
- Use `decorative` on Separator when it is purely visual; otherwise its inner Bits UI separator remains exposed semantically.
- Avoid placing unrelated interactive controls inside Label. Choice cards should contain only the associated choice and its explanatory content.
- Keep DOM order logical in horizontal layouts because CSS changes presentation but not reading or focus order.
- Avoid duplicate live announcements. Error uses `role="alert"` whenever rendered, so introduce it deliberately and associate it with the invalid control.

Field.Field sets `role="group"` by default. When it contains several controls that need a shared accessible name, prefer Set/Legend or provide an explicit `aria-label`/`aria-labelledby`. The component adds no keyboard behavior; controls retain their native or component-provided interaction.

## Localization

Field contains no built-in human-readable copy and does not use Paraglide messages. The app supplies and translates labels, legends, descriptions, errors, button text, placeholders, selection summaries, and accessible names.

Horizontal and responsive layouts may need more width for translated text. Content can flex, Description uses normal wrapping and text balancing in horizontal fields, and Group uses container queries rather than the viewport. Test long translations at the actual container widths and override orientation, gaps, or widths when needed.

The technical values of `orientation`, `variant`, `data-slot`, `data-invalid`, `data-disabled`, and `data-checked` are not translated.

## Dependencies

Field expects a Svelte 5 project using Tailwind CSS 4. It requires the local Label and Separator components, Bits UI behind those components, Tailwind Variants, and the shared class utilities. Install every package requirement in one of these command groups:

```sh
# bun
bun add bits-ui clsx tailwind-merge tailwind-variants
bun add -D tailwindcss

# npm
npm install bits-ui clsx tailwind-merge tailwind-variants
npm install -D tailwindcss

# pnpm
pnpm add bits-ui clsx tailwind-merge tailwind-variants
pnpm add -D tailwindcss
```

### Required UI components

Copy the complete Label and Separator components and follow each component's README to install it and understand its API:

- `src/lib/components/ui/label`: `label-root.svelte`, `index.ts`
- `src/lib/components/ui/separator`: `separator-root.svelte`, `index.ts`

Field.Label imports Label through its public `index.ts`. Field.Separator imports Separator the same way and places it inside an additional positioning wrapper. No form-control component is required by Field itself; inputs, textareas, selects, checkboxes, radio groups, switches, and buttons are app-selected compositions with their own README guides.

### Shared utilities

Field and its required components import `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block includes `clsx` and `tailwind-merge`, which `cn` imports.

### Global CSS

The global stylesheet must import Tailwind, define the dark and checked-state variants used by Field.Label, apply the shared border color, and expose the semantic colors and radius used by Field and its required components. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--primary: oklch(0.841 0.238 128.85);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--primary: oklch(0.768 0.233 130.85);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-primary: var(--primary);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--radius-lg: var(--radius);
}

@layer base {
	* {
		@apply border-border;
	}
}

@custom-variant data-checked {
	&:where([data-state="checked"]),
	&:where([data-checked]:not([data-checked="false"])) {
		@slot;
	}
}
```

No animation package, keyframe, icon style, shared component stylesheet, or mode-management package is required. The app is responsible for applying its `.dark` class when dark mode is supported.

### Icons

Field, Label, and Separator import no icons. No icon package or `$lib/icons` export is required.

### Other requirements

Field requires no hook, attachment, context file, localization message, Paraglide setup, external asset, or browser API. Validation state, form submission, value bindings, IDs, ARIA relationships, and translated copy belong to the app or its chosen form library.

## Credits

Field is adapted from [shadcn-svelte's Field component](https://www.shadcn-svelte.com/docs/components/field). Local xvelte exports, structure, responsive behavior, validation contract, dependencies, styling, and limitations documented here take precedence.

## File organization

| File                       | Responsibility                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `field-root.svelte`        | Main role-group wrapper, orientation variants, invalid styling, responsive container-query layout, and exported variants. |
| `field-set.svelte`         | Native fieldset and spacing for ordinary or choice groups.                                                                |
| `field-legend.svelte`      | Native legend with full-size and label-size typography variants.                                                          |
| `field-group.svelte`       | Named container, field stacking, nested-group spacing, and choice-group spacing hooks.                                    |
| `field-content.svelte`     | Flexible compact column for labels/titles and descriptions.                                                               |
| `field-label.svelte`       | Local Label composition, disabled styling, and selectable choice-card layout.                                             |
| `field-title.svelte`       | Presentational title using the shared field-label slot and disabled styling.                                              |
| `field-description.svelte` | Native paragraph, helper-text styling, link treatment, and position-aware spacing.                                        |
| `field-separator.svelte`   | Outer positioning wrapper and inner local Separator composition.                                                          |
| `field-error.svelte`       | Conditional alert, custom content, single error, or filtered multiple-error list.                                         |
| `index.ts`                 | Public components, props types, and `rootVariants` export.                                                                |
| `README.md`                | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits.                |

Treat `index.ts`, its exported types, and `rootVariants` as the source of truth for the public API.

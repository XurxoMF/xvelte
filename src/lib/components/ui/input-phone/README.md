# Input Phone

A composable international telephone field with a searchable country selector, SVG flags, localized country names, live parsing, E.164-compatible values, validation, and blur formatting. Root owns the shared phone state while Input and CountrySelector can be ordered and laid out freely.

Use Input Phone when a form must accept numbers from multiple countries. Prefer a normal Input for local-only numbers, extensions without a main number, or values that must remain completely unparsed.

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

Import all public parts through the component `index.ts`:

```svelte
<script lang="ts">
	import * as InputPhone from "$lib/components/ui/input-phone";
</script>
```

The component exports:

- Components: `Root`, `Input`, and `CountrySelector`.
- Props types: `RootProps`, `InputProps`, and `CountrySelectorProps`.
- State types: `InputPhoneCountry`, `InputPhoneDetails`, `InputPhoneValidationError`, and `CountryCode`.

The context state and its flag loader remain internal.

---

## Anatomy

Root provides context and renders its children without fixing their order or visual container:

```svelte
<InputPhone.Root>
	<InputPhone.CountrySelector />
	<InputPhone.Input />
</InputPhone.Root>
```

The standard joined composition places both controls inside Button Group:

```svelte
<InputPhone.Root>
	<ButtonGroup.Root>
		<InputPhone.CountrySelector />
		<InputPhone.Input />
	</ButtonGroup.Root>
</InputPhone.Root>
```

`Input` and `CountrySelector` must be descendants of the same `Root`. Root owns `value`, `valid`, `country`, and `details`, so neither child exposes a competing value or country binding.

---

## Basic usage

```svelte
<script lang="ts">
	import * as ButtonGroup from "$lib/components/ui/button-group";
	import * as InputPhone from "$lib/components/ui/input-phone";

	let value = $state("");
	let valid = $state(true);
</script>

<div class="grid max-w-sm gap-1.5">
	<label for="contact-phone">Phone number</label>

	<InputPhone.Root defaultCountry="ES" bind:value bind:valid required>
		<ButtonGroup.Root class="w-full">
			<InputPhone.CountrySelector />
			<InputPhone.Input id="contact-phone" name="phone" placeholder="Phone number" aria-describedby="contact-phone-help" />
		</ButtonGroup.Root>
	</InputPhone.Root>

	<p id="contact-phone-help" class="text-sm text-muted-foreground">Choose a country and enter the complete phone number.</p>

	{#if !valid}
		<p class="text-sm text-destructive" role="alert">Enter a valid phone number.</p>
	{/if}
</div>
```

`value` is normalized to an E.164-shaped string as someone types. Check `valid` before storing or submitting it because incomplete numbers may still produce a normalized partial value.

---

## Examples

### Control country and parsed details

```svelte
<script lang="ts">
	import type { CountryCode, InputPhoneDetails } from "$lib/components/ui/input-phone";

	import * as InputPhone from "$lib/components/ui/input-phone";

	let country = $state<CountryCode | null>("PT");
	let details = $state<InputPhoneDetails | null>(null);
</script>

<InputPhone.Root bind:country bind:details>
	<InputPhone.CountrySelector />
	<InputPhone.Input aria-label="International phone number" />
</InputPhone.Root>

{#if details}
	<p>{details.formatInternational ?? details.raw}</p>
{/if}
```

Typing an international prefix may update `country` when the detected country is allowed. Selecting another country reinterprets the current national number and returns focus to Input.

### Restrict the country list

`allowedCountries` filters the selector and validation together:

```svelte
<InputPhone.Root defaultCountry="ES" allowedCountries={["ES", "PT", "FR"]}>
	<InputPhone.CountrySelector />
	<InputPhone.Input aria-label="European phone number" />
</InputPhone.Root>
```

An international number detected outside this list receives the `COUNTRY_NOT_ALLOWED` error and `valid` becomes false.

### Put preferred countries first

Country metadata is localized before `order` runs:

```svelte
<script lang="ts">
	import type { InputPhoneCountry } from "$lib/components/ui/input-phone";

	import * as InputPhone from "$lib/components/ui/input-phone";

	const priority = new Map([
		["ES", 0],
		["PT", 1],
		["FR", 2]
	]);

	function orderCountries(a: InputPhoneCountry, b: InputPhoneCountry) {
		const aPriority = priority.get(a.code) ?? Number.MAX_SAFE_INTEGER;
		const bPriority = priority.get(b.code) ?? Number.MAX_SAFE_INTEGER;

		return aPriority - bPriority || a.name.localeCompare(b.name);
	}
</script>

<InputPhone.Root locale="gl" defaultCountry="ES" order={orderCountries}>
	<InputPhone.CountrySelector />
	<InputPhone.Input aria-label="Teléfono" />
</InputPhone.Root>
```

Without `order`, names are sorted with `localeCompare` using the Root locale.

### Separate layout

Root defaults to `display: contents`, so the children can participate directly in an app-owned grid or flex layout:

```svelte
<InputPhone.Root defaultCountry="ES" class="grid grid-cols-[10rem_1fr] gap-2">
	<InputPhone.CountrySelector />
	<InputPhone.Input aria-label="Phone number" />
</InputPhone.Root>
```

Changing Root `class` from `contents` to `grid` gives its wrapper a layout box. The parts can also be nested in another component while remaining below Root.

### Observe native Input events

Input keeps native event handlers even though its value is managed by Root:

```svelte
<script lang="ts">
	import * as InputPhone from "$lib/components/ui/input-phone";

	let value = $state("");
</script>

<InputPhone.Root bind:value>
	<InputPhone.Input
		aria-label="Phone number"
		oninput={(event) => {
			console.info("Visible value", event.currentTarget.value);
		}}
		onchange={(event) => {
			console.info("Committed native change", event.currentTarget.value);
		}}
	/>
	<InputPhone.CountrySelector
		onchange={(country) => {
			console.info("Selected country", country);
		}}
	/>
</InputPhone.Root>
```

Root state updates before the custom Input `oninput` callback. Blur formatting runs before the custom `onblur` callback. The native `onchange` handler is forwarded unchanged.

---

## Public API

The component `index.ts` and its exported types are the source of truth.

### `Root`

`RootProps` extends native `div` attributes with shared phone state:

| Prop               | Type                                                     | Default                 | Behavior                                                                                     |
| ------------------ | -------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| `value`            | `string`                                                 | `""`                    | Bindable normalized E.164-compatible value. It may remain incomplete while `valid` is false. |
| `valid`            | `boolean`                                                | `true` initially        | Bindable overall validity. Empty optional input is valid; empty required input is invalid.   |
| `country`          | `CountryCode \| null`                                    | `defaultCountry`        | Bindable selected or detected country.                                                       |
| `defaultCountry`   | `CountryCode \| null`                                    | `null`                  | Initial country when `country` is not supplied.                                              |
| `details`          | `InputPhoneDetails \| null`                              | `null`                  | Bindable live parse, formatting, possibility, validity, and error information.               |
| `allowedCountries` | `CountryCode[]`                                          | All supported countries | Filters both CountrySelector entries and accepted detected countries.                        |
| `locale`           | `string`                                                 | `"en"`                  | Locale used by `Intl.DisplayNames` and default country sorting.                              |
| `order`            | `(a: InputPhoneCountry, b: InputPhoneCountry) => number` | Localized name order    | Optional final comparator.                                                                   |
| `required`         | `boolean`                                                | `false`                 | Makes empty state invalid and applies native `required` to Input.                            |
| `disabled`         | `boolean`                                                | `false`                 | Disables Input and CountrySelector.                                                          |
| `readonly`         | `boolean`                                                | `false`                 | Makes Input read-only while leaving CountrySelector interactive.                             |
| `children`         | `Snippet`                                                | —                       | Renders public parts and app-owned layout below the context provider.                        |
| `ref`              | `HTMLDivElement \| null`                                 | `null`                  | Bindable wrapper reference.                                                                  |
| `class`            | `string`                                                 | —                       | Merged after `contents`; another display class creates a wrapper box.                        |

Root renders a `div` with `data-slot="input-phone"` and forwards remaining native `div` attributes. Preserve that slot when passing attributes.

### `Input`

`InputProps` starts from the local Input `RootProps` but deliberately omits:

- `value`, `type`, and `files`.
- `disabled`, `readonly`, and `required`.
- `aria-invalid` and `data-slot`.

Root owns those properties. Input always renders the local Input component with `type="tel"` and the context-controlled value.

| Prop           | Type                       | Default | Behavior                                                                          |
| -------------- | -------------------------- | ------- | --------------------------------------------------------------------------------- |
| `ref`          | `HTMLInputElement \| null` | `null`  | Bindable native input reference, also registered with Root for focus restoration. |
| `autocomplete` | Native input value         | `"tel"` | Forwarded autocomplete hint.                                                      |
| `inputmode`    | Native input value         | `"tel"` | Forwarded virtual-keyboard hint.                                                  |
| `class`        | `string`                   | —       | Forwarded to the local Input component and merged with its standard styles.       |
| `oninput`      | Native input handler       | —       | Runs after Root parses and updates its bindings.                                  |
| `onblur`       | Native focus handler       | —       | Runs after Root formats the visible value.                                        |
| `onchange`     | Native change handler      | —       | Forwarded unchanged for observing native committed changes.                       |

All other supported native input attributes and handlers are forwarded, including `id`, `name`, `placeholder`, `aria-label`, `aria-describedby`, `maxlength`, `pattern`, `onfocus`, `onkeydown`, and form attributes.

Input does not expose `bind:value`. Bind `value` on Root and use native callbacks only for observation or additional app behavior.

### `CountrySelector`

`CountrySelectorProps` is based on Combobox Trigger props but omits `children` and `disabled`. Root supplies selection and disabled state.

| Prop                | Type                             | Default                   | Behavior                                 |
| ------------------- | -------------------------------- | ------------------------- | ---------------------------------------- |
| `searchPlaceholder` | `string`                         | `"Search..."`             | Country-search placeholder.              |
| `emptyText`         | `string`                         | `"No country found."`     | Empty result content.                    |
| `contentClass`      | `string`                         | —                         | Merged onto the Combobox popover.        |
| `class`             | `string`                         | —                         | Merged onto the Combobox trigger.        |
| `size`              | `"sm" \| "default"`              | `"default"`               | Inherited Combobox trigger size.         |
| `aria-label`        | `string`                         | Generated localized label | Overrides the accessible selector label. |
| `onchange`          | `(country: CountryCode) => void` | —                         | Runs after Root selects a country.       |

Remaining supported Combobox Trigger attributes and handlers are forwarded. The selector does not expose `value`, `country`, `bind:value`, custom children, or its own disabled state. Bind `country` or set `disabled` on Root.

The selected trigger displays its flag and calling code. The popup searches across localized name, ISO code, and calling code, and every result displays all three.

### `InputPhoneDetails`

| Field                 | Type                                | Meaning                                                 |
| --------------------- | ----------------------------------- | ------------------------------------------------------- |
| `raw`                 | `string`                            | Visible text used for the latest analysis.              |
| `e164`                | `string \| null`                    | Normalized number or normalized partial value.          |
| `country`             | `CountryCode \| null`               | Selected or detected country.                           |
| `callingCode`         | `string \| null`                    | International calling code without `+`.                 |
| `nationalNumber`      | `string \| null`                    | Parsed national significant number.                     |
| `formatNational`      | `string \| null`                    | National display format when available.                 |
| `formatInternational` | `string \| null`                    | International display format when available.            |
| `uri`                 | `string \| null`                    | `tel:` URI when available.                              |
| `possible`            | `boolean`                           | Whether the number length and structure are possible.   |
| `valid`               | `boolean`                           | Whether the number is valid and its country is allowed. |
| `error`               | `InputPhoneValidationError \| null` | Length, required, country, or generic validation error. |

`InputPhoneValidationError` includes libphonenumber-js length errors plus `REQUIRED`, `COUNTRY_NOT_ALLOWED`, and `INVALID`.

See the [libphonenumber-js documentation](https://gitlab.com/catamphetamine/libphonenumber-js) for dependency-owned parsing and validation behavior.

---

## Styling and DOM contract

| Part              | Element                 | Stable hooks                                                        |
| ----------------- | ----------------------- | ------------------------------------------------------------------- |
| `Root`            | `div`                   | `data-slot="input-phone"`                                           |
| `Input`           | native `input`          | `data-slot="input"`, `data-input-phone-input`                       |
| `CountrySelector` | Combobox trigger button | `data-slot="combobox-trigger"`, `data-input-phone-country-selector` |
| Flag              | `span`                  | `data-slot="input-phone-flag"`                                      |

Root uses `contents` by default and therefore has no layout box. A caller display class such as `flex` or `grid` overrides it through `cn()`.

Input reuses the complete local Input styling. As a direct Button Group child, its slot lets Button Group join its border and radii to adjacent controls.

CountrySelector reuses the complete Combobox trigger, content, filtering, item, and state styling. Its trigger keeps an automatic width; Button Group handles connected borders and radii when the selector and Input are direct children.

Flags are fixed 3:2 SVGs. The first flag request lazily imports and caches the `country-flag-icons/string/3x2` collection; no flag network request occurs at interaction time.

---

## Accessibility

- Input is a native `type="tel"` control and forwards `id`, ARIA attributes, form metadata, and native events. Associate it with a persistent visible label.
- Input defaults to `autocomplete="tel"` and `inputmode="tel"`. Override these only when a more specific native telephone autocomplete token is appropriate.
- CountrySelector is a Combobox button with a localized accessible name. It exposes popup state and uses the required Popover and Command keyboard behavior.
- The selector popup supports searching by country name, ISO code, and calling code. Each result includes visible text in addition to its decorative flag.
- Flag wrappers use `aria-hidden="true"`. A flag is never the only country identifier.
- `aria-invalid` is controlled from Root validity and applied to Input after non-empty interaction or immediately when required.
- Selecting a country closes the popup and moves focus to Input after the Combobox focus restoration completes.
- `disabled` affects both interactive parts. `readonly` affects Input only, so changing country remains possible by design.
- Connect validation help with `aria-describedby` and render text for `details.error` or app-owned validation. Do not rely on border color alone.

Keep Input and CountrySelector in a logical DOM order even when CSS changes their visual order.

---

## Localization

Input Phone uses these Paraglide messages from `messages/en.json`:

| Message ID            | English value                                          | Used by                            |
| --------------------- | ------------------------------------------------------ | ---------------------------------- |
| `harbor_wren_pause`   | `Search...`                                            | Default country-search placeholder |
| `kind_badger_country` | `No country found.`                                    | Empty country search               |
| `mellow_ibis_country` | `Select country`                                       | Trigger label without a selection  |
| `nimble_lynx_country` | `Change country, currently {country} (+{callingCode})` | Trigger label with a selection     |

`locale` controls country names through `Intl.DisplayNames`; it does not select the Paraglide locale. The app supplies and translates Input placeholders, visible field labels, instructions, validation messages, and value summaries.

`searchPlaceholder`, `emptyText`, and `aria-label` override the corresponding built-in selector copy.

---

## Dependencies

### Packages

Install runtime dependencies first and development dependencies second:

```sh
# Bun
bun add libphonenumber-js country-flag-icons bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss tw-animate-css

# npm
npm install libphonenumber-js country-flag-icons bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss tw-animate-css

# pnpm
pnpm add libphonenumber-js country-flag-icons bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss tw-animate-css
```

Input Phone imports the `libphonenumber-js/min` metadata build. It does not depend on `svelte-tel-input`.

### Required UI components

Copy these complete xvelte components and follow their README guides:

- `src/lib/components/ui/input`: `input-root.svelte`, `index.ts`, and `README.md`.
- `src/lib/components/ui/combobox`: every Svelte file, `combobox-context.svelte.ts`, `index.ts`, and `README.md`.
- `src/lib/components/ui/button-group`: every Svelte file, `index.ts`, and `README.md`.

Follow the Combobox and Button Group README guides to copy and configure their own required components. Button Group is needed for the standard joined layout, but Root also supports app-owned layouts without it.

No xvelte hook, attachment, additional context file outside this component folder, font, image file, or external network service is required.

### Shared utilities

Input Phone and its required components use these `$lib/utils` exports:

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

### Icons

Add the semantic icons required by Combobox and its complete dependencies to `src/lib/icons.ts`:

```ts
export { default as CheckIcon } from "@tabler/icons-svelte/icons/check";
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
export { default as SearchIcon } from "@tabler/icons-svelte/icons/search";
export { default as SelectorIcon } from "@tabler/icons-svelte/icons/selector";
```

Input Phone adds no new semantic icon alias for flags; `country-flag-icons` supplies their SVG markup.

### Global styles

The required Input and Combobox components need Tailwind, animation utilities, state variants, hidden scrollbars, and the following semantic theme values. Colors and radii may change while names and mappings remain:

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
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--accent: oklch(0.841 0.238 128.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.577 0.245 27.325);
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
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--accent: oklch(0.768 0.233 130.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--destructive: oklch(0.704 0.191 22.216);
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
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-sm: calc(var(--radius) * 0.6);
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

@custom-variant data-selected {
	&:where([data-selected]) {
		@slot;
	}
}

@custom-variant data-disabled {
	&:where([data-disabled="true"]),
	&:where([data-disabled]:not([data-disabled="false"])) {
		@slot;
	}
}

@utility no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}
```

No `svelte-tel-input` stylesheet, Input Phone keyframe, or component-specific CSS variable is required.

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the four entries listed in [Localization](#localization) to `messages/en.json`. Their exact keys and values are already shown there and are not duplicated here.

---

## Credits

The original visual direction comes from the [shadcn-svelte-extras Phone Input component](https://shadcn-svelte-extras.com/docs/components/phone-input). The composable Root/context API and direct libphonenumber-js integration are local xvelte adaptations.

---

## File organization

| File                                  | Responsibility                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `input-phone-root.svelte`             | Public Root bindings, localized country derivation, context setup, and neutral wrapper.        |
| `input-phone-input.svelte`            | Context-controlled native telephone Input and composed native events.                          |
| `input-phone-country-selector.svelte` | Searchable Combobox, inline flag rendering, country metadata, selection, and callbacks.        |
| `input-phone-context.svelte.ts`       | Shared state, parsing, validation, country data, focus behavior, and lazy cached flag loading. |
| `index.ts`                            | Public components and exported props/state types.                                              |
| `README.md`                           | Composition, examples, API, styling, accessibility, localization, dependencies, and credits.   |

The component `index.ts` and its exported types are the source of truth for the public API.

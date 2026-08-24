# Date Strip

A compact, paginated row of dates for choosing one day from a short visible range. It starts at the current locale's week boundary, displays five dates by default, moves backward or forward by one complete visible range, supports controlled selection, and lets the app disable individual dates.

Use Date Strip when nearby dates are the main choice and a full calendar would be unnecessarily large. Do not use it when people need to browse distant dates, enter a date directly, or understand selected state through assistive technology.

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

Import both parts from the component's public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as DateStrip from "$lib/components/ui/date-strip";
</script>
```

Date Strip's `index.ts` exports `Root`, `Item`, `RootProps`, and `ItemProps`.

---

## Anatomy

`Root` requires a children snippet. It calls the snippet once for each displayed date, and the app normally renders one Item for every date:

```svelte
<DateStrip.Root>
	{#snippet children({ date })}
		<DateStrip.Item {date} />
	{/snippet}
</DateStrip.Root>
```

Root renders a previous-page button, the date row, and a next-page button. Item must render below Root because it reads selection, disabled-date, and animation state from the component's internal context.

---

## Basic usage

```svelte
<script lang="ts">
	import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

	import * as DateStrip from "$lib/components/ui/date-strip";

	let selectedDate = $state<DateValue>(today(getLocalTimeZone()));
</script>

<DateStrip.Root bind:value={selectedDate}>
	{#snippet children({ date })}
		<DateStrip.Item {date} />
	{/snippet}
</DateStrip.Root>

<p class="text-sm">Selected date: {selectedDate.toString()}</p>
```

The selected value is bindable. Selecting an enabled Item updates the binding; navigating changes only the visible range and does not change the selected date.

---

## Examples

### Visible range and change callback

```svelte
<script lang="ts">
	import type { DateValue } from "@internationalized/date";

	import * as DateStrip from "$lib/components/ui/date-strip";

	function handleDateChange(date: DateValue) {
		console.info("Selected date", date.toString());
	}
</script>

<DateStrip.Root daysToShow={7} onDateChange={handleDateChange}>
	{#snippet children({ date })}
		<DateStrip.Item {date} />
	{/snippet}
</DateStrip.Root>
```

`daysToShow` controls both the number of rendered dates and the number of days moved by each navigation button. Pass a positive integer; the component does not validate this prop.

### Disabled dates

```svelte
<script lang="ts">
	import { getLocalTimeZone, type DateValue } from "@internationalized/date";

	import * as DateStrip from "$lib/components/ui/date-strip";

	const timeZone = getLocalTimeZone();

	function isWeekend(date: DateValue) {
		const day = date.toDate(timeZone).getDay();
		return day === 0 || day === 6;
	}
</script>

<DateStrip.Root isDateDisabled={isWeekend}>
	{#snippet children({ date })}
		<DateStrip.Item {date} />
	{/snippet}
</DateStrip.Root>
```

Disabled Items use the native button `disabled` attribute, cannot update the value, and receive Button's disabled opacity and pointer-event styles.

### Initial selection outside the visible range

```svelte
<script lang="ts">
	import { CalendarDate, type DateValue } from "@internationalized/date";

	import * as DateStrip from "$lib/components/ui/date-strip";

	let selectedDate = $state<DateValue>(new CalendarDate(2030, 6, 18));
</script>

<DateStrip.Root bind:value={selectedDate}>
	{#snippet children({ date })}
		<DateStrip.Item {date} />
	{/snippet}
</DateStrip.Root>
```

Root still opens on the current week. It does not derive the visible range from `value`, expose the range start, or provide a method for jumping to the selected date. People must page to that date manually, so use Calendar or another date picker when distant initial values are common.

### Styling the public parts

```svelte
<DateStrip.Root class="max-w-md shadow-none" daysToShow={5}>
	{#snippet children({ date })}
		<DateStrip.Item {date} class="size-14" />
	{/snippet}
</DateStrip.Root>
```

Root and Item accept only `class` for DOM customization. They do not forward arbitrary HTML attributes, element references, event handlers, snippets for replacing their internal markup, or props for changing the navigation buttons.

---

## Public API

Date Strip owns its API directly rather than wrapping an external component primitive. `DateValue` and the date operations come from `@internationalized/date`; the local `index.ts`, exported types, and source are the source of truth.

### `DateStrip.Root`

Type: `RootProps`.

| Prop             | Type                             | Default       | xvelte behavior                                                                                                  |
| ---------------- | -------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `value`          | `DateValue`                      | `undefined`   | Bindable selected date. It does not control or reposition the visible range.                                     |
| `locale`         | `string`                         | Paraglide     | Formats month/day labels and chooses the initial week boundary. An explicit value overrides the active locale.   |
| `daysToShow`     | `number`                         | `5`           | Number of consecutive dates rendered and number of days moved per navigation action.                             |
| `isDateDisabled` | `(date: DateValue) => boolean`   | `() => false` | Evaluated for every displayed Item to determine its native disabled state.                                       |
| `onDateChange`   | `(date: DateValue) => void`      | `undefined`   | Runs after an enabled Item is selected. It does not run for navigation or an app-driven binding change.          |
| `children`       | `Snippet<[{ date: DateValue }]>` | required      | Called once for every displayed date. Render `<DateStrip.Item {date} />` to connect local selection behavior.    |
| `class`          | `string`                         | `undefined`   | Merged after the outer container's local layout, surface, border, radius, padding, and shadow classes with `cn`. |

Root does not forward native `div` attributes, expose its element reference, accept navigation labels, or provide previous/next callbacks. Its initial range starts at `startOfWeek(today(getLocalTimeZone()), locale)`, using the active Paraglide locale unless `locale` is passed explicitly. Navigation adds or subtracts exactly `daysToShow` days.

Changing `daysToShow` updates the number of displayed dates reactively. Passing zero renders no Items; negative, fractional, non-finite, or extremely large values are not validated and should be avoided.

### Children snippet data

| Field  | Type        | Meaning                                                |
| ------ | ----------- | ------------------------------------------------------ |
| `date` | `DateValue` | One consecutive date in the current visible date page. |

The snippet is required even though `children` uses Svelte's conventional property name. Root supplies no index, selected state, disabled state, or formatting helpers through the snippet.

### `DateStrip.Item`

Type: `ItemProps`.

| Prop    | Type        | Default     | xvelte behavior                                                                                            |
| ------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `date`  | `DateValue` | required    | Date displayed and selected when the button is activated.                                                  |
| `class` | `string`    | `undefined` | Merged after the fixed size, layout, animation, today, selected, typography, and Button classes with `cn`. |

Item always renders Button.Root with `variant="ghost"` as a native button. It derives disabled state from Root, highlights today's date with `bg-accent`, and gives the selected date `bg-primary text-primary-foreground`; selected styling takes precedence when the date is also today.

Each Item displays a locale-formatted abbreviated month above a numeric day. It does not display weekday, year, full date, or app-provided children. Item does not forward native button attributes, events, a ref, `aria-*`, or alternative labels. It cannot be used outside Root because its internal context would be missing.

---

## Styling and DOM contract

Date Strip uses Tailwind utilities, Tailwind animation utilities, semantic theme tokens, and two stable local `data-slot` hooks. It exposes no component-specific CSS variables or public state attributes.

| Element                  | Stable hook                   | Local structure and styling                                                                              |
| ------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| Root container           | `data-slot="date-strip"`      | Flex row with card background, border, large radius, padding, gap, and shadow.                           |
| Previous navigation      | `data-slot="button"`          | Internal ghost icon Button fixed to `1.75rem` square; not directly configurable.                         |
| Date viewport            | No public hook                | Flexible, clipped row that distributes Items with a small gap.                                           |
| Item                     | `data-slot="date-strip-item"` | Native ghost Button fixed to `3rem` square, with vertical month/day layout and page-direction animation. |
| Item month and day spans | No public hooks               | Fixed typography; no classes or snippets are exposed for individual customization.                       |
| Next navigation          | `data-slot="button"`          | Internal ghost icon Button fixed to `1.75rem` square; not directly configurable.                         |

Root and Item merge app classes with `cn`, so later Tailwind classes can replace compatible local utilities. No other attributes are accepted by their public props. Item passes its `data-slot` through Button and intentionally replaces Button's normal `data-slot="button"` value.

The current date uses the accent background. The selected date uses primary colors. Disabled presentation comes from Button. Item enters with a fade and a slide from the right after forward navigation or from the left after backward navigation; the initial render uses the forward direction. The internal viewport clips animation overflow.

---

## Accessibility

Each date and navigation control is a native Button, so standard button activation, focus, and disabled behavior are available. Disabled dates cannot be activated with pointer or keyboard input.

The current local implementation has important accessibility limitations:

- The previous and next icon-only buttons have no accessible names, and Root exposes no prop for adding them.
- Selected and current dates are represented only by color classes. Item does not set `aria-pressed`, `aria-current="date"`, or another semantic selected/current state.
- An Item's accessible name comes from its abbreviated month and numeric day only; it omits the year and weekday.
- Root provides no calendar, listbox, toolbar, group label, instructions, live range announcement, or specialized arrow-key navigation.
- Root and Item do not forward `aria-*` attributes, so an app cannot repair these contracts through public props.

Treat Date Strip as a compact visual date control, not as a complete accessible calendar or date picker. Until the local API supplies navigation labels and semantic date states, use Calendar or another accessible date input when screen-reader operation is required. Do not rely on color alone to explain a selected date elsewhere in the interface.

---

## Localization

Date Strip has no visible word labels and uses no Paraglide message keys. Root imports `getLocale()` from the generated Paraglide runtime and uses the active locale by default for both the initial week boundary and the Item month/day formatters. Pass `locale` to override that default for one Date Strip. Items convert dates in the user's local time zone before formatting.

There is no formatter prop, explicit week-start prop, or message ID. Navigation buttons also lack built-in accessible labels rather than containing translatable default copy, and the current public API cannot override those labels.

---

## Dependencies

Date Strip requires `@internationalized/date`, the shared Button component, two semantic Tabler icon exports, the shared `cn` helper, Tailwind Variants through Button, Tailwind CSS, and `tw-animate-css`. Install all package requirements with one of these command groups:

```sh
# bun
bun add @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss tw-animate-css

# npm
npm install @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss tw-animate-css

# pnpm
pnpm add @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss tw-animate-css
```

### Shared utilities

Root and Item import `cn` from `$lib/utils`. The required Button component additionally imports `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

### Paraglide locale

Configure and compile Paraglide so `$lib/paraglide/runtime.js` exports `getLocale`. Date Strip has no message keys, but its default locale depends on that generated runtime. A passed `locale` prop overrides Paraglide for that Root.

### Icons

Date Strip imports two semantic names from `$lib/icons`. Add these exact exports to `src/lib/icons.ts`:

```ts
export { default as ChevronLeftIcon } from "@tabler/icons-svelte/icons/chevron-left";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
```

The package block includes `@tabler/icons-svelte`. Keep these aliases in the shared icon facade instead of importing Tabler directly from component files.

### Button component

Copy the complete `$lib/components/ui/button` component with Date Strip. The required component files are:

```text
src/lib/components/ui/button/
├── button-root.svelte
└── index.ts
```

Follow the Button component's colocated README to install and understand its complete API and requirements. Date Strip uses its ghost variant and icon size internally; no other xvelte component is required.

### Internal context

Copy `date-strip-context.ts` with Root and Item. Its complete contents are:

```ts
import { createContext } from "svelte";
import type { DateValue } from "@internationalized/date";

type DateStripContext = {
	readonly selectedValue: DateValue | undefined;
	readonly locale: string;
	onSelect: (date: DateValue) => void;
	isDateDisabled: (date: DateValue) => boolean;
	readonly direction: "start" | "end";
};

const [getDateStripState, setDateStripState] = createContext<DateStripContext>();

/**
 * Provides locale, selection, and navigation data to date-strip items.
 *
 * @param props - Reactive date-strip state and callbacks.
 */
export function setDateStripContext(props: DateStripContext) {
	return setDateStripState(props);
}

/** @returns The nearest date-strip context. */
export function getDateStripContext() {
	return getDateStripState();
}
```

This context is an internal implementation file, not an additional public import.

### Global CSS

The global stylesheet must import Tailwind and `tw-animate-css`, define the dark variant used by Button, and expose the semantic colors and radius values used by Date Strip and its internal Buttons. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--card: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.97 0.001 106.424);
	--accent: oklch(0.841 0.238 128.85);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--card: oklch(0.216 0.006 56.043);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.268 0.007 34.298);
	--accent: oklch(0.768 0.233 130.85);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-muted: var(--muted);
	--color-accent: var(--accent);
	--color-danger: var(--danger);
	--color-border: var(--border);
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
```

`tw-animate-css` supplies the enter, fade, and directional slide utilities. No Date Strip-specific keyframe or shared component stylesheet must be copied. The app remains responsible for applying its `.dark` class when dark mode is supported.

### Other requirements

Date Strip requires no hook, attachment, external context library, localization message, shared component stylesheet, or external asset. Its internal Svelte context must remain in the component folder as shown above, and the generated Paraglide runtime must be available.

---

## Credits

Date Strip is adapted from [more-shadcn-svelte's Date Strip component](https://more-shadcn.noair.fun/docs/components/date-strip). Local xvelte behavior, API, styling, dependencies, accessibility limitations, and localization limitations documented here take precedence.

---

## File organization

| File                     | Responsibility                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `date-strip-root.svelte` | Locale-aware visible-range state, page navigation, selected-value binding, disabled-date callback, layout, and children loop. |
| `date-strip-item.svelte` | Locale-aware date formatting, current/selected/disabled state, selection action, Button composition, and transition classes.  |
| `date-strip-context.ts`  | Internal reactive bridge between Root and descendant Items.                                                                   |
| `index.ts`               | Public Root, Item, and props-type exports.                                                                                    |
| `README.md`              | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits.                    |

Treat `index.ts`, its exported types, and the local component source as the source of truth for the public API.

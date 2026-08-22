# Calendar

An accessible calendar for selecting one or several dates. It renders complete month navigation, optional month/year dropdowns, one or more month grids, disabled and unavailable dates, localized labels, and a customizable day snippet on top of Bits UI and `@internationalized/date`.

Use Calendar when people need to choose dates from a visual month grid. Do not use it for date ranges, free-form date input, time-only input, event scheduling with time zones, or a read-only event calendar; use Range Calendar or a purpose-built input/display instead.

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
	import * as Calendar from "$lib/components/ui/calendar";
</script>
```

Calendar's `index.ts` exports `Root`, `Months`, `Month`, `Nav`, `PrevButton`, `NextButton`, `Header`, `Caption`, `Heading`, `MonthSelect`, `YearSelect`, `Grid`, `GridHead`, `GridBody`, `GridRow`, `HeadCell`, `Cell`, and `Day`. It also exports a matching props type for every component.

---

## Anatomy

For normal use, render only `Root`. It creates the complete calendar structure internally:

```svelte
<Calendar.Root type="single" />
```

The generated structure is equivalent to:

```text
Root
└── Months
    ├── Nav
    │   ├── PrevButton
    │   └── NextButton
    └── Month (one per visible month)
        ├── Header
        │   └── Caption
        └── Grid
            ├── GridHead → GridRow → HeadCell
            └── GridBody → GridRow → Cell → Day
```

Unlike the underlying Bits UI root, the local `Root` does not accept `children` or `child`; it always owns this composition. Use the `day` snippet for supported day-content customization. The other exported components are available for advanced composition with a Bits UI Calendar root, or for maintaining the built-in structure.

---

## Basic usage

```svelte
<script lang="ts">
	import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

	import * as Calendar from "$lib/components/ui/calendar";

	let value = $state<DateValue | undefined>(today(getLocalTimeZone()));
</script>

<Calendar.Root type="single" bind:value calendarLabel="Appointment date" class="rounded-lg border shadow-sm" />

<p class="mt-2 text-sm">Selected: {value?.toString() ?? "No date selected"}</p>
```

Calendar values are `DateValue` objects from `@internationalized/date`, not JavaScript `Date` objects or date strings. Use methods such as `toString()` for ISO-style storage and `toDate(timeZone)` when a native `Date` is required.

---

## Examples

### Month and year dropdowns

```svelte
<script lang="ts">
	import { CalendarDate, type DateValue } from "@internationalized/date";

	import * as Calendar from "$lib/components/ui/calendar";

	let value = $state<DateValue | undefined>(new CalendarDate(2026, 8, 13));
</script>

<Calendar.Root
	type="single"
	bind:value
	captionLayout="dropdown"
	years={Array.from({ length: 101 }, (_, index) => 2026 - index)}
	calendarLabel="Date of birth"
/>
```

`captionLayout="dropdown"` shows both selects. Use `dropdown-months` or `dropdown-years` for only one select. Dropdown captions use short month names by default; label captions use long month names.

### Multiple selection and date rules

```svelte
<script lang="ts">
	import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

	import * as Calendar from "$lib/components/ui/calendar";

	const firstAllowedDate = today(getLocalTimeZone());
	let values = $state<DateValue[]>([]);
</script>

<Calendar.Root
	type="multiple"
	bind:value={values}
	minValue={firstAllowedDate}
	maxDays={3}
	isDateUnavailable={(date) => date.day === 15}
	calendarLabel="Choose up to three appointment dates"
/>
```

Disabled dates cannot be focused or selected. Unavailable dates remain focusable and selectable, but selecting one marks the calendar invalid. `maxDays` applies only to `type="multiple"`.

### Multiple visible months

```svelte
<Calendar.Root type="single" numberOfMonths={2} pagedNavigation fixedWeeks calendarLabel="Travel date" class="rounded-lg border shadow-sm" />
```

With `pagedNavigation`, previous/next changes the view by the number of visible months. Without it, navigation shifts one month at a time. `fixedWeeks` keeps every month at six rows.

### Localized calendar

```svelte
<Calendar.Root type="single" locale="gl-ES" weekStartsOn={1} weekdayFormat="short" monthFormat="long" calendarLabel="Data da cita" />
```

`locale` formats month, year, weekday, and select labels through `Intl.DateTimeFormat`. The built-in header displays the first two characters of each formatted weekday, so check narrow or non-Latin labels in every supported locale.

### Custom day content

```svelte
<Calendar.Root type="single" calendarLabel="Event date">
	{#snippet day({ day, outsideMonth })}
		<Calendar.Day>
			<span>{day.day}</span>
			{#if !outsideMonth && eventDays.has(day.toString())}
				<span class="size-1 rounded-full bg-current" aria-hidden="true"></span>
			{/if}
		</Calendar.Day>
	{/snippet}
</Calendar.Root>
```

The snippet receives the `DateValue` and whether it belongs to an adjacent month. Render `Calendar.Day` inside the snippet to preserve Bits UI's day semantics, focus handling, selection, and state attributes. The example's marker is decorative; expose event information separately if it matters to screen-reader users.

### Read-only and disabled

```svelte
<Calendar.Root type="single" readonly calendarLabel="Selected delivery date" />

<Calendar.Root type="single" disabled calendarLabel="Unavailable delivery calendar" />
```

`readonly` keeps navigation and focus available but prevents selection. `disabled` prevents focus and selection across the calendar.

---

## Public API

Calendar wraps Bits UI 2.18.1. The tables below document the local options and the most useful inherited options; see the complete [Bits UI Calendar API reference](https://www.bits-ui.com/docs/components/calendar#api-reference) for native attributes and advanced primitive details.

### `Calendar.Root`

Type: `RootProps`, based on Bits UI `Calendar.RootProps` with `children` and `child` removed, plus local caption, navigation, and day options.

| Prop                      | Type                                                             | Default       | Behavior                                                                                                 |
| ------------------------- | ---------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `type`                    | `"single" \| "multiple"`                                         | Required      | Chooses a single `DateValue` or `DateValue[]` selection model.                                           |
| `value`                   | `DateValue \| undefined` or `DateValue[]`                        | See type      | Bindable selected value; starts `undefined` for single mode and `[]` for multiple mode.                  |
| `placeholder`             | `DateValue \| undefined`                                         | Current date  | Bindable focused/view date; navigation and caption dropdowns update it.                                  |
| `buttonVariant`           | `Button.RootVariants`                                            | `"ghost"`     | Applies any local Button variant to previous and next controls.                                          |
| `captionLayout`           | `"label" \| "dropdown" \| "dropdown-months" \| "dropdown-years"` | `"label"`     | Chooses plain formatted text or month/year native selects.                                               |
| `months`                  | `number[]`                                                       | All months    | Limits month values shown by `MonthSelect`.                                                              |
| `years`                   | `number[]`                                                       | Bits UI range | Sets year values shown by `YearSelect`; Bits UI otherwise derives a range from constraints/current year. |
| `monthFormat`             | `Intl...['month'] \| (month: number) => string`                  | See below     | Defaults to `"short"` for dropdown captions and `"long"` for label captions.                             |
| `yearFormat`              | `Intl...['year'] \| (year: number) => string`                    | `"numeric"`   | Formats year labels and options.                                                                         |
| `weekdayFormat`           | `Intl.DateTimeFormatOptions["weekday"]`                          | `"short"`     | Formats weekday data; the built-in header then displays its first two characters.                        |
| `locale`                  | `string`                                                         | `"en-US"`     | Locale used for date labels, month/year captions, weekdays, and Bits UI accessibility text.              |
| `day`                     | `Snippet<[{ day: DateValue; outsideMonth: boolean }]>`           | `undefined`   | Replaces the default `Day`; render `Calendar.Day` inside to preserve behavior.                           |
| `numberOfMonths`          | `number`                                                         | `1`           | Number of visible months.                                                                                |
| `pagedNavigation`         | `boolean`                                                        | `false`       | Moves by all visible months instead of one month.                                                        |
| `fixedWeeks`              | `boolean`                                                        | `false`       | Always renders six weeks per month.                                                                      |
| `weekStartsOn`            | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`                                | Locale/Bits   | Overrides the first weekday; `0` is Sunday and `6` is Saturday.                                          |
| `minValue` / `maxValue`   | `DateValue`                                                      | `undefined`   | Constrains selectable dates and caption navigation/options.                                              |
| `isDateDisabled`          | `(date: DateValue) => boolean`                                   | `undefined`   | Prevents matching dates from being focused or selected.                                                  |
| `isDateUnavailable`       | `(date: DateValue) => boolean`                                   | `undefined`   | Marks matching dates unavailable; they remain selectable and can make the root invalid.                  |
| `disableDaysOutsideMonth` | `boolean`                                                        | `false`       | Disables days shown from adjacent months.                                                                |
| `preventDeselect`         | `boolean`                                                        | `false`       | Prevents clearing a selected date by selecting it again.                                                 |
| `maxDays`                 | `number`                                                         | `undefined`   | Limits selected dates in multiple mode.                                                                  |
| `disabled`                | `boolean`                                                        | `false`       | Prevents calendar focus and selection.                                                                   |
| `readonly`                | `boolean`                                                        | `false`       | Allows focus/navigation but prevents selection changes.                                                  |
| `initialFocus`            | `boolean`                                                        | `false`       | Focuses the selected date, today, or the first visible date when mounted.                                |
| `calendarLabel`           | `string`                                                         | `"Event"`     | Accessible base label; Bits UI appends the visible month and year.                                       |
| `onValueChange`           | Selection callback                                               | `undefined`   | Runs when selection changes; its argument follows `type`.                                                |
| `onPlaceholderChange`     | `(date: DateValue) => void`                                      | `undefined`   | Runs when the focused/view date changes.                                                                 |
| `ref`                     | `HTMLDivElement \| null`                                         | `null`        | Bindable reference to the Bits UI root element.                                                          |
| `class`                   | `string`                                                         | `undefined`   | Merged with the local surface, padding, cell variables, and composition-aware background classes.        |

Native root `div` and ARIA attributes are forwarded. `children` and `child` are intentionally unavailable because xvelte renders the complete calendar body.

### Navigation and caption components

These exports support the built-in structure and advanced composition. Most Bits UI parts require a surrounding Bits UI Calendar root context.

| Component     | Props type         | Default element | Local behavior and important props                                                                                                  |
| ------------- | ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Months`      | `MonthsProps`      | `div`           | Responsive column/row wrapper for all visible months; forwards native `div` props and bindable `ref`.                               |
| `Month`       | `MonthProps`       | `div`           | Vertical wrapper for one month; forwards native `div` props and bindable `ref`.                                                     |
| `Nav`         | `NavProps`         | `nav`           | Absolutely positions previous/next controls; forwards native `nav` props and bindable `ref`.                                        |
| `PrevButton`  | `PrevButtonProps`  | `button`        | Bits UI previous button styled with Button; local `variant` defaults to `"ghost"`; default left chevron.                            |
| `NextButton`  | `NextButtonProps`  | `button`        | Bits UI next button styled with Button; local `variant` defaults to `"ghost"`; default right chevron.                               |
| `Header`      | `HeaderProps`      | `header`        | Bits UI month header centered at cell height; forwards primitive/native props.                                                      |
| `Heading`     | `HeadingProps`     | `div`           | Bits UI heading with cell-width side padding; supports primitive `children`/`child` and `headingValue`.                             |
| `Caption`     | `CaptionProps`     | No wrapper      | Chooses formatted label/dropdowns from required caption data; `placeholder` is bindable, `monthIndex` is 0.                         |
| `MonthSelect` | `MonthSelectProps` | `span` + select | Visible styled label over a native Bits UI select; `children`/`child` removed; accepts `months`, format, value, and change handler. |
| `YearSelect`  | `YearSelectProps`  | `span` + select | Visible styled label over a native Bits UI select; `children`/`child` removed; accepts `years`, format, and value.                  |

`PrevButton` and `NextButton` accept custom children; supplying them replaces the default icon. Their remaining props follow the corresponding Bits UI buttons.

`CaptionProps` is mainly useful to the built-in renderer. It requires `captionLayout`, `months`, `monthFormat`, `years`, `yearFormat`, `month`, `placeholder`, `locale`, and `monthIndex`. Caption renders no element of its own.

### Grid and day components

| Component  | Props type      | Default element            | Local behavior and important props                                                                        |
| ---------- | --------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Grid`     | `GridProps`     | `table`                    | Bits UI calendar grid styled as a full-width flex column.                                                 |
| `GridHead` | `GridHeadProps` | `thead`                    | Bits UI grid head; xvelte only merges `class`.                                                            |
| `GridBody` | `GridBodyProps` | `tbody`                    | Bits UI grid body; xvelte only merges `class`.                                                            |
| `GridRow`  | `GridRowProps`  | `tr`                       | Bits UI row with local flex layout.                                                                       |
| `HeadCell` | `HeadCellProps` | `th`                       | Cell-width weekday heading with muted, normal-weight text.                                                |
| `Cell`     | `CellProps`     | `td`                       | Requires `date` and `month`; controls cell size, focus stacking, and selected edge radii.                 |
| `Day`      | `DayProps`      | `div` with `role="button"` | Selectable day with local hover, today, selected, outside-month, disabled, unavailable, and focus styles. |

These props are aliases of their matching Bits UI component props, including `children`, `child`, native attributes, state snippet values, and bindable refs. Use the [Bits UI Calendar API reference](https://www.bits-ui.com/docs/components/calendar#api-reference) for their complete inherited options.

Use `index.ts` and the exported props types as the source of truth for the local API.

---

## Styling and DOM contract

Calendar uses semantic Tailwind tokens and two root-scoped CSS variables:

| Variable        | Default                          | Purpose                                        |
| --------------- | -------------------------------- | ---------------------------------------------- |
| `--cell-size`   | Tailwind spacing `7` (`1.75rem`) | Width/height of days, headers, and navigation. |
| `--cell-radius` | `var(--radius-md)`               | Radius for day cells and selection edges.      |

Override them on `Root` when a different density is needed:

```svelte
<Calendar.Root type="single" class="[--cell-radius:var(--radius-lg)] [--cell-size:--spacing(9)]" />
```

The local components do not add xvelte `data-slot` attributes. Bits UI supplies dependency-owned selectors instead:

- Root/header/heading/navigation/grid parts: `data-calendar-*` attributes.
- Day and cell state: `data-selected`, `data-today`, `data-disabled`, `data-unavailable`, `data-outside-month`, `data-focused`, and `data-value`.
- Root state: `data-invalid`, `data-disabled`, and `data-readonly`.
- Bits UI also exposes `data-bits-day` on interactive days; treat it as dependency-owned.

Prefer component `class` props and documented state attributes. Check the installed Bits UI API before relying on dependency-owned selectors across upgrades.

Notable local styling behavior:

- Root uses `group/calendar`, background, padding, and transparent backgrounds inside `card-content` or `popover-content` slots.
- `Months` changes from a vertical layout to a row at the `md` breakpoint.
- Navigation is absolutely positioned across the top of the root.
- Selected days use primary colors; today uses accent colors when unselected.
- Outside-month days are muted; disabled days lose pointer events and opacity; unavailable days are struck through.
- Navigation icons rotate in right-to-left layouts.
- Month/year selects use transparent native selects over styled visual labels, preserving native selection behavior.
- Classes supplied by your app are merged after local classes with `cn`, so conflicting Tailwind utilities normally favor your values.

---

## Accessibility

Bits UI supplies the calendar grid semantics, labels, focus management, and date-selection behavior. The local wrappers preserve those attributes and use native selects for dropdown captions.

- Always provide a specific `calendarLabel`, such as “Appointment date” or “Date of birth”. Bits UI appends the visible month/year for screen readers.
- Arrow Left/Right moves focus by one day; Arrow Up/Down moves by one week. Enter and Space select the focused date.
- Previous/next controls are native buttons and become disabled at `minValue`/`maxValue` boundaries.
- Disabled dates cannot receive focus or selection. Read-only calendars remain focusable and navigable. Unavailable dates remain selectable and can set `data-invalid`.
- Use `initialFocus` when Calendar opens in a popover/dialog and focus should enter the grid immediately. The surrounding overlay remains responsible for returning focus when it closes.
- `type="multiple"` changes selection behavior but does not explain the maximum or purpose. Include nearby instructions when `maxDays` or other rules are not obvious.
- If a custom `day` snippet replaces `Calendar.Day`, keyboard and screen-reader behavior can be lost. Keep `Calendar.Day` as the interactive part and add only supplementary content inside it.
- Decorative navigation icons are not the buttons' accessible names; Bits UI supplies the literal labels “Previous” and “Next”. Custom icon-only content must preserve the primitive's forwarded attributes.
- Month/year dropdowns contain real native selects. Do not remove the invisible select or make the visible `aria-hidden` label interactive.
- Do not communicate today, selected, disabled, or unavailable state only through color. The default markup exposes state attributes and unavailable styling includes a line-through; add visible help when the distinction matters.

---

## Localization

Calendar has no Paraglide message keys. Date text is generated from `locale`, `calendarLabel`, `monthFormat`, `yearFormat`, and `weekdayFormat`. Bits UI currently supplies three English defaults directly: `"Event"` for `calendarLabel`, plus `"Previous"` and `"Next"` for the navigation buttons.

| Input           | Local default | What it controls                                                                 |
| --------------- | ------------- | -------------------------------------------------------------------------------- |
| `locale`        | `en-US`       | Month/year/weekday labels, dropdown options, and date accessibility text.        |
| `calendarLabel` | `Event`       | Purpose of the calendar; your app should pass a translated, specific label.      |
| `monthFormat`   | Contextual    | Long for label captions, short for dropdown captions, or a custom formatter.     |
| `yearFormat`    | `numeric`     | Year label/options, or a custom formatter.                                       |
| `weekdayFormat` | `short`       | Weekday source strings; the built-in header displays their first two characters. |

Always pass a translated `calendarLabel`. The current previous/next labels cannot be overridden through the local `Root`; changing them requires adapting the navigation wrappers or using an advanced custom composition. Translate any surrounding instructions, selected-date summaries, error messages, event descriptions, and empty states in your app. Do not translate `data-*` values, selection types, caption-layout values, or other technical identifiers.

---

## Dependencies

Calendar requires Svelte 5, Bits UI, `@internationalized/date`, the Tabler Svelte icon package, Tailwind Variants through Button, the local utility helpers, and Tailwind CSS. Install its runtime and development packages with one of these command groups:

```sh
# bun
bun add bits-ui @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss
```

### Required UI component

Copy the complete Button UI component from `src/lib/components/ui/button`. `PrevButton` and `NextButton` import its styles and variant type. Copy these files:

- `src/lib/components/ui/button/button-root.svelte`
- `src/lib/components/ui/button/index.ts`

Follow the Button component's README to install it and understand its API. Calendar requires no other xvelte component, hook, attachment, or custom context file.

### Shared utilities

Calendar imports `cn`, `WithElementRef`, and `WithoutChildrenOrChild` from `$lib/utils`; Button uses `cn` and `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block above includes `clsx` and `tailwind-merge`, which this code imports.

### Icons

Add these exact semantic exports to `src/lib/icons.ts`:

```ts
export { default as ChevronDownIcon } from "@tabler/icons-svelte/icons/chevron-down";
export { default as ChevronLeftIcon } from "@tabler/icons-svelte/icons/chevron-left";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
```

The package block above includes `@tabler/icons-svelte`. Calendar imports icons only through this shared semantic file.

### Global CSS

Your global stylesheet must import Tailwind, define the dark variant, and expose the semantic colors and radius scale used by Calendar and its Button dependency. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

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
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}
```

The app remains responsible for applying its `.dark` class, normally through root-level theme management.

No `tw-animate-css` import, animation, keyframe, Paraglide message, shared component stylesheet, or additional icon is required. Popover, Date Picker, Range Calendar, form fields, and date summaries shown in larger compositions have their own installation requirements; follow each component's README when you use them.

---

## Credits

Calendar is adapted from the [shadcn-svelte Calendar](https://www.shadcn-svelte.com/docs/components/calendar). Its complete built-in composition, caption behavior, local Button integration, icon facade, sizing, and styles have been adapted for xvelte.

---

## File organization

| File                           | Responsibility                                                              |
| ------------------------------ | --------------------------------------------------------------------------- |
| `calendar-root.svelte`         | Builds the complete calendar and adds local root options and day rendering. |
| `calendar-months.svelte`       | Lays out all visible months responsively.                                   |
| `calendar-month.svelte`        | Wraps one visible month.                                                    |
| `calendar-nav.svelte`          | Positions previous and next navigation controls.                            |
| `calendar-prev-button.svelte`  | Styles the Bits UI previous button and supplies its default icon.           |
| `calendar-next-button.svelte`  | Styles the Bits UI next button and supplies its default icon.               |
| `calendar-header.svelte`       | Styles the heading/caption row.                                             |
| `calendar-caption.svelte`      | Renders label, month dropdown, year dropdown, or both.                      |
| `calendar-heading.svelte`      | Styles the Bits UI heading component.                                       |
| `calendar-month-select.svelte` | Renders the styled month selector over a native select.                     |
| `calendar-year-select.svelte`  | Renders the styled year selector over a native select.                      |
| `calendar-grid.svelte`         | Styles the month table/grid.                                                |
| `calendar-grid-head.svelte`    | Wraps the weekday heading section.                                          |
| `calendar-grid-body.svelte`    | Wraps the weeks section.                                                    |
| `calendar-grid-row.svelte`     | Styles each weekday/week row.                                               |
| `calendar-head-cell.svelte`    | Styles weekday heading cells.                                               |
| `calendar-cell.svelte`         | Styles date cells and selected-range edge radii.                            |
| `calendar-day.svelte`          | Styles interactive days and every visual date state.                        |
| `index.ts`                     | Exports all components and matching props types.                            |

Use `index.ts` and the exported props types as the source of truth for the public API. If this guide and the implementation disagree, verify the installed Bits UI and `@internationalized/date` APIs and update the guide with the code change.

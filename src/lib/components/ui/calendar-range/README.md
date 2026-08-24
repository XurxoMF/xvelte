# Calendar Range

An accessible calendar for selecting a start and end date. It renders complete month navigation, optional month/year dropdowns, one or more month grids, range highlighting, date constraints, localized date formatting, and a customizable day snippet on top of Bits UI and `@internationalized/date`.

Use Calendar Range when people need to choose a continuous date interval visually, such as a stay, report period, or availability window. Use Calendar for one or several independent dates, and use a date-range field or picker when compact typed input and popover behavior are also required. It does not select times or calculate time-zone-aware durations for the app.

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

Import the component from its public `index.ts`:

```svelte
<script lang="ts">
	import * as CalendarRange from "$lib/components/ui/calendar-range";
</script>
```

`index.ts` exports `Root`, `Months`, `Month`, `Nav`, `PrevButton`, `NextButton`, `Header`, `Caption`, `Heading`, `MonthSelect`, `YearSelect`, `Grid`, `GridHead`, `GridBody`, `GridRow`, `HeadCell`, `Cell`, and `Day`. It also exports a matching props type for every component.

Date values come from `@internationalized/date`. Bits UI's public `DateRange` type can be imported from `bits-ui` when an explicit range type is useful.

---

## Anatomy

For normal use, render only Root. It creates the complete range calendar internally:

```svelte
<CalendarRange.Root />
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

Unlike the underlying Bits UI Root, the local Root does not accept `children` or `child`; it owns this composition. Use the `day` snippet for supported day-content customization. The remaining exports support the built-in implementation and advanced composition with a Bits UI Range Calendar root.

---

## Basic usage

```svelte
<script lang="ts">
	import { getLocalTimeZone, today } from "@internationalized/date";
	import type { DateRange } from "bits-ui";

	import * as CalendarRange from "$lib/components/ui/calendar-range";

	const start = today(getLocalTimeZone());
	let value = $state<DateRange>({
		start,
		end: start.add({ days: 6 })
	});
</script>

<CalendarRange.Root bind:value calendarLabel="Travel dates" class="w-full rounded-lg border shadow-sm" />

<p class="mt-2 text-sm">
	{value.start?.toString() ?? "No start date"} – {value.end?.toString() ?? "No end date"}
</p>
```

`value` is a bindable `{ start, end }` object whose fields are `DateValue | undefined`. These are `@internationalized/date` objects, not JavaScript `Date` instances or date strings. Use `toString()` for ISO-style storage and `toDate(timeZone)` when a native `Date` is required.

---

## Examples

### Empty controlled range and partial selection

Both fields start undefined when no value is supplied. `onStartValueChange` and `onEndValueChange` also report incomplete selection:

```svelte
<script lang="ts">
	import type { DateRange } from "bits-ui";

	import * as CalendarRange from "$lib/components/ui/calendar-range";

	let value = $state<DateRange>({ start: undefined, end: undefined });
	let instruction = $state("Choose a start date.");
</script>

<CalendarRange.Root
	bind:value
	calendarLabel="Reporting period"
	onStartValueChange={(start) => {
		instruction = start ? "Now choose an end date." : "Choose a start date.";
	}}
	onEndValueChange={(end) => {
		if (end) instruction = "Date range selected.";
	}}
/>

<p aria-live="polite">{instruction}</p>
```

`onValueChange` reports the complete public range object whenever Bits UI updates it. The start/end callbacks expose the primitive's intermediate selection state separately.

### Minimum and maximum range length

`minDays` and `maxDays` count both endpoints. An invalid second choice becomes the new start instead of completing the range:

```svelte
<CalendarRange.Root minDays={3} maxDays={14} calendarLabel="Holiday dates" />
```

Explain these limits near the calendar; the component does not render visible validation instructions.

### Disabled dates inside a range

Use `excludeDisabled` when a completed range must not cross a disabled date:

```svelte
<script lang="ts">
	import { isWeekend } from "@internationalized/date";

	import { getLocale } from "$lib/paraglide/runtime";
	import * as CalendarRange from "$lib/components/ui/calendar-range";
</script>

<CalendarRange.Root calendarLabel="Working-day range" isDateDisabled={(date) => isWeekend(date, getLocale())} excludeDisabled />
```

Disabled dates cannot be focused or selected. With `excludeDisabled`, Bits UI also rejects or clears a range containing one. Without it, disabled dates between selectable endpoints do not automatically invalidate the range.

### Month and year dropdowns

```svelte
<CalendarRange.Root captionLayout="dropdown" years={Array.from({ length: 11 }, (_, index) => 2026 + index)} calendarLabel="Project period" />
```

`dropdown` shows both native selects. Use `dropdown-months` or `dropdown-years` for only one. Dropdown captions use short month names by default; label captions use long month names.

### Multiple visible months

```svelte
<CalendarRange.Root numberOfMonths={2} pagedNavigation fixedWeeks calendarLabel="Accommodation dates" class="rounded-lg border shadow-sm" />
```

With `pagedNavigation`, previous/next moves by the number of visible months. Without it, navigation shifts one month at a time. `fixedWeeks` keeps every visible month at six rows.

### Localized calendar

```svelte
<CalendarRange.Root locale="gl-ES" weekStartsOn={1} weekdayFormat="short" calendarLabel="Intervalo de datas" />
```

`locale` formats month, year, weekday, day accessibility text, and dropdown options. The built-in header displays the first two characters of each formatted weekday, so verify narrow and non-Latin labels in every supported locale.
When `locale` is omitted, Root uses the active Paraglide locale.

### Custom day content

```svelte
<CalendarRange.Root calendarLabel="Booking dates">
	{#snippet day({ day, outsideMonth })}
		<CalendarRange.Day>
			<span>{day.day}</span>
			{#if !outsideMonth && eventDays.has(day.toString())}
				<span class="size-1 rounded-full bg-current" aria-hidden="true"></span>
			{/if}
		</CalendarRange.Day>
	{/snippet}
</CalendarRange.Root>
```

Render `CalendarRange.Day` inside the snippet to preserve Bits UI's roles, focus handling, selection, and range state. The marker above is decorative; expose meaningful availability or event information separately.

### Read-only and disabled

```svelte
<CalendarRange.Root value={savedRange} readonly calendarLabel="Saved reporting period" />

<CalendarRange.Root disabled calendarLabel="Unavailable booking calendar" />
```

`readonly` keeps navigation and focus available but prevents selection changes. `disabled` prevents calendar focus and selection.

---

## Public API

Calendar Range wraps the installed stable `bits-ui@2.18.1` primitive. The tables document the local options and important inherited behavior; use the complete [Bits UI Range Calendar API](https://bits-ui.com/docs/components/range-calendar#api-reference) for native attributes and advanced primitive details. The component's `index.ts`, exported types, and source are the source of truth.

### `CalendarRange.Root`

Type: `RootProps`, based on Bits UI `RangeCalendar.RootProps` with `children` and `child` removed, plus local caption, navigation, and day options.

| Prop                      | Type                                                             | Default                                | Behavior                                                                                                       |
| ------------------------- | ---------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `value`                   | `DateRange`                                                      | `{ start: undefined, end: undefined }` | Bindable range. Each endpoint is a `DateValue \| undefined`; start is always ordered before end when complete. |
| `placeholder`             | `DateValue`                                                      | Current date                           | Bindable focused/view date; selection, navigation, and caption dropdowns update it.                            |
| `buttonVariant`           | `Button.RootVariants`                                            | `"ghost"`                              | Applies any local Button variant to previous and next controls.                                                |
| `captionLayout`           | `"label" \| "dropdown" \| "dropdown-months" \| "dropdown-years"` | `"label"`                              | Chooses plain formatted text or month/year native selects.                                                     |
| `months`                  | `number[]`                                                       | All months                             | Limits month values shown by MonthSelect.                                                                      |
| `years`                   | `number[]`                                                       | Bits UI-derived range                  | Sets year values shown by YearSelect.                                                                          |
| `monthFormat`             | `Intl...['month'] \| (month: number) => string`                  | Contextual                             | Defaults to `"short"` for dropdown captions and `"long"` for label captions.                                   |
| `yearFormat`              | `Intl...['year'] \| (year: number) => string`                    | `"numeric"`                            | Formats year captions and options.                                                                             |
| `weekdayFormat`           | `Intl.DateTimeFormatOptions["weekday"]`                          | `"short"`                              | Formats weekday data; the built-in header displays its first two characters.                                   |
| `locale`                  | `string`                                                         | Paraglide                              | Locale used for visible and accessible date text.                                                              |
| `day`                     | `Snippet<[{ day: DateValue; outsideMonth: boolean }]>`           | —                                      | Replaces the default Day; render `CalendarRange.Day` inside to preserve behavior.                              |
| `minDays` / `maxDays`     | `number`                                                         | `undefined`                            | Inclusive minimum and maximum number of days in a completed range.                                             |
| `minValue` / `maxValue`   | `DateValue`                                                      | `undefined`                            | Constrains selectable dates and caption navigation/options.                                                    |
| `isDateDisabled`          | `(date: DateValue) => boolean`                                   | `undefined`                            | Prevents matching dates from receiving selection or normal focus.                                              |
| `isDateUnavailable`       | `(date: DateValue) => boolean`                                   | `undefined`                            | Marks dates unavailable and prevents their selection in the installed primitive.                               |
| `excludeDisabled`         | `boolean`                                                        | `false`                                | Rejects or clears a range containing a disabled date.                                                          |
| `disableDaysOutsideMonth` | `boolean`                                                        | `false`                                | Local override: adjacent-month days remain selectable unless explicitly disabled.                              |
| `preventDeselect`         | `boolean`                                                        | `false`                                | Prevents clearing a partial or completed range by selecting its active endpoint again.                         |
| `numberOfMonths`          | `number`                                                         | `1`                                    | Number of visible month grids.                                                                                 |
| `pagedNavigation`         | `boolean`                                                        | `false`                                | Moves by all visible months instead of one month.                                                              |
| `fixedWeeks`              | `boolean`                                                        | `false`                                | Always renders six weeks per month.                                                                            |
| `weekStartsOn`            | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`                                | Locale/Bits UI                         | Overrides the first weekday; `0` is Sunday and `6` is Saturday.                                                |
| `disabled`                | `boolean`                                                        | `false`                                | Prevents focus and selection across the calendar.                                                              |
| `readonly`                | `boolean`                                                        | `false`                                | Allows focus/navigation but prevents selection changes.                                                        |
| `calendarLabel`           | `string`                                                         | `"Event"`                              | Accessible base label; Bits UI appends the visible month and year.                                             |
| `onValueChange`           | `(value: DateRange) => void`                                     | `undefined`                            | Runs when the public range object changes, including partial values.                                           |
| `onStartValueChange`      | `(date: DateValue \| undefined) => void`                         | `undefined`                            | Runs when the internal start endpoint changes.                                                                 |
| `onEndValueChange`        | `(date: DateValue \| undefined) => void`                         | `undefined`                            | Runs when the internal end endpoint changes.                                                                   |
| `onPlaceholderChange`     | `(date: DateValue) => void`                                      | `undefined`                            | Runs when the focused/view date changes.                                                                       |
| `ref`                     | `HTMLDivElement \| null`                                         | `null`                                 | Bindable reference to the Bits UI root element.                                                                |
| `class`                   | `string`                                                         | `undefined`                            | Merged with the local surface, padding, cell variables, and composition-aware backgrounds.                     |

Root forwards compatible native `div` and ARIA attributes. `children` and `child` are intentionally unavailable because xvelte renders the complete calendar body.

The installed Bits UI source defaults `disableDaysOutsideMonth` to `true`, while local Root explicitly defaults it to `false`. The local behavior documented above takes precedence. Pass `disableDaysOutsideMonth` when adjacent-month dates should be shown but unavailable.

### `DateRange`

```ts
type DateRange = {
	start: DateValue | undefined;
	end: DateValue | undefined;
};
```

After the first valid selection, only `start` is set. Selecting a valid second endpoint completes and chronologically orders the range. Selecting again starts a new range. Consult the [`@internationalized/date` guide](https://react-spectrum.adobe.com/internationalized/date/index.html) for calendar systems, conversion, arithmetic, and time-zone behavior.

### Navigation and caption components

These exports support the built-in structure and advanced composition. Bits UI-backed parts require a surrounding Bits UI Range Calendar context.

| Component     | Props type         | Default element | Local behavior and important props                                                                                                 |
| ------------- | ------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Months`      | `MonthsProps`      | `div`           | Full-width responsive column/row wrapper for all visible months; forwards native props and bindable `ref`.                         |
| `Month`       | `MonthProps`       | `div`           | Flexible equal-width wrapper for one month, with a seven-cell minimum width; forwards native props and bindable `ref`.             |
| `Nav`         | `NavProps`         | `nav`           | Absolutely positions previous/next controls; forwards native props and bindable `ref`.                                             |
| `PrevButton`  | `PrevButtonProps`  | `button`        | Bits UI previous button styled with Button; `variant` defaults to `"ghost"`; default left chevron.                                 |
| `NextButton`  | `NextButtonProps`  | `button`        | Bits UI next button styled with Button; `variant` defaults to `"ghost"`; default right chevron.                                    |
| `Header`      | `HeaderProps`      | `header`        | Bits UI month header centered at cell height; forwards primitive/native props.                                                     |
| `Heading`     | `HeadingProps`     | `div`           | Bits UI formatted heading with cell-width side padding; exported for advanced composition but not rendered by local Root.          |
| `Caption`     | `CaptionProps`     | No wrapper      | Chooses formatted labels/dropdowns from required caption data; `placeholder` is bindable and `monthIndex` defaults to `0`.         |
| `MonthSelect` | `MonthSelectProps` | `span` + select | Styled visual label over a native Bits UI select; `children`/`child` removed; accepts month choices, formatting, and native props. |
| `YearSelect`  | `YearSelectProps`  | `span` + select | Styled visual label over a native Bits UI select; `children`/`child` removed; accepts year choices, formatting, and native props.  |

PrevButton and NextButton accept custom children; supplying them replaces the default icon. Their remaining props follow the corresponding Bits UI buttons.

`CaptionProps` is mainly used by Root's built-in renderer. It requires `captionLayout`, `months`, `monthFormat`, `years`, `yearFormat`, `month`, `placeholder`, `locale`, and `monthIndex`. Caption renders no wrapper element.

### Grid and day components

| Component  | Props type      | Default element            | Local behavior and important props                                                                      |
| ---------- | --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Grid`     | `GridProps`     | `table`                    | Full-width fixed-layout table whose seven columns share the available width equally.                    |
| `GridHead` | `GridHeadProps` | `thead`                    | Bits UI grid head with direct prop/ref forwarding.                                                      |
| `GridBody` | `GridBodyProps` | `tbody`                    | Bits UI grid body with direct prop/ref forwarding.                                                      |
| `GridRow`  | `GridRowProps`  | `tr`                       | Native table row so the table can distribute all seven columns evenly.                                  |
| `HeadCell` | `HeadCellProps` | `th`                       | One-seventh-width weekday heading with muted, normal-weight text.                                       |
| `Cell`     | `CellProps`     | `td`                       | Uses one seventh of the row and controls focus stacking, selected-range background, and endpoint radii. |
| `Day`      | `DayProps`      | `div` with `role="button"` | Full-cell selectable day with fixed height and local range/date-state styles.                           |

These props are aliases of their matching Bits UI parts, including `children`, `child`, native attributes, state snippet values, and bindable refs. The local MonthSelect and YearSelect deliberately remove primitive child snippets because they own the native select composition.

---

## Styling and DOM contract

Calendar Range uses semantic Tailwind tokens and two root-scoped CSS variables:

| Variable        | Default                          | Purpose                                                |
| --------------- | -------------------------------- | ------------------------------------------------------ |
| `--cell-size`   | Tailwind spacing `7` (`1.75rem`) | Day height, minimum column width, and navigation size. |
| `--cell-radius` | `var(--radius-md)`               | Radius for days and selected range endpoints.          |

Override them on Root when a different density is needed:

```svelte
<CalendarRange.Root class="[--cell-radius:var(--radius-lg)] [--cell-size:--spacing(9)]" />
```

Root is compact by default. Add `w-full` to fill its container; visible months grow equally and every grid divides its width into seven equal columns:

```svelte
<CalendarRange.Root class="w-full rounded-lg border" />
```

The local components do not add xvelte `data-slot` attributes. Bits UI supplies dependency-owned selectors:

- Part hooks such as `data-range-calendar-root`, `data-range-calendar-cell`, and `data-range-calendar-day`, plus matching hooks for navigation and grid parts.
- Range state: `data-selection-start`, `data-selection-end`, `data-range-start`, `data-range-end`, `data-range-middle`, and `data-highlighted`.
- Date state: `data-selected`, `data-today`, `data-disabled`, `data-unavailable`, `data-outside-month`, `data-outside-visible-months`, `data-focused`, and `data-value`.
- Root/grid state: `data-invalid`, `data-disabled`, and `data-readonly`.
- Bits UI also exposes `data-bits-day`; treat it as dependency-owned.

Notable local styling behavior:

- Root uses `group/calendar`, background, padding, and transparent backgrounds inside `card-content` or `popover-content` slots.
- Months change from a vertical layout to a row at the `md` breakpoint and share the available width equally; navigation is positioned across the top.
- Every grid uses native fixed table layout. Weekday headings, cells, and day controls therefore stay centered in seven equal columns at compact and full widths.
- The first and last selected dates use primary colors and rounded outer edges. Every middle date uses `rounded-none`, including dates at the start or end of a week, so only the actual range endpoints are rounded.
- The provisional range under pointer or keyboard focus uses `data-highlighted` state supplied by Bits UI.
- Today uses accent colors when unselected; outside-month and disabled dates are muted; unavailable dates are struck through.
- Navigation icons rotate in right-to-left layouts.
- Month/year dropdowns keep a transparent native select over a styled visual label.
- Public `class` props are merged after local classes with `cn`, except GridHead and GridBody, which forward primitive props directly because they add no local class.

Check the installed Bits UI API before relying on dependency-owned selectors across upgrades.

---

## Accessibility

Bits UI supplies grid semantics, date labels, range announcements, roving focus, keyboard navigation, and selection behavior. Local wrappers preserve those attributes and keep native selects for dropdown captions.

- Always provide a specific `calendarLabel`, such as “Travel dates” or “Reporting period”. Bits UI appends the visible month/year.
- Arrow Left/Right moves focus by one day; Arrow Up/Down moves by one week. Enter and Space select the focused date.
- Explain whether the user is choosing a start or end date and any `minDays`, `maxDays`, disabled-date, or availability rules in visible text.
- Previous/next controls are native buttons and become disabled at `minValue`/`maxValue` boundaries.
- Disabled dates cannot receive normal focus or selection. Unavailable dates remain in keyboard navigation in the installed primitive but expose `aria-disabled="true"` and cannot be selected.
- Read-only calendars remain focusable and navigable; disabled calendars do not.
- If a custom `day` snippet replaces CalendarRange.Day, keyboard and screen-reader behavior can be lost. Keep CalendarRange.Day as the interactive part.
- Decorative navigation icons are not accessible names. Bits UI supplies the buttons' labels.
- Month/year dropdowns contain real native selects. Do not remove the transparent select or make the visible `aria-hidden` label interactive.
- Do not communicate today, selection endpoints, range middle, disabled, or unavailable state only through color. Add visible instructions or summaries when those distinctions matter.

Calendar Range does not provide a text-entry alternative or surrounding dialog/popover focus management. Compose those separately when required.

---

## Localization

Calendar Range has no Paraglide message keys, but Root uses `getLocale()` from the generated Paraglide runtime as its default `locale`. Date text is generated from `locale`, `calendarLabel`, `monthFormat`, `yearFormat`, and `weekdayFormat`. The installed Bits UI primitive also contains English accessibility defaults and announcements:

| Copy/input          | Local or dependency default | Purpose                                                                   |
| ------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `locale`            | Paraglide                   | Formats visible and accessible dates, weekdays, months, and years.        |
| `calendarLabel`     | `Event`                     | Accessible calendar purpose; visible month/year is appended.              |
| `monthFormat`       | Contextual                  | Long for label captions and short for dropdown captions by default.       |
| `yearFormat`        | `numeric`                   | Formats year labels and options.                                          |
| `weekdayFormat`     | `short`                     | Produces weekday strings; local Root displays their first two characters. |
| Navigation labels   | `Previous`, `Next`          | Accessible names for the two navigation buttons.                          |
| Dropdown labels     | `Select a month/year`       | Accessible names for the native caption selects.                          |
| Range announcements | English dependency strings  | Announces a selected date, completed range, or cleared selection.         |

Always pass a translated, context-specific `calendarLabel`. Month/year formatting follows `locale`, but the navigation, select, and live-announcement strings cannot all be replaced through local Root. Fully localizing those strings requires adapting the exported wrappers or using an advanced custom composition.

Translate surrounding instructions, selected-range summaries, validation feedback, and empty states in the app. Technical values such as data attributes, caption layouts, and ISO date strings are not translated.

---

## Dependencies

Calendar Range requires Svelte 5, Bits UI, `@internationalized/date`, Tabler's Svelte icons, Tailwind Variants through Button, the local utilities, and Tailwind CSS. Install runtime dependencies first and development dependencies second:

```sh
# Bun
bun add bits-ui @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install bits-ui @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add bits-ui @internationalized/date @tabler/icons-svelte tailwind-variants clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss
```

### Component files

Copy the complete `src/lib/components/ui/calendar-range` component folder:

- `calendar-range-root.svelte`
- `calendar-range-months.svelte`
- `calendar-range-month.svelte`
- `calendar-range-nav.svelte`
- `calendar-range-prev-button.svelte`
- `calendar-range-next-button.svelte`
- `calendar-range-header.svelte`
- `calendar-range-caption.svelte`
- `calendar-range-heading.svelte`
- `calendar-range-month-select.svelte`
- `calendar-range-year-select.svelte`
- `calendar-range-grid.svelte`
- `calendar-range-grid-head.svelte`
- `calendar-range-grid-body.svelte`
- `calendar-range-grid-row.svelte`
- `calendar-range-head-cell.svelte`
- `calendar-range-cell.svelte`
- `calendar-range-day.svelte`
- `index.ts`
- `README.md`

### Required UI component

Copy the complete `src/lib/components/ui/button` component:

- `button-root.svelte`
- `index.ts`
- `README.md`

Follow the Button component's README to install it and understand its variants, native API, styling, accessibility, and theme requirements. PrevButton and NextButton import Button's public variant helper and type. No other xvelte component, hook, attachment, context module, shared style, font, image, or network service is required.

### Shared utilities

Calendar Range imports `cn`, `WithElementRef`, and `WithoutChildrenOrChild` from `$lib/utils`; Button uses `cn` and `WithElementRef`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block includes `clsx` and `tailwind-merge`, which these helpers import.

### Paraglide locale

Configure and compile Paraglide so `$lib/paraglide/runtime.js` exports `getLocale`. Calendar Range has no message keys, but Root reads that generated runtime when `locale` is omitted. Passing `locale` remains the per-calendar override.

### Icons

Add the semantic navigation and select icon exports to `src/lib/icons.ts`:

```ts
export { default as ChevronDownIcon } from "@tabler/icons-svelte/icons/chevron-down";
export { default as ChevronLeftIcon } from "@tabler/icons-svelte/icons/chevron-left";
export { default as ChevronRightIcon } from "@tabler/icons-svelte/icons/chevron-right";
```

The package block includes `@tabler/icons-svelte`. Calendar Range imports no icon package directly.

### Global CSS

Load Tailwind, configure the class-based dark variant, and expose the semantic colors and radius scale used by Calendar Range and its Button dependency. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--accent: oklch(0.841 0.238 128.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--accent: oklch(0.768 0.233 130.85);
	--accent-foreground: oklch(0.405 0.101 131.063);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@custom-variant data-selected {
	&:where([data-selected]) {
		@slot;
	}
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}

@custom-variant data-disabled {
	&:where([data-disabled="true"]),
	&:where([data-disabled]:not([data-disabled="false"])) {
		@slot;
	}
}
```

The app owns dark-mode activation. No `tw-animate-css` import, keyframe, Paraglide message, shared component stylesheet, or component-specific global variable is required. The generated Paraglide runtime is required for the default locale.

---

## Credits

Calendar Range is adapted from the [shadcn-svelte Range Calendar](https://www.shadcn-svelte.com/docs/components/range-calendar). Its complete built-in composition, local caption behavior, Button integration, icon facade, range styling, and defaults have been adapted for xvelte.

---

## File organization

| File                                 | Responsibility                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `calendar-range-root.svelte`         | Builds the complete range calendar and adds local captions and day rendering. |
| `calendar-range-months.svelte`       | Lays out all visible months responsively.                                     |
| `calendar-range-month.svelte`        | Wraps one visible month.                                                      |
| `calendar-range-nav.svelte`          | Positions previous and next navigation controls.                              |
| `calendar-range-prev-button.svelte`  | Styles the Bits UI previous button and supplies its default icon.             |
| `calendar-range-next-button.svelte`  | Styles the Bits UI next button and supplies its default icon.                 |
| `calendar-range-header.svelte`       | Styles the caption row.                                                       |
| `calendar-range-caption.svelte`      | Renders label, month dropdown, year dropdown, or both.                        |
| `calendar-range-heading.svelte`      | Styles the optional Bits UI heading component.                                |
| `calendar-range-month-select.svelte` | Renders the styled month selector over a native select.                       |
| `calendar-range-year-select.svelte`  | Renders the styled year selector over a native select.                        |
| `calendar-range-grid.svelte`         | Styles the month table/grid.                                                  |
| `calendar-range-grid-head.svelte`    | Wraps the weekday heading section.                                            |
| `calendar-range-grid-body.svelte`    | Wraps the weeks section.                                                      |
| `calendar-range-grid-row.svelte`     | Styles each weekday/week row.                                                 |
| `calendar-range-head-cell.svelte`    | Styles weekday heading cells.                                                 |
| `calendar-range-cell.svelte`         | Styles cells, selected backgrounds, and range endpoint radii.                 |
| `calendar-range-day.svelte`          | Styles interactive days and every visible range/date state.                   |
| `index.ts`                           | Exports all components and matching props types.                              |
| `README.md`                          | Usage, API, styling, accessibility, localization, dependencies, and credits.  |

The component's `index.ts`, exported types, and local source are the source of truth for the public API.

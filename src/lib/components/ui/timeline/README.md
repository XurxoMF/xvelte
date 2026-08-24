# Timeline

A presentational compound component for arranging dated events along a vertical line. It provides item spacing, a customizable marker, semantic title typography, date and description text, and native attribute forwarding while leaving timeline data and interaction to the app.

Use Timeline for chronological histories, activity feeds, release notes, or process milestones. Use Stepper for an interactive multi-stage workflow and a normal list when chronology does not need a visual axis.

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

```svelte
<script lang="ts">
	import * as Timeline from "$lib/components/ui/timeline";
</script>
```

`index.ts` exports `Root`, `Item`, `Separator`, `Content`, `Title`, `Date`, and `Description`, together with a matching props type for each part.

## Anatomy

```svelte
<Timeline.Root>
	<Timeline.Item>
		<Timeline.Separator />
		<Timeline.Content>
			<Timeline.Date>Date</Timeline.Date>
			<Timeline.Title>Event title</Timeline.Title>
			<Timeline.Description>Event details</Timeline.Description>
		</Timeline.Content>
	</Timeline.Item>
</Timeline.Root>
```

Root draws the continuous line. Separator sits over it and renders a small primary dot unless custom children are supplied.

## Basic usage

```svelte
<script lang="ts">
	import * as Timeline from "$lib/components/ui/timeline";

	const events = [
		{ date: "12 August 2026", title: "Order placed", description: "We received your order." },
		{ date: "13 August 2026", title: "Order shipped", description: "The parcel left the warehouse." }
	];
</script>

<Timeline.Root role="list" aria-label="Order history">
	{#each events as event (event.title)}
		<Timeline.Item role="listitem">
			<Timeline.Separator aria-hidden="true" />
			<Timeline.Content>
				<Timeline.Date>{event.date}</Timeline.Date>
				<Timeline.Title>{event.title}</Timeline.Title>
				<Timeline.Description>{event.description}</Timeline.Description>
			</Timeline.Content>
		</Timeline.Item>
	{/each}
</Timeline.Root>
```

Root and Item are divs, so add list roles when the events should be exposed as a list.

## Examples

### Semantic date element

Date renders a paragraph. Place a native `<time>` inside it when a machine-readable date is available:

```svelte
<Timeline.Date>
	<time datetime="2026-08-13">13 August 2026</time>
</Timeline.Date>
```

### Custom marker

```svelte
<Timeline.Separator class="border-primary bg-primary text-primary-foreground">
	<span aria-hidden="true">✓</span>
</Timeline.Separator>
```

Custom children completely replace the default inner dot. Keep decorative markers hidden or provide equivalent text in Content.

### Current event

```svelte
<Timeline.Item aria-current="step">
	<Timeline.Separator class="ring-4 ring-primary/20" aria-hidden="true" />
	<Timeline.Content>
		<Timeline.Date>Today</Timeline.Date>
		<Timeline.Title>In transit</Timeline.Title>
		<Timeline.Description>Your parcel is moving through the network.</Timeline.Description>
	</Timeline.Content>
</Timeline.Item>
```

State is app-owned; Timeline adds no active or completed props.

## Public API

Timeline is local native markup. Each props type accepts the corresponding native attributes, `children`, a mergeable `class`, and bindable `ref`. The component's `index.ts`, exported types, and source are the source of truth.

| Part and type                      | Element | Local behavior                                                                                 |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `Root` — `RootProps`               | `div`   | Relative vertical flex container plus an absolute one-pixel line at 11.5 pixels from the left. |
| `Item` — `ItemProps`               | `div`   | Relative flex row, 2rem bottom padding except for the final item, and `group` class.           |
| `Separator` — `SeparatorProps`     | `div`   | 1.5rem circular bordered marker over the line; renders children or a default primary dot.      |
| `Content` — `ContentProps`         | `div`   | Flexible vertical content with left margin, small gap, and top alignment.                      |
| `Date` — `DateProps`               | `p`     | Muted extra-small date line.                                                                   |
| `Title` — `TitleProps`             | `h3`    | Small semibold heading.                                                                        |
| `Description` — `DescriptionProps` | `p`     | Muted small supporting text.                                                                   |

All remaining native attributes and handlers are forwarded. Classes merge after local defaults with `cn()`.

## Styling and DOM contract

Stable hooks are `data-slot="timeline"`, `timeline-item`, `timeline-separator`, `timeline-content`, `timeline-date`, `timeline-title`, and `timeline-description`.

The continuous line and default inner dot have no separate slots. The line uses `border`, while the marker uses `background`, `border`, `primary`, and shadow styling. Root is fixed to a left-aligned vertical layout; alternate axes require app CSS or a future component API.

## Accessibility

The local composition is visual and does not add list semantics automatically. Use `role="list"` and `role="listitem"`, or wrap events in native list markup outside the component when the collection should be announced as a list. Title is always an `h3`, so ensure it fits the page heading hierarchy.

Use native `<time datetime>` for machine-readable dates. Decorative separators and icons should be hidden from assistive technology, and state such as current/completed must also be expressed in text or ARIA rather than color alone.

## Localization

Timeline contains no built-in copy and requires no localization messages. The app supplies and translates titles, descriptions, relative-date wording, accessible labels, and date/time formatting.

## Dependencies

### Packages

```sh
# Bun
bun add clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss
```

No primitive or animation package is required.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--primary: oklch(0.768 0.233 130.85);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
}
```

Values may be replaced by the app's theme. No keyframe, custom variant, font, or layout rule is required.

### Shared utilities

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

### Component files and other integration

```text
timeline/
├── index.ts
├── timeline-content.svelte
├── timeline-date.svelte
├── timeline-description.svelte
├── timeline-item.svelte
├── timeline-root.svelte
├── timeline-separator.svelte
└── timeline-title.svelte
```

Timeline needs no icon, other xvelte component, hook, attachment, context, localization setup, shared style, image, font, or network service.

## Credits

The component structure and presentation are adapted from [more-shadcn-svelte Timeline](https://more-shadcn.noair.fun/docs/components/timeline).

## File organization

| File                          | Responsibility                                                          |
| ----------------------------- | ----------------------------------------------------------------------- |
| `timeline-root.svelte`        | Vertical container and continuous background line.                      |
| `timeline-item.svelte`        | Event row and inter-item spacing.                                       |
| `timeline-separator.svelte`   | Marker shell, default dot, and custom marker content.                   |
| `timeline-content.svelte`     | Event text layout.                                                      |
| `timeline-date.svelte`        | Date paragraph styling.                                                 |
| `timeline-title.svelte`       | Event heading semantics and typography.                                 |
| `timeline-description.svelte` | Supporting event description.                                           |
| `index.ts`                    | Public parts and every exported props type.                             |
| `README.md`                   | Composition, examples, API, semantics, styling, and installation guide. |

The component's `index.ts` and exported types are the source of truth for the public API.

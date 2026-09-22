# Bubble

Conversational content surfaces with seven semantic variants, logical alignment, grouping, reactions, and polymorphic links or buttons. Use Bubble for a framed message surface or short conversational choice; use Message when avatars, sender metadata, status, or message-level actions are also required.

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

```svelte
<script lang="ts">
	import * as Bubble from "$lib/components/ui/bubble";
</script>
```

The component's `index.ts` exports `Root`, `Group`, `Content`, `Reactions`, their named props and variant types, `rootVariants`, and `reactionsVariants`.

---

## Anatomy

```svelte
<Bubble.Group>
	<Bubble.Root>
		<Bubble.Content />
		<Bubble.Reactions />
	</Bubble.Root>
</Bubble.Group>
```

`Group` is optional. Place `Reactions` inside the corresponding `Root` because its position is anchored to that root.

---

## Basic usage

```svelte
<Bubble.Root variant="muted">
	<Bubble.Content>I checked the project and found three affected files.</Bubble.Content>
</Bubble.Root>
```

---

## Examples

### Alignment and grouping

```svelte
<Bubble.Group>
	<Bubble.Root align="end">
		<Bubble.Content>Run the checks.</Bubble.Content>
	</Bubble.Root>
	<Bubble.Root align="end" variant="tinted">
		<Bubble.Content>The checks passed.</Bubble.Content>
	</Bubble.Root>
</Bubble.Group>
```

`align` is logical: `end` follows the document direction. A root inside `Message.Root align="end"` also aligns to the end automatically.

### Reactions

```svelte
<Bubble.Root variant="muted">
	<Bubble.Content>The preview is ready.</Bubble.Content>
	<Bubble.Reactions side="bottom" align="end" role="img" aria-label="Reactions: thumbs up and fire">
		<span>👍</span>
		<span>🔥</span>
	</Bubble.Reactions>
</Bubble.Root>
```

Reactions overlap the root edge. Leave enough vertical space between adjacent conversation rows.

### Link or button content

```svelte
<Bubble.Root variant="outline" align="end">
	<Bubble.Content>
		{#snippet child({ props })}
			<a href="/account/recovery" {...props}>I forgot my password</a>
		{/snippet}
	</Bubble.Content>
</Bubble.Root>
```

The `child` snippet receives the complete content props. Spread them onto exactly one native or component-owned element.

---

## Public API

The component's `index.ts` and exported types are the source of truth.

### Root

`RootProps` extends native `div` attributes and exposes a bindable `ref`.

| Prop       | Type                                                                                  | Default     | Description                                                                                        |
| ---------- | ------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `variant`  | `"default" \| "secondary" \| "muted" \| "tinted" \| "outline" \| "ghost" \| "danger"` | `"default"` | Semantic visual treatment. `danger` is xvelte's local name for the upstream destructive treatment. |
| `align`    | `"start" \| "end"`                                                                    | `"start"`   | Logical inline alignment.                                                                          |
| `ref`      | `HTMLDivElement \| null`                                                              | `null`      | Bindable root element.                                                                             |
| `children` | `Snippet`                                                                             | —           | Root contents.                                                                                     |
| `class`    | `string`                                                                              | —           | Classes merged after the generated variant classes.                                                |

`rootVariants`, `RootVariants`, and `RootAlignments` are exported for typed composition.

### Content

`ContentProps` extends native `div` attributes. Without `child`, Content renders a `div` and binds `ref`. With `child`, the caller renders the element and must spread the received `props`; `ref` cannot bind to that caller-owned element.

| Prop       | Type                     | Default | Description                                              |
| ---------- | ------------------------ | ------- | -------------------------------------------------------- |
| `child`    | `Snippet<[{ props }]>`   | —       | Delegates rendering to a link, button, or other element. |
| `ref`      | `HTMLDivElement \| null` | `null`  | Bindable only for the default `div`.                     |
| `children` | `Snippet`                | —       | Content rendered by the default element.                 |
| `class`    | `string`                 | —       | Additional content classes.                              |

### Reactions

`ReactionsProps` extends native `div` attributes and forwards `role`, `aria-label`, handlers, and remaining attributes.

| Prop       | Type                     | Default    | Description                               |
| ---------- | ------------------------ | ---------- | ----------------------------------------- |
| `side`     | `"top" \| "bottom"`      | `"bottom"` | Vertical edge used as the anchor.         |
| `align`    | `"start" \| "end"`       | `"end"`    | Logical position along that edge.         |
| `ref`      | `HTMLDivElement \| null` | `null`     | Bindable reaction container.              |
| `children` | `Snippet`                | —          | Emoji, counters, or controls.             |
| `class`    | `string`                 | —          | Classes merged after `reactionsVariants`. |

`reactionsVariants`, `ReactionsSides`, and `ReactionsAlignments` are exported.

### Group

`GroupProps` extends native `div` attributes. It renders a vertical stack, forwards all attributes, and exposes bindable `ref`, `children`, and `class` props.

---

## Styling and DOM contract

| Part        | Element                       | Stable hooks                                                       |
| ----------- | ----------------------------- | ------------------------------------------------------------------ |
| `Root`      | `div`                         | `data-slot="bubble"`, `data-variant`, `data-align`, `group/bubble` |
| `Content`   | `div` or caller-owned element | `data-slot="bubble-content"`                                       |
| `Reactions` | `div`                         | `data-slot="bubble-reactions"`, `data-side`, `data-align`          |
| `Group`     | `div`                         | `data-slot="bubble-group"`                                         |

Roots size to their content up to 80% of the row; `ghost` removes that maximum and the frame. Root variants style the direct Content child. `class` values are merged with `cn()`, so later conflicting Tailwind utilities win. The semantic tokens are `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `foreground`, `background`, `muted`, `border`, `input`, `card`, and `danger`.

---

## Accessibility

Bubble is a presentational surface and adds no conversation, list, article, or live-region semantics. Put those semantics on the surrounding feature.

- Give a static emoji reaction row `role="img"` and an `aria-label` describing the complete reaction summary. This prevents each glyph and counters such as `+2` from being read without context.
- Render interactive reactions as real buttons and label icon-only controls.
- Use `child` to render clickable content as a real `button` or `a`; do not attach click behavior to the default `div`.
- Pair tone variants—especially `danger`—with explicit text or an icon so color is not the only signal.
- The shared global `*:focus-visible` rule provides the focus treatment for delegated links and buttons.

---

## Localization

Bubble contains no built-in human-readable copy and imports no localization messages. The app supplies and translates message text, choices, reaction labels, counters, and action labels. `align` and reaction alignment use logical directions and follow the document's `dir` value.

---

## Dependencies

Install the runtime and development packages with one command group:

```sh
# Bun
bun add clsx tailwind-merge tailwind-variants
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge tailwind-variants
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge tailwind-variants
pnpm add -D tailwindcss
```

Bubble requires `cn` and `WithElementRef` from `$lib/utils`:

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

The global stylesheet must provide Tailwind, xvelte's shared focus-visible rule, and the semantic variables named in [Styling and DOM contract](#styling-and-dom-contract). Their values may be replaced by the app theme:

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--card: oklch(1 0 0);
	--primary: oklch(65.6% 0.241 354.308);
	--primary-foreground: oklch(0.985 0 0);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(65.6% 0.241 354.308);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--card: oklch(0.216 0.006 56.043);
	--primary: oklch(65.6% 0.241 354.308);
	--primary-foreground: oklch(0.985 0 0);
	--secondary: oklch(0.274 0.006 286.033);
	--secondary-foreground: oklch(0.985 0 0);
	--muted: oklch(0.268 0.007 34.298);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(65.6% 0.241 354.308);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
	* {
		@apply border-border;
	}

	*:focus-visible {
		@apply rounded-sm border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

Bubble requires no icon facade export, primitive package, context, hook, attachment, localization message, shared style utility, asset, font, or network service. Message, Collapsible, Button, Tooltip, and Popover are optional compositions; copy each component's complete folder and follow its guide when used.

---

## Credits

Bubble is adapted from the [shadcn-svelte Bubble component](https://www.shadcn-svelte.com/docs/components/bubble). Its filenames, exported type names, semantic `danger` variant, logical reaction placement, focus handling, and inline style integration follow xvelte's local conventions.

---

## File organization

| File                      | Responsibility                                                           |
| ------------------------- | ------------------------------------------------------------------------ |
| `bubble-root.svelte`      | Alignment, semantic variants, root state attributes, and variant helper. |
| `bubble-content.svelte`   | Framed content and polymorphic `child` rendering.                        |
| `bubble-reactions.svelte` | Overlapping reaction placement and variant helper.                       |
| `bubble-group.svelte`     | Consecutive-bubble stack.                                                |
| `index.ts`                | Public components, types, and variant helpers.                           |
| `bubble.md`               | Installation, API, behavior, and usage guide.                            |

The component's `index.ts` and exported types are the source of truth for the public API.

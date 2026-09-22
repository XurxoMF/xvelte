# Message

Aligned conversation rows with optional avatars, grouped messages, body columns, sender headers, statuses, timestamps, and action footers. Use Message to arrange complete chat entries; compose Bubble, Marker, Attachment, or app-owned content inside it rather than using Message as the visual surface itself.

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
	import * as Message from "$lib/components/ui/message";
</script>
```

The component's `index.ts` exports `Root`, `Group`, `Avatar`, `Content`, `Header`, `Footer`, every named props type, and `RootAlignments`.

---

## Anatomy

```svelte
<Message.Group>
	<Message.Root>
		<Message.Avatar />
		<Message.Content>
			<Message.Header />
			<!-- Bubble, Marker, Attachment, or app content -->
			<Message.Footer />
		</Message.Content>
	</Message.Root>
</Message.Group>
```

All parts except Root are optional. Content is the normal wrapper for a surface plus its metadata; Group stacks consecutive rows from one sender.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Bubble from "$lib/components/ui/bubble";
	import * as Message from "$lib/components/ui/message";
</script>

<Message.Root>
	<Message.Content>
		<Message.Header>Assistant</Message.Header>
		<Bubble.Root variant="muted">
			<Bubble.Content>I found three affected files.</Bubble.Content>
		</Bubble.Root>
	</Message.Content>
</Message.Root>
```

---

## Examples

### End-aligned message with delivery status

```svelte
<Message.Root align="end">
	<Message.Content>
		<Bubble.Root>
			<Bubble.Content>Update the files and run the checks.</Bubble.Content>
		</Bubble.Root>
		<Message.Footer>Delivered</Message.Footer>
	</Message.Content>
</Message.Root>
```

Root reverses its row for `align="end"`; Content aligns each direct slotted child to the same logical side, and Footer justifies its internal row to that side.

### Avatar

```svelte
<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import * as Message from "$lib/components/ui/message";
</script>

<Message.Root>
	<Message.Avatar>
		<Avatar.Root>
			<Avatar.Fallback>AI</Avatar.Fallback>
		</Avatar.Root>
	</Message.Avatar>
	<Message.Content>...</Message.Content>
</Message.Root>
```

When Footer exists, the avatar shifts upward to stay aligned with the message surface rather than the footer.

### Consecutive messages

```svelte
<Message.Group>
	<Message.Root>...</Message.Root>
	<Message.Root>...</Message.Root>
</Message.Group>
```

### Status and attachments

Place a `Marker.Root role="status"` directly in a row for a dynamic update. Place an Attachment after a Bubble inside Content when a message includes a file. Follow each component's own guide for semantics and installation.

---

## Public API

The component's `index.ts` and exported types are the source of truth. Every part renders a `div`, extends native `div` attributes, forwards remaining props and events, merges `class` through `cn()`, renders `children`, and exposes a bindable `HTMLDivElement | null` `ref`.

### Root

| Prop       | Type                     | Default   | Description                                  |
| ---------- | ------------------------ | --------- | -------------------------------------------- |
| `align`    | `"start" \| "end"`       | `"start"` | Logical sender-side alignment and row order. |
| `ref`      | `HTMLDivElement \| null` | `null`    | Bindable row element.                        |
| `children` | `Snippet`                | —         | Message parts.                               |
| `class`    | `string`                 | —         | Additional row classes.                      |

`RootProps` and `RootAlignments` are exported.

### Group

`GroupProps` describes a vertical stack of consecutive Message roots with a default gap of `0.5rem`.

### Avatar

`AvatarProps` describes the avatar position. It anchors to the bottom of Root, reserves a minimum width of `2rem`, and shifts upward when Root contains Footer. It does not create an image or accessible name; compose the Avatar component or app markup inside it.

### Content

`ContentProps` describes the full-width body column. It stacks direct children, wraps long content, and aligns each direct `data-slot` child to the end when Root has `align="end"`.

### Header

`HeaderProps` describes leading metadata such as the sender name. It uses small muted text and removes horizontal inset when Root contains a ghost Bubble.

### Footer

`FooterProps` describes trailing metadata, status, timestamps, or actions. It uses small muted text, follows Root's logical alignment, and removes horizontal inset when Root contains a ghost Bubble.

---

## Styling and DOM contract

| Part      | Element | Stable hooks                                         |
| --------- | ------- | ---------------------------------------------------- |
| `Root`    | `div`   | `data-slot="message"`, `data-align`, `group/message` |
| `Group`   | `div`   | `data-slot="message-group"`                          |
| `Avatar`  | `div`   | `data-slot="message-avatar"`                         |
| `Content` | `div`   | `data-slot="message-content"`                        |
| `Header`  | `div`   | `data-slot="message-header"`                         |
| `Footer`  | `div`   | `data-slot="message-footer"`                         |

Message is intentionally a layout component: it supplies no border or conversation surface. It recognizes descendant `data-variant="ghost"` to remove Header and Footer inset, and the presence of `data-slot="message-footer"` to offset Avatar. Keep those attributes when replacing composed parts. Message uses the `muted` and `muted-foreground` semantic tokens.

---

## Accessibility

Message adds no message, article, list, log, or live-region role. Choose the surrounding semantics for the product: a static transcript may use a list, while a live conversation may use an appropriately labeled log or live region without re-announcing the whole thread.

- Avatar is only a layout wrapper. Give images useful alternative text when identity matters, or empty alternative text when the adjacent Header already provides the same name.
- Label every icon-only action placed in Footer.
- Use Marker with `role="status"` for a concise in-progress update that should be announced.
- Do not rely on `align` alone to identify the sender; include a name, avatar alternative, surrounding label, or other textual context where needed.

---

## Localization

Message contains no built-in human-readable copy and imports no localization messages. The app supplies and translates sender names, message content, timestamps, delivery states, action names, status updates, and accessible labels. Alignment is logical and follows the document's `dir` value.

---

## Dependencies

Install the runtime and development packages required by Message itself:

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

Message requires `cn` and `WithElementRef` from `$lib/utils`:

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

The global stylesheet must import Tailwind and map the `muted` and `muted-foreground` semantic colors. These are xvelte's values; an app may replace them while preserving the variable names:

```css
@import "tailwindcss";

:root {
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
}

.dark {
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
}
```

Message needs no icons, context, hooks, attachments, localization messages, shared style utilities, assets, fonts, or network services by itself.

A useful message needs app-owned content. The documented composition uses these optional xvelte component folders:

- `src/lib/components/ui/bubble/`: all `.svelte` files, `index.ts`, and `bubble.md`.
- `src/lib/components/ui/avatar/`: all `.svelte` files, `index.ts`, and `avatar.md`.
- `src/lib/components/ui/marker/`: all `.svelte` files, `index.ts`, and `marker.md`.
- `src/lib/components/ui/attachment/`: all `.svelte` files, `index.ts`, and `attachment.md`.
- `src/lib/components/ui/button/`: all `.svelte` files, `index.ts`, and `button.md` when Footer contains actions.

Copy only the compositions the app uses and follow each guide instead of duplicating their package, token, icon, style, and accessibility requirements here.

---

## Credits

Message is adapted from the [shadcn-svelte Message component](https://www.shadcn-svelte.com/docs/components/message). Its filenames, exported type names, logical alignment, and inline style integration follow xvelte's local conventions.

---

## File organization

| File                     | Responsibility                                    |
| ------------------------ | ------------------------------------------------- |
| `message-root.svelte`    | Logical sender alignment and row order.           |
| `message-group.svelte`   | Consecutive-message stack.                        |
| `message-avatar.svelte`  | Bottom-aligned avatar position and footer offset. |
| `message-content.svelte` | Body column, wrapping, and child alignment.       |
| `message-header.svelte`  | Sender and leading metadata.                      |
| `message-footer.svelte`  | Status, timestamp, and action metadata.           |
| `index.ts`               | Public components and types.                      |
| `message.md`             | Installation, API, behavior, and usage guide.     |

The component's `index.ts` and exported types are the source of truth for the public API.

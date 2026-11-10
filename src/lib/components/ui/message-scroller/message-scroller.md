# Message Scroller

An anchored chat transcript scroller that follows streamed responses without fighting the reader, preserves position when earlier history is inserted, restores saved conversations, tracks visible messages, and supports programmatic jumps. Use it for height-constrained chat transcripts; use Scroll Area for general-purpose overflow that does not need message-aware behavior.

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

Import the component and its hooks through the public `index.ts`:

```svelte
<script lang="ts">
	import * as MessageScroller from "$lib/components/ui/message-scroller";
</script>
```

The component exports `Provider`, `Root`, `Viewport`, `Content`, `Item`, and `Button`; their named props types; the `DefaultScrollPosition`, `ScrollAlign`, `ScrollOptions`, `Scrollable`, and `VisibilityState` types; and the `useMessageScroller`, `useMessageScrollerScrollable`, and `useMessageScrollerVisibility` hooks.

---

## Anatomy

```svelte
<MessageScroller.Provider>
	<MessageScroller.Root>
		<MessageScroller.Viewport>
			<MessageScroller.Content>
				<MessageScroller.Item>{/* Message, Marker, or another transcript row */}</MessageScroller.Item>
			</MessageScroller.Content>
		</MessageScroller.Viewport>

		<MessageScroller.Button />
	</MessageScroller.Root>
</MessageScroller.Provider>
```

`Provider` owns the state and renders no element. `Root` is the positioned frame, `Viewport` is the scrollable region, and `Content` is the transcript log. Every direct transcript row must be wrapped in `Item` so it can be measured, anchored, preserved, tracked, and addressed. `Button` is an optional control for returning to either edge.

Message Scroller fills its parent. Give an ancestor a definite or flex-constrained height and keep the `min-h-0` chain intact.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Message from "$lib/components/ui/message";
	import * as MessageScroller from "$lib/components/ui/message-scroller";
</script>

<div class="h-96 min-h-0">
	<MessageScroller.Provider autoScroll defaultScrollPosition="last-anchor">
		<MessageScroller.Root>
			<MessageScroller.Viewport>
				<MessageScroller.Content class="gap-6 p-4">
					{#each messages as message (message.id)}
						<MessageScroller.Item messageId={message.id} scrollAnchor={message.role === "user"}>
							<Message.Root align={message.role === "user" ? "end" : "start"}>
								<!-- Render the message body here. -->
							</Message.Root>
						</MessageScroller.Item>
					{/each}
				</MessageScroller.Content>
			</MessageScroller.Viewport>

			<MessageScroller.Button />
		</MessageScroller.Root>
	</MessageScroller.Provider>
</div>
```

`autoScroll` follows output only while the reader is already at the live edge. Wheel, touch, scrollbar, keyboard, selection, and explicit message-jump intent release that behavior rather than pulling the reader away from what they are reading.

---

## Examples

### Anchor new turns

Mark the row that begins a meaningful exchange. In a two-party assistant chat this is usually the user message, but any row may be an anchor:

```svelte
<MessageScroller.Item messageId={message.id} scrollAnchor={message.role === "user"}>
	<!-- message -->
</MessageScroller.Item>
```

When a new anchor is appended, the viewport places it near the top and keeps `scrollPreviousItemPeek` pixels of the previous row visible. This leaves room for the response to grow while retaining conversational context.

### Preserve position while loading history

Prepend stable keyed rows to the data collection. `Viewport` preserves the first visible `messageId` by default:

```svelte
<MessageScroller.Viewport preserveScrollOnPrepend>
	<MessageScroller.Content>
		{#each messages as message (message.id)}
			<MessageScroller.Item messageId={message.id}>
				<!-- message -->
			</MessageScroller.Item>
		{/each}
	</MessageScroller.Content>
</MessageScroller.Viewport>
```

Stable `messageId` values make restoration precise. Rows without an ID can still render, but cannot participate in message jumps or visibility snapshots.

### Jump to a message

Hooks may be used anywhere below the same Provider, including controls outside Root:

```svelte
<script lang="ts">
	import * as MessageScroller from "$lib/components/ui/message-scroller";

	const { scrollToMessage, scrollToStart, scrollToEnd } = MessageScroller.useMessageScroller();
</script>

<button type="button" onclick={() => scrollToMessage("decision", { align: "center", behavior: "smooth" })}> Jump to the decision </button>
<button type="button" onclick={() => scrollToStart({ behavior: "smooth" })}>First message</button>
<button type="button" onclick={() => scrollToEnd({ behavior: "smooth" })}>Latest message</button>
```

Every command returns `boolean`. A successful result means the jump ran or was queued while initial items mount; it does not mean the animation has already finished. A missing ID after mounting returns `false`.

### Read scroll and visibility state

```svelte
<script lang="ts">
	import * as MessageScroller from "$lib/components/ui/message-scroller";

	const scrollable = MessageScroller.useMessageScrollerScrollable();
	const visibility = MessageScroller.useMessageScrollerVisibility();
</script>

<p>
	At latest message: {!scrollable.end ? "yes" : "no"}. Current turn: {visibility.currentAnchorId ?? "none"}.
</p>
```

`scrollable.start` and `scrollable.end` report whether hidden content remains in that direction. `currentAnchorId` identifies the anchored turn the reader is in, while `visibleMessageIds` lists intersecting rows in document order. Visibility observation runs only when the visibility hook is used.

### Custom edge button

Pass children to replace only the default icon and accessible label, or use `child` to render the complete interactive element:

```svelte
<MessageScroller.Button direction="start" variant="outline" size="sm">Back to the first message</MessageScroller.Button>

<MessageScroller.Button direction="end">
	{#snippet child({ props, active, direction })}
		<button {...props}>{active ? `Go to ${direction}` : "Caught up"}</button>
	{/snippet}
</MessageScroller.Button>
```

When using `child`, spread `props` onto a real button. They contain the click behavior, `inert`, `tabindex`, activity state, and reference attachment.

### Streaming announcements

Use `aria-busy` while the active response is incomplete if a screen reader should wait before announcing that row:

```svelte
<MessageScroller.Content aria-busy={status === "streaming"}>
	<!-- transcript rows -->
</MessageScroller.Content>
```

---

## Public API

All DOM-rendering parts merge `class`, forward remaining native attributes and event handlers, render snippets, and expose a bindable `ref`. Root, Viewport, Content, Item, and Button inherit render delegation through `child` from the primitive. The component's `index.ts`, exported types, and installed `@shadcn-svelte/primitives` version are the source of truth.

### `MessageScroller.Provider`

Type: `ProviderProps`. Provider renders no DOM and must wrap every hook and part belonging to one transcript.

| Prop                     | Type                                | Default     | Behavior                                                           |
| ------------------------ | ----------------------------------- | ----------- | ------------------------------------------------------------------ |
| `autoScroll`             | `boolean`                           | `false`     | Follows growing output only while the viewport remains at the end. |
| `defaultScrollPosition`  | `"start" \| "end" \| "last-anchor"` | `"end"`     | Opening position applied once on the first non-empty render.       |
| `scrollEdgeThreshold`    | `number`                            | `8`         | Pixel tolerance used to consider the viewport at either edge.      |
| `scrollPreviousItemPeek` | `number`                            | `64`        | Previous-row height kept visible above a newly anchored turn.      |
| `scrollMargin`           | `number`                            | `0`         | Default aligned-edge margin for commands and visibility.           |
| `children`               | `Snippet`                           | `undefined` | Renders the scroller and any controls using its hooks.             |

`last-anchor` opens at the last `scrollAnchor`; it falls back to the end if no useful anchor exists or that final turn already fits.

### `MessageScroller.Root`

Type: `RootProps`. It renders a `div`, fills its constrained parent, establishes the positioning context for Button, and forwards native div attributes. `ref` defaults to `null`.

### `MessageScroller.Viewport`

Type: `ViewportProps`. It renders a vertically scrollable `div`.

| Prop                      | Type                     | Default                | Behavior                                                                       |
| ------------------------- | ------------------------ | ---------------------- | ------------------------------------------------------------------------------ |
| `preserveScrollOnPrepend` | `boolean`                | `true`                 | Keeps the first visible identified row stable when rows are inserted above it. |
| `aria-label`              | `string`                 | localized `"Messages"` | Accessible name for the scroll region; may be overridden.                      |
| `role`                    | `AriaRole`               | `"region"`             | Semantic role supplied by the primitive.                                       |
| `tabindex`                | `number`                 | `0`                    | Makes the viewport directly keyboard-scrollable.                               |
| `children` / `child`      | `Snippet`                | `undefined`            | Default content or delegated viewport element.                                 |
| `class`                   | `ClassValue`             | `undefined`            | Merges onto the scrolling element.                                             |
| `ref`                     | `HTMLDivElement \| null` | `null`                 | Bindable viewport reference.                                                   |

Native `onkeydown`, `onscroll`, `ontouchmove`, and `onwheel` handlers are composed with the primitive's intent tracking.

### `MessageScroller.Content`

Type: `ContentProps`. It renders a transcript `div` with `role="log"` and `aria-relevant="additions"` by default.

| Prop                 | Type                     | Default     | Behavior                                                                    |
| -------------------- | ------------------------ | ----------- | --------------------------------------------------------------------------- |
| `spacerClassName`    | `string`                 | `undefined` | Class for the internal, hidden tail spacer used to position anchored turns. |
| `children` / `child` | `Snippet`                | `undefined` | Transcript rows or delegated content element.                               |
| `class`              | `ClassValue`             | `undefined` | Merges onto the transcript container.                                       |
| `ref`                | `HTMLDivElement \| null` | `null`      | Bindable content reference.                                                 |

Native live-region attributes such as `aria-busy`, `aria-live`, and `aria-relevant` are forwarded. The primitive owns an internal `data-message-scroller-spacer` element; do not remove it when customizing markup.

### `MessageScroller.Item`

Type: `ItemProps`. It renders one transcript-row `div`.

| Prop                 | Type                     | Default     | Behavior                                                                   |
| -------------------- | ------------------------ | ----------- | -------------------------------------------------------------------------- |
| `messageId`          | `string`                 | `undefined` | Stable address used for preservation, visibility, and `scrollToMessage`.   |
| `scrollAnchor`       | `boolean`                | `false`     | Marks a meaningful turn boundary for new-turn anchoring and `last-anchor`. |
| `children` / `child` | `Snippet`                | `undefined` | Row content or delegated row element.                                      |
| `class`              | `ClassValue`             | `undefined` | Merges onto the measurable row.                                            |
| `ref`                | `HTMLDivElement \| null` | `null`      | Bindable row reference.                                                    |

The default styles use `content-visibility: auto` and an intrinsic fallback size. Avoid height, margin, or padding entrance animations on Item because they interfere with position preservation; animate transform and opacity instead.

### `MessageScroller.Button`

Type: `ButtonProps`. It uses the primitive's button state and renders xvelte `Button.Root` by default.

| Prop        | Type                                    | Default                | Behavior                                                               |
| ----------- | --------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `direction` | `"start" \| "end"`                      | `"end"`                | Chooses the transcript edge and rotates the default chevron for start. |
| `behavior`  | `ScrollBehavior`                        | `"smooth"`             | Native behavior used by the edge jump.                                 |
| `variant`   | `Button.RootVariants`                   | `"secondary"`          | xvelte Button visual treatment.                                        |
| `size`      | `Button.RootSizes`                      | `"icon-sm"`            | xvelte Button size.                                                    |
| `children`  | `Snippet`                               | localized icon control | Replaces the default icon and screen-reader label.                     |
| `child`     | `Snippet<{ props; active; direction }>` | `undefined`            | Delegates the complete interactive element.                            |
| `class`     | `ClassValue`                            | `undefined`            | Merges with the floating control classes.                              |
| `ref`       | `HTMLButtonElement \| null`             | `null`                 | Bindable button reference.                                             |

The inactive button becomes `inert`, receives `tabindex="-1"`, and visually exits. Native button props and click handlers are forwarded and composed.

### Hooks

| Hook                             | Return value                                      | Purpose                                  |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| `useMessageScroller()`           | `{ scrollToStart; scrollToEnd; scrollToMessage }` | Imperative navigation commands.          |
| `useMessageScrollerScrollable()` | `Scrollable`                                      | Reactive start/end overflow snapshot.    |
| `useMessageScrollerVisibility()` | `VisibilityState`                                 | Reactive current anchor and visible IDs. |

Call hooks only while a matching Provider is present above the calling component.

### Public helper types

| Type                    | Meaning                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `DefaultScrollPosition` | `"start" \| "end" \| "last-anchor"`.                           |
| `ScrollAlign`           | `"start" \| "center" \| "end" \| "nearest"`.                   |
| `ScrollOptions`         | Optional `align`, native `behavior`, and pixel `scrollMargin`. |
| `Scrollable`            | Boolean `start` and `end` overflow flags.                      |
| `VisibilityState`       | `currentAnchorId` plus ordered `visibleMessageIds`.            |

---

## Styling and DOM contract

| Part       | Default element | Stable xvelte hook                                                                   |
| ---------- | --------------- | ------------------------------------------------------------------------------------ |
| `Provider` | none            | none                                                                                 |
| `Root`     | `div`           | `data-slot="message-scroller"`                                                       |
| `Viewport` | `div`           | `data-slot="message-scroller-viewport"`                                              |
| `Content`  | `div`           | `data-slot="message-scroller-content"`                                               |
| `Item`     | `div`           | `data-slot="message-scroller-item"`                                                  |
| `Button`   | `button`        | `data-slot="message-scroller-button"`, `data-direction`, `data-variant`, `data-size` |

The primitive adds these behavior hooks:

- Root and Viewport expose `data-scrollable="start"`, `"end"`, or `"start end"` when content exists beyond those edges.
- Root and Viewport expose `data-autoscrolling` during a programmatic live-edge scroll.
- Root and Viewport expose `data-pending-scroll` until an initial `end` or `last-anchor` position is applied. The styled Viewport remains invisible during that short state to avoid flashing the oldest rows.
- Item exposes `data-message-id` when identified and `data-scroll-anchor="true|false"`.
- Button exposes `data-active="true|false"`; xvelte adds `data-direction`, `data-variant`, and `data-size`.
- Content owns a presentational child with `data-message-scroller-spacer`.

Viewport uses the shared `scroll-fade-b` utility, thin stable-gutter scrollbars, overscroll containment, and transparent scrollbars during automatic motion. Item retains every row in the DOM for selection, find-in-page, SSR, and assistive technology while letting the browser skip offscreen painting.

Root and Button use `background`, `foreground`, `muted`, and `border` semantic tokens. Consumer classes merge last through `cn()`, although Tailwind Merge decides equivalent conflicts. Logical inset and RTL transforms keep the edge control centered in either document direction.

---

## Accessibility

Viewport is a keyboard-focusable, localized `role="region"`; Content is an additions-only `role="log"`. New rows can be announced without forcing streamed text mutations to be read token by token. Use `aria-busy` during a streamed turn when announcements should wait for its completion.

Button is a real button with a localized accessible name when its default content is used. Inactive controls are inert and removed from the tab order. A custom `children` snippet must include visible text or another accessible name; a custom `child` must be an actual button and must spread the provided props.

Keep stable message IDs unique within one Provider. Message Scroller preserves focus and does not own message semantics, sender identity, action labels, or live transport status; compose those responsibilities through Message, Bubble, Marker, and application markup. Do not turn the entire transcript into a constantly assertive live region.

Reduced-motion preferences do not disable scroll behavior automatically. Choose `behavior: "auto"` instead of `"smooth"` for application controls when the product needs to avoid smooth scrolling under reduced motion.

---

## Localization

Message Scroller includes three localized defaults:

| Message ID                | English value     | Used by                                   |
| ------------------------- | ----------------- | ----------------------------------------- |
| `brave_quail_messages`    | `Messages`        | Viewport `aria-label`.                    |
| `gentle_river_scroll_end` | `Scroll to end`   | Default end Button screen-reader label.   |
| `soft_owl_scroll_start`   | `Scroll to start` | Default start Button screen-reader label. |

Override `aria-label` or Button children when the surrounding product needs a more specific description. The app supplies and translates message bodies, sender names, timestamps, history controls, loading states, and custom navigation labels.

---

## Dependencies

Install the primitive as a development dependency and the local wrapper's runtime and build dependencies:

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

The implementation is built against `@shadcn-svelte/primitives` 0.0.1. Its Message Scroller export is the source of the scroll algorithm, context, measurements, observers, event composition, and hooks.

### Required xvelte files

Copy the complete `src/lib/components/ui/button` folder, including every `.svelte` file, `index.ts`, and `button.md`, then follow its guide. Button supplies the default edge control and brings its own semantic-token and `tailwind-variants` requirements.

Copy `src/lib/styles/scroll-fade.css` and `src/lib/styles/scroll-fade.md`, follow that guide, and import the style after Tailwind in the global stylesheet:

```css
@import "tailwindcss";
@import "../lib/styles/scroll-fade.css";
```

Message and Bubble are optional compositions shown in examples. Copy `src/lib/components/ui/message` and `src/lib/components/ui/bubble`, including their guides, only when the app uses them.

### Icon facade

The default Button requires this existing semantic export in `src/lib/icons.ts`:

```ts
export { default as ChevronDownIcon } from "@tabler/icons-svelte/icons/chevron-down";
```

### Utilities

Message Scroller requires `cn` from `$lib/utils`:

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Theme and localization

The global stylesheet must map the semantic colors used by Root and Button. Replace these sample values with the app's own accessible palette:

```css
:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--border: oklch(0.923 0.003 48.717);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-muted: var(--muted);
	--color-border: var(--border);
}
```

Add the three keys listed in [Localization](#localization) to `messages/en.json`, configure Paraglide, and import its generated `$lib/paraglide/messages.js` module. The generated `src/lib/paraglide` output must be produced by the consuming app's Paraglide compile step rather than copied manually.

Message Scroller requires no xvelte hook, attachment, authored context module, asset, font, network service, or Tauri integration. The installed primitive owns its internal state and browser observers.

---

## Credits

Message Scroller is adapted from the [shadcn-svelte Message Scroller](https://www.shadcn-svelte.com/docs/components/message-scroller) and its [`@shadcn-svelte/primitives` implementation](https://github.com/huntabyte/shadcn-svelte/tree/main/packages/primitives/src/lib/message-scroller). The local wrapper adds xvelte's component namespace, named prop types, semantic icon facade, Button composition, localization, data slots, and documentation conventions.

---

## File organization

| File                               | Responsibility                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `message-scroller-provider.svelte` | Headless scroll state, configuration, and hook context.                         |
| `message-scroller-root.svelte`     | Sized and positioned transcript frame.                                          |
| `message-scroller-viewport.svelte` | Accessible scroll region, intent tracking, history preservation, and edge fade. |
| `message-scroller-content.svelte`  | Transcript log and anchor spacer.                                               |
| `message-scroller-item.svelte`     | Measurable, identifiable, anchorable transcript row.                            |
| `message-scroller-button.svelte`   | Localized start/end control composed with xvelte Button.                        |
| `index.ts`                         | Public components, hooks, props, and helper types.                              |
| `message-scroller.md`              | Installation, behavior, API, and usage guide.                                   |

The component's `index.ts`, exported types, and installed primitive version are the source of truth for the public API.

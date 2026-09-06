# IsMobile

`IsMobile` is a reactive media-query class that reports whether the viewport is narrower than a configurable breakpoint. Use it when JavaScript behavior or component composition genuinely changes by viewport. Prefer CSS media or container queries when only presentation changes, particularly in server-rendered pages.

<!-- xvelte-example: overview -->

## Contents

- [Installation](#installation)
- [Import](#import)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Reactivity and lifecycle](#reactivity-and-lifecycle)
- [Accessibility and localization](#accessibility-and-localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Installation

Copy `is-mobile.svelte.ts` and install Svelte 5.7 or newer if the project does not already provide it:

```sh
# Bun
bun add -D svelte

# npm
npm install -D svelte

# pnpm
pnpm add -D svelte
```

---

## Import

```svelte
<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";
</script>
```

The file exports the `IsMobile` class. It does not export the internal default-breakpoint constant.

---

## Basic usage

```svelte
<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	const mobile = new IsMobile();
</script>

{#if mobile.current}
	<button type="button">Open mobile navigation</button>
{:else}
	<nav aria-label="Primary navigation">...</nav>
{/if}
```

The default breakpoint is `768`, producing the media query `max-width: 767px`. `current` comes from Svelte's reactive `MediaQuery` base class and updates when the query match changes.

---

## Examples

### Custom breakpoint

```svelte
<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	const compact = new IsMobile(1024);
</script>

<p>{compact.current ? "Compact navigation" : "Expanded navigation"}</p>
```

The constructor subtracts one pixel, so `new IsMobile(1024)` matches through `1023px`. It does not validate or round the supplied number.

### Derive reusable component state

```svelte
<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	const mobile = new IsMobile();
	const navigationMode = $derived(mobile.current ? "sheet" : "sidebar");
</script>

<p>Current mode: {navigationMode}</p>
```

Reading `current` inside markup, `$derived`, or `$effect` subscribes reactively through Svelte.

---

## Public API

```ts
class IsMobile extends MediaQuery {
	constructor(breakpoint?: number);
	readonly current: boolean;
}
```

| Member                | Type               | Default | Behavior                                                    |
| --------------------- | ------------------ | ------- | ----------------------------------------------------------- |
| `new IsMobile(value)` | `value?: number`   | `768`   | Creates `max-width: ${value - 1}px`.                        |
| `current`             | `readonly boolean` | —       | Inherited reactive match result from Svelte's `MediaQuery`. |

The local constructor exposes only the breakpoint. It does not expose `MediaQuery`'s optional server fallback parameter. See the official [Svelte `MediaQuery` reference](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery) for inherited behavior.

---

## Reactivity and lifecycle

Svelte manages the underlying `matchMedia` listener while reactive consumers read `current`; no local `destroy()` method is needed.

During server-side rendering the viewport is unknown. Because `IsMobile` does not pass a server fallback to its base class, the server result can differ from the browser result and the rendered branch can change during hydration. Use CSS when possible, or ensure both branches tolerate that transition without losing important state or content.

---

## Accessibility and localization

`IsMobile` renders no content and contains no localized copy. Responsive branches must preserve the same available actions, accessible names, focus behavior, and information across viewport sizes. Do not treat viewport width as proof of touch input, device type, or accessibility needs.

---

## Dependencies

`IsMobile` requires only Svelte 5.7 or newer and the single `is-mobile.svelte.ts` file. The installation command is under Installation. It requires no Runed package, browser storage, CSS, icons, xvelte components, other hooks, attachments, or localization configuration.

---

## Credits

`IsMobile` is adapted from the responsive helper used by [shadcn-svelte's Sidebar](https://www.shadcn-svelte.com/docs/components/sidebar).

The API, behavior, and limitations in this guide describe the local xvelte implementation.

---

## File organization

| File                  | Responsibility                                            |
| --------------------- | --------------------------------------------------------- |
| `is-mobile.svelte.ts` | Exported implementation, types, and public API.           |
| `is-mobile.md`        | Installation, usage, API, behavior, and dependency guide. |

`is-mobile.svelte.ts` and its exported declarations are the source of truth for this hook's public API.

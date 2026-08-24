# Hooks

Reactive helpers for viewport state, persisted frequency-and-recency ranking, accelerating repeated actions, and document tables of contents. Each hook is a standalone file imported directly from `$lib/hooks`; there is no shared `index.ts`.

Use only the hook needed by your feature. Some hooks depend on browser APIs and require explicit cleanup or careful server-rendering behavior, documented in their individual sections.

## Contents

- [Installation](#installation)
- [isMobile](#ismobile)
- [useFrecency](#usefrecency)
- [useRamp](#useramp)
- [useToc](#usetoc)
- [Credits](#credits)
- [File organization](#file-organization)

## Installation

Copy the required `.svelte.ts` files from `src/lib/hooks` to the same path in your project. All four hooks require Svelte 5; only `UseFrecency` requires Runed:

```sh
# Bun
bun add runed
bun add -D svelte

# npm
npm install runed
npm install -D svelte

# pnpm
pnpm add runed
pnpm add -D svelte
```

Omit `runed` when you do not copy `use-frecency.svelte.ts`. `IsMobile` extends Svelte's `MediaQuery`, available since Svelte 5.7. The repository currently develops against the stable Svelte and Runed versions declared in `package.json` and `bun.lock`.

These hooks require no Tailwind CSS, global stylesheet values, icons, `$lib/utils` helpers, attachments, localization messages, or generated files. `UseToc` can be used with the xvelte Table of Contents component, but that component is optional.

## isMobile

`IsMobile` is a reactive media-query class that reports whether the viewport is narrower than a configurable breakpoint. Use it when JavaScript behavior or component composition genuinely changes by viewport. Prefer CSS media or container queries when only presentation changes, particularly in server-rendered pages.

<!-- xvelte-example: overview -->

### Import

```svelte
<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";
</script>
```

The file exports the `IsMobile` class. It does not export the internal default-breakpoint constant.

### Basic usage

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

### Examples

#### Custom breakpoint

```svelte
<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	const compact = new IsMobile(1024);
</script>

<p>{compact.current ? "Compact navigation" : "Expanded navigation"}</p>
```

The constructor subtracts one pixel, so `new IsMobile(1024)` matches through `1023px`. It does not validate or round the supplied number.

#### Derive reusable component state

```svelte
<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	const mobile = new IsMobile();
	const navigationMode = $derived(mobile.current ? "sheet" : "sidebar");
</script>

<p>Current mode: {navigationMode}</p>
```

Reading `current` inside markup, `$derived`, or `$effect` subscribes reactively through Svelte.

### Public API

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

### Reactivity and lifecycle

Svelte manages the underlying `matchMedia` listener while reactive consumers read `current`; no local `destroy()` method is needed.

During server-side rendering the viewport is unknown. Because `IsMobile` does not pass a server fallback to its base class, the server result can differ from the browser result and the rendered branch can change during hydration. Use CSS when possible, or ensure both branches tolerate that transition without losing important state or content.

### Accessibility and localization

`IsMobile` renders no content and contains no localized copy. Responsive branches must preserve the same available actions, accessible names, focus behavior, and information across viewport sizes. Do not treat viewport width as proof of touch input, device type, or accessibility needs.

### Dependencies

`IsMobile` requires only Svelte 5.7 or newer and the single `is-mobile.svelte.ts` file. The shared installation command is under Installation. It requires no Runed package, browser storage, CSS, icons, xvelte components, other hooks, attachments, or localization configuration.

## useFrecency

`UseFrecency` stores how often and how recently string keys were used, then returns them ordered by a time-decayed score. Use it to rank command items, recent destinations, search choices, or other stable identifiers. Do not store private content in the keys or use the ranking as a precise analytics system.

<!-- xvelte-example: overview -->

### Import

```svelte
<script lang="ts">
	import { UseFrecency, type FrecencyItem, type FrecencyMap, type UseFrecencyOptions } from "$lib/hooks/use-frecency.svelte";
</script>
```

The file exports `UseFrecency` and the `FrecencyItem`, `FrecencyMap`, and `UseFrecencyOptions` types.

### Basic usage

```svelte
<script lang="ts">
	import { UseFrecency } from "$lib/hooks/use-frecency.svelte";

	const recentProjects = new UseFrecency("recent-projects", {}, { maxItems: 5 });
	const projects = [
		{ id: "atlas", name: "Atlas" },
		{ id: "harbor", name: "Harbor" },
		{ id: "northstar", name: "Northstar" }
	];

	function openProject(id: string) {
		recentProjects.use(id);
		// Navigate to the selected project.
	}
</script>

<ul>
	{#each recentProjects.items as id}
		{@const project = projects.find((item) => item.id === id)}
		{#if project}
			<li><button type="button" onclick={() => openProject(id)}>{project.name}</button></li>
		{/if}
	{/each}
</ul>
```

Persist stable IDs rather than translated labels. The `use` method is bound in the constructor, so it can safely be passed as a callback without losing its instance.

### Examples

#### Initial server or migrated data

```svelte
<script lang="ts">
	import { UseFrecency, type FrecencyMap } from "$lib/hooks/use-frecency.svelte";

	const initialItems: FrecencyMap = {
		dashboard: { uses: 4, lastUsage: Date.now() - 60_000 },
		reports: { uses: 12, lastUsage: Date.now() - 86_400_000 }
	};

	const destinations = new UseFrecency("navigation-frecency", initialItems);
</script>
```

The initial map is used only when the selected storage has no persisted value for that key.

#### Session-only ranking

```ts
const commands = new UseFrecency(
	"command-frecency",
	{},
	{
		storage: "session",
		syncTabs: false,
		maxItems: 8
	}
);
```

All options other than `maxItems` are forwarded to Runed's `PersistedState`. See the [Runed PersistedState guide](https://runed.dev/docs/utilities/persisted-state) for its storage, synchronization, and serializer behavior.

#### Reset recorded usage

```svelte
<button type="button" onclick={() => commands.clear()}>Reset command history</button>
```

`clear()` replaces the persisted map with an empty object. It does not remove unrelated data from the selected storage.

### Public API

#### Constructor

```ts
new UseFrecency(key: string, initialValue: FrecencyMap = {}, options: UseFrecencyOptions = {});
```

| Parameter      | Type                 | Default  | Behavior                                                                                       |
| -------------- | -------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `key`          | `string`             | Required | Storage key passed to `PersistedState`; keep it stable and unique within the selected storage. |
| `initialValue` | `FrecencyMap`        | `{}`     | Initial data used when no stored value is available.                                           |
| `options`      | `UseFrecencyOptions` | `{}`     | Local result limit plus installed Runed `PersistedState` options.                              |

#### Instance members

| Member     | Type                    | Behavior                                                                                 |
| ---------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `items`    | `readonly string[]`     | Reactive keys ordered from highest to lowest score, limited only in the returned result. |
| `use(key)` | `(key: string) => void` | Adds one to the key's use count and replaces its `lastUsage` with `Date.now()`.          |
| `clear()`  | `() => void`            | Replaces all usage metadata stored under this instance's storage key with `{}`.          |

The score is `uses / (1 + ageInDays)`, where age is never below zero. One day without use halves the contribution of each recorded use. Equal scores are ordered by newest `lastUsage`. `maxItems` applies after sorting and does not delete older entries from storage.

#### Public types

```ts
type FrecencyItem = {
	uses: number;
	lastUsage: number;
};

type FrecencyMap = Record<string, FrecencyItem>;
```

`UseFrecencyOptions` adds the following local field to the options accepted by the installed `PersistedState<FrecencyMap>`:

| Option       | Type                                                                         | Default       | Behavior                                                                                                        |
| ------------ | ---------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| `maxItems`   | `number`                                                                     | `undefined`   | Maximum returned keys. Negative values produce an empty result; persisted data is not pruned.                   |
| `storage`    | `"local" \| "session"`                                                       | `"local"`     | Selects `localStorage` or `sessionStorage`.                                                                     |
| `serializer` | `{ serialize(value): string; deserialize(value): FrecencyMap \| undefined }` | JSON          | Overrides serialization and deserialization.                                                                    |
| `syncTabs`   | `boolean`                                                                    | `true`        | Synchronizes supported storage changes between tabs.                                                            |
| `connected`  | `boolean`                                                                    | `true`        | Starts connected to storage. The local class does not expose Runed's later `connect()` or `disconnect()` calls. |
| `window`     | `Window & typeof globalThis`                                                 | Global window | Supplies a custom window implementation to Runed.                                                               |

The installed Runed types are the source of truth for inherited options. The local class deliberately keeps its `PersistedState` private, so persistence connection state and the raw map are not public.

### Reactivity and lifecycle

`items` recalculates when persisted data changes and every time it is read, using the current time for decay. Time passing alone does not schedule a reactive update; another render, usage update, storage synchronization, or reactive invalidation must cause the getter to run again.

Runed owns storage access and cross-tab listeners. In SSR it uses the supplied initial value when no browser window is available, so browser storage can change the order after hydration. Do not render ranking differences where a hydration change would lose user input or critical content.

Starting with `connected: false` leaves the private persisted state disconnected because `UseFrecency` does not expose Runed's `connect()` method. Use that option only when intentionally keeping this instance in memory.

### Accessibility and localization

The hook renders no content and has no localization messages. Persist identifier keys, then resolve them to translated visible labels in your app. Ranking must not unexpectedly change keyboard focus or visual order while someone is navigating; preserve stable keyed rendering and announce meaningful changes when the surrounding interface requires it.

Do not place sensitive user content in storage keys. Treat persisted preferences and history according to the app's privacy and consent requirements.

### Dependencies

Copy `use-frecency.svelte.ts` and install `runed` plus Svelte using the shared commands under Installation. No CSS, icons, `$lib/utils` exports, xvelte components, hooks, attachments, or localization setup are required. Storage behavior comes from Runed's `PersistedState`; no separate storage file must be copied.

## useRamp

`useRamp` repeats an increment after an initial delay and gradually shortens the interval while an interaction remains active. Use it to build press-and-hold steppers, scrub controls, or other repeated adjustments. It supplies timing and state only; the consuming control owns pointer, keyboard, disabled, focus, and labeling behavior.

<!-- xvelte-example: overview -->

### Import

```svelte
<script lang="ts">
	import { useRamp, type UseRampOptions } from "$lib/hooks/use-ramp.svelte";
</script>
```

The file exports `useRamp` and `UseRampOptions`. Its returned object has an inferred type and no separately exported name.

### Basic usage

```svelte
<script lang="ts">
	import { onDestroy } from "svelte";

	import { useRamp } from "$lib/hooks/use-ramp.svelte";

	let value = $state(0);
	const maximum = 100;

	const ramp = useRamp({
		increment: () => value++,
		canRamp: () => value < maximum
	});

	onDestroy(ramp.reset);
</script>

<button
	type="button"
	disabled={value >= maximum}
	onpointerdown={() => ramp.start()}
	onpointerup={ramp.reset}
	onpointercancel={ramp.reset}
	onpointerleave={ramp.reset}
>
	Increase continuously
</button>

<output aria-live="polite">{value}</output>
```

The first increment occurs only after `startDelay`; a quick press performs no increment. Add a separate click or keyboard behavior when the control must also support single-step activation.

### Examples

#### Custom acceleration

```ts
const ramp = useRamp({
	increment: increaseZoom,
	canRamp: () => zoom < 4,
	startDelay: 300,
	maxFrequency: 240,
	minFrequency: 40,
	rampUpTime: 1800
});
```

Despite their names, the frequency options are delays in milliseconds. `maxFrequency` is the initial slower interval and `minFrequency` is the eventual faster interval. The implementation normalizes reversed values automatically.

#### Add accessible single-step behavior

Keep normal activation separate from hold repetition so keyboard and assistive-technology users can increment once:

```svelte
<button
	type="button"
	disabled={!canIncrease()}
	onclick={() => canIncrease() && increase()}
	onpointerdown={(event) => {
		if (event.pointerType !== "mouse" || event.button === 0) ramp.start();
	}}
	onpointerup={ramp.reset}
	onpointercancel={ramp.reset}
	onpointerleave={ramp.reset}
>
	Increase value
</button>
```

A completed pointer hold normally also produces a click, adding one final increment in this example. Suppress that click in the surrounding control if that is not the desired behavior. `useRamp` intentionally does not decide this interaction policy.

#### Stop at a dynamic boundary

```ts
const ramp = useRamp({
	increment: () => quantity++,
	canRamp: () => !disabled && quantity < availableStock
});
```

`canRamp` is checked immediately before every repeated increment. Returning `false` resets the complete ramp and cancels further work.

### Public API

#### `useRamp(options)`

| Option         | Type            | Default  | Behavior                                                                                                  |
| -------------- | --------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `increment`    | `() => void`    | Required | Runs once per repeated step after the initial delay.                                                      |
| `canRamp`      | `() => boolean` | Required | Checked before each step; `false` stops and resets the ramp.                                              |
| `maxFrequency` | `number`        | `200`    | Slow interval in milliseconds. Values below zero are clamped through normalization.                       |
| `minFrequency` | `number`        | `25`     | Fast interval in milliseconds reached at the end of the ramp.                                             |
| `startDelay`   | `number`        | `100`    | Delay in milliseconds before the first repeated increment; negative values become zero.                   |
| `rampUpTime`   | `number`        | `2500`   | Time in milliseconds for linear interpolation from slow to fast; zero or negative uses the fast interval. |

`useRamp` returns:

| Member    | Type               | Behavior                                                                           |
| --------- | ------------------ | ---------------------------------------------------------------------------------- |
| `start()` | `() => void`       | Resets any existing cycle, marks it active, and starts the initial-delay timer.    |
| `reset()` | `() => void`       | Clears both timers and returns `active` and `ramping` to `false`.                  |
| `active`  | `readonly boolean` | Reactive state that is true during both the initial delay and repeated increments. |
| `ramping` | `readonly boolean` | Reactive state that becomes true at the first repeated increment.                  |

The callbacks and timing values are captured when `useRamp` runs. Recreate the hook to replace those options; callbacks may still read current reactive values.

### Reactivity and lifecycle

The hook uses Svelte runes for `active` and `ramping` and native `setTimeout` calls for scheduling. It does not register lifecycle cleanup automatically. Always call `reset()` when the interaction ends and when the owning component is destroyed, as shown in Basic usage.

Calling `start()` repeatedly is safe: it clears the previous initial-delay and repeat timers before beginning a new cycle. Timer scheduling is approximate and follows normal browser throttling in inactive tabs.

### Accessibility and localization

The hook renders no content and contains no copy. Apply it to a semantic control with an accessible name, visible focus, normal single-step keyboard activation, a real disabled state, and understandable limits. Repeated updates should not flood an `aria-live` region; choose the surrounding announcement strategy according to the value and task.

Labels, values, units, validation, and feedback are supplied and translated by the app.

### Dependencies

`useRamp` requires only Svelte 5 runes and `use-ramp.svelte.ts`. The shared installation command is under Installation. It requires no Runed package, CSS, icons, `$lib/utils` exports, xvelte components, other hooks, attachments, contexts, or localization setup.

## useToc

`UseToc` builds a reactive nested hierarchy from the headings inside one element and marks an intersecting heading as active. Use it to power an “On this page” navigation for browser-rendered content. It observes DOM structure and visibility; it does not render the navigation, generate heading IDs, scroll links, or manage history.

<!-- xvelte-example: overview -->

### Import

```svelte
<script lang="ts">
	import { INDEX_ATTRIBUTE, TOC_IGNORE_ATTRIBUTE, UseToc, type Heading, type HeadingKind } from "$lib/hooks/use-toc.svelte";
</script>
```

The file exports `UseToc`, `Heading`, `HeadingKind`, `INDEX_ATTRIBUTE`, and `TOC_IGNORE_ATTRIBUTE`.

### Basic usage

```svelte
<script lang="ts">
	import * as TableOfContents from "$lib/components/ui/table-of-contents";
	import { UseToc } from "$lib/hooks/use-toc.svelte";

	const headings = new UseToc();
	let article = $state<HTMLElement>();

	$effect(() => {
		headings.ref = article;
		return () => headings.destroy();
	});
</script>

<div class="grid gap-8 lg:grid-cols-[14rem_1fr]">
	<nav aria-label="On this page">
		<TableOfContents.Root toc={headings.current} />
	</nav>

	<article bind:this={article}>
		<h1 id="overview">Overview</h1>
		<p>Introduction.</p>
		<h2 id="installation">Installation</h2>
		<p>Installation instructions.</p>
	</article>
</div>
```

The Table of Contents component is optional. `headings.current` is a normal reactive `Heading[]` that can be rendered with custom markup.

### Examples

#### Render a custom flat navigation

```svelte
<nav aria-label="On this page">
	<ul>
		{#each headings.current as heading (heading.index)}
			<li>
				{#if heading.id}
					<a href={`#${heading.id}`} aria-current={heading.active ? "location" : undefined}>{heading.label}</a>
				{:else}
					<span>{heading.label}</span>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
```

This example renders only root headings. Traverse `children` recursively when nested navigation is required.

#### Ignore preview or embedded content

```svelte
<section data-toc-ignore>
	<h2>Heading inside an embedded preview</h2>
</section>
```

Any heading whose closest matching ancestor has `data-toc-ignore` is excluded. Import `TOC_IGNORE_ATTRIBUTE` when TypeScript code needs the stable attribute name.

#### Observe dynamic content

```svelte
{#if showAdvancedOptions}
	<h2 id="advanced-options">Advanced options</h2>
{/if}
```

Child-list and text mutations rebuild the complete hierarchy and reconnect heading observation. Attribute-only changes, including changing `id` or adding `data-toc-ignore`, are not observed. Reassign `ref` or accompany those changes with an observed content mutation when an immediate rebuild is required.

### Public API

#### `UseToc`

```ts
const headings = new UseToc();
```

| Member      | Type                                     | Behavior                                                                                                                           |
| ----------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ref`       | getter/setter `HTMLElement \| undefined` | Assigning a container disconnects previous observers, rebuilds its heading tree, and begins mutation and intersection observation. |
| `current`   | getter `Heading[]`                       | Current reactive nested hierarchy.                                                                                                 |
| `destroy()` | `() => void`                             | Disconnects both observers, removes retained DOM references, clears `ref`, and replaces `current` with an empty array.             |

Assigning `undefined` to `ref` also disconnects observers and clears the hierarchy. Reassigning the same element forces a fresh rebuild.

#### `Heading`

```ts
type HeadingKind = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type Heading = {
	index: number;
	ref: HTMLHeadingElement;
	kind: HeadingKind;
	id?: string | undefined;
	level: number;
	label: string;
	active: boolean;
	children: Heading[];
};
```

| Field      | Behavior                                                                              |
| ---------- | ------------------------------------------------------------------------------------- |
| `index`    | Zero-based document-order index written back to the element through `data-toc-index`. |
| `ref`      | Retained native heading element.                                                      |
| `kind`     | Lowercase heading tag from `h1` through `h6`.                                         |
| `id`       | Existing element ID, or `undefined`; the hook never generates one.                    |
| `level`    | Numeric level from `1` through `6`.                                                   |
| `label`    | Current `innerText` captured during the latest rebuild.                               |
| `active`   | Whether this heading is the selected intersecting heading.                            |
| `children` | Later headings nested beneath this one according to document order and heading level. |

Skipped heading levels are accepted. A heading becomes a child of the most recent preceding heading with a lower level; otherwise it remains at the root.

#### Constants

| Export                 | Value               | Purpose                                                                 |
| ---------------------- | ------------------- | ----------------------------------------------------------------------- |
| `INDEX_ATTRIBUTE`      | `"data-toc-index"`  | Attribute written to each included heading for observer lookup.         |
| `TOC_IGNORE_ATTRIBUTE` | `"data-toc-ignore"` | Attribute an app places on a heading or ancestor subtree to exclude it. |

### Reactivity and lifecycle

Assigning `ref` creates one `MutationObserver` and one `IntersectionObserver`. The mutation observer watches descendant child-list and text changes, rebuilds the hierarchy, clears saved visibility ratios, and observes every current heading again.

The intersection observer stores the latest ratio for changed headings, keeps entries with a ratio above zero, sorts them by their viewport `top` coordinate, and activates the first result. If no heading is intersecting, the previous active value remains. It uses the browser's default observer root, root margin, and thresholds.

The hook writes `data-toc-index` to included headings. `destroy()` disconnects observers but does not remove those attributes from the DOM. Always call `destroy()` when the owning scope ends. The hook is browser-only once a DOM element is assigned and should be initialized from component code rather than a server module.

### Accessibility and localization

The hook renders no markup and provides no navigation semantics. Wrap the rendered links in a labelled `<nav>`, preserve a meaningful document heading hierarchy, use stable unique IDs for linkable headings, and expose active state appropriately when the chosen design needs it.

Labels come from each heading's rendered `innerText`, so translated headings automatically produce translated TOC labels. The hook has no built-in copy or localization messages. The navigation's accessible label and any empty state belong to your app.

Active state does not move focus, update the URL, announce changes, or scroll the page. Standard anchor behavior and any enhanced navigation remain the renderer's responsibility.

### Dependencies

Copy `use-toc.svelte.ts` and install Svelte using the shared command under Installation. It uses Svelte's reactive `SvelteMap` plus the browser's `MutationObserver` and `IntersectionObserver`; no polyfill is included.

No Runed package, CSS, theme variables, icons, `$lib/utils` exports, attachments, contexts, or localization setup are required. To use the optional visual renderer, copy `$lib/components/ui/table-of-contents` and follow that component's README for its own installation and API.

## Credits

- `IsMobile` is adapted from the responsive helper used by [shadcn-svelte's Sidebar](https://www.shadcn-svelte.com/docs/components/sidebar).
- `UseFrecency` is adapted from [shadcn-svelte-extras UseFrecency](https://shadcn-svelte-extras.com/docs/hooks/use-frecency).
- `useRamp` is adapted from [shadcn-svelte-extras UseRamp](https://shadcn-svelte-extras.com/docs/hooks/use-ramp).
- `UseToc` is adapted from [shadcn-svelte-extras UseToc](https://shadcn-svelte-extras.com/docs/hooks/use-toc).

The APIs, algorithms, behavior, and limitations in this guide describe the local xvelte implementations.

## File organization

| File                     | Responsibility                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `is-mobile.svelte.ts`    | Reactive below-breakpoint media query.                                                                  |
| `use-frecency.svelte.ts` | Persisted usage metadata, scoring, ordering, limiting, and reset behavior.                              |
| `use-ramp.svelte.ts`     | Accelerating timeout loop, continuation guard, controls, and reactive status.                           |
| `use-toc.svelte.ts`      | Heading discovery, hierarchy construction, DOM observation, active state, types, and attribute exports. |
| `README.md`              | Shared installation and complete guide for each hook.                                                   |

Each `.svelte.ts` file and its exported declarations are the source of truth for that hook's public API.

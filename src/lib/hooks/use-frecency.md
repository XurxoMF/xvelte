# UseFrecency

`UseFrecency` stores how often and how recently string keys were used, then returns them ordered by a time-decayed score. Use it to rank command items, recent destinations, search choices, or other stable identifiers. Do not store private content in the keys or use the ranking as a precise analytics system.

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

Copy `use-frecency.svelte.ts` and install its dependencies:

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

---

## Import

```svelte
<script lang="ts">
	import { UseFrecency, type FrecencyItem, type FrecencyMap, type UseFrecencyOptions } from "$lib/hooks/use-frecency.svelte";
</script>
```

The file exports `UseFrecency` and the `FrecencyItem`, `FrecencyMap`, and `UseFrecencyOptions` types.

---

## Basic usage

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

---

## Examples

### Initial server or migrated data

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

### Session-only ranking

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

### Reset recorded usage

```svelte
<button type="button" onclick={() => commands.clear()}>Reset command history</button>
```

`clear()` replaces the persisted map with an empty object. It does not remove unrelated data from the selected storage.

---

## Public API

### Constructor

```ts
new UseFrecency(key: string, initialValue: FrecencyMap = {}, options: UseFrecencyOptions = {});
```

| Parameter      | Type                 | Default  | Behavior                                                                                       |
| -------------- | -------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `key`          | `string`             | Required | Storage key passed to `PersistedState`; keep it stable and unique within the selected storage. |
| `initialValue` | `FrecencyMap`        | `{}`     | Initial data used when no stored value is available.                                           |
| `options`      | `UseFrecencyOptions` | `{}`     | Local result limit plus installed Runed `PersistedState` options.                              |

### Instance members

| Member     | Type                    | Behavior                                                                                 |
| ---------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `items`    | `readonly string[]`     | Reactive keys ordered from highest to lowest score, limited only in the returned result. |
| `use(key)` | `(key: string) => void` | Adds one to the key's use count and replaces its `lastUsage` with `Date.now()`.          |
| `clear()`  | `() => void`            | Replaces all usage metadata stored under this instance's storage key with `{}`.          |

The score is `uses / (1 + ageInDays)`, where age is never below zero. One day without use halves the contribution of each recorded use. Equal scores are ordered by newest `lastUsage`. `maxItems` applies after sorting and does not delete older entries from storage.

### Public types

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

---

## Reactivity and lifecycle

`items` recalculates when persisted data changes and every time it is read, using the current time for decay. Time passing alone does not schedule a reactive update; another render, usage update, storage synchronization, or reactive invalidation must cause the getter to run again.

Runed owns storage access and cross-tab listeners. In SSR it uses the supplied initial value when no browser window is available, so browser storage can change the order after hydration. Do not render ranking differences where a hydration change would lose user input or critical content.

Starting with `connected: false` leaves the private persisted state disconnected because `UseFrecency` does not expose Runed's `connect()` method. Use that option only when intentionally keeping this instance in memory.

---

## Accessibility and localization

The hook renders no content and has no localization messages. Persist identifier keys, then resolve them to translated visible labels in your app. Ranking must not unexpectedly change keyboard focus or visual order while someone is navigating; preserve stable keyed rendering and announce meaningful changes when the surrounding interface requires it.

Do not place sensitive user content in storage keys. Treat persisted preferences and history according to the app's privacy and consent requirements.

---

## Dependencies

Copy `use-frecency.svelte.ts` and install `runed` plus Svelte using the commands under Installation. No CSS, icons, `$lib/utils` exports, xvelte components, hooks, attachments, or localization setup are required. Storage behavior comes from Runed's `PersistedState`; no separate storage file must be copied.

---

## Credits

`UseFrecency` is adapted from [shadcn-svelte-extras UseFrecency](https://shadcn-svelte-extras.com/docs/hooks/use-frecency).

The API, behavior, and limitations in this guide describe the local xvelte implementation.

---

## File organization

| File                     | Responsibility                                            |
| ------------------------ | --------------------------------------------------------- |
| `use-frecency.svelte.ts` | Exported implementation, types, and public API.           |
| `use-frecency.md`        | Installation, usage, API, behavior, and dependency guide. |

`use-frecency.svelte.ts` and its exported declarations are the source of truth for this hook's public API.

# IsTauri

`IsTauri` identifies whether shared SvelteKit code is executing in a Tauri webview or on the web. Read its `current` value as a runtime name or compare it explicitly to select behavior. Do not use runtime detection as a security boundary.

<!-- xvelte-example: overview -->

## Contents

- [Installation](#installation)
- [Import](#import)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Runtime behavior](#runtime-behavior)
- [Accessibility and localization](#accessibility-and-localization)
- [Dependencies](#dependencies)
- [File organization](#file-organization)

---

## Installation

Install the official Tauri JavaScript API and copy the hook and its guide:

```sh
# Bun
bun add @tauri-apps/api

# npm
npm install @tauri-apps/api

# pnpm
pnpm add @tauri-apps/api

mkdir -p src/lib/tauri/hooks
cp .xvelte-source/src/lib/tauri/hooks/is-tauri.ts src/lib/tauri/hooks/is-tauri.ts
cp .xvelte-source/src/lib/tauri/hooks/is-tauri.md src/lib/tauri/hooks/is-tauri.md
```

This helper can remain in a project whose frontend also runs as a normal website. A complete native application additionally requires the Tauri CLI, Rust project, platform prerequisites, and build configuration described in the xvelte installation guide.

---

## Import

```ts
import { IsTauri } from "$lib/tauri/hooks/is-tauri";
```

The hook exports only the `IsTauri` class.

---

## Basic usage

```svelte
<script lang="ts">
	import { IsTauri } from "$lib/tauri/hooks/is-tauri";

	const runtime = new IsTauri();
</script>

<p>Running in {runtime.current}.</p>
```

`runtime.current` is `"tauri"` inside the desktop application and `"web"` in a normal browser. During server rendering or prerendering it is `"web"` because no Tauri webview exists.

---

## Examples

### Compare the runtime

```svelte
<script lang="ts">
	import { IsTauri } from "$lib/tauri/hooks/is-tauri";

	const runtime = new IsTauri();
</script>

{#if runtime.current === "tauri"}
	<p>Running in the desktop application.</p>
{:else if runtime.current === "web"}
	<p>Running on the web.</p>
{/if}
```

Both strings are truthy: always use an explicit equality check when selecting an environment.

### Keep both environments useful

Prefer a real web implementation when one exists. For example, a native file helper can use Tauri's filesystem plugin in the desktop app while a browser preview accepts a `File` selected through an HTML file input. Hide a feature only when a meaningful web equivalent does not exist.

---

## Public API

```ts
class IsTauri {
	constructor();
	readonly current: "tauri" | "web";
}
```

| Member          | Type                        | Behavior                                                                    |
| --------------- | --------------------------- | --------------------------------------------------------------------------- |
| `new IsTauri()` | `IsTauri`                   | Creates an SSR-safe snapshot of the runtime.                                |
| `current`       | `readonly "tauri" \| "web"` | Is `"tauri"` only in a browser context managed by Tauri; otherwise `"web"`. |

The constructor accepts no parameters. `is-tauri.ts` and its exported declaration are the source of truth for this API.

---

## Runtime behavior

The helper combines SvelteKit's `browser` environment flag with Tauri's official `isTauri()` check. This makes module evaluation safe while SvelteKit prerenders the website and while an application performs server-side rendering.

Each instance stores a non-reactive snapshot. The result is stable for the lifetime of a loaded page because a page does not move between a browser and a Tauri webview without a new execution context.

Runtime detection controls presentation and API selection only. Tauri capabilities and command validation remain responsible for security; frontend code can be inspected or modified by an end user.

---

## Accessibility and localization

The helper renders no DOM, owns no focus or keyboard behavior, and contains no human-readable copy. It requires no localization messages. Components that branch on the result must preserve accessible names, status feedback, and equivalent functionality whenever both environments support the same task.

---

## Dependencies

Runtime dependency:

```sh
# Bun
bun add @tauri-apps/api

# npm
npm install @tauri-apps/api

# pnpm
pnpm add @tauri-apps/api
```

Copy `src/lib/tauri/hooks/is-tauri.ts` and `src/lib/tauri/hooks/is-tauri.md`. No other xvelte source files are required.

The class imports `browser` from the consuming SvelteKit application and `isTauri` from `@tauri-apps/api/core`. It requires no Rust crate, Tauri plugin or initialization call, capability permission, CSS, icon, `$lib/utils` export, component, hook, attachment, or localization setup.

See the official [Tauri JavaScript API](https://v2.tauri.app/reference/javascript/api/namespacecore/#istauri) and [SvelteKit frontend configuration](https://v2.tauri.app/start/frontend/sveltekit/) for the underlying behavior and native shell requirements.

---

## File organization

| File          | Responsibility                                                    |
| ------------- | ----------------------------------------------------------------- |
| `is-tauri.ts` | SSR-safe runtime detection class.                                 |
| `is-tauri.md` | Installation, usage, behavior, API, and dependency documentation. |

`is-tauri.ts` and its exported declaration are the source of truth for the public API.

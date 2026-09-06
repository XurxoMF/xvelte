# IsTauri

`isTauri()` identifies whether shared SvelteKit code is executing in a Tauri webview or on the web. Use the returned `"tauri"` or `"web"` string as a runtime name or compare it explicitly to select behavior. Do not use runtime detection as a security boundary.

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
import { isTauri } from "$lib/tauri/hooks/is-tauri";
```

The hook exports only `isTauri()`.

---

## Basic usage

```svelte
<script lang="ts">
	import { isTauri } from "$lib/tauri/hooks/is-tauri";

	const runtime = isTauri();
</script>

<p>Running in {runtime}.</p>
```

`isTauri()` returns `"tauri"` inside the desktop application and `"web"` in a normal browser. During server rendering or prerendering it returns `"web"` because no Tauri webview exists.

---

## Examples

### Compare the runtime

```svelte
<script lang="ts">
	import { isTauri } from "$lib/tauri/hooks/is-tauri";

	const runtime = isTauri();
</script>

{#if runtime === "tauri"}
	<p>Running in the desktop application.</p>
{:else if runtime === "web"}
	<p>Running on the web.</p>
{/if}
```

Both strings are truthy: always use an explicit equality check when selecting an environment.

### Keep both environments useful

Prefer a real web implementation when one exists. For example, a native file helper can use Tauri's filesystem plugin in the desktop app while a browser preview accepts a `File` selected through an HTML file input. Hide a feature only when a meaningful web equivalent does not exist.

---

## Public API

```ts
function isTauri(): "tauri" | "web";
```

`isTauri(): "tauri" | "web"` accepts no parameters and returns `"tauri"` only in a browser context managed by Tauri; otherwise it returns `"web"`. It mutates no state and can be called from ordinary module or component code. `is-tauri.ts` and its exported declaration are the source of truth for this API.

---

## Runtime behavior

The helper combines SvelteKit's `browser` environment flag with Tauri's official `isTauri()` check. This makes module evaluation safe while SvelteKit prerenders the website and while an application performs server-side rendering.

The result is stable for the lifetime of a loaded page: a page does not move between a browser and a Tauri webview without a new execution context. The helper therefore exposes an ordinary function rather than reactive state.

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

The helper imports `browser` from the consuming SvelteKit application and `isTauri` from `@tauri-apps/api/core`. It requires no Rust crate, Tauri plugin or initialization call, capability permission, CSS, icon, `$lib/utils` export, component, hook, attachment, or localization setup.

See the official [Tauri JavaScript API](https://v2.tauri.app/reference/javascript/api/namespacecore/#istauri) and [SvelteKit frontend configuration](https://v2.tauri.app/start/frontend/sveltekit/) for the underlying behavior and native shell requirements.

---

## File organization

| File          | Responsibility                                                    |
| ------------- | ----------------------------------------------------------------- |
| `is-tauri.ts` | SSR-safe runtime detection function.                              |
| `is-tauri.md` | Installation, usage, behavior, API, and dependency documentation. |

`is-tauri.ts` and its exported declaration are the source of truth for the public API.

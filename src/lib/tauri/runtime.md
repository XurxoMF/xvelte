# Tauri runtime

The Tauri runtime helpers identify whether shared SvelteKit code is executing in a native Tauri webview or a normal browser. Use them to select an example, enable a native-only action, or avoid importing behavior that has no useful web equivalent; do not use the runtime check as a security boundary.

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

Install the official Tauri JavaScript API and copy both unit files:

```sh
# Bun
bun add @tauri-apps/api

# npm
npm install @tauri-apps/api

# pnpm
pnpm add @tauri-apps/api

mkdir -p src/lib/tauri
cp .xvelte-source/src/lib/tauri/runtime.ts src/lib/tauri/runtime.ts
cp .xvelte-source/src/lib/tauri/runtime.md src/lib/tauri/runtime.md
```

This helper can remain in a project whose frontend also runs as a normal website. A complete native application additionally requires the Tauri CLI, Rust project, platform prerequisites, and build configuration described in the xvelte installation guide.

---

## Import

```ts
import { getRuntime, isTauriRuntime } from "$lib/tauri/runtime";

import type { Runtime } from "$lib/tauri/runtime";
```

The file exports the `Runtime` type and the `getRuntime()` and `isTauriRuntime()` functions.

---

## Basic usage

```svelte
<script lang="ts">
	import { getRuntime } from "$lib/tauri/runtime";

	const runtime = getRuntime();
</script>

<p>Running in {runtime}.</p>
```

`getRuntime()` returns `"tauri"` inside the desktop application and `"web"` in a normal browser. During server rendering or prerendering it returns `"web"` because no Tauri webview exists.

---

## Examples

### Guard a native-only action

```svelte
<script lang="ts">
	import { isTauriRuntime } from "$lib/tauri/runtime";

	async function openNativePicker() {
		if (!isTauriRuntime()) return;

		const { open } = await import("@tauri-apps/plugin-dialog");
		await open({ multiple: false });
	}
</script>

{#if isTauriRuntime()}
	<button type="button" onclick={openNativePicker}>Choose a local file</button>
{:else}
	<p>The native file picker is available in the desktop application.</p>
{/if}
```

The dynamic import is useful when a native-only plugin does not need to enter the initial web bundle. Install and configure the dialog plugin before using this example; it is not a dependency of `runtime.ts` itself.

### Keep both environments useful

Prefer a real web implementation when one exists. For example, a native file helper can use Tauri's filesystem plugin in the desktop app while a browser preview accepts a `File` selected through an HTML file input. Hide a feature only when a meaningful web equivalent does not exist.

---

## Public API

```ts
type Runtime = "tauri" | "web";

function isTauriRuntime(): boolean;
function getRuntime(): Runtime;
```

| Export             | Return type | Behavior                                                                                  |
| ------------------ | ----------- | ----------------------------------------------------------------------------------------- |
| `isTauriRuntime()` | `boolean`   | Returns `true` only when called in a browser context managed by Tauri.                    |
| `getRuntime()`     | `Runtime`   | Returns `"tauri"` when `isTauriRuntime()` is true and `"web"` in every other environment. |
| `Runtime`          | type        | The closed `"tauri" \| "web"` runtime-name union.                                         |

The functions accept no parameters, mutate no state, and may be called from ordinary module or component code. `runtime.ts` and its exported declarations are the source of truth for this API.

---

## Runtime behavior

The helper combines SvelteKit's `browser` environment flag with Tauri's official `isTauri()` check. This makes module evaluation safe while SvelteKit prerenders the website and while an application performs server-side rendering.

The result is stable for the lifetime of a loaded page: a page does not move between a browser and a Tauri webview without a new execution context. The helper therefore exposes ordinary functions rather than reactive state.

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

The helper imports `browser` from the consuming SvelteKit application and `isTauri` from `@tauri-apps/api/core`. It requires no Rust crate, Tauri plugin, capability permission, CSS, icon, `$lib/utils` export, component, hook, attachment, or localization setup.

See the official [Tauri JavaScript API](https://v2.tauri.app/reference/javascript/api/namespacecore/#istauri) and [SvelteKit frontend configuration](https://v2.tauri.app/start/frontend/sveltekit/) for the underlying behavior and native shell requirements.

---

## File organization

| File         | Responsibility                                                    |
| ------------ | ----------------------------------------------------------------- |
| `runtime.ts` | Public runtime type and SSR-safe webview detection functions.     |
| `runtime.md` | Installation, usage, behavior, API, and dependency documentation. |

`runtime.ts` and its exported declarations are the source of truth for the public API.

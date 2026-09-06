# Installation

xvelte is a copy-owned collection rather than an npm package, registry, or CLI. Install it by selecting a tagged release, copying the source files your application needs, and adding the dependencies documented for those files.

This guide covers a complete installation and a smaller per-component installation. Commands assume an existing SvelteKit project and a POSIX-compatible shell. Adapt paths when the project uses a different layout.

## Contents

- [Choose an installation scope](#choose-an-installation-scope)
- [Requirements](#requirements)
- [Download a release](#download-a-release)
- [Install the shared foundation](#install-the-shared-foundation)
- [Install components](#install-components)
- [Install hooks and attachments](#install-hooks-and-attachments)
- [Install every runtime package](#install-every-runtime-package)
- [Configure localization](#configure-localization)
- [Configure the root layout](#configure-the-root-layout)
- [Add Tauri support](#add-tauri-support)
- [Install the agent skill](#install-the-agent-skill)
- [Verify the installation](#verify-the-installation)
- [Update xvelte](#update-xvelte)

---

## Choose an installation scope

| Scope     | Copy                                                                                                   | Best for                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Selective | The chosen component folders, hooks, attachments, and only their shared requirements.                  | Most applications. It keeps dependencies and copied code small.                                          |
| Complete  | All authored reusable code under `src/lib`, the complete global stylesheet, messages, and agent skill. | Applications that expect to use much of the collection or want it available for rapid local development. |

Selective installation is recommended. Every component folder contains a same-named guide such as `button/button.md`; hooks and attachments have guides such as `use-ramp.md` beside their source. Those guides are the dependency source of truth.

> [!IMPORTANT]
> Files copied into an application belong to that application. Commit them, review them like local source, and adapt them when necessary. xvelte does not update copied files automatically.

---

## Requirements

Before copying xvelte code, the application needs:

- Svelte 5 and SvelteKit.
- TypeScript.
- Tailwind CSS 4 through its Vite plugin.
- The standard SvelteKit `$lib` alias pointing to `src/lib`.
- Bun, npm, or pnpm.
- A tagged xvelte release whose source and documentation match.

The copied `layout.css` uses Tailwind 4 features such as `@theme`, `@utility`, and `@custom-variant`. Do not copy it unchanged into a Tailwind 3 project.

The `$lib` alias is provided by ordinary SvelteKit projects. Imports in copied files intentionally use paths such as `$lib/utils`, `$lib/icons`, and `$lib/components/ui/button`; preserve that structure unless you update every affected import.

---

## Download a release

Choose a version from the [xvelte releases page](https://github.com/XurxoMF/xvelte/releases). Releases are stable source snapshots; `main` is the development branch.

Clone the selected tag into a temporary source directory beside your application files:

```sh
git clone --depth 1 --branch RELEASE_TAG https://github.com/XurxoMF/xvelte.git .xvelte-source
```

Replace `RELEASE_TAG` with the chosen tag. Alternatively, download the release archive:

```txt
https://github.com/XurxoMF/xvelte/archive/refs/tags/RELEASE_TAG.zip
https://github.com/XurxoMF/xvelte/archive/refs/tags/RELEASE_TAG.tar.gz
```

Keep `.xvelte-source/package.json`, `bun.lock`, and the copied unit guides available while installing. They record the dependency versions tested by that release.

---

## Install the shared foundation

Create the reusable-code directories:

```sh
mkdir -p src/lib/components/ui src/lib/hooks src/lib/attachments src/lib/tauri
```

### Utilities

Most components use `cn()` and shared element prop types from `src/lib/utils.ts`. Install its packages and copy the file:

```sh
# Bun
bun add clsx tailwind-merge

# npm
npm install clsx tailwind-merge

# pnpm
pnpm add clsx tailwind-merge

cp .xvelte-source/src/lib/utils.ts src/lib/utils.ts
```

If the application already has `src/lib/utils.ts`, merge the required exports instead of overwriting local utilities. Each component guide identifies the exact exports it needs.

### Global styles and theme

The complete stylesheet provides Tailwind, animation utilities, Inter, semantic colors, radii, light and dark values, state variants, focus treatment, and shared utilities:

```sh
# Bun
bun add mode-watcher
bun add -D tailwindcss @tailwindcss/vite tw-animate-css @fontsource-variable/inter

# npm
npm install mode-watcher
npm install -D tailwindcss @tailwindcss/vite tw-animate-css @fontsource-variable/inter

# pnpm
pnpm add mode-watcher
pnpm add -D tailwindcss @tailwindcss/vite tw-animate-css @fontsource-variable/inter
```

For a new stylesheet, copy the complete xvelte file:

```sh
cp .xvelte-source/src/routes/layout.css src/routes/layout.css
```

If `src/routes/layout.css` already exists, do not overwrite it. Merge the imports, variables, `@theme` mappings, base rules, custom variants, and utilities required by the selected component guides. Theme color values and the Inter font may be replaced with application-specific choices, but keep every semantic variable used by copied components.

Add Tailwind's Vite plugin while preserving the existing SvelteKit configuration:

```ts
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
```

### Semantic icons

Components import role-based names from `$lib/icons`, never directly from an icon package. Install the backing library and copy the facade:

```sh
# Bun
bun add @tabler/icons-svelte

# npm
npm install @tabler/icons-svelte

# pnpm
pnpm add @tabler/icons-svelte

cp .xvelte-source/src/lib/icons.ts src/lib/icons.ts
```

For a selective installation, copy only the semantic exports listed in each component guide into the application's existing `src/lib/icons.ts`. The facade may point those names at another icon library if the replacement components accept the same props.

---

## Install components

Copy the complete directory for each selected component. The directory contains its Svelte files, public `index.ts`, context or helper files when required, and its same-named guide.

For example, to install Button:

```sh
cp -R .xvelte-source/src/lib/components/ui/button src/lib/components/ui/button
```

Then read `src/lib/components/ui/button/button.md` and install every package, shared export, theme token, icon, localization message, and related xvelte component listed under Dependencies.

Install related xvelte components the same way. If a guide says Button requires Tooltip, copy the complete Tooltip folder and then follow `tooltip/tooltip.md` for its own requirements:

```sh
cp -R .xvelte-source/src/lib/components/ui/tooltip src/lib/components/ui/tooltip
```

To copy every component:

```sh
cp -R .xvelte-source/src/lib/components/. src/lib/components/
```

Import compound components through their directory `index.ts` and keep their namespace:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
</script>

<Button.Root>Save changes</Button.Root>
```

Do not import private implementation files from another component directory. The component's `index.ts` and exported types define its public API.

---

## Install hooks and attachments

Hooks and attachments are standalone files, so copy both their implementation and same-named guide.

For example:

```sh
cp .xvelte-source/src/lib/hooks/use-ramp.svelte.ts src/lib/hooks/use-ramp.svelte.ts
cp .xvelte-source/src/lib/hooks/use-ramp.md src/lib/hooks/use-ramp.md

cp .xvelte-source/src/lib/attachments/shortcut.ts src/lib/attachments/shortcut.ts
cp .xvelte-source/src/lib/attachments/shortcut.md src/lib/attachments/shortcut.md
```

Read each copied guide and install only its documented dependencies. To install every current hook and attachment:

```sh
cp -R .xvelte-source/src/lib/hooks/. src/lib/hooks/
cp -R .xvelte-source/src/lib/attachments/. src/lib/attachments/
```

Tauri helpers follow the same convention under `src/lib/tauri`. Their native shell, plugin, capability, and Rust requirements are covered separately under [Add Tauri support](#add-tauri-support).

---

## Install every runtime package

Skip this section for a selective installation: the local guides provide smaller commands. When copying the complete collection, install the full runtime dependency set from the selected release.

```sh
# Bun
bun add @floating-ui/dom @internationalized/date @shikijs/langs @shikijs/themes @tabler/icons-svelte @tanstack/svelte-table @tauri-apps/api bits-ui clsx country-flag-icons embla-carousel-svelte github-slugger gridstack hast-util-from-html hast-util-sanitize hast-util-to-html layerchart libphonenumber-js mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm mode-watcher paneforge qrcode-generator runed shiki svelte-dnd-action svelte-sonner tailwind-merge tailwind-variants vaul-svelte
bun add -D @fontsource-variable/inter @inlang/paraglide-js @tailwindcss/vite tailwindcss tw-animate-css

# npm
npm install @floating-ui/dom @internationalized/date @shikijs/langs @shikijs/themes @tabler/icons-svelte @tanstack/svelte-table @tauri-apps/api bits-ui clsx country-flag-icons embla-carousel-svelte github-slugger gridstack hast-util-from-html hast-util-sanitize hast-util-to-html layerchart libphonenumber-js mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm mode-watcher paneforge qrcode-generator runed shiki svelte-dnd-action svelte-sonner tailwind-merge tailwind-variants vaul-svelte
npm install -D @fontsource-variable/inter @inlang/paraglide-js @tailwindcss/vite tailwindcss tw-animate-css

# pnpm
pnpm add @floating-ui/dom @internationalized/date @shikijs/langs @shikijs/themes @tabler/icons-svelte @tanstack/svelte-table @tauri-apps/api bits-ui clsx country-flag-icons embla-carousel-svelte github-slugger gridstack hast-util-from-html hast-util-sanitize hast-util-to-html layerchart libphonenumber-js mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm mode-watcher paneforge qrcode-generator runed shiki svelte-dnd-action svelte-sonner tailwind-merge tailwind-variants vaul-svelte
pnpm add -D @fontsource-variable/inter @inlang/paraglide-js @tailwindcss/vite tailwindcss tw-animate-css
```

Use the version constraints in the selected release's `package.json`; do not silently substitute prerelease APIs or dependency major versions. An existing SvelteKit project already owns packages such as Svelte, SvelteKit, TypeScript, and its adapter.

---

## Configure localization

Reusable xvelte code routes human-readable default copy through Paraglide. A component that imports `$lib/paraglide/messages.js` requires this setup; units whose Localization section says they contain no built-in copy do not.

Install Paraglide, then copy the English catalog and project configuration:

```sh
# Bun
bun add -D @inlang/paraglide-js

# npm
npm install -D @inlang/paraglide-js

# pnpm
pnpm add -D @inlang/paraglide-js

cp -R .xvelte-source/project.inlang project.inlang
mkdir -p messages
cp .xvelte-source/messages/en.json messages/en.json
```

For a selective installation, merge only the message IDs listed by the copied guides into every application locale. Do not copy `src/lib/paraglide`: it is generated output.

Add the Paraglide plugin after the existing Vite plugins:

```ts
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
			emitTsDeclarations: true
		})
	]
});
```

Generate the messages once when validating setup; the Vite plugin handles subsequent development builds:

```sh
# Bun
bunx paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide

# npm
npx paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide

# pnpm
pnpm exec paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide
```

Locale negotiation, URL localization, and server middleware belong to the application. Configure them with the application's chosen Paraglide strategy rather than copying the preview site's routing behavior blindly.

---

## Configure the root layout

Import the global stylesheet once and install `ModeWatcher` when the application uses xvelte's `.dark` theme values:

```svelte
<script lang="ts">
	import { ModeWatcher } from "mode-watcher";

	import "./layout.css";

	let { children } = $props();
</script>

<ModeWatcher />

{@render children()}
```

If the application manages the `.dark` class itself, omit ModeWatcher. Components never own global theme-mode state.

Some compound components require an app-wide provider. For example, configure Tooltip once when copied components use it:

```svelte
<script lang="ts">
	import "./layout.css";

	import * as Tooltip from "$lib/components/ui/tooltip";

	let { children } = $props();
</script>

<Tooltip.Provider delayDuration={500}>
	{@render children()}
</Tooltip.Provider>
```

Follow each component guide for any additional provider, portal, stylesheet, browser API, or root-level requirement.

---

## Add Tauri support

Tauri is optional and separate from the browser installation. The same SvelteKit source can serve the website and the native application: `bun run dev` opens the normal web development server, while `bun tauri dev` starts that server and loads it in a Tauri webview.

### Install the native toolchain

Install Rust and the operating-system packages listed in Tauri's official [prerequisites guide](https://v2.tauri.app/start/prerequisites/). Then add the official JavaScript API and CLI:

```sh
# Bun
bun add @tauri-apps/api
bun add -D @tauri-apps/cli

# npm
npm install @tauri-apps/api
npm install -D @tauri-apps/cli

# pnpm
pnpm add @tauri-apps/api
pnpm add -D @tauri-apps/cli
```

Add the package script if the project does not already define it:

```json
{
	"scripts": {
		"tauri": "tauri"
	}
}
```

### Copy or initialize the Rust application

For an application based directly on xvelte, copy the tested shell from the same release:

```sh
cp -R .xvelte-source/src-tauri ./src-tauri
```

Do not overwrite an existing `src-tauri`. If the application already uses Tauri, retain its Rust crate, capabilities, icons, application identifier, windows, plugins, and commands, then copy only the xvelte frontend helpers it needs.

For a fresh shell that should not inherit xvelte's product metadata and icons, initialize it interactively instead:

```sh
# Bun
bun tauri init

# npm
npm run tauri init

# pnpm
pnpm tauri init
```

Use these values when prompted:

| Prompt               | Value                   |
| -------------------- | ----------------------- |
| Web assets location  | `../build`              |
| Development URL      | `http://localhost:5173` |
| Before dev command   | `bun dev`               |
| Before build command | `bun run build`         |

Replace the Bun commands with the project's npm or pnpm equivalents when necessary. Set a unique reverse-domain `identifier` in `src-tauri/tauri.conf.json`, customize the product name and icons, and review every capability before distributing the application.

### Configure the shared SvelteKit frontend

Tauri does not provide the Node.js server required by SvelteKit SSR. Prerender the documentation routes, disable SSR for the shared shell, and keep a fallback for client-side navigation:

```ts
// src/routes/+layout.ts
export const prerender = true;
export const ssr = false;
```

Configure the static adapter and a fixed Vite development port. Ignoring Rust files prevents native rebuild output from causing unnecessary frontend reloads:

```ts
// vite.config.ts
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ fallback: "index.html" })
		})
	],
	server: {
		port: 5173,
		strictPort: true,
		watch: {
			ignored: ["**/src-tauri/**"]
		}
	}
});
```

An existing static website can keep all of its prerendered pages. The fallback adds an SPA entry for navigation that reaches a path not emitted as a standalone HTML file; it does not require replacing the website with a native-only frontend.

### Install Tauri helpers

Frontend helpers live in `src/lib/tauri` and follow the same source-plus-guide convention as hooks and attachments. Start with the runtime helper when web and native previews need different behavior:

```sh
mkdir -p src/lib/tauri
cp .xvelte-source/src/lib/tauri/runtime.ts src/lib/tauri/runtime.ts
cp .xvelte-source/src/lib/tauri/runtime.md src/lib/tauri/runtime.md
```

Read the same-named guide before copying another Tauri unit. Its Dependencies section must identify all of the following when applicable:

- The `@tauri-apps/*` JavaScript package.
- The matching Cargo crate and plugin initialization call.
- Capability permissions and filesystem or URL scopes.
- Rust command modules and their `tauri::generate_handler!` registration.
- Platform-specific behavior and the web preview or fallback.

Official plugins can be added with Tauri's plugin command, for example `bun tauri add fs`. Do not grant a plugin's complete permission set automatically: copy the capability entries documented by the selected helper and scope access to the paths or operations it genuinely needs.

Helpers backed only by official plugins normally require no custom IPC. A helper such as a future archive utility may also include a focused Rust command module; copy that module into `src-tauri/src`, add its documented crates, and register only its exported commands in the application's existing handler. The shell remains one Tauri application—there is no separate native app per helper.

### Run and validate both targets

Use separate commands for the two representations:

```sh
# Browser preview
bun run dev

# Native preview; starts the browser dev server automatically
bun tauri dev

# Static website build
bun run build

# Rust backend check
cargo check --manifest-path src-tauri/Cargo.toml

# Native application build
bun tauri build
```

Run both previews for any helper that branches by runtime. A web example may use browser APIs, show a representative result, or explain that the action is native-only; the Tauri preview should exercise the real plugin or command.

---

## Install the agent skill

This optional step lets compatible coding agents discover installed xvelte code and follow its composition and maintenance conventions:

```sh
mkdir -p .agents/skills/xvelte
cp -R .xvelte-source/.agents/skills/xvelte/. .agents/skills/xvelte/
```

Keep `.agents/skills/xvelte/references/catalog.md` synchronized with the units actually present in the application. Remove catalog entries for units you did not copy, or copy the full catalog when installing the complete collection.

The skill complements the consuming project's own `AGENTS.md`; it does not replace application-specific architecture, product behavior, or validation rules.

---

## Verify the installation

Run the consuming project's formatter and checks:

```sh
# Bun
bun run check
bun run lint
bun run build

# npm
npm run check
npm run lint
npm run build

# pnpm
pnpm check
pnpm lint
pnpm build
```

Then verify the copied component in a real route:

- Light and dark theme values resolve correctly.
- Focus rings and keyboard interaction remain visible.
- Portals, overlays, and providers work from the root layout.
- Localized default text appears in every configured locale.
- No copied file imports a missing `$lib` module or private component file.
- The browser console and server output contain no hydration warnings.

If a dependency, token, icon, message, or related component is missing, return to that unit's local guide. Do not install the complete dependency list merely to hide a selective-installation error.

---

## Update xvelte

Copied code does not receive automatic updates. To update:

1. Download the target tagged release separately.
2. Read its release notes and the local guides for the installed units.
3. Compare the new source with the application's adapted copy.
4. Merge behavior, styles, dependencies, messages, and documentation intentionally.
5. Re-run check, lint, build, and application tests.

Do not replace adapted files wholesale unless losing the application's local changes is intentional. Local behavior takes precedence over matching xvelte or any upstream collection line for line.

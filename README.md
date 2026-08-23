# xvelte

`xvelte` is my personal collection of reusable components, attachments, hooks, utilities, styles, and supporting code for building applications and websites with SvelteKit.

The repository also contains a small SvelteKit app used to develop, preview, and validate the reusable code. It is not a package with a fixed public API, a component registry, or a CLI: the intended workflow is to copy the code into a project and adapt it as needed.

> [!WARNING]
> This collection is designed primarily for my own projects, preferences, and use cases. Code adapted or copied from other libraries remains credited to its original authors; see [Credits](#credits). Review each part before using it in your own project.

Published releases are stable source snapshots intended for reuse. The `main` branch is the development branch and may contain unpublished or undocumented changes.

## Contents

- [About the project](#about-the-project)
- [Intended use](#intended-use)
- [Organization](#organization)
- [Per-unit documentation](#per-unit-documentation)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage conventions](#usage-conventions)
- [Agent integration](#agent-integration)
- [Development](#development)
- [Design and customization](#design-and-customization)
- [Upstream sources and local adaptations](#upstream-sources-and-local-adaptations)
- [Projects using xvelte](#projects-using-xvelte)
- [Important notes](#important-notes)
- [Credits](#credits)
- [Up to date with](#up-to-date-with)

## About the project

`xvelte` brings together the reusable building blocks I commonly need when developing with SvelteKit. Its scope is broader than UI components and includes:

- Components and compound UI primitives
- Svelte attachments
- Hooks and reusable state logic
- Shared utilities
- Semantic icon mappings
- Design tokens and global styles
- Localization for human-readable reusable UI copy

Many pieces are inspired by, derived from, or copied and subsequently modified from projects such as [shadcn-svelte](https://www.shadcn-svelte.com/), [more-shadcn-svelte](https://github.com/kevwpl/more-shadcn-svelte), and [shadcn-svelte-extras](https://github.com/ieedan/shadcn-svelte-extras). They are refactored to follow this repository's naming, imports, styling, accessibility, API conventions, and practical requirements.

The copy-owned philosophy remains important: once code is copied into an application, it belongs to that application and can be changed without being constrained by a package API.

## Intended use

The collection supports both SvelteKit applications and websites, although many of its layout decisions are especially useful for application interfaces such as:

- Local applications built with Tauri or Electron
- Admin panels and dashboards
- Internal tools
- Websites with reusable interactive UI
- Interfaces with sidebars, fixed bars, and internally scrollable content

The base app layout assumes that `html` and `body` have a fixed height and use `overflow: hidden`. Consequently, scrolling normally belongs to an internal container rather than `window`. For example, content inside `Sidebar.Inset` should use a scrollable container, and scrolling code should call `scrollTo()` on that element instead of `window.scrollTo()`.

## Organization

```txt
.agents
└── skills/xvelte
src
├── lib
│   ├── attachments
│   ├── components/ui
│   ├── hooks
│   ├── icons.ts
│   └── utils.ts
└── routes
    ├── +layout.svelte
    ├── +page.svelte
    └── layout.css
```

- `.agents/skills/xvelte` contains the portable instructions and public-unit catalog used by compatible coding agents.
- `src/lib/components/ui` contains reusable components and compound primitives.
- `src/lib/attachments` contains reusable Svelte attachments.
- `src/lib/hooks` contains hooks and reusable state helpers.
- `src/lib/utils.ts` contains shared utilities.
- `src/lib/icons.ts` is the semantic facade for the configured icon library.
- `src/routes` contains the development and preview application.
- `src/routes/layout.css` contains global styles, Tailwind configuration, design tokens, and theme variables intended to be copied into consuming projects.
- `messages/en.json` contains the English source messages used by reusable code through Paraglide.

The preview website under `src/routes` intentionally keeps its own copy hardcoded in English. Localization applies to reusable code so applications can translate it without editing component internals.

## Per-unit documentation

Each reusable component, attachment, hook, utility group, or equivalent unit is intended to have its own `README.md` beside the source. These focused guides document:

- What the unit does and when to use it
- Its public API, props, types, and exported parts
- Basic and advanced usage examples
- Its internal file organization
- Required dependencies and related reusable units
- Accessibility behavior and relevant implementation notes

These per-unit guides are the canonical usage documentation for individual parts of the collection. They are being introduced progressively and are not yet present in every directory.

## Requirements

- Svelte and SvelteKit
- Tailwind CSS configured for Svelte
- The `$lib` alias pointing to `src/lib`
- The dependencies used by the specific reusable parts being copied
- Paraglide when using reusable parts that import localized messages

Use the `package.json` and lockfile from the selected release as the source of truth for compatible dependency versions. If only part of the collection is copied, install only the dependencies that part requires.

## Installation

Install reusable code from a tagged release so its source, dependencies, documentation, and migration notes belong to the same snapshot. Avoid treating `main` as a stable release.

1. Open the [releases page](https://github.com/XurxoMF/xvelte/releases) and select a version.
2. Download and extract its generated **Source code (`zip`)** or **Source code (`tar.gz`)** archive. The direct URL formats are:

```txt
https://github.com/XurxoMF/xvelte/archive/refs/tags/<version>.zip
https://github.com/XurxoMF/xvelte/archive/refs/tags/<version>.tar.gz
```

3. Copy all of `src/lib`, or only the components, attachments, hooks, utilities, and icon mappings required by the project.
4. Copy `src/routes/layout.css` to the appropriate global stylesheet in the consuming application.
5. When copied code uses localized messages, copy the required entries from `messages/en.json` and configure Paraglide in the consuming project.
6. Copy `.agents/skills/xvelte` when coding agents should discover and use the collection according to its public conventions without adding instructions to the consuming project's README or `AGENTS.md`.
7. Install the required dependencies using the release's `package.json` and lockfile as references.
8. Import the global stylesheet from the root layout:

```svelte
<script lang="ts">
	import "./layout.css";
</script>

{@render children()}
```

If app-wide tooltips should share the same delay and provider settings, wrap the root layout:

```svelte
<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip";

	import "./layout.css";

	let { children } = $props();
</script>

<Tooltip.Provider delayDuration={500}>
	{@render children()}
</Tooltip.Provider>
```

## Usage conventions

Import compound components through their directory barrel and use each exported part through its namespace:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
</script>

<Button.Root>Save</Button.Root>
```

Reusable code is deliberately copy-owned. After copying it, changing its styles, markup, behavior, dependencies, or API is part of the normal workflow.

## Agent integration

The repository includes a portable `xvelte` agent skill under `.agents/skills/xvelte`. Copy that directory into a consuming project to teach compatible coding agents how to discover, import, compose, and protect the installed xvelte units.

The skill directs agents to prefer existing public APIs, read each selected unit's local guide, confirm exports and types, and avoid changing shared components, attachments, hooks, utilities, or icon mappings for application-specific requirements. It also defines the documentation and catalog updates required when a reusable unit genuinely must change.

## Development

Clone `main` when developing the collection itself or testing upcoming changes:

```sh
bun install
bun run dev
```

Available validation and formatting commands include:

```sh
bun run check
bun run lint
bun run format
bun run build
```

## Design and customization

The primary visual customization points are `src/routes/layout.css` and `src/lib/icons.ts`.

`layout.css` defines color variables, radius, fonts, light and dark themes, sidebar tokens, chart colors, Tailwind configuration, custom variants, and the shared `*:focus-visible` border/ring treatment. Editing these shared values adapts the collection without coupling individual components to an application theme.

`src/lib/icons.ts` maps semantic, library-independent icon names to `@tabler/icons-svelte`. Change those exports to replace the icon library without rewriting component directories.

Other common customizations include:

- Replacing `@fontsource-variable/inter`
- Changing Tailwind classes and component structure
- Replacing wrappers around `bits-ui`, `vaul-svelte`, `paneforge`, or other dependencies
- Copying only the reusable modules required by an application
- Adding locales and translations to the Paraglide message catalog

## Upstream sources and local adaptations

This repository is not a line-by-line mirror or an official fork of any upstream project. Upstream code is adapted to the local conventions and may intentionally diverge in API, behavior, structure, or styling.

Examples of local adaptations include:

- Standardized imports, exports, prop ordering, naming, and function organization
- Svelte 5 runes and snippets throughout reusable components
- Semantic icon imports through a single facade
- Accessibility fixes and localized human-readable defaults
- Tailwind class and generated-output warning fixes
- A sidebar adapted to fit inside containers instead of relying on viewport-fixed positioning
- A contextual combobox API in which items update the root selection directly
- Additional typography, list, floating-menu, canvas, file-drop-zone, and other reusable parts

When updating from an upstream source, local behavior and conventions take precedence over achieving exact parity.

## Projects using xvelte

- [Rustory](https://github.com/XurxoMF/rustory)

## Important notes

- There is no installation script, component registry, or CLI.
- Releases are the stable installation source; `main` may contain unpublished work.
- Some reusable parts are intentionally tailored to my own requirements.
- The default app layout uses fixed-height pages with internal scrolling.
- Review dependencies when copying only part of the collection.
- Consult upstream documentation where relevant, while accounting for local modifications.

## Credits

Some components and ideas originate from or are based on the work of the authors and contributors of:

- [shadcn/ui](https://ui.shadcn.com/)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
- [more-shadcn-svelte](https://github.com/kevwpl/more-shadcn-svelte)
- [shadcn-svelte-extras](https://github.com/ieedan/shadcn-svelte-extras)

Additional files may be inspired by other projects identified in their source, history, or documentation. Credit for copied or derived work belongs to its original authors. `xvelte` is a personal, independently maintained collection and is not affiliated with or endorsed by those projects.

## Up to date with

This maintainer-facing list records the latest reviewed upstream revisions:

- [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) · [dabbd4c](https://github.com/huntabyte/shadcn-svelte/commit/dabbd4c00fbca1feef29a2a155b2eecf6bb4ea7a)
- [more-shadcn-svelte](https://github.com/kevwpl/more-shadcn-svelte) · [0066781](https://github.com/kevwpl/more-shadcn-svelte/commit/00667812c6394c9c30847b4fcc0a95a5c6180fd0)
- [shadcn-svelte-extras](https://github.com/ieedan/shadcn-svelte-extras) · [e130961](https://github.com/ieedan/shadcn-svelte-extras/commit/e130961b6e9676c5c01cfa582d91d2d2b34e6b2f)

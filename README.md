# xmfcn-svelte

A personal collection of Svelte/SvelteKit components based on
[shadcn-svelte](https://www.shadcn-svelte.com/).

This is not a full fork of shadcn-svelte. It does not include a CLI, install
scripts, or a component registry workflow. This repository is a SvelteKit app
that contains a set of already generated components that I have modified,
improved, and adapted for my own use cases. The app provides a development
environment for previewing the components and running checks, while the source
code remains available to copy into other projects.

The philosophy is still the same as [shadcn](https://ui.shadcn.com/) and
[shadcn-svelte](https://www.shadcn-svelte.com/): you copy the code into your
project, and then it belongs to you. You can change the styles, structure, icons,
dependencies, and behavior without being locked into a package API.

## Intended Use

This collection is mostly aimed at application interfaces rather than marketing
websites:

- Local apps built with Tauri or Electron
- Admin panels
- Dashboards
- Internal tools
- Interfaces with sidebars, fixed bars, and scrollable main content

The base layout is designed for apps where `html` and `body` have a fixed height
and `overflow: hidden`. That means the main scroll area usually does not live on
`window`, but inside an internal container if you add one. For example, if you need to scroll
the main content, you need to add a ScrollableContainer inside the Sidebar.Inset (or where you need it) and do `scrollTo()` on that container instead of `window.scrollTo()`.

## Structure

The reusable code and the development app live in:

```txt
src
├── lib
│   ├── components/ui
│   ├── hooks
│   ├── icons.ts
│   └── utils.ts
└── routes
    ├── +layout.svelte
    ├── +page.svelte
    └── layout.css
```

Reusable components live in `src/lib`. The files under `src/routes` belong to
the development and preview app, except for `layout.css`, which contains the
global styles and design tokens intended to be copied into consuming projects.

## Requirements

- Svelte/SvelteKit
- The `$lib` alias pointing to `src/lib`
- Tailwind CSS configured for Svelte
- The dependencies used by the components you copy

If you copy the whole collection, install these dependencies:

```sh
npm install bits-ui clsx tailwind-merge tailwind-variants @tabler/icons-svelte @internationalized/date @tanstack/table-core embla-carousel-svelte layerchart paneforge svelte-sonner vaul-svelte mode-watcher
npm install -D tailwindcss tw-animate-css @fontsource-variable/inter
```

Depending on your project, Svelte, SvelteKit, and the Tailwind integration may
already be installed. If you replace the font, swap the icon package, or remove
some components, you can also remove the dependencies that are no longer used.

## Manual Installation

1. Copy `src/lib` into your project's `src/lib`.
2. Copy `src/routes/layout.css` wherever it makes sense for your app.
3. Import that global CSS from your root layout:

```svelte
<script lang="ts">
	import "./layout.css";
</script>

{@render children()}
```

4. If you want app-wide tooltips to use the same delays and other properties, wrap your layout with the tooltip provider:

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

5. Import components from `$lib/components/ui/...` always with `import * as XXXX from` and use them with XXXX.Part:

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button";
</script>

<Button.Root>Save</Button.Root>
```

## Development

Install the dependencies and start the SvelteKit development app:

```sh
bun install
bun run dev
```

The repository also includes scripts for validating and formatting the source:

```sh
bun run check
bun run lint
bun run format
bun run build
```

## Main differences with shadcn-svelte

This collection started from shadcn-svelte components, but it is not a
line-by-line mirror. The main changes are:

- Imports, exports, prop ordering, variable ordering, and function ordering have
  been standardized across the components.
- Several code issues and warnings have been fixed, especially around Tailwind
  CSS classes and generated component output.
- The sidebar has been modified to fit inside any container. See the comments in
  the sidebar components for the exact changes: the wrapper uses `h-full`, and
  the desktop sidebar container no longer relies on viewport-fixed positioning.
- The combobox includes its own context and a small constructor-style API,
  similar to select components. Items read the root context and update the
  selected value directly.
- New `typography` components were added following shadcn-style typography
  recommendations.
- New `list` components were added for ordered and unordered lists.
- New `floating-menu` components were added for positioning floating actions in
  multiple places around a container. They are especially useful for buttons,
  button groups, and compact tool clusters.

## Customization

The main visual customization entry points are `layout.css` and `lib/icons.ts`.

`layout.css` contains the CSS variables for colors, radius, fonts, dark mode, sidebar
tokens, chart colors, and custom Tailwind variants. By changing those variables,
you can adapt the collection to another product without editing every component.

`lib/icons.ts` maps the library-independent icon names used by the components to
`@tabler/icons-svelte`. Change only these exports to use a different icon
package; the component directories can then be updated without overwriting your
icon choices.

You can also replace:

- `@fontsource-variable/inter` with another font
- The mappings in `lib/icons.ts` to use your preferred icon package
- Any Tailwind class inside the components
- The internal structure of any component
- The wrappers around `bits-ui`, `vaul-svelte`, `paneforge`, and the other base libraries

There is no abstraction layer getting in your way. Once the code is inside your
project, editing it is part of the workflow.

## Projects using this collection

- [Rustory](https://github.com/XurxoMF/rustory)

## Important Notes

- There is no installation script or CLI.
- This is not meant to replace the shadcn-svelte documentation.
- Some components may be adapted to my own specific needs.
- The global layout assumes a fixed-height app with internal scrolling.
- Review the dependency list if you copy only part of the components.

## Credits

Based on [shadcn-svelte](https://www.shadcn-svelte.com/), which brings the
[shadcn/ui](https://ui.shadcn.com/) philosophy to the Svelte ecosystem.

This repository is a personal collection of derived and adapted components. It
is not an official fork and is not affiliated with shadcn or shadcn-svelte.

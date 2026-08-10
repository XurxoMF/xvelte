# Repository guidelines

## Purpose and layout

- This is a SvelteKit development/preview app for a customized, copy-owned shadcn-svelte component collection.
- Reusable code lives in `src/lib`; the preview app lives in `src/routes`.
- UI primitives live in `src/lib/components/ui/<component>` and hooks in `src/lib/hooks`.
- Global tokens, Tailwind configuration, fonts, light/dark values, and app layout rules live in `src/routes/layout.css`.
- `src/lib/icons.ts` is the only icon-library facade. Components must use semantic icon names from it.
- Keep reusable code independent from route or application components such as `App.svelte`.

## Formatting and size

- Use tabs, double quotes, no trailing commas, and a print width of 150; `.prettierrc` is authoritative.
- Preserve the existing concise style and avoid comments that only restate the code.
- Run Prettier instead of manually reformatting generated or class-heavy markup.

## Imports

- Always import shared utilities through `$lib/utils`; never use a relative path to `utils` or add `.js` to that alias.
- Import icons only from `$lib/icons`, using library-neutral names such as `SidebarIcon`, not vendor names such as `LayoutSidebar`.
- Import UI components through their directory barrel: `import * as Dialog from "$lib/components/ui/dialog"`.
- When one compound component renders another public part from the same directory, prefer its `.` barrel namespace over a direct relative component import.
- Group imports in this order: Svelte/framework types, third-party packages, blank line, `$lib` imports, blank line, local imports.
- Use `import type` whenever an import is type-only.

## Component conventions

- Use Svelte 5 runes and snippets: `$props`, `$bindable`, `$state`, `$derived`, `$effect`, and `{@render children?.()}`.
- Put exported prop and variant types in `<script lang="ts" module>` and runtime code in the instance script.
- Every public component part exports a named props type; roots use `RootProps`. Re-export all public components, types, and variants from `index.ts`.
- Name the main component `Root` in barrels and other parts by role (`Trigger`, `Content`, `Title`, etc.).
- Forward native/primitive props with `...restProps`, merge classes with `cn()`, expose bindable DOM references as `ref`, and add a stable `data-slot`.
- Base DOM props on `svelte/elements` types and `WithElementRef`; use `WithoutChild`, `WithoutChildren`, or `WithoutChildrenOrChild` when wrapping primitives.
- Preserve accessibility roles, labels, keyboard behavior, focus handling, and primitive-provided attributes.
- Keep public prop defaults in the destructuring declaration and avoid hidden application-specific behavior.

## Styling

- Use semantic Tailwind tokens (`background`, `foreground`, `primary`, `muted`, `border`, etc.), not hard-coded product colors.
- Light/dark and color customization must flow through CSS variables. Do not couple components to an application theme class or component.
- Global theme-mode management belongs in the root application (normally `mode-watcher`); components may accept or consume its resolved value.
- Keep Tailwind state selectors aligned with the actual primitive data attributes; do not invent or rename attributes without checking the dependency.
- Preserve the fixed-height, internal-scroll application assumptions documented in `README.md`.

## Icons

- Add or change mappings in `src/lib/icons.ts`; do not import Tabler or another icon package from component files.
- Export one semantic alias per icon using direct subpath exports, for example:
  `export { default as AlertErrorIcon } from "@tabler/icons-svelte/icons/alert-octagon";`
- Reuse an existing semantic alias when the meaning matches. Add a new alias only when the UI role is genuinely different.

## Dependency-specific rules

- Implement against the stable versions declared in `package.json` and resolved in `bun.lock`; do not silently adopt prerelease APIs.
- Use TanStack Table 9 through `@tanstack/svelte-table`: define explicit features in each implementation and import its adapter, render helpers, and types directly.
- Vaul Svelte 0.3 uses `el` internally and legacy slots. Drawer wrappers expose the collection's `ref`/snippet API and translate it at the boundary.
- Prefer the public API of dependencies. If a package lacks a public type, derive it from the exported component instead of importing private internals.
- Do not add install scripts or an `install` runtime dependency.

## Updating components

- Treat local behavior and naming as intentional; this repository is not a line-for-line shadcn-svelte mirror.
- Before replacing an upstream component, preserve semantic icon imports, public exports, prop types, `data-slot` values, and local layout adaptations.
- Keep user customization in CSS variables and the icon facade so component directories can be updated without overwriting it.
- Do not add compatibility shims across dependency major versions unless explicitly requested; migrate the wrapper to the installed stable API.

## Validation

- After component or TypeScript changes, run `bun run check`.
- After formatting or structural changes, run `bun run lint` and `git diff --check`.
- Run `bun run build` when routes, SvelteKit configuration, SSR behavior, or production output are affected.
- Do not hide diagnostics with broad casts or ignore directives; fix the wrapper, public type, or dependency API mismatch.

# Repository guidelines

## Purpose and layout

- This project is named `xvelte`.
- It is a personal collection of reusable components, attachments, hooks, utilities, and supporting code for building SvelteKit applications and websites, together with a SvelteKit development/preview app.
- Parts of the collection are inspired by or adapted from projects such as shadcn-svelte, more-shadcn-svelte, and shadcn-svelte-extras, but local behavior, conventions, and use cases define the project rather than compatibility with any upstream collection.
- Reusable code lives in `src/lib`; the preview app lives in `src/routes`.
- UI primitives live in `src/lib/components/ui/<component>` and hooks in `src/lib/hooks`.
- Global tokens, Tailwind configuration, fonts, light/dark values, and app layout rules live in `src/routes/layout.css`.
- `src/lib/icons.ts` is the only icon-library facade. Components must use semantic icon names from it.
- Keep reusable code independent from route or application components such as `App.svelte`.

## Formatting and size

- Use tabs, double quotes, no trailing commas, and a 150-character print width; `.prettierrc` is authoritative. This is not a file-length limit: keep related logic together instead of splitting it artificially.
- Keep code and markup readable with blank lines between dense sibling elements or distinct logical blocks, while preserving the existing concise style.
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
- Write `?: T | undefined` for every optional prop, field, and parameter instead of relying on the implicit `undefined` from `?:`.
- Preserve accessibility roles, labels, keyboard behavior, focus handling, and primitive-provided attributes.
- Keep public prop defaults in the destructuring declaration and avoid hidden application-specific behavior.

## Context conventions

- Use only Svelte's native `createContext`; do not use external context or reactive-box abstractions such as Runed `Context` or svelte-toolbelt `box`.
- Name context modules `<component>-context.ts` or `<component>-context.svelte.ts`, and expose them consistently as `setXxxContext` and `getXxxContext`, never `createXxxContext`, `useXxx`, or shortened getters.
- Bridge reactive values with accessor properties: use `get value()` for readable state and add `set value()` when descendants may update it. Do not represent reactive values as zero-argument callbacks; reserve functions for actual actions, event callbacks, or predicates.
- Use `.svelte.ts` and state classes when a context owns runes, derived state, or meaningful behavior; use `.ts` with a type and plain object when it only shares data or configuration.
- Add a context only for state genuinely shared by a root and its descendants. Keep its public input minimal, place reusable internal logic in its state class, and avoid making components repeat derived-state logic.

## Documentation and readability

- Every reusable component, attachment, hook, utility group, or equivalent unit directory must include a `README.md` that serves as its focused guide, covering purpose, public API, usage, organization, dependencies, accessibility considerations, and relevant examples.
- Keep each unit guide beside its source and update it whenever that unit's API, structure, dependencies, or behavior changes.
- Document every function, method, class, and public type or interface with useful TSDoc, including each parameter and non-obvious return value; preserve or improve existing accurate comments.
- Add short intent-focused comments around algorithms, browser APIs, non-obvious ordering/filtering, or complex markup, but do not merely restate the code.

## Localization

- Localize only reusable library code, including components, attachments, hooks, and equivalent reusable modules under `src/lib` that present text to people.
- Keep the preview website and application code under `src/routes` in hard-coded English. Do not extract its copy to Paraglide; route-level Paraglide runtime wiring may remain when required by the integration.
- Extract every human-readable string in reusable code to `messages/en.json` and render it through `m.<message_id>()`. This includes visible copy, screen-reader-only text, accessible names and descriptions, placeholders, titles, tooltips, alternative text, and empty or loading states.
- Use random, non-semantic message IDs in the style generated by Sherlock instead of deriving IDs from the English copy.
- Parameterize dynamic values inside the message instead of concatenating translated fragments. Preserve public props that allow consumers to override default copy.
- Do not translate implementation details such as internal identifiers, object keys, `data-*` values, protocol values, logs, or errors that are not intended to be read by an end user.

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

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

- Treat authored reusable code under `src/lib/components`, `src/lib/attachments`, `src/lib/hooks`, `src/lib/icons.ts`, `src/lib/utils.ts`, and future equivalent public-library locations as public units. Generated outputs such as `src/lib/paraglide` are not public units for documentation purposes.
- Every public unit directory must include a `README.md` that serves as its focused guide for both people and LLMs/agents. Until standalone public files are moved into dedicated unit directories, document them in the closest relevant `README.md`.
- Creating, editing, moving, renaming, or deleting a public unit requires updating its guide in the same change. Re-check the guide even when a code change appears internal, and update it whenever API, behavior, structure, dependencies, accessibility, localization, examples, credits, or limitations are affected.
- Keep `.agents/skills/xvelte/references/catalog.md` synchronized when public units or their paths, categories, exports, or noteworthy capabilities change. Update the `xvelte` skill itself only when consumer-facing discovery or usage guidance changes; keep repository development and maintenance rules in `AGENTS.md`.
- Do not consider a public-library change complete until its local documentation and the relevant `xvelte` skill material are accurate.
- Document every function, method, class, and public type or interface with useful TSDoc, including each parameter and non-obvious return value; preserve or improve existing accurate comments.
- Add short intent-focused comments around algorithms, browser APIs, non-obvious ordering/filtering, or complex markup, but do not merely restate the code.

### Public component README format

- Use `src/lib/components/ui/accordion/README.md` as the reference implementation for tone, detail, Markdown formatting, tables, and example style.
- Write for people installing and using the component, not for repository maintainers. Prefer plain terms such as “component”, “component folder”, “the component's `index.ts`”, “documented API”, “your app/project”, and “installation requirements”. Avoid internal or abstract wording such as “unit”, “public unit”, “public surface”, “consumer-owned”, “consuming project”, “portability”, or “barrel” when a clearer phrase works. Explain any unavoidable technical term the first time it appears, and use direct instructions such as “Copy the Separator component and follow its README to install it.”
- Write guides in English and describe the local xvelte component rather than presenting it as upstream-compatible. Make local behavior, defaults, constraints, forwarding rules, and unsupported composition explicit; never infer an API that is not present in the component's `index.ts`, exported types, source, or installed stable dependency.
- Begin with one `# <Public name>` heading followed by a concise description of the component's purpose, main capabilities, appropriate uses, and important cases where it should not be used.
- Place a `## Contents` index immediately after the introduction. Link every subsequent `##` section in document order and keep the index synchronized when sections change.
- Insert a Markdown horizontal rule (`---`) before every top-level `##` section after `Contents` so the sections are visually distinct.
- Use the following top-level sections and order. Keep a section concise when the unit is simple; omit `Credits` only when the implementation is original, and omit any other section only when it genuinely cannot apply:
  1. `Import`
  2. `Anatomy`
  3. `Basic usage`
  4. `Examples`
  5. `Public API`
  6. `Styling and DOM contract`
  7. `Accessibility`
  8. `Localization`
  9. `Dependencies`
  10. `Credits`, when required
  11. `File organization`
- `Import` must show the public `$lib` barrel import and list exported public types, variants, helpers, or other relevant symbols. Never teach imports from private implementation files.
- `Anatomy` must show the required component composition or, for a simple component, briefly explain its rendered structure and relationship to related components.
- `Basic usage` must be a minimal, complete, copyable Svelte 5 example. `Examples` must add only focused scenarios needed for correct real-world use, such as controlled state, multiple modes, disabled behavior, composition, localization, or important edge cases. Use realistic accessible copy and current project conventions.
- `Public API` must document every xvelte-owned component part, prop, type, variant, default, binding, snippet, callback, behavioral adaptation, and non-obvious prop or attribute forwarding rule. Use compact tables where they improve scanning. When the component wraps an external primitive, summarize only the important inherited options and link to the exact upstream component/API reference instead of duplicating its complete API. State that the component's `index.ts` and exported types are the source of truth.
- `Styling and DOM contract` must document stable local `data-slot` values, public state attributes, semantic tokens, CSS variables, stable classes, class-merging behavior, animation hooks, and unusual class or attribute placement. Clearly distinguish stable xvelte hooks from dependency-owned implementation details.
- `Accessibility` must explain semantics, keyboard and focus behavior, heading or labeling requirements, accessible-name responsibilities, disabled behavior, and any consumer obligations or misuse to avoid. Link to an upstream accessibility implementation when appropriate, but document local adaptations directly.
- `Localization` must list built-in human-readable copy and its message IDs or state explicitly that the component has no built-in copy and the app supplies and translates it. Include override props and dynamic parameters when present.
- `Dependencies` is an operational portability checklist, not an attribution section. It must include all of the following that apply:
  - Package names and copyable installation commands for Bun, npm, and pnpm. Put every package-installation command in one `sh` code block, grouped by package manager; within each group, list runtime dependencies first and development dependencies second. Always use the short `-D` flag for development dependencies, never `--dev` or `--save-dev`.
  - Required global stylesheet imports, semantic variables, `@theme` mappings, keyframes, or other code from `src/routes/layout.css`. Include only the minimal tokens and code the component actually uses, and explain which values users may replace with their own theme.
  - Every required semantic export from `src/lib/icons.ts` and its backing icon package.
  - Required exports from `$lib/utils`, including their package dependencies.
  - Required xvelte components, hooks, attachments, context modules, localization messages, shared styles, or other files that must be copied or configured.
  - An explicit statement when a dependency category does not apply, so a reader or agent does not need to infer whether it was overlooked.
- Whenever `Dependencies` instructs the reader to add exports, configuration, helpers, or other code to a shared or source file, include the exact copyable code block immediately in that section; never name required code without showing it. Localization message keys and values need not be duplicated when they are already listed completely in `Localization`. For a required standalone internal file, include its complete contents. For a required UI component, list its exact folder and source files, then tell readers to follow that component's README instead of duplicating it.
- Never combine `Dependencies` and `Credits`. `Credits` is only for code or design adapted from external projects such as shadcn-svelte or more-shadcn-svelte, and must name and link each actual source. Runtime primitives and packages belong under `Dependencies`, not `Credits`. Omit `Credits` for original xvelte work; if provenance is unknown, ask the repository owner instead of guessing.
- `File organization` must use a compact table mapping every file in the component folder to its responsibility and end by identifying `index.ts` and the exported types as the source of truth for the public API.
- Keep code examples narrowly relevant, formatted with Prettier, and free of deprecated APIs. Verify external links against official project documentation or repositories before adding them.

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

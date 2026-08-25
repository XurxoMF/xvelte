---
name: xvelte
description: Build and modify SvelteKit pages, layouts, forms, and interfaces using the xvelte collection of reusable components, attachments, hooks, utilities, styles, icons, and localized UI. Use whenever a project contains xvelte reusable code or a task asks to select, compose, integrate, add, update, document, or maintain xvelte public-library units.
---

# Xvelte

Use the existing xvelte public API to build application code while protecting reusable infrastructure. Treat local project instructions as authoritative where they add stricter requirements.

## Discover the available library

1. Read [references/catalog.md](references/catalog.md) to identify likely reusable units.
2. Verify that each selected path exists in the consuming project; copied installations may contain only a subset of xvelte.
3. Read the `README.md` beside every selected unit before using or changing it.
4. Confirm the public surface in the unit's `index.ts` and exported types. Treat public barrels, types, and source as authoritative if documentation differs.
5. Inspect implementation files only when the guide does not answer the question, exact composition or reactive behavior is unclear, diagnosing a defect, or changing the reusable unit is unavoidable.

If a selected unit has no guide yet, inspect its barrel, public types, and implementation instead. Do not invent an API from the catalog entry.

## Build with public APIs

- Prefer the smallest set of existing units that satisfies the task.
- Import every xvelte UI component through its directory entry point as a namespace, even when only a type, variant, or helper is needed. Use forms such as `import * as Dialog from "$lib/components/ui/dialog"` and refer to exports as `Dialog.Root`, `Dialog.RootProps`, or `Dialog.rootVariants`; never destructure a component import.
- Group imports in this order with one blank line between non-empty groups: installed/framework value imports; type-only imports; local files, styles, and assets; icons; Paraglide; utilities; hooks; attachments; components. Split mixed value/type declarations, except xvelte component namespaces, which always remain normal namespace imports.
- Import shared utilities only from `$lib/utils` and semantic icons only from `$lib/icons`.
- Use documented props, snippets, bindings, callbacks, attachments, and hooks. Do not import private implementation files from another unit.
- Compose components or add application-local wrappers before extending shared primitives.
- Keep page-specific copy, state, validation, layout, and product behavior in application code.
- Preserve accessibility semantics and use the consuming application's localization conventions for application copy.
- Keep the shared global `*:focus-visible` rule from `src/routes/layout.css` when copying xvelte components. Standard focus borders, rings, and native-outline suppression are centralized there; component classes retain only structural wrapper handling and state-specific overrides.

## Protect reusable infrastructure

Treat authored code in these locations as shared public infrastructure:

- `src/lib/components`
- `src/lib/attachments`
- `src/lib/hooks`
- `src/lib/icons.ts`
- `src/lib/utils.ts`
- Equivalent public-library locations added by the project

Do not modify these units merely to satisfy one page or feature. Prefer public props, snippets, composition, wrappers, and application-local code. Modify a public unit only when fixing a defect or when the capability genuinely belongs in its reusable API.

Generated outputs such as `src/lib/paraglide` are not authored public units. Do not edit generated files directly.

## Maintain a public unit

When creating, editing, moving, renaming, or deleting a public unit:

1. Read the complete local guide, public barrel, exported types, and relevant implementation before editing.
2. Preserve established naming, imports, accessibility, localization, styling, and compatibility unless the task explicitly changes them.
3. Update or create the colocated `README.md` in the same change. Cover any affected API, usage, examples, organization, dependencies, accessibility, localization, credits, behavior, or limitations.
4. Update [references/catalog.md](references/catalog.md) when availability, path, category, exports, or noteworthy capabilities change.
5. Update this `SKILL.md` when general xvelte usage or maintenance rules change.
6. Run the repository-prescribed formatter, type checks, lint checks, build checks, and diff checks appropriate to the change.

Do not report the public-library change as complete while its guide or skill catalog is stale.

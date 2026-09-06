# Documentation website

This directory contains the xvelte preview and documentation website. It is application code: reusable components, hooks, and attachments remain under `src/lib`.

## How a component page is created

The component routes use one SvelteKit dynamic route, `components/[slug]`, but the final website is still statically generated:

```text
src/lib/components/ui/button/button.md
                │
                ▼
       _docs/catalog.ts
   imports every unit guide as text
                │
                ├──► components/[slug]/+page.ts
                │    returns every slug from entries()
                │
                ▼
        _docs/UnitPage.svelte
   selects and segments the document
                │
                ├──► Markdown.Root            parsed guide sections
                └──► _examples/.../*.svelte   live preview + exact source
```

During `bun run build`, SvelteKit calls `entries()` and emits one HTML entry for every known slug, such as `build/components/button.html`. The `[slug]` folder avoids maintaining one nearly identical route file per component; it does not mean that the production site needs a server.

`catalog.ts` discovers every component, hook, attachment, and Tauri guide automatically with one `import.meta.glob(..., { query: "?raw" })` loader. Each unit has an autonomous `<slug>.md` document. The filename supplies its route slug, the first level-one heading supplies its visible name, and the first paragraph supplies its description. Component guide filenames must also match their containing directory; invalid guide paths or missing titles fail the build instead of silently omitting documentation.

## Sources of truth

- Each public unit's `<slug>.md` guide supplies the reference text, API tables, installation notes, and code examples shown on the website. Editing that guide updates the corresponding web page.
- `_examples/components/<slug>/*.svelte`, `_examples/hooks/<slug>/*.svelte`, `_examples/attachments/<slug>/*.svelte`, and `_examples/tauri/<category>/<slug>/*.svelte` are real, independently compiled previews.
- An invisible `<!-- xvelte-example: overview -->` guide comment places the matching `overview.svelte` preview at that exact position on the website.
- `_docs/examples.ts` discovers both the compiled preview and its raw source. The Preview tab renders the component and the Code tab therefore always displays the exact same file.
- `UnitPage.svelte` finds preview markers, parses each remaining guide section through `parseMarkdown`, and passes its mdast directly to `Markdown.Root` instead of injecting parser-generated HTML.
- Markdown code fences use Code's lazy Shiki language registry and treat unknown languages as plain text.
- `installation/installation.md` supplies the standalone installation guide rendered by `installation/+page.svelte` through the same Markdown pipeline.
- The sidebar's Shared/Tauri ToggleGroup filters its collapsible resource categories. It keeps one scope selected, including when the active toggle is clicked or activated with Enter or Space; arrow keys retain ToggleGroup's focus navigation. Empty categories are hidden; expanded categories are remembered during client navigation and scope changes. Opening a documentation page selects its scope and expands its category.
- The footer Search button opens a global Dialog containing Command. Results always include both scopes, grouped as `Shared - Components`, `Tauri - Hooks`, and so on, plus Installation under Getting started. Search matches titles, slugs, scopes, categories, and descriptions. Selecting a result closes the dialog and reveals it in the sidebar.
- `layout.css` owns the reusable global theme and may only receive collection-wide theme changes. The landing page keeps its decorative grid mask in its own scoped `<style>` block; documentation content relies on the xvelte components' local styles.

The interactive demo source is intentionally route-local. When a demo is based on a unit-guide example, keep both versions equivalent when changing it.

## Adding documentation

For a new component:

1. Add its component folder and `<slug>.md` guide under `src/lib/components/ui/<slug>` following the repository guidelines.
2. The catalog, navigation, component index, and static route entry will discover it automatically.
3. Add at least one focused preview under `_examples/components/<slug>`.
4. Place `<!-- xvelte-example: <filename-without-extension> -->` at the desired position in the component guide.

For a new hook, attachment, or Tauri helper, add its source file and a sibling `<slug>.md` guide, such as `use-viewport.svelte.ts` plus `use-viewport.md`. Use the exported public name in the guide's level-one heading and put its catalog description in the first paragraph. The catalog uses the filename as the slug, so navigation, the category index, and the static route entry discover it automatically. Put shared previews in `_examples/<category>/<slug>` and Tauri previews in `_examples/tauri/<category>/<slug>`, then place the same invisible comment in the unit guide when it has an interactive preview.

After route changes, run:

```sh
bun run check
bun run lint
bun run build
git diff --check
```

## Route map

| Route                                             | Purpose                                 |
| ------------------------------------------------- | --------------------------------------- |
| `/`                                               | Project introduction                    |
| `/installation`                                   | Complete installation and update guide  |
| `/components`, `/hooks`, `/attachments`, `/tauri` | Small category indexes                  |
| `/components/<slug>`                              | One generated component reference page  |
| `/hooks/<slug>`                                   | One generated hook reference page       |
| `/attachments/<slug>`                             | One generated attachment reference page |
| `/tauri/<category>`                               | One generated Tauri category index      |
| `/tauri/<category>/<slug>`                        | One generated Tauri reference page      |

## Scopes and categories

The catalog records `scope` (`shared` or `tauri`) independently from `kind` (`component`, `hook`, `attachment`, `class`, `type`, or `utility`). Source folders supply categories: `components`, `hooks`, `attachments`, `classes`, `types`, and `utils`; `interfaces` also belongs to Types. Standalone root modules belong to Utilities. Tauri guides are discovered recursively under `src/lib/tauri`, and its component guides must match their component folder names.

Navigation and search use the same scope/category groups and omit empty categories. Tauri pages use `/tauri/<category>/<slug>` and shared pages use `/<category>/<slug>`. A duplicate destination fails catalog construction. When introducing a new shared category, add its category and detail routes using the existing route patterns.

Documentation breadcrumbs display scope, linked category, and page title. Examples are matched by destination URL, independently of sidebar grouping.

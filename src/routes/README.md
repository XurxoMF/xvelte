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

`catalog.ts` discovers every component, hook, and attachment guide automatically with one `import.meta.glob(..., { query: "?raw" })` loader. Each unit has an autonomous `<slug>.md` document. The filename supplies its route slug, the first level-one heading supplies its visible name, and the first paragraph supplies its description. Component guide filenames must also match their containing directory; invalid guide paths or missing titles fail the build instead of silently omitting documentation.

## Sources of truth

- Each public unit's `<slug>.md` guide supplies the reference text, API tables, installation notes, and code examples shown on the website. Editing that guide updates the corresponding web page.
- `_examples/components/<slug>/*.svelte`, `_examples/hooks/<slug>/*.svelte`, and `_examples/attachments/<slug>/*.svelte` are real, independently compiled previews.
- An invisible `<!-- xvelte-example: overview -->` guide comment places the matching `overview.svelte` preview at that exact position on the website.
- `_docs/examples.ts` discovers both the compiled preview and its raw source. The Preview tab renders the component and the Code tab therefore always displays the exact same file.
- `UnitPage.svelte` finds preview markers, parses each remaining guide section through `parseMarkdown`, and passes its mdast directly to `Markdown.Root` instead of injecting parser-generated HTML.
- Markdown code fences use Code's lazy Shiki language registry and treat unknown languages as plain text.
- The sidebar renders separate Components, Hooks, and Attachments groups from `_docs/catalog.ts`; its search filters all three groups by title and hides groups without matches.
- `layout.css` owns the reusable global theme and may only receive collection-wide theme changes. The landing page keeps its decorative grid mask in its own scoped `<style>` block; documentation content relies on the xvelte components' local styles.

The interactive demo source is intentionally route-local. When a demo is based on a unit-guide example, keep both versions equivalent when changing it.

## Adding documentation

For a new component:

1. Add its component folder and `<slug>.md` guide under `src/lib/components/ui/<slug>` following the repository guidelines.
2. The catalog, navigation, component index, and static route entry will discover it automatically.
3. Add at least one focused preview under `_examples/components/<slug>`.
4. Place `<!-- xvelte-example: <filename-without-extension> -->` at the desired position in the component guide.

For a new hook or attachment, add its source file and a sibling `<slug>.md` guide, such as `use-viewport.svelte.ts` plus `use-viewport.md`. Use the exported public name in the guide's level-one heading and put its catalog description in the first paragraph. The catalog uses the filename as the slug, so navigation, the category index, and the static route entry discover it automatically. Create the matching `_examples/<category>/<slug>` file and place the same invisible comment in the unit guide when it has an interactive preview.

After route changes, run:

```sh
bun run check
bun run lint
bun run build
git diff --check
```

## Route map

| Route                                   | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `/`                                     | Project introduction                    |
| `/components`, `/hooks`, `/attachments` | Small category indexes                  |
| `/components/<slug>`                    | One generated component reference page  |
| `/hooks/<slug>`                         | One generated hook reference page       |
| `/attachments/<slug>`                   | One generated attachment reference page |

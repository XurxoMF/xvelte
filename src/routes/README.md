# Documentation website

This directory contains the xvelte preview and documentation website. It is application code: reusable components, hooks, and attachments remain under `src/lib`.

## How a component page is created

The component routes use one SvelteKit dynamic route, `components/[slug]`, but the final website is still statically generated:

```text
src/lib/components/ui/button/README.md
                │
                ▼
       _docs/catalog.ts
   imports every README as text
                │
                ├──► components/[slug]/+page.ts
                │    returns every slug from entries()
                │
                ▼
        _docs/UnitPage.svelte
     selects the matching document
                │
                ▼
        _docs/Document.svelte
     finds xvelte-example comments
                │
                ├──► _examples/.../*.svelte   live preview + exact source
                └──► Markdown.svelte          typed AST + xvelte components
```

During `bun run build`, SvelteKit calls `entries()` and emits one HTML entry for every known slug, such as `build/components/button.html`. The `[slug]` folder avoids maintaining 82 nearly identical route files; it does not mean that the production site needs a server.

`catalog.ts` discovers component README files automatically with `import.meta.glob(..., { query: "?raw" })`. Hooks and attachments use one shared dynamic loader: every `##` section between `Installation` and `Credits` is a public unit, and its camelCase heading becomes the kebab-case slug used by the matching `.svelte.ts` or `.ts` filename. When that section becomes a standalone page, its nested Markdown headings are promoted by one level outside fenced code blocks, preserving a valid `#` → `##` → `###` hierarchy. Invalid shared README structure fails the build instead of silently omitting the documentation.

## Sources of truth

- Each `src/lib/**/README.md` supplies the reference text, API tables, installation notes, and code examples shown on the website. Editing that README updates the corresponding web page.
- `_examples/components/<slug>/*.svelte`, `_examples/hooks/<slug>/*.svelte`, and `_examples/attachments/<slug>/*.svelte` are real, independently compiled previews.
- An invisible `<!-- xvelte-example: overview -->` README comment places the matching `overview.svelte` preview at that exact position on the website.
- `_docs/examples.ts` discovers both the compiled preview and its raw source. The Preview tab renders the component and the Code tab therefore always displays the exact same file.
- `_docs/markdown.ts` parses trusted repository Markdown into a typed block and inline AST without adding a runtime Markdown dependency.
- `_docs/Markdown.svelte` renders that AST with the public Typography, Code, List, Table, and Separator components instead of injecting parser-generated HTML. Its explicit Shiki loader map covers every language used by the current README files and treats unknown languages as plain text.
- The sidebar renders separate Components, Hooks, and Attachments groups from `_docs/catalog.ts`; its search filters all three groups by title and hides groups without matches.
- `layout.css` owns the reusable global theme and may only receive collection-wide theme changes. The landing page keeps its decorative grid mask in its own scoped `<style>` block; documentation content relies on the xvelte components' local styles.

The interactive demo source is intentionally route-local. When a demo is based on a README example, keep both versions equivalent when changing it.

## Adding documentation

For a new component:

1. Add its component folder and README under `src/lib/components/ui/<slug>` following the repository guidelines.
2. The catalog, navigation, component index, and static route entry will discover it automatically.
3. Add at least one focused preview under `_examples/components/<slug>`.
4. Place `<!-- xvelte-example: <filename-without-extension> -->` at the desired position in the component README.

For a new hook or attachment, add its source file and a matching camelCase `##` section between `Installation` and `Credits` in the shared README. For example, `use-viewport.svelte.ts` or `use-viewport.ts` matches `## useViewport`. The catalog, navigation, category index, and static route entry discover it automatically. Create the matching `_examples/<category>/<slug>` file and place the same invisible comment in that unit's README section when it has an interactive preview.

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

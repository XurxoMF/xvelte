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
                └──► Markdown.svelte          remaining README content
```

During `bun run build`, SvelteKit calls `entries()` and emits one HTML entry for every known slug, such as `build/components/button.html`. The `[slug]` folder avoids maintaining 82 nearly identical route files; it does not mean that the production site needs a server.

`catalog.ts` discovers component README files automatically with `import.meta.glob(..., { query: "?raw" })`. Hooks share one README, so their headings and slugs are listed explicitly there. The current attachment is extracted from the `shortcut` section of its shared README.

## Sources of truth

- Each `src/lib/**/README.md` supplies the reference text, API tables, installation notes, and code examples shown on the website. Editing that README updates the corresponding web page.
- `_examples/components/<slug>/*.svelte`, `_examples/hooks/<slug>/*.svelte`, and `_examples/attachments/<slug>/*.svelte` are real, independently compiled previews.
- An invisible `<!-- xvelte-example: overview -->` README comment places the matching `overview.svelte` preview at that exact position on the website.
- `_docs/examples.ts` discovers both the compiled preview and its raw source. The Preview tab renders the component and the Code tab therefore always displays the exact same file.
- `_docs/markdown.ts` converts trusted repository Markdown to HTML without adding a runtime Markdown dependency.
- `layout.css` owns the reusable global theme and may only receive collection-wide theme changes. Website-specific Markdown and decorative styles belong in `custom.css`.

The interactive demo source is intentionally route-local. When a demo is based on a README example, keep both versions equivalent when changing it.

## Adding documentation

For a new component:

1. Add its component folder and README under `src/lib/components/ui/<slug>` following the repository guidelines.
2. The catalog, navigation, component index, and static route entry will discover it automatically.
3. Add at least one focused preview under `_examples/components/<slug>`.
4. Place `<!-- xvelte-example: <filename-without-extension> -->` at the desired position in the component README.

For a new hook or attachment, add its slug and README section mapping to `_docs/catalog.ts`, create the matching `_examples` file, and place the same invisible comment in that unit's README section.

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

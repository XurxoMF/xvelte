# Tree View

A composable file-tree presentation with expandable folders, file buttons, default semantic file/folder icons, custom icon snippets, and bindable folder state. It uses xvelte Collapsible for folder disclosure and adds ARIA tree roles to the local structure.

Use Tree View for compact file or hierarchical resource browsing. Do not treat it as a complete ARIA tree widget: the current local implementation does not provide roving focus, arrow-key traversal across nodes, selection state, or tree data management.

<!-- xvelte-example: overview -->

## Contents

- [Import](#import)
- [Anatomy](#anatomy)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Styling and DOM contract](#styling-and-dom-contract)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Import

```svelte
<script lang="ts">
	import * as TreeView from "$lib/components/ui/tree-view";
</script>
```

`index.ts` exports `Root`, `Folder`, `File`, `RootProps`, `FolderProps`, and `FileProps`.

---

## Anatomy

```svelte
<TreeView.Root>
	<TreeView.Folder name="Folder">
		<TreeView.File name="File.txt" />
	</TreeView.Folder>
</TreeView.Root>
```

Folder may contain Files or nested Folders. Root and folders do not accept a data model; the app composes the hierarchy directly.

---

## Basic usage

```svelte
<script lang="ts">
	import * as TreeView from "$lib/components/ui/tree-view";
</script>

<TreeView.Root aria-label="Project files">
	<TreeView.Folder name="src">
		<TreeView.Folder name="components">
			<TreeView.File name="Header.svelte" onclick={() => openFile("src/components/Header.svelte")} />
		</TreeView.Folder>
		<TreeView.File name="app.css" onclick={() => openFile("src/app.css")} />
	</TreeView.Folder>
	<TreeView.File name="package.json" onclick={() => openFile("package.json")} />
</TreeView.Root>
```

Files are native buttons with `type="button"` by default. Folder defaults to open in the local implementation.

---

## Examples

### Controlled folder state

```svelte
<script lang="ts">
	let sourceOpen = $state(false);
</script>

<TreeView.Folder name="src" bind:open={sourceOpen}>
	<TreeView.File name="main.ts" />
</TreeView.Folder>
```

### Custom icons

```svelte
<TreeView.Folder name="Images">
	{#snippet icon({ name, open })}
		<span aria-hidden="true">{open ? "📂" : "📁"}</span>
	{/snippet}

	<TreeView.File name="hero.webp">
		{#snippet icon({ name })}
			<span aria-hidden="true">🖼️</span>
		{/snippet}
	</TreeView.File>
</TreeView.Folder>
```

Folder icon receives `name` and current `open`; File icon receives `name`. Custom icons replace the local semantic icon exports.

### Selected file state

```svelte
<TreeView.File
	name="README.md"
	aria-current={selectedPath === "README.md" ? "page" : undefined}
	data-selected={selectedPath === "README.md" || undefined}
	class="rounded px-1 data-[selected=true]:bg-muted"
	onclick={() => (selectedPath = "README.md")}
/>
```

Selection is application state; the component adds no selected prop or keyboard selection model.

---

## Public API

Tree View is local code that composes native markup and xvelte Collapsible. The component's `index.ts`, exported types, and source are the source of truth.

### `TreeView.Root`

`RootProps` extends native `<div>` attributes with `children`, merged class, and bindable `HTMLDivElement` ref. Root fixes `role="tree"`, adds `data-slot="tree-view"`, and renders a vertical flex container.

### `TreeView.Folder`

| Prop       | Type                        | Default        | Behavior                                    |
| ---------- | --------------------------- | -------------- | ------------------------------------------- |
| `name`     | `string`                    | Required       | Visible folder label and custom icon input. |
| `open`     | `boolean`                   | `true` locally | Bindable xvelte Collapsible state.          |
| `icon`     | `Snippet<[{ name, open }]>` | —              | Replaces FolderIcon/FolderOpenIcon.         |
| `children` | `Snippet`                   | —              | Nested Folder and File components.          |
| `class`    | `string`                    | —              | Merges onto the Collapsible Trigger only.   |

Folder does not expose a ref or general native attributes. Its Trigger has `role="treeitem"` and `data-slot="tree-view-folder"`; Content has `role="group"` and `data-slot="tree-view-folder-content"`.

### `TreeView.File`

| Prop                | Type                        | Default    | Behavior                                                     |
| ------------------- | --------------------------- | ---------- | ------------------------------------------------------------ |
| `name`              | `string`                    | Required   | Visible file label and custom icon input.                    |
| `icon`              | `Snippet<[{ name }]>`       | —          | Replaces FileIcon.                                           |
| `type`              | Native button type          | `"button"` | Prevents accidental form submission by default.              |
| `ref`               | `HTMLButtonElement \| null` | `null`     | Bindable file button.                                        |
| Native button props | —                           | —          | Handlers, disabled state, ARIA, class, data attributes, etc. |

`FileProps` currently includes a `children` snippet through its public type, but `tree-view-file.svelte` does not render it. Use `name` and `icon`; do not rely on File children until the implementation is changed.

---

## Styling and DOM contract

| Part           | Stable hook                            | Local styling                               |
| -------------- | -------------------------------------- | ------------------------------------------- |
| Root           | `data-slot="tree-view"`                | Vertical flex.                              |
| Folder trigger | `data-slot="tree-view-folder"`         | Inline row, 0.25rem gap.                    |
| Folder content | `data-slot="tree-view-folder-content"` | Left margin/border plus nested flex column. |
| File           | `data-slot="tree-view-file"`           | Inline row, small left padding and gap.     |

Default icons are 1rem. Folder's `class` affects only its trigger. File and Root classes merge through `cn()`. Collapsible contributes open/closed state attributes and behavior documented in its README.

---

## Accessibility

Root, Folder Trigger, Folder Content, and File declare `tree`, `treeitem`, and `group` roles, and Collapsible supplies folder disclosure state. However, the local component does not implement the complete ARIA tree keyboard pattern: there is no roving tabindex, Arrow Up/Down navigation between visible nodes, Arrow Right/Left hierarchy navigation, Home/End, or typeahead.

Files and folders remain individually Tab-reachable native buttons. For a strict tree widget, add the missing focus/navigation model before use. Give Root an accessible label, keep file names unique enough in context, and express selection with ARIA plus visible state rather than color alone.

---

## Localization

Tree View contains no built-in copy and requires no localization messages. The app supplies and translates file/folder names, tree labels, actions, selection status, empty states, and errors. File paths or identifiers may remain implementation values when not presented to people.

---

## Dependencies

### Packages

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge tw-animate-css
pnpm add -D tailwindcss
```

Bits UI is used by Collapsible and for shared public prop helpers.

### Icon facade

```ts
export { default as FileIcon } from "@tabler/icons-svelte/icons/file";
export { default as FolderIcon } from "@tabler/icons-svelte/icons/folder";
export { default as FolderOpenIcon } from "@tabler/icons-svelte/icons/folder-open";
```

### Global styles and theme tokens

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
	--border: oklch(0.923 0.003 48.717);
}

.dark {
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-border: var(--border);
}
```

This is Tree View's direct token. Follow Collapsible's README for its animation, focus, and additional theme requirements.

### Shared utilities

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

### Required xvelte component

Copy Collapsible and follow its README:

```text
collapsible/
├── collapsible-content.svelte
├── collapsible-root.svelte
├── collapsible-trigger.svelte
└── index.ts
```

### Component files and other integration

```text
tree-view/
├── index.ts
├── tree-view-file.svelte
├── tree-view-folder.svelte
└── tree-view-root.svelte
```

Tree View needs no hook, attachment, local context file, localization setup, shared style, image, font, or network service. Collapsible owns its state context.

---

## Credits

The component structure is adapted from [shadcn-svelte-extras Tree View](https://www.shadcn-svelte-extras.com/docs/components/tree-view), with the local defaults and limitations documented above.

---

## File organization

| File                      | Responsibility                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `tree-view-root.svelte`   | Tree role, root layout, native props, and ref.                                                     |
| `tree-view-folder.svelte` | Bindable disclosure, default/custom folder icon, label, nested group, and Collapsible composition. |
| `tree-view-file.svelte`   | Native file button, default/custom icon, name, native props, and ref.                              |
| `index.ts`                | Public parts and props types.                                                                      |
| `README.md`               | Composition, examples, API, limitations, accessibility, styling, and installation guide.           |

The component's `index.ts` and exported types are the source of truth for the public API.

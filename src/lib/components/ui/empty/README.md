# Empty

A composable layout for empty states, missing results, first-use prompts, and unavailable content. It provides centered header, media, title, description, and action areas while leaving all copy, semantics, controls, and behavior to the app.

Use Empty when a successfully loaded area has no content to display and people may need context or a next action. Do not use it as a loading indicator, an unexplained error state, or a replacement for content that is merely filtered or temporarily unavailable unless the message clearly describes that condition.

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

## Import

Import all parts from the component's public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Empty from "$lib/components/ui/empty";
</script>
```

Empty's `index.ts` exports `Root`, `Header`, `Media`, `Title`, `Description`, and `Content`, together with the `RootProps`, `HeaderProps`, `MediaProps`, `MediaVariants`, `TitleProps`, `DescriptionProps`, and `ContentProps` types. It also exports the `mediaVariants` styling function.

## Anatomy

Compose a header and optional action content beneath one Root:

```svelte
<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<span aria-hidden="true">📁</span>
		</Empty.Media>

		<Empty.Title role="heading" aria-level={2}>No projects yet</Empty.Title>
		<Empty.Description>Create your first project to begin organizing your work.</Empty.Description>
	</Empty.Header>

	<Empty.Content>
		<button type="button">Create project</button>
	</Empty.Content>
</Empty.Root>
```

Root centers the complete state. Header groups Media, Title, and Description with a narrower readable width. Content groups actions, forms, or supporting links below the explanation. Media can render an icon-sized surface or any app-provided image, avatar, illustration, or other visual.

Every part renders a native `div`. The component does not enforce this composition, create headings, announce state changes, or add action behavior.

## Basic usage

```svelte
<script lang="ts">
	import * as Empty from "$lib/components/ui/empty";

	function createProject() {
		console.info("Create project");
	}
</script>

<Empty.Root class="border">
	<Empty.Header>
		<Empty.Media variant="icon">
			<span aria-hidden="true">📂</span>
		</Empty.Media>

		<Empty.Title role="heading" aria-level={2}>No projects yet</Empty.Title>
		<Empty.Description>Create your first project to keep files, tasks, and collaborators together.</Empty.Description>
	</Empty.Header>

	<Empty.Content>
		<button class="rounded-lg border px-3 py-2 text-sm font-medium" type="button" onclick={createProject}> Create project </button>
	</Empty.Content>
</Empty.Root>
```

Root includes `border-dashed` but no border-width utility, so the dashed outline becomes visible only after adding a class such as `border`. Root also uses `flex-1`; its final height depends on the surrounding layout. Add `min-h-*`, `h-full`, or another size class when the empty state must occupy a specific area.

## Examples

### Search with no results

Use the same structure for a filtered result set, but explain what was searched and provide a useful recovery action:

```svelte
<script lang="ts">
	import * as Empty from "$lib/components/ui/empty";

	let query = $state("archived invoices");
</script>

<Empty.Root aria-live="polite">
	<Empty.Header>
		<Empty.Media variant="icon">
			<span aria-hidden="true">🔎</span>
		</Empty.Media>

		<Empty.Title role="heading" aria-level={2}>No matching documents</Empty.Title>
		<Empty.Description>No documents matched “{query}”. Try a shorter search or clear the current filters.</Empty.Description>
	</Empty.Header>

	<Empty.Content>
		<button type="button" onclick={() => (query = "")}>Clear search</button>
	</Empty.Content>
</Empty.Root>
```

Use a live region only when the result changes without a page navigation and an announcement is helpful. Avoid placing an automatically updating live region around controls that change frequently.

### Background without an outline

Root does not require a border. A semantic background can separate the state from its surroundings:

```svelte
<Empty.Root class="bg-muted/50">
	<Empty.Header>
		<Empty.Media>
			<span class="text-4xl" aria-hidden="true">✓</span>
		</Empty.Media>

		<Empty.Title role="heading" aria-level={2}>You're all caught up</Empty.Title>
		<Empty.Description>New notifications will appear here when they arrive.</Empty.Description>
	</Empty.Header>
</Empty.Root>
```

The default Media variant is transparent and imposes no fixed width or height, so it is appropriate for larger glyphs, illustrations, avatars, and other custom content.

### Description links and multiple actions

Description automatically styles direct anchor children. Content can hold several actions while the app controls their responsive layout:

```svelte
<Empty.Root>
	<Empty.Header>
		<Empty.Title role="heading" aria-level={2}>No team members</Empty.Title>
		<Empty.Description>
			Invite someone to collaborate, or <a href="/help/teams">learn how teams work</a>.
		</Empty.Description>
	</Empty.Header>

	<Empty.Content>
		<div class="flex flex-wrap justify-center gap-2">
			<button type="button">Invite member</button>
			<a href="/contacts">Browse contacts</a>
		</div>
	</Empty.Content>
</Empty.Root>
```

Only anchors that are direct children of Description receive its built-in underline and hover-color styles. Nested links require their own classes.

### Reusing the media styles

Use the exported `mediaVariants` function when app-owned markup needs the same presentation without rendering Media:

```svelte
<script lang="ts">
	import { mediaVariants } from "$lib/components/ui/empty";
</script>

<aside class={mediaVariants({ variant: "icon", class: "size-10" })} aria-label="Empty inbox">
	<span aria-hidden="true">📭</span>
</aside>
```

This reuses only Media's classes. It does not add `data-slot`, `data-variant`, a bindable element reference, or any Empty composition behavior.

## Public API

All component parts render native `div` elements and forward compatible native attributes and events. Their props use the same base shape:

| Prop       | Type                     | Default     | xvelte behavior                                  |
| ---------- | ------------------------ | ----------- | ------------------------------------------------ |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the rendered `div`.        |
| `children` | `Snippet`                | `undefined` | Renders app-provided content.                    |
| `class`    | `string`                 | `undefined` | Merged after the part's local classes with `cn`. |

Native attributes such as `id`, `role`, `aria-*`, `data-*`, `style`, `title`, and pointer events are forwarded. Forwarded props are spread after the local `data-slot` and, on Media, `data-variant`; overriding those attributes can break styling or app integrations and is not recommended.

### `Empty.Root`

Type: `RootProps`.

Root renders the outer `div` and adds `data-slot="empty"`. Its local layout is full-width, flexible, centered in both axes, column-oriented, gap `1rem`, rounded with `rounded-xl`, padded by `1.5rem`, text-centered, and text-balanced. It includes `min-w-0`, `flex-1`, and `border-dashed`.

Root does not add `border`, a minimum height, a role, a label, or a background. Those remain app choices.

### `Empty.Header`

Type: `HeaderProps`.

Header renders `data-slot="empty-header"`. It is a centered column with `0.5rem` gaps and a maximum width of `24rem`. Use it to keep Media, Title, and Description visually grouped.

### `Empty.Media`

Type: `MediaProps`, extending the shared native props with one local option:

| Prop      | Type                  | Default     | xvelte behavior                                     |
| --------- | --------------------- | ----------- | --------------------------------------------------- |
| `variant` | `"default" \| "icon"` | `"default"` | Selects the transparent or icon-sized presentation. |

Media renders `data-slot="empty-icon"` and `data-variant` equal to the selected variant. The slot is named `empty-icon` even when Media contains an avatar, image, or other non-icon content.

Both variants add bottom margin, flex centering, shrinking behavior, and non-interactive/non-shrinking descendant SVGs:

- `default` adds only a transparent background.
- `icon` adds a `2rem` square, muted background, foreground color, `rounded-lg`, and a default `1rem` size for descendant SVGs that do not already have a `size-*` class.

### `Empty.Title`

Type: `TitleProps`.

Title renders `data-slot="empty-title"` with small, medium-weight, tightly tracked text. It remains a native `div`; add `role="heading"` and the appropriate `aria-level`, or place a semantic heading inside it, when the title belongs in the page's heading hierarchy.

### `Empty.Description`

Type: `DescriptionProps`.

Description renders `data-slot="empty-description"` with relaxed small text and the muted-foreground token. Direct anchor children receive an underline, a four-pixel underline offset, and primary color on hover. It remains a `div`, so paragraph semantics are not added automatically.

### `Empty.Content`

Type: `ContentProps`.

Content renders `data-slot="empty-content"`. It is a centered column with full width, `min-w-0`, a `24rem` maximum width, `0.625rem` gaps, small text, and balanced wrapping. Use it for actions, a compact form, secondary descriptions, or other recovery controls.

### `mediaVariants`

`mediaVariants` is the Tailwind Variants function used by Media. Call it with `variant: "default" | "icon"` and an optional `class` value to produce the merged class string:

```ts
const className = mediaVariants({
	variant: "icon",
	class: "size-10"
});
```

`MediaVariants` is the exported variant union. The component's `index.ts`, exported types, and `mediaVariants` are the source of truth for the public API.

## Styling and DOM contract

Empty uses Tailwind utilities and semantic theme tokens. It exposes no component-specific CSS variables, state attributes, animations, or dependency-owned DOM.

| Part          | Stable xvelte attributes                                       |
| ------------- | -------------------------------------------------------------- |
| `Root`        | `data-slot="empty"`                                            |
| `Header`      | `data-slot="empty-header"`                                     |
| `Media`       | `data-slot="empty-icon"`, `data-variant="default"` or `"icon"` |
| `Title`       | `data-slot="empty-title"`                                      |
| `Description` | `data-slot="empty-description"`                                |
| `Content`     | `data-slot="empty-content"`                                    |

Stable presentation details include:

- Root's `flex-1`, centered column layout, padding, rounded corners, text alignment, text balancing, and dashed border style without a border width.
- Header and Content's `max-w-sm` readable width.
- Media's `mb-2` spacing and variant styling.
- Description's direct-link underline and hover treatment.
- Content's slightly larger `gap-2.5` spacing between children.

Every part merges `class` with `cn`, so later conflicting utilities supplied by the app normally replace local Tailwind utilities. Native `style` and other attributes are forwarded independently.

## Accessibility

Empty adds layout only. It does not provide a landmark, status role, heading, live region, focus management, or accessible name.

App responsibilities:

- Give the state a clear title and concise explanation that distinguishes “empty”, “filtered”, “unavailable”, and “failed” conditions.
- Make Title a real heading when appropriate. Because it renders a `div`, add `role="heading"` with the correct `aria-level` or place an `h1`–`h6` inside it.
- Add `role="status"`, `aria-live`, or another announcement mechanism only when a dynamically appearing state must be announced. Static page content normally needs no live region.
- Hide decorative Media content from assistive technology. Give informative images meaningful alternative text instead.
- Use semantic buttons for actions and anchors for navigation; Empty does not change their behavior.
- Keep a visible focus indicator on every interactive child and provide useful accessible names for icon-only controls.
- Do not rely on the visual illustration or muted styling alone to explain the state.
- Move focus intentionally when an action replaces or removes the empty state, especially in client-side dialogs, panels, and filtered collections.

The component has no keyboard interaction of its own. Keyboard and disabled behavior come entirely from controls placed inside it.

## Localization

Empty contains no built-in human-readable copy and does not use Paraglide messages. The app supplies and translates titles, descriptions, action labels, link text, image alternative text, accessible names, status announcements, and any dynamic values.

The layout uses centered text and `text-balance`, with `max-w-sm` on Header and Content. Test longer translations and override width, alignment, or balancing classes when a locale needs more space. The technical values of `variant`, `data-slot`, and `data-variant` are not translated.

## Dependencies

Empty expects a Svelte 5 project using Tailwind CSS 4. It requires Tailwind Variants for Media and the shared class-merging utilities. Install all package requirements in one of these command groups:

```sh
# bun
bun add clsx tailwind-merge tailwind-variants
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge tailwind-variants
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge tailwind-variants
pnpm add -D tailwindcss
```

### Shared utilities

Every part imports `cn` and `WithElementRef` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

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

The package block includes `clsx` and `tailwind-merge`, which `cn` imports.

### Global CSS

The global stylesheet must import Tailwind, apply the shared border color when an outline is added, and expose the semantic colors and radii used by Empty. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

:root {
	--foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--primary: oklch(0.768 0.233 130.85);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
	* {
		@apply border-border;
	}
}
```

No dark custom variant, animation package, keyframe, shared component stylesheet, or mode-management package is required; the app is responsible for applying its `.dark` class when dark mode is supported.

### Icons

Empty imports no icon and does not require an icon package or `$lib/icons` export. Media renders whatever content the app provides, and the examples use Unicode symbols so no icon code needs to be copied.

### Other requirements

Empty requires no other xvelte component, hook, attachment, context file, localization message, Paraglide setup, shared style, external asset, or browser API. Buttons, avatars, input groups, illustrations, and popup containers are optional app compositions; copy each component and follow its README only when it is used.

## Credits

Empty is adapted from [shadcn-svelte's Empty component](https://www.shadcn-svelte.com/docs/components/empty). Local xvelte structure, exports, styling, dependencies, semantics, and limitations documented here take precedence.

## File organization

| File                       | Responsibility                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `empty-root.svelte`        | Flexible centered outer layout, spacing, padding, dashed border style, class merging, and native props.    |
| `empty-header.svelte`      | Narrow centered group for Media, Title, and Description.                                                   |
| `empty-media.svelte`       | Default/icon visual variants, SVG sizing, semantic colors, and exported styling function.                  |
| `empty-title.svelte`       | Presentational title text without built-in heading semantics.                                              |
| `empty-description.svelte` | Muted explanatory text and direct-link styling.                                                            |
| `empty-content.svelte`     | Narrow centered area for actions, compact forms, and supporting content.                                   |
| `index.ts`                 | Public components, props types, media variant type, and styling-function exports.                          |
| `README.md`                | Installation, composition, examples, API, styling, accessibility, localization, dependencies, and credits. |

Treat `index.ts`, its exported types, and `mediaVariants` as the source of truth for the public API.

# Attachment

A composable file and image card with metadata, upload states, sizes, orientations, independent actions, a full-card trigger, and scrollable groups. Use Attachment to present selected files, uploads, generated documents, or message attachments; it does not select, upload, download, preview, or delete files by itself.

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

Import every part through the component's public `index.ts`:

```svelte
<script lang="ts">
	import * as Attachment from "$lib/components/ui/attachment";
</script>
```

The entry point exports `Root`, `Group`, `Media`, `Content`, `Title`, `Description`, `Actions`, `Action`, and `Trigger`. It also exports each part's props type, `RootSizes`, `RootOrientations`, `AttachmentState`, `MediaVariants`, `rootVariants`, and `mediaVariants`.

---

## Anatomy

Compose a single attachment in this order:

```svelte
<Attachment.Root>
	<Attachment.Media />

	<Attachment.Content>
		<Attachment.Title />
		<Attachment.Description />
	</Attachment.Content>

	<Attachment.Actions>
		<Attachment.Action />
	</Attachment.Actions>

	<Attachment.Trigger />
</Attachment.Root>
```

Only `Root` is required. `Media`, `Description`, `Actions`, and `Trigger` are optional. Put several roots inside `Group` for a horizontally scrollable, snapping row:

```svelte
<Attachment.Group>
	<Attachment.Root />
	<Attachment.Root />
</Attachment.Group>
```

---

## Basic usage

```svelte
<script lang="ts">
	import { CloseIcon, FileIcon } from "$lib/icons";

	import * as Attachment from "$lib/components/ui/attachment";

	function removeFile() {
		// Remove the file from application state.
	}
</script>

<Attachment.Root>
	<Attachment.Media>
		<FileIcon />
	</Attachment.Media>

	<Attachment.Content>
		<Attachment.Title>sales-dashboard.pdf</Attachment.Title>
		<Attachment.Description>PDF · 2.4 MB</Attachment.Description>
	</Attachment.Content>

	<Attachment.Actions>
		<Attachment.Action aria-label="Remove sales-dashboard.pdf" onclick={removeFile}>
			<CloseIcon />
		</Attachment.Action>
	</Attachment.Actions>
</Attachment.Root>
```

Attachment renders presentation and controls but owns no file state. The app performs the action and updates `state`, metadata, or the rendered list.

---

## Examples

### Image preview and full-card link

Set `variant="image"` on `Media` and render an image with meaningful alternative text. `Trigger` can delegate its rendering to a link through `child`:

```svelte
<Attachment.Root orientation="vertical">
	<Attachment.Media variant="image">
		<img src={image.url} alt={image.alt} />
	</Attachment.Media>

	<Attachment.Content>
		<Attachment.Title>{image.name}</Attachment.Title>
		<Attachment.Description>{image.type} · {image.size}</Attachment.Description>
	</Attachment.Content>

	<Attachment.Trigger>
		{#snippet child({ props })}
			<a href={image.url} target="_blank" rel="noreferrer" aria-label={`Open ${image.name}`} {...props}></a>
		{/snippet}
	</Attachment.Trigger>
</Attachment.Root>
```

The trigger fills the card at `z-10`. `Actions` uses `z-20`, so its controls remain independently clickable.

### Upload states

Use `state` to expose the current lifecycle and provide visible status text in `Description`:

```svelte
<script lang="ts">
	import { FileIcon } from "$lib/icons";

	import * as Attachment from "$lib/components/ui/attachment";
	import * as Spinner from "$lib/components/ui/spinner";
</script>

<Attachment.Root state="uploading" class="w-full">
	<Attachment.Media>
		<Spinner.Root />
	</Attachment.Media>

	<Attachment.Content>
		<Attachment.Title>design-system.zip</Attachment.Title>
		<Attachment.Description>Uploading · 64%</Attachment.Description>
	</Attachment.Content>
</Attachment.Root>

<Attachment.Root state="error" class="w-full">
	<Attachment.Media>
		<FileIcon />
	</Attachment.Media>

	<Attachment.Content>
		<Attachment.Title>financial-model.xlsx</Attachment.Title>
		<Attachment.Description>Upload failed. Try again.</Attachment.Description>
	</Attachment.Content>
</Attachment.Root>
```

`uploading` and `processing` animate the title with the shared shimmer utility. `error` changes the border, media, and description to the `danger` semantic color. `idle` uses a dashed border, while `done` uses the normal presentation.

### Sizes

The three sizes adjust spacing, type, media size, and border radius:

```svelte
<div class="flex flex-col items-start gap-3">
	<Attachment.Root size="default">Default attachment</Attachment.Root>
	<Attachment.Root size="sm">Small attachment</Attachment.Root>
	<Attachment.Root size="xs">Extra-small attachment</Attachment.Root>
</div>
```

### Scrollable group

```svelte
<Attachment.Group role="region" aria-label="Selected files" tabindex={0} class="w-full">
	{#each files as file (file.id)}
		<Attachment.Root class="w-64">
			<Attachment.Content>
				<Attachment.Title>{file.name}</Attachment.Title>
				<Attachment.Description>{file.type} · {file.size}</Attachment.Description>
			</Attachment.Content>
		</Attachment.Root>
	{/each}
</Attachment.Group>
```

The group hides its scrollbar, contains horizontal overscroll, and snaps each direct Attachment root to the start. In browsers with CSS scroll-driven animation support, the mask fades only the edges that have more content; other browsers keep the content fully visible.

---

## Public API

Attachment uses native elements except for `Action`, which wraps xvelte's Button component. Native attributes are forwarded by every part, and every rendered element exposes a bindable `ref`. The component's `index.ts` and exported types are the source of truth.

### `Attachment.Root`

Type: `RootProps`, extending native `div` attributes.

| Prop          | Type                                                         | Default        | Behavior                                                                 |
| ------------- | ------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------ |
| `state`       | `"idle" \| "uploading" \| "processing" \| "error" \| "done"` | `"done"`       | Sets `data-state` and activates lifecycle styling.                       |
| `size`        | `"default" \| "sm" \| "xs"`                                  | `"default"`    | Controls the root spacing, text size, radius, and descendant media size. |
| `orientation` | `"horizontal" \| "vertical"`                                 | `"horizontal"` | Places media beside the content or stacks the parts vertically.          |
| `ref`         | `HTMLDivElement \| null`                                     | `null`         | Bindable reference to the root element.                                  |
| `children`    | `Snippet`                                                    | `undefined`    | Renders the attachment parts.                                            |
| `class`       | `string`                                                     | `undefined`    | Merged after the classes returned by `rootVariants`.                     |

`RootSizes`, `RootOrientations`, and `AttachmentState` expose the xvelte-owned option types. `rootVariants` is exported for wrappers that need the same variant classes.

### `Attachment.Media`

Type: `MediaProps`, extending native `div` attributes.

| Prop       | Type                     | Default     | Behavior                                                     |
| ---------- | ------------------------ | ----------- | ------------------------------------------------------------ |
| `variant`  | `"icon" \| "image"`      | `"icon"`    | Selects icon sizing or full-cover image styling.             |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the media element.                     |
| `children` | `Snippet`                | `undefined` | Renders an icon, Spinner, image, or other app-owned preview. |
| `class`    | `string`                 | `undefined` | Merged after the classes returned by `mediaVariants`.        |

`MediaVariants` and `mediaVariants` are exported. The component does not generate an image, infer a file type, or supply alternative text.

### `Attachment.Content`

Type: `ContentProps`, extending native `div` attributes. It renders the flexible, truncation-safe wrapper for `Title` and `Description`. `ref`, `children`, `class`, and remaining native attributes are forwarded.

### `Attachment.Title`

Type: `TitleProps`, extending native `span` attributes. It renders a single truncated line and shimmers when the nearest Root is `uploading` or `processing`. `ref`, `children`, `class`, and remaining native attributes are forwarded.

### `Attachment.Description`

Type: `DescriptionProps`, extending native `span` attributes. It renders one truncated secondary line and adopts the `danger` tone in the `error` state. `ref`, `children`, `class`, and remaining native attributes are forwarded.

### `Attachment.Actions`

Type: `ActionsProps`, extending native `div` attributes. It keeps actions above `Trigger`; in vertical orientation it is positioned at the top-right corner. `ref`, `children`, `class`, and remaining native attributes are forwarded.

### `Attachment.Action`

Type: `ActionProps`, an alias of `Button.RootProps`.

| Prop      | Type                        | Default     | Behavior                                 |
| --------- | --------------------------- | ----------- | ---------------------------------------- |
| `variant` | `Button.RootVariants`       | `"ghost"`   | Uses any variant supported by Button.    |
| `size`    | `Button.RootSizes`          | `"icon-xs"` | Uses any size supported by Button.       |
| `ref`     | `HTMLButtonElement \| null` | `null`      | Bindable Button reference.               |
| `class`   | `string`                    | `undefined` | Forwarded through Button's class merger. |

All remaining Button props, native button attributes, event callbacks, and `children` are forwarded. Action does not provide a default icon, label, handler, disabled state, or confirmation flow.

### `Attachment.Trigger`

Type: `TriggerProps`, extending native button attributes with a render-delegation snippet.

| Prop       | Type                                            | Default     | Behavior                                                                             |
| ---------- | ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `type`     | Native button type                              | `"button"`  | Prevents accidental form submission by default.                                      |
| `child`    | `Snippet<[{ props: Record<string, unknown> }]>` | `undefined` | Replaces the button with an app-owned element that must spread the supplied `props`. |
| `ref`      | `HTMLButtonElement \| null`                     | `null`      | Bindable only when Trigger renders its native button.                                |
| `children` | `Snippet`                                       | `undefined` | Renders inside the native full-card button; normally no visible content is needed.   |
| `class`    | `string`                                        | `undefined` | Merged with the absolute full-card positioning.                                      |

When using `child`, the app owns the rendered element and its reference. Spread `props` last enough to preserve the trigger's `class` and `data-slot`, then add a meaningful accessible name.

### `Attachment.Group`

Type: `GroupProps`, extending native `div` attributes. It renders a flex row with horizontal overflow, mandatory start snapping, contained overscroll, hidden scrollbars, and an edge fade. `ref`, `children`, `class`, and remaining native attributes are forwarded.

---

## Styling and DOM contract

All colors use xvelte's semantic `card`, `card-foreground`, `muted`, `muted-foreground`, `foreground`, `border`, `ring`, and `danger` tokens. Caller classes are merged with `cn`, so later conflicting Tailwind utilities can replace local utilities.

Stable xvelte hooks:

| Part          | Element                       | Stable attributes                                                       |
| ------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `Root`        | `div`                         | `data-slot="attachment"`, `data-state`, `data-size`, `data-orientation` |
| `Media`       | `div`                         | `data-slot="attachment-media"`, `data-variant`                          |
| `Content`     | `div`                         | `data-slot="attachment-content"`                                        |
| `Title`       | `span`                        | `data-slot="attachment-title"`                                          |
| `Description` | `span`                        | `data-slot="attachment-description"`                                    |
| `Actions`     | `div`                         | `data-slot="attachment-actions"`                                        |
| `Action`      | Button `button`               | `data-slot="attachment-action"`                                         |
| `Trigger`     | `button` or app-owned element | `data-slot="attachment-trigger"`                                        |
| `Group`       | `div`                         | `data-slot="attachment-group"`                                          |

`Root` is the named Tailwind group `group/attachment`. Descendants respond to its state, size, and orientation attributes. `Trigger` covers Root at `z-10`; `Actions` is at `z-20`. Keep Root positioned and preserve that stacking relationship when extending the component.

The shared `shimmer` utility uses a text-clipped gradient, reverses in right-to-left documents, and disables its animation under `prefers-reduced-motion: reduce`. The `scroll-fade-x` utility uses a direction-aware mask, scroll-driven animations where supported, and a static fade fallback. Group also uses the shared `no-scrollbar` utility.

---

## Accessibility

Attachment has no implicit document, list, progress, or status semantics. Choose semantics and announcements based on the surrounding feature.

- Give every icon-only `Action` an `aria-label` that identifies both the operation and file.
- Give `Trigger` an accessible name describing its result, such as “Preview report.pdf” or “Open photo.jpg”.
- When `child` renders an anchor, provide a valid `href`; when it renders another control, preserve native keyboard behavior.
- Do not put another interactive element below the full-card Trigger. Put independent controls inside `Actions`, whose higher stacking level keeps them reachable.
- Describe failures in visible text. The `error` color alone is not sufficient.
- Announce asynchronous upload changes with an app-owned live region when users need immediate feedback. `state` is visual and does not create one.
- Supply meaningful `alt` text for informative images and `alt=""` for decorative previews.
- A presentational `Group` containing no focusable descendants should normally receive `tabindex={0}`, a suitable role, and an accessible name so keyboard users can reach and scroll it.
- Preserve the repository's global focus-visible styling and verify that the absolute Trigger focus ring remains visible around the card.

---

## Localization

Attachment has no built-in human-readable copy and imports no localization messages. The app supplies and translates filenames when appropriate, file metadata, upload and processing status, failure reasons, action labels, trigger labels, group labels, and live announcements. Technical values in `data-state`, `data-size`, `data-orientation`, and `data-variant` are not translated.

---

## Dependencies

Attachment expects Svelte 5 and Tailwind CSS 4. Install its runtime and development packages with one of these command groups:

```sh
# Bun
bun add clsx tailwind-merge tailwind-variants
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge tailwind-variants
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge tailwind-variants
pnpm add -D tailwindcss
```

### Global CSS

The application stylesheet, `src/routes/layout.css` in xvelte, must import Tailwind and the standalone Scroll Fade and Shimmer styles. Copy `src/lib/styles/scroll-fade.css`, `scroll-fade.md`, `shimmer.css`, and `shimmer.md`, then follow those guides for their complete APIs and installation requirements:

```css
@import "tailwindcss";
@import "../lib/styles/scroll-fade.css";
@import "../lib/styles/shimmer.css";
```

Group also uses the shared `no-scrollbar` utility. Add it to the global stylesheet after the theme setup:

```css
@utility no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}
```

Attachment uses the `card`, `card-foreground`, `muted`, `muted-foreground`, `foreground`, `border`, `ring`, and `danger` semantic colors. Define their light and dark CSS variables and expose them through Tailwind's `@theme inline` mappings. These are xvelte's values; an app may replace them while preserving the variable names:

```css
:root {
	--foreground: oklch(0.147 0.004 49.25);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.147 0.004 49.25);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--ring: oklch(65.6% 0.241 354.308);
}

.dark {
	--foreground: oklch(0.985 0.001 106.423);
	--card: oklch(0.216 0.006 56.043);
	--card-foreground: oklch(0.985 0.001 106.423);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--danger: oklch(0.704 0.191 22.216);
	--border: oklch(1 0 0 / 10%);
	--ring: oklch(65.6% 0.241 354.308);
}

@theme inline {
	--color-ring: var(--ring);
	--color-border: var(--border);
	--color-danger: var(--danger);
	--color-muted-foreground: var(--muted-foreground);
	--color-muted: var(--muted);
	--color-card-foreground: var(--card-foreground);
	--color-card: var(--card);
	--color-foreground: var(--foreground);
}
```

The repository's global focus rule supplies the Trigger's visible keyboard focus treatment. Preserve it when copying the component:

```css
@layer base {
	*:focus-visible {
		@apply rounded-sm border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

### Shared utilities

Every part imports `cn` or `WithElementRef` from `$lib/utils`. Add these definitions to `src/lib/utils.ts` if they are not already present:

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

### Required xvelte component

`Action` wraps the Button component. Copy the complete `src/lib/components/ui/button` folder, including:

- `button-root.svelte`
- `index.ts`
- `button.md`

Then follow `button.md` for Button's own packages, utilities, global CSS, and installation requirements.

Attachment requires no icon facade export: all media and action icons are supplied by the app. It also requires no Bits UI primitive, hook, attachment, context module, localization message, font, image, or network service. Spinner is optional and appears only in the upload-state example.

---

## Credits

Attachment is adapted from the [shadcn-svelte Attachment](https://www.shadcn-svelte.com/docs/components/attachment). Its files, type names, semantic danger color, Tailwind utilities, import structure, and edge-fade behavior have been adapted to xvelte's local conventions.

---

## File organization

| File                            | Responsibility                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `attachment-root.svelte`        | Root states, sizes, orientations, layout variants, and attachment data attributes. |
| `attachment-media.svelte`       | Icon or image media presentation and media variants.                               |
| `attachment-content.svelte`     | Flexible title-and-description wrapper.                                            |
| `attachment-title.svelte`       | Truncated title and processing shimmer.                                            |
| `attachment-description.svelte` | Secondary metadata and error-state styling.                                        |
| `attachment-actions.svelte`     | Independent action layout and stacking.                                            |
| `attachment-action.svelte`      | Attachment-specific defaults over xvelte Button.                                   |
| `attachment-trigger.svelte`     | Native or delegated full-card interactive trigger.                                 |
| `attachment-group.svelte`       | Horizontally scrollable, snapping attachment row.                                  |
| `index.ts`                      | Public parts, props types, option types, and style variants.                       |
| `attachment.md`                 | Installation, composition, API, styling, accessibility, and dependency guide.      |

Use `index.ts` and the exported props and variant types as the source of truth for the public API. If this guide and the implementation disagree, update them together.

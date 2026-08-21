# File Drop Zone

A compound file picker for choosing files through the native file dialog, drag and drop, or document-level clipboard paste. It validates file count, byte size, extensions, and MIME types before passing accepted `File` objects to an asynchronous upload callback. An optional page-wide overlay makes file drags visible across the app.

Use File Drop Zone when an app needs immediate client-side file handling or uploads with a reusable visual target. Do not use it as a complete upload service: the component does not transfer files, render progress, retry failures, store server state, or submit retained files through a native form by itself.

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

Import every public part from the component's `index.ts`:

```svelte
<script lang="ts">
	import * as FileDropZone from "$lib/components/ui/file-drop-zone";
</script>
```

`index.ts` exports `Root`, `Trigger`, and `DragOverlay`. It also exports `RootProps`, `TriggerProps`, `DragOverlayProps`, `FileRejectedReason`, the `BYTE`, `KILOBYTE`, `MEGABYTE`, and `GIGABYTE` decimal-size constants, the `ACCEPT_IMAGE`, `ACCEPT_VIDEO`, and `ACCEPT_AUDIO` accept patterns, and `displaySize`.

---

## Anatomy

Place every interactive part inside one Root:

```svelte
<FileDropZone.Root onUpload={uploadFiles}>
	<FileDropZone.Trigger />
	<FileDropZone.DragOverlay />
</FileDropZone.Root>
```

Root renders the hidden native file input and provides validation/upload state to its descendants. Trigger is a label connected to that input and doubles as a drop target. DragOverlay listens for file drags across the window and, while active, renders a full-page drop target through a Bits UI Portal.

Trigger and DragOverlay require a parent Root. Root can contain either or both parts, and ordinary app content may be placed alongside them.

---

## Basic usage

Keep `fileCount` synchronized with files already accepted by the app when using `maxFiles`. The Root does not retain that count itself:

```svelte
<script lang="ts">
	import * as FileDropZone from "$lib/components/ui/file-drop-zone";

	let files = $state<File[]>([]);
	let inputRef = $state<HTMLInputElement | null>(null);
	let error = $state("");

	async function receiveFiles(nextFiles: File[]) {
		error = "";
		files = [...files, ...nextFiles];
	}

	function openPickerFromKeyboard(event: KeyboardEvent) {
		if (event.key !== "Enter" && event.key !== " ") return;

		event.preventDefault();
		inputRef?.click();
	}
</script>

<FileDropZone.Root
	bind:ref={inputRef}
	onUpload={receiveFiles}
	maxFiles={5}
	fileCount={files.length}
	maxFileSize={10 * FileDropZone.MEGABYTE}
	accept={[FileDropZone.ACCEPT_IMAGE, "application/pdf"].join(",")}
	onFileRejected={({ file, reason }) => (error = file.name + ": " + reason)}
>
	<FileDropZone.Trigger role="button" tabindex="0" onkeydown={openPickerFromKeyboard} />
</FileDropZone.Root>

{#if error}
	<p role="alert">{error}</p>
{/if}

<ul>
	{#each files as file (file.name + file.lastModified)}
		<li>{file.name} — {FileDropZone.displaySize(file.size)}</li>
	{/each}
</ul>
```

`onUpload` is awaited and receives all files that passed validation in one array. While it is pending, the native input and every drop/paste path using the same Root are disabled. The component restores its internal state in a `finally` block, but upload errors are not caught; handle expected failures inside `onUpload`.

---

## Examples

### Custom trigger

Providing children replaces Trigger's complete default interface while preserving its label behavior, drop handlers, and connection to Root's hidden input:

```svelte
<FileDropZone.Root onUpload={receiveFiles} accept={FileDropZone.ACCEPT_IMAGE}>
	<FileDropZone.Trigger
		role="button"
		tabindex="0"
		onkeydown={(event) => {
			if (event.key !== "Enter" && event.key !== " ") return;

			event.preventDefault();
			inputRef?.click();
		}}
		class="block rounded-lg border border-dashed p-8 text-center"
	>
		<p class="font-medium">Add product images</p>
		<p class="text-sm text-muted-foreground">Choose files or drop them here.</p>
	</FileDropZone.Trigger>
</FileDropZone.Root>
```

Do not place a button, link, or other interactive control inside Trigger: it renders a `label`, and nested interactive content creates confusing activation behavior.

### Capture clipboard files across the document

`capturePaste` installs a document-level paste listener for the lifetime of Root:

```svelte
<FileDropZone.Root onUpload={receiveFiles} capturePaste>
	<FileDropZone.Trigger />
</FileDropZone.Root>
```

Use this only when pasting anywhere on the page should add attachments. Text pasted into fields continues normally; clipboard files are additionally validated and uploaded by Root.

### Page-wide drag overlay

DragOverlay appears only while files are being dragged over the window. Its default Portal target is `document.body`:

```svelte
<FileDropZone.Root onUpload={receiveFiles} maxFiles={5} fileCount={files.length}>
	<FileDropZone.Trigger />
	<FileDropZone.DragOverlay />
</FileDropZone.Root>
```

Provide children to replace the default icon and message, or configure the Bits UI Portal through `portalProps`:

```svelte
<div id="upload-overlay"></div>

<FileDropZone.Root onUpload={receiveFiles}>
	<FileDropZone.Trigger />

	<FileDropZone.DragOverlay portalProps={{ to: "#upload-overlay" }} class="bg-background/95">
		<div class="rounded-xl border border-dashed p-10 text-center">
			<p class="text-lg font-medium">Drop attachments anywhere</p>
			<p class="text-sm text-muted-foreground">Release to validate and add the files.</p>
		</div>
	</FileDropZone.DragOverlay>
</FileDropZone.Root>
```

Set `portalProps={{ disabled: true }}` to render the overlay at its declaration point. See the [Bits UI Portal API](https://bits-ui.com/docs/utilities/portal) for its complete `to` and `disabled` behavior.

### Rejection feedback and accepted patterns

`accept` uses the native comma-separated syntax. The local validator supports exact MIME types, wildcard MIME families, and filename extensions:

```svelte
<script lang="ts">
	import * as FileDropZone from "$lib/components/ui/file-drop-zone";

	let rejections = $state<string[]>([]);
</script>

<FileDropZone.Root
	onUpload={receiveFiles}
	accept="image/*,.pdf,text/plain"
	maxFileSize={5 * FileDropZone.MEGABYTE}
	onFileRejected={({ file, reason }) => {
		rejections = [...rejections, file.name + ": " + reason];
	}}
>
	<FileDropZone.Trigger />
</FileDropZone.Root>
```

Validation stops at the first failing rule for each file: maximum byte size, then maximum count, then `accept`. `onFileRejected` runs once per rejected file. `onUpload` runs only when at least one file survives.

When a browser supplies an empty MIME type, the validator compares the filename directly with each pattern. Include explicit extensions such as `.pdf` when those files must remain acceptable even without MIME metadata; a wildcard such as `image/*` cannot match an empty type by itself.

---

## Public API

File Drop Zone owns its validation and event behavior. Bits UI is used only for snippet helper types and DragOverlay's Portal; see the [Bits UI Portal API](https://bits-ui.com/docs/utilities/portal) for the complete inherited Portal options. The component's `index.ts`, exported types, and local source are the source of truth.

### `FileDropZone.Root`

Type: `RootProps`, combining xvelte-owned options with native input attributes except `multiple`, `files`, `id`, and `class`.

| Prop             | Type                               | Default     | Behavior                                                                                             |
| ---------------- | ---------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `onUpload`       | `(files: File[]) => Promise<void>` | Required    | Receives accepted files as one batch and is awaited.                                                 |
| `ref`            | `HTMLInputElement \| null`         | `null`      | Bindable hidden file input. Use `ref?.click()` for a separate keyboard-accessible control.           |
| `id`             | `string`                           | generated   | Connects Trigger's `for` attribute to the hidden input. Keep it unique when overriding.              |
| `maxFiles`       | `number`                           | `undefined` | Rejects candidates whose one-based position after `fileCount` exceeds the limit.                     |
| `fileCount`      | `number`                           | `undefined` | Number of files the app already holds. Required for a persistent maximum across multiple selections. |
| `maxFileSize`    | `number`                           | `undefined` | Rejects a file when `file.size` is greater than this byte count.                                     |
| `onFileRejected` | `({ reason, file }) => void`       | `undefined` | Runs synchronously for every rejected candidate.                                                     |
| `accept`         | `string`                           | `undefined` | Native accept hint and local validation patterns separated by commas.                                |
| `capturePaste`   | `boolean`                          | `false`     | Uploads clipboard files from paste events anywhere in the document.                                  |
| `disabled`       | `boolean \| null`                  | `false`     | Disables the hidden input and prevents drop/paste uploads.                                           |
| `children`       | `Snippet`                          | `undefined` | Renders Trigger, DragOverlay, and app content after the hidden input.                                |

When `maxFiles` is supplied without `fileCount`, the component logs a console warning. It can still limit candidates within an individual batch, but it cannot know how many files earlier uploads left in app state. Candidate positions use the original batch index, so an earlier rejected candidate still counts when evaluating a later candidate's maximum-file position.

`maxFiles`, `fileCount`, and `maxFileSize` are used as supplied rather than rounded or clamped; pass non-negative values with counts expressed as whole numbers. The default Trigger displays its constraint summary only for truthy limits, so a zero value still affects validation but is not printed in the default prompt.

The generated input sets `type="file"`, `multiple` according to remaining capacity, `accept`, `disabled`, and its internal `onchange` handler. Remaining native input attributes are forwarded last. Do not override `type` or `onchange`: doing so replaces required behavior even though the current TypeScript surface permits those native attributes.

After a successful `onUpload` resolution—or a batch containing no accepted files—the input value is cleared so choosing the same file again emits another event. If `onUpload` rejects, that reset is skipped even though the internal uploading state recovers. The hidden input is not intended to retain a `FileList` for later native form submission; store or upload the callback's `File[]` yourself.

### `FileDropZone.Trigger`

Type: `TriggerProps`, based on native label attributes with `for` owned by Root.

| Prop         | Type                       | Default     | Behavior                                                               |
| ------------ | -------------------------- | ----------- | ---------------------------------------------------------------------- |
| `ref`        | `HTMLLabelElement \| null` | `null`      | Bindable rendered label.                                               |
| `children`   | `Snippet`                  | `undefined` | Replaces the complete default upload prompt.                           |
| `class`      | `string`                   | `undefined` | Merged onto the label after its local group class.                     |
| `ondragover` | native handler             | `undefined` | Runs after the component prevents the browser's default drag behavior. |
| `ondrop`     | native handler             | `undefined` | Runs after the component begins validation/upload handling.            |

Trigger always writes `for` from Root's current `id` and `aria-disabled` from shared upload availability. Without children it renders the localized icon, prompt, and optional `maxFiles`/`maxFileSize` summary.

Remaining native label attributes are forwarded. The local Trigger does not add `role`, `tabindex`, or keyboard handlers; see [Accessibility](#accessibility).

### `FileDropZone.DragOverlay`

Type: `DragOverlayProps`, combining xvelte-owned options, a children snippet, and native `div` attributes.

| Prop          | Type                                | Default     | Behavior                                                                                                |
| ------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `ref`         | `HTMLDivElement \| null`            | `null`      | Bindable overlay element; it is `null` while no overlay is rendered.                                    |
| `disabled`    | `boolean`                           | `false`     | Prevents this overlay from appearing or accepting a drop. Root's disabled/uploading state also applies. |
| `portalProps` | Portal props without child snippets | `undefined` | Passed to Bits UI Portal. It supports a target through `to` and local rendering through `disabled`.     |
| `children`    | `Snippet`                           | `undefined` | Replaces the default icon and localized drop message.                                                   |
| `class`       | `string`                            | `undefined` | Merged after the full-screen overlay classes.                                                           |
| `ondragover`  | native handler                      | `undefined` | Runs after internal drag-over handling.                                                                 |
| `ondrop`      | native handler                      | `undefined` | Runs after internal depth reset and upload handling begins.                                             |

The component listens to window `dragenter`, `dragleave`, `dragover`, `dragend`, and `drop`. It tracks nested enter/leave depth and ignores drags whose `DataTransfer.types` does not contain `"Files"`. The default overlay is fixed across the viewport at `z-index: 50`.

Remaining compatible native `div` attributes are forwarded to the overlay.

### Rejection type

`FileRejectedReason` is exactly:

```ts
type FileRejectedReason = "Maximum file size exceeded" | "File type not allowed" | "Maximum files uploaded";
```

These strings are programmatic reason identifiers, not built-in visible copy. Translate the app's message when presenting a reason to people.

### Constants and `displaySize`

| Export         | Value           | Use                      |
| -------------- | --------------- | ------------------------ |
| `BYTE`         | `1`             | Base byte multiplier.    |
| `KILOBYTE`     | `1000`          | Decimal kilobyte.        |
| `MEGABYTE`     | `1_000_000`     | Decimal megabyte.        |
| `GIGABYTE`     | `1_000_000_000` | Decimal gigabyte.        |
| `ACCEPT_IMAGE` | `"image/*"`     | All image MIME subtypes. |
| `ACCEPT_VIDEO` | `"video/*"`     | All video MIME subtypes. |
| `ACCEPT_AUDIO` | `"audio/*"`     | All audio MIME subtypes. |

`displaySize(bytes)` chooses the largest supported decimal unit, rounds to zero fractional digits with `toFixed(0)`, and returns a label in B, KB, MB, or GB. It does not use binary KiB/MiB units or locale-aware number formatting.

---

## Styling and DOM contract

Stable xvelte hooks:

| Part              | Stable hook or attribute                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Hidden Root input | `data-slot="file-drop-zone"` and `class="hidden"`                                                  |
| Trigger label     | `data-slot="file-drop-zone-trigger"`, `group/file-drop-zone-trigger`, and reactive `aria-disabled` |
| DragOverlay       | `data-slot="file-drop-zone-drag-overlay"`                                                          |

Trigger's `class` is merged with `cn`. Its default child interface is rendered only when no children are provided, so custom children own all visible styling. The default surface uses a dashed border, semantic muted text, accent hover background, and reduced opacity while unavailable.

DragOverlay's `class` is also merged with `cn`. The default uses a fixed full-viewport layout, translucent background, optional backdrop blur, `animate-in`, and `fade-in-0`. It is conditionally mounted rather than hidden with a persistent state attribute.

Root does not accept a `class` prop because its input must remain hidden. The component defines no CSS variable, keyframe, attachment, or shared component stylesheet.

---

## Accessibility

Root uses a native file input and Trigger uses a connected label, so pointer activation opens the browser's file chooser and the browser applies its normal file-selection semantics. Drag and paste are enhancements; always provide a file-dialog path because they are unavailable to some keyboard, touch, and assistive-technology users.

The local input uses `display: none` and Trigger's label is not focusable by default. For keyboard access, either:

- give Trigger `role="button"`, `tabindex="0"`, and Enter/Space handling that calls a bound Root `ref`, as shown in Basic usage; or
- provide a separate native button that calls `inputRef?.click()`.

When Root is disabled or uploading, its native input is disabled and Trigger receives `aria-disabled="true"`. If adding custom keyboard handling, avoid opening the input in your own app-disabled state. Do not place nested buttons or links inside Trigger.

Disabled drop targets ignore files, but the shared drop handler returns before calling `preventDefault()`. Applications that keep a disabled drop surface visible may add their own `ondrop` handler to prevent browser navigation or file opening.

DragOverlay is a visual drop target, not a modal dialog: it does not trap focus, announce itself, or block the underlying page semantically. Keep a persistent, labeled file-selection control available outside it.

The component does not announce accepted files, rejected files, upload progress, or upload failure. Render an `aria-live` status or `role="alert"` in the app when that feedback is important. Do not expose the raw English `FileRejectedReason` identifiers directly in a localized interface.

---

## Localization

The default Trigger and DragOverlay use these Paraglide messages:

| Message ID           | English value                                        | Purpose                                              |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `fresh_mango_drop`   | `Drop files here to upload`                          | Default DragOverlay instruction.                     |
| `gold_gecko_choose`  | `Drag 'n' drop files here, or click to select files` | Default Trigger instruction.                         |
| `happy_birch_count`  | `You can upload {count} files`                       | Trigger maximum-count summary.                       |
| `indigo_mouse_limit` | `(up to {size} each)`                                | Trigger size suffix when count and size are present. |
| `jade_tiger_maximum` | `Maximum size {size}`                                | Trigger summary when only size is present.           |

`count` comes from `maxFiles`. `size` comes from `displaySize(maxFileSize)` and therefore uses the fixed B/KB/MB/GB abbreviations.

Providing Trigger or DragOverlay children replaces their built-in visible copy. The app supplies and translates upload progress, accepted-file lists, rejection feedback, errors, custom prompts, and keyboard-control labels. `FileRejectedReason` values remain technical identifiers.

---

## Dependencies

File Drop Zone expects Svelte 5, Tailwind CSS 4, and xvelte's Paraglide setup. It uses Bits UI only for Portal and snippet prop types.

Install runtime dependencies first and development dependencies second within the same package-manager block:

```sh
# bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss tw-animate-css

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss tw-animate-css
```

### Component files

Copy the complete `src/lib/components/ui/file-drop-zone` folder:

- `file-drop-zone-root.svelte`
- `file-drop-zone-trigger.svelte`
- `file-drop-zone-drag-overlay.svelte`
- `file-drop-zone-context.svelte.ts`
- `file-drop-zone-utils.ts`
- `index.ts`
- `README.md`

No other xvelte UI component is required.

### Shared utilities

The Svelte files import `cn` and `WithoutChildrenOrChild` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when absent:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class values and resolves conflicting Tailwind utilities in favor of the last value.
 *
 * @param inputs - Conditional, nested, or plain class values to merge.
 * @returns The normalized class string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
```

The package block includes `clsx` and `tailwind-merge`.

### Icons

The default Trigger and DragOverlay import one semantic icon through `$lib/icons`. Add this exact export to `src/lib/icons.ts`:

```ts
export { default as UploadIcon } from "@tabler/icons-svelte/icons/upload";
```

The package block includes `@tabler/icons-svelte`. Custom children may avoid rendering the icon, but the component files still import it statically.

### Internal context

`file-drop-zone-context.svelte.ts` is required because all public parts share validation, upload, paste, disabled, and overlay state through it. Its complete contents are:

```ts
import { createContext } from "svelte";

/** Returns the files carried by a drag or clipboard data transfer. */
function getFiles(dataTransfer: DataTransfer | null): File[] {
	return Array.from(dataTransfer?.files ?? []);
}

/** Returns whether a drag data transfer contains files. */
function hasFiles(dataTransfer: DataTransfer | null): boolean {
	return dataTransfer?.types.includes("Files") ?? false;
}

/** Reasons a candidate file can be rejected before upload. */
export type FileRejectedReason = "Maximum file size exceeded" | "File type not allowed" | "Maximum files uploaded";

type FileDropZoneOptions = {
	readonly id: string;
	readonly disabled: boolean;
	readonly onUpload: (files: File[]) => Promise<void>;
	readonly maxFiles: number | undefined;
	readonly fileCount: number | undefined;
	readonly maxFileSize: number | undefined;
	readonly onFileRejected: ((options: { reason: FileRejectedReason; file: File }) => void) | undefined;
	readonly accept: string | undefined;
};

/** Validates files and coordinates uploads shared by all drop-zone parts. */
export class FileDropZoneContext {
	uploading = $state(false);

	/** @param options - Reactive constraints, callbacks, and native input options. */
	constructor(readonly options: FileDropZoneOptions) {
		if (this.options.maxFiles !== undefined && this.options.fileCount === undefined) {
			console.warn("Make sure to provide FileDropZone with `fileCount` when using the `maxFiles` prompt");
		}
	}

	/** @param event - Drop event containing files to validate and upload. */
	ondrop = async (event: DragEvent & { currentTarget: EventTarget }) => {
		if (this.options.disabled || !this.canUploadFiles) return;

		event.preventDefault();
		await this.upload(getFiles(event.dataTransfer));
	};

	/** @param event - Document paste event whose clipboard files should be uploaded. */
	onpaste = async (event: ClipboardEvent) => {
		if (this.options.disabled || !this.canUploadFiles) return;

		const files = getFiles(event.clipboardData);
		if (files.length > 0) await this.upload(files);
	};

	/** @param event - Native file-input change event. */
	onchange = async (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		if (this.options.disabled) return;

		const files = event.currentTarget.files;
		if (!files) return;

		await this.upload(Array.from(files));

		// Reset the input so selecting the same rejected file emits another change event.
		event.currentTarget.value = "";
	};

	/**
	 * Validates one file against size, count, extension, and MIME constraints.
	 *
	 * @param file - File to validate.
	 * @param fileNumber - One-based count including previously uploaded files.
	 * @returns The first rejection reason, or undefined when accepted.
	 */
	shouldAcceptFile(file: File, fileNumber: number): FileRejectedReason | undefined {
		if (this.options.maxFileSize !== undefined && file.size > this.options.maxFileSize) return "Maximum file size exceeded";
		if (this.options.maxFiles !== undefined && fileNumber > this.options.maxFiles) return "Maximum files uploaded";
		if (!this.options.accept) return undefined;

		const acceptedTypes = this.options.accept.split(",").map((value) => value.trim().toLowerCase());
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			// Empty MIME values and explicit extensions are matched against the filename.
			if (fileType === "" || pattern.startsWith(".")) return fileName.endsWith(pattern);

			// Wildcards such as `video/*` accept every subtype in the requested MIME family.
			if (pattern.endsWith("/*")) {
				const baseType = pattern.slice(0, pattern.indexOf("/*"));
				return fileType.startsWith(`${baseType}/`);
			}

			return fileType === pattern;
		});

		return isAcceptable ? undefined : "File type not allowed";
	}

	/** @param files - Candidate files to validate before invoking the upload callback. */
	upload = async (files: File[]) => {
		this.uploading = true;

		try {
			const validFiles: File[] = [];

			for (let index = 0; index < files.length; index++) {
				const file = files[index];
				const reason = this.shouldAcceptFile(file, (this.options.fileCount ?? 0) + index + 1);

				if (reason) {
					this.options.onFileRejected?.({ file, reason });
					continue;
				}

				validFiles.push(file);
			}

			if (validFiles.length > 0) await this.options.onUpload(validFiles);
		} finally {
			this.uploading = false;
		}
	};

	canUploadFiles = $derived.by(() => {
		if (this.options.disabled || this.uploading) return false;
		if (this.options.maxFiles !== undefined && this.options.fileCount !== undefined && this.options.fileCount >= this.options.maxFiles) return false;

		return true;
	});

	props = $derived.by(() => ({
		disabled: !this.canUploadFiles,
		id: this.options.id,
		accept: this.options.accept,
		multiple: this.options.maxFiles === undefined || this.options.maxFiles - (this.options.fileCount ?? 0) > 1,
		type: "file" as const,
		onchange: this.onchange
	}));
}

type FileDropZoneDragOverlayOptions = {
	readonly disabled: boolean;
};

/** Tracks page-level file drags and coordinates drops with the root upload state. */
export class FileDropZoneDragOverlayState {
	#depth = $state(0);

	/**
	 * @param options - Reactive overlay configuration.
	 * @param fileDropZone - Parent drop-zone state receiving accepted drops.
	 */
	constructor(
		readonly options: FileDropZoneDragOverlayOptions,
		readonly fileDropZone: FileDropZoneContext
	) {}

	canDropFiles = $derived.by(() => !this.options.disabled && this.fileDropZone.canUploadFiles);
	show = $derived.by(() => this.#depth > 0 && this.canDropFiles);

	/** @param event - Window drag-enter event used to track nested targets. */
	ondragenter = (event: DragEvent) => {
		if (hasFiles(event.dataTransfer)) this.#depth++;
	};

	/** @param event - Window drag-leave event used to track nested targets. */
	ondragleave = (event: DragEvent) => {
		if (hasFiles(event.dataTransfer)) this.#depth = Math.max(this.#depth - 1, 0);
	};

	/** @param event - Drag-over event that enables a file drop while the overlay is visible. */
	ondragover = (event: DragEvent) => {
		if (this.show) event.preventDefault();
	};

	/** Clears the nested drag depth after a drop, drag end, or cancelled drag. */
	reset = () => {
		this.#depth = 0;
	};

	/** @param event - Overlay drop event whose files should be uploaded. */
	ondrop = async (event: DragEvent & { currentTarget: EventTarget }) => {
		this.reset();
		if (this.canDropFiles) await this.fileDropZone.ondrop(event);
	};
}

const [getFileDropZoneContext, provideFileDropZoneContext] = createContext<FileDropZoneContext>();

/** @param options - Reactive upload constraints and callbacks to provide to descendants. */
export function setFileDropZoneContext(options: FileDropZoneOptions) {
	return provideFileDropZoneContext(new FileDropZoneContext(options));
}

/** @returns The state from the nearest file-drop-zone root. */
export { getFileDropZoneContext };
```

Keep the `.svelte.ts` extension because the context owns rune-based state.

### Colocated size and accept helpers

`file-drop-zone-utils.ts` is required by Trigger and re-exported as public API. Its complete contents are:

```ts
export const BYTE = 1;
export const KILOBYTE = 1000;
export const MEGABYTE = 1000 * KILOBYTE;
export const GIGABYTE = 1000 * MEGABYTE;

export const ACCEPT_IMAGE = "image/*";
export const ACCEPT_VIDEO = "video/*";
export const ACCEPT_AUDIO = "audio/*";

/**
 * Formats a byte count using the largest supported decimal unit.
 *
 * @param bytes - File size in bytes.
 * @returns A rounded size labelled as B, KB, MB, or GB.
 */
export function displaySize(bytes: number): string {
	if (bytes < KILOBYTE) return `${bytes.toFixed(0)} B`;
	if (bytes < MEGABYTE) return `${(bytes / KILOBYTE).toFixed(0)} KB`;
	if (bytes < GIGABYTE) return `${(bytes / MEGABYTE).toFixed(0)} MB`;
	return `${(bytes / GIGABYTE).toFixed(0)} GB`;
}
```

### Localization setup

Add every message listed in [Localization](#localization) to each locale and compile Paraglide into `src/lib/paraglide`. The component imports generated functions from `$lib/paraglide/messages.js`; do not copy or edit generated files manually.

No other message, translation attachment, or runtime localization helper is required.

### Global CSS

The application stylesheet must load Tailwind and `tw-animate-css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
```

The default interface uses `background`, `foreground`, `accent`, `muted-foreground`, `border`, and shared radius utilities. These are xvelte's defaults; apps may replace their values while preserving the names and mappings:

```css
:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--accent: oklch(0.841 0.238 128.85);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--accent: oklch(0.768 0.233 130.85);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
}

@theme inline {
	--color-border: var(--border);
	--color-accent: var(--accent);
	--color-muted-foreground: var(--muted-foreground);
	--color-foreground: var(--foreground);
	--color-background: var(--background);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
}

@layer base {
	* {
		@apply border-border;
	}
}
```

`tw-animate-css` supplies DragOverlay's `animate-in` and `fade-in-0` utilities. No component-specific keyframe, custom CSS variable, attachment, hook, image, font, network service, or layout rule is required. The app owns dark-mode activation.

---

## Credits

Adapted from [shadcn-svelte-extras' File Drop Zone](https://shadcn-svelte-extras.com/docs/components/file-drop-zone). The local xvelte API, validation, paste capture, DragOverlay, localization, styling, and behavior documented here are the source of truth.

---

## File organization

| File                                 | Responsibility                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `file-drop-zone-root.svelte`         | Hidden input, generated ID, public constraints, document paste capture, shared context setup, and children.    |
| `file-drop-zone-trigger.svelte`      | Connected label, local drop target, default localized prompt, constraint summary, and custom children.         |
| `file-drop-zone-drag-overlay.svelte` | Window drag tracking, conditional full-page target, Portal configuration, default prompt, and custom children. |
| `file-drop-zone-context.svelte.ts`   | Shared validation order, input props, upload lifecycle, document paste handling, and overlay state.            |
| `file-drop-zone-utils.ts`            | Decimal byte constants, common accept patterns, and size formatting.                                           |
| `index.ts`                           | Public components, props types, rejection type, constants, and helper exports.                                 |
| `README.md`                          | Usage, API, styling, accessibility, localization, dependencies, and credits.                                   |

Treat `index.ts`, its exported types, and the local source as the source of truth for the public API.

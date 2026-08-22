# QR Code

A reactive SVG QR code generator with automatic symbol sizing, configurable dimensions, foreground and background colors, quiet-zone margin, four error-correction levels, and an optional centered logo supplied as an image URL or Svelte snippet.

Use QR Code to encode a URL, identifier, contact action, network configuration, or other text that should be transferred by scanning. Always expose important destinations or instructions as readable text too, and do not treat a QR code as encryption or as the only accessible way to complete a task.

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

Import the component through its public `index.ts`:

```svelte
<script lang="ts">
	import * as QrCode from "$lib/components/ui/qr-code";
</script>
```

The component exports `Root`, the `RootProps` type, and the `ErrorCorrection` type.

---

## Anatomy

QR Code has one public part:

```svelte
<QrCode.Root value="https://example.com" />
```

Root renders a sized wrapper containing an SVG background and one SVG rectangle for every dark QR module. When `logo` is supplied, it also renders a centered HTML layer above the SVG.

The logo is not embedded into the SVG. Copying or exporting only the generated `<svg>` omits the logo layer.

---

## Basic usage

```svelte
<script lang="ts">
	import * as QrCode from "$lib/components/ui/qr-code";

	const destination = "https://example.com/account/setup";
</script>

<figure class="grid w-fit gap-2">
	<QrCode.Root value={destination} size={192} />
	<figcaption class="max-w-48 text-sm break-all">Open {destination}</figcaption>
</figure>
```

The readable destination helps people who cannot or do not want to scan the image, and makes a link QR code's target visible before opening it.

---

## Examples

### Reactive value

Changing `value` regenerates the matrix automatically:

```svelte
<script lang="ts">
	import * as QrCode from "$lib/components/ui/qr-code";

	let value = $state("Order 1042");
</script>

<label class="grid max-w-sm gap-1">
	<span>QR content</span>
	<input bind:value />
</label>

<QrCode.Root {value} size={180} />
```

An empty string produces no matrix and displays only the configured background. Generation failures behave the same visually and are written to the browser or server console; the component exposes no error callback or visible fallback.

### Image logo

Pass an image source string through `logo`:

```svelte
<QrCode.Root value="https://example.com/download" size={224} errorCorrection="H" logo="/brand-mark.svg" logoSize={0.18} />
```

The logo wrapper is circular, uses the semantic page background, adds padding and a small shadow, and measures `size * logoSize` pixels. A higher error-correction level can make an obstructed code more resilient, but it also reduces data capacity. Test branded codes with the target devices and scanners before publishing them.

### Custom logo snippet

Use a snippet for text, an icon, or custom markup:

```svelte
<script lang="ts">
	import * as QrCode from "$lib/components/ui/qr-code";
</script>

{#snippet logo()}
	<span aria-hidden="true" class="grid size-full place-items-center rounded-full bg-background text-xs font-bold">AC</span>
{/snippet}

<QrCode.Root value="https://example.com/acme" size={200} errorCorrection="H" {logo} logoSize={0.22} />
```

The snippet receives no parameters. It owns its internal markup and styles but remains inside the component's fixed centered logo wrapper.

### Colors and margin

```svelte
<QrCode.Root value="mailto:support@example.com" size={176} color="#172554" backgroundColor="#ffffff" margin={4} />
```

`color` and `backgroundColor` are passed directly to SVG `fill` attributes. Maintain strong contrast and a clear quiet zone around the symbol. Transparent, similar, or context-dependent colors can make scanning unreliable.

### Error-correction levels

```svelte
<script lang="ts">
	import type { ErrorCorrection } from "$lib/components/ui/qr-code";

	import * as QrCode from "$lib/components/ui/qr-code";

	let errorCorrection = $state<ErrorCorrection>("M");
</script>

<select bind:value={errorCorrection} aria-label="Error correction">
	<option value="L">Low</option>
	<option value="M">Medium</option>
	<option value="Q">Quartile</option>
	<option value="H">High</option>
</select>

<QrCode.Root value="https://example.com/tickets/1042" {errorCorrection} />
```

Changing the level regenerates the QR matrix. The generator automatically selects the smallest supported QR type that fits the value and correction level.

---

## Public API

The component's `index.ts`, exported types, and local source are the source of truth. Matrix generation uses [`qrcode-generator`](https://www.npmjs.com/package/qrcode-generator), but Root exposes only the xvelte-owned props below rather than the package's complete API.

### `QrCode.Root`

Type: `RootProps`.

| Prop              | Type                | Default     | Behavior                                                                                            |
| ----------------- | ------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `value`           | `string`            | Required    | Text passed to `qrcode-generator` in its default byte mode. An empty or unencodable value is blank. |
| `size`            | `number`            | `128`       | Wrapper width and height in CSS pixels, applied with inline styles.                                 |
| `color`           | `string`            | `"#000000"` | SVG fill value used for every dark module.                                                          |
| `backgroundColor` | `string`            | `"#FFFFFF"` | SVG fill value used for the complete background and quiet zone.                                     |
| `errorCorrection` | `ErrorCorrection`   | `"M"`       | Error-correction level passed to the generator.                                                     |
| `margin`          | `number`            | `2`         | Quiet-zone width in QR module units, added on every side of the SVG view box.                       |
| `class`           | `string`            | —           | Merged onto the outer wrapper after its local layout classes.                                       |
| `logo`            | `string \| Snippet` | —           | Image source string or zero-argument snippet rendered in the centered overlay.                      |
| `logoSize`        | `number`            | `0.2`       | Ratio of the pixel `size` used for both width and height of the logo wrapper.                       |

Root does not forward native `div` attributes. It has no `ref`, `id`, `style`, ARIA prop, event callback, download/export method, generated-SVG binding, error callback, or matrix callback. Wrap it in app-owned markup when those capabilities are required.

Use finite positive values for `size`, a finite non-negative `margin`, and normally a `logoSize` between `0` and `1`. The component does not validate these numbers. Large logos and small margins may make a QR code difficult or impossible to scan.

### `ErrorCorrection`

```ts
type ErrorCorrection = "L" | "M" | "Q" | "H";
```

| Value | Level    | Tradeoff                                                                     |
| ----- | -------- | ---------------------------------------------------------------------------- |
| `L`   | Low      | Highest data capacity and least redundancy.                                  |
| `M`   | Medium   | Local default and a general balance between capacity and redundancy.         |
| `Q`   | Quartile | More redundancy with less available data capacity.                           |
| `H`   | High     | Most redundancy and lowest data capacity; useful to test when adding a logo. |

The component calls `qrcode(0, errorCorrection)`. Type number `0` asks the dependency to choose automatically from its supported QR types, then `addData(value)` uses the package's default encoding mode. If the value does not fit, the dependency throws and the local component catches the error.

### Logo behavior

- A string renders `<img src={logo}>` with the localized fixed alternative text `"QR Logo"`.
- A snippet renders exactly once with no arguments.
- Both forms are centered above the SVG inside the same circular background, padding, and shadow wrapper.
- `logoSize` sizes the wrapper, not the raw image or snippet content. String images use `object-contain` inside the padded wrapper.
- The overlay does not remove covered QR modules from the SVG and is not included when only the SVG element is copied.
- A remote string URL performs a normal browser image request; the component itself does not proxy, preload, or embed that resource.

### Generation and failure behavior

Root regenerates the boolean module matrix when `value` or `errorCorrection` changes. The generator chooses the QR type automatically, and the component creates one SVG `<rect>` per dark module.

If `value` is empty or generation throws:

- The matrix becomes empty.
- The SVG still renders its background rectangle.
- A configured logo still renders.
- The error is logged as `"QR Generation failed"` for thrown failures.
- No visible error, callback, or accessible status is produced.

Longer values generally create larger matrices and more SVG elements. Avoid regenerating very large values on every keystroke when the extra DOM and synchronous generation work would be noticeable.

---

## Styling and DOM contract

Stable xvelte hook:

| Element       | Stable hook           | Local behavior                                                                    |
| ------------- | --------------------- | --------------------------------------------------------------------------------- |
| Outer wrapper | `data-slot="qr-code"` | Relative inline flex box, fixed inline width/height, centered content, no shrink. |

The component does not expose stable slots for the SVG, its rectangles, the logo wrapper, or the logo image. Their current structure is implementation detail.

The SVG fills the wrapper, uses a square view box based on the generated module count plus twice `margin`, and sets `shape-rendering="crispEdges"`. The background is one full rectangle; every dark module is a separate one-unit rectangle offset by the margin. The outer `size` scales that view box to CSS pixels.

Root classes are merged with `cn()`, but inline width and height from `size` take precedence over ordinary width and height utilities. The QR foreground and background do not use semantic theme tokens; their explicit prop defaults remain black and white in every color mode.

Only the optional logo wrapper uses the semantic `background` token. It is absolutely centered, circular, padded, and shadowed. There is no component-specific CSS variable, keyframe, state attribute, stable class, or animation hook.

---

## Accessibility

The generated SVG has no role, title, description, or accessible name, and Root does not accept ARIA attributes. Treat the QR graphic as a visual transfer convenience rather than the only presentation of its data.

- Show the destination, identifier, or action in readable text near the QR code.
- Wrap Root in a labelled `figure`, region, or other app-owned structure when the graphic needs context for assistive technology.
- For links, display the destination and provide a normal clickable anchor so people can inspect and open it without scanning.
- Do not encode essential instructions only inside the QR data.
- Do not assume the data is private or encrypted merely because it is represented visually.
- Test the final rendered size, contrast, margin, data length, print conditions, and logo with representative scanners.
- A string logo has the fixed alt text `"QR Logo"`. Use a custom snippet when the logo needs different accessible handling, and mark decorative snippet content with `aria-hidden="true"`.
- Generation failure is silent in the interface. Validate important output separately when a usable code is required.

The component has no keyboard interaction because it is display-only. Any download, copy, refresh, or navigation action belongs in separate accessible controls supplied by your app.

---

## Localization

QR Code uses one Paraglide message from `messages/en.json`:

| Message ID          | English value | Used by                                         |
| ------------------- | ------------- | ----------------------------------------------- |
| `quiet_falcon_logo` | `QR Logo`     | Fixed alternative text for a string logo image. |

The string-logo alternative text has no override prop. Use the `logo` snippet for different accessible markup.

Your app supplies and translates visible destinations, captions, instructions, validation, errors, download labels, and surrounding actions. The console-only `"QR Generation failed"` text is a developer diagnostic rather than user-facing copy and is not localized.

---

## Dependencies

### Packages

Install runtime dependencies first and development dependencies second:

```sh
# Bun
bun add qrcode-generator clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install qrcode-generator clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add qrcode-generator clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss
```

The installed `qrcode-generator` package includes its own TypeScript declaration file, so a separate `@types/qrcode-generator` package is not required. See the [qrcode-generator API documentation](https://www.npmjs.com/package/qrcode-generator) for its type selection, correction levels, data modes, capacity, and matrix methods.

### Component files

Copy the complete `src/lib/components/ui/qr-code` component folder:

- `qr-code-root.svelte`
- `index.ts`
- `README.md`

QR Code requires no other xvelte component, icon, hook, attachment, context module, shared style file, font, bundled image, or external network service. A remote `logo` URL is an app-supplied image request rather than a component service dependency.

### Shared utilities

QR Code imports `cn` from `$lib/utils`. Add this exact definition to `src/lib/utils.ts` when it is not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Icons

QR Code does not use icons and requires no export from `src/lib/icons.ts` or icon package.

### Global styles

Load Tailwind CSS and expose the semantic background used behind an optional logo. The values below are xvelte's defaults and may be replaced with your own theme:

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
}

@theme inline {
	--color-background: var(--background);
}
```

Define the dark value only when your app supports a dark theme. No custom variant, keyframe, `tw-animate-css` import, icon style, font, radius variable, or component-specific CSS variable is required.

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the message listed in [Localization](#localization) to `messages/en.json`. Its exact key and value are already shown there and are not duplicated here.

---

## Credits

QR Code is adapted from the [more-shadcn-svelte QR Code](https://more-shadcn.noair.fun/docs/components/qr-code). Its implementation has been modified to follow xvelte's local API, SVG rendering, localization, styling, and import conventions.

---

## File organization

| File                  | Responsibility                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `qr-code-root.svelte` | Public props, reactive matrix generation, SVG rendering, logo overlay, styling, and failures.    |
| `index.ts`            | Public Root component and exported `RootProps` and `ErrorCorrection` types.                      |
| `README.md`           | Usage, examples, API, generation, logos, accessibility, localization, dependencies, and credits. |

The component's `index.ts` and exported types are the source of truth for the public API.

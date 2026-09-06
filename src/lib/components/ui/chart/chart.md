# Chart

A themed presentation layer for charts built with LayerChart. It provides a responsive container, series configuration, light/dark CSS color variables, a consistent tooltip, and local styling for LayerChart axes, grids, labels, legends, highlights, and radial guides.

Use Chart together with LayerChart when data needs a visual comparison, trend, distribution, composition, or relationship. Do not use a chart when a sentence, key metric, or small table communicates the information more clearly.

This project uses stable `layerchart@2.1.0`. Consult the [LayerChart v2 documentation](https://www.layerchart.com/docs), the [LayerChart Chart API](https://www.layerchart.com/docs/components/Chart), and the [LayerChart v2 release guide](https://www.layerchart.com/docs/releases/layerchart-2.0.0) for the installed major version.

<!-- xvelte-example: overview -->

## Contents

- [Import](#import)
- [How xvelte and LayerChart fit together](#how-xvelte-and-layerchart-fit-together)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Chart configuration](#chart-configuration)
- [Public API](#public-api)
- [Tooltip behavior](#tooltip-behavior)
- [Styling and DOM contract](#styling-and-dom-contract)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

## Import

Import the local presentation components from their public `index.ts` entry point and chart primitives directly from LayerChart:

```svelte
<script lang="ts">
	import { BarChart } from "layerchart";

	import * as Chart from "$lib/components/ui/chart";
</script>
```

Chart's `index.ts` exports `Container`, `Tooltip`, and `Style`, their props types, configuration and tooltip types, context helpers, `getPayloadConfigFromPayload`, and `THEMES`.

## How xvelte and LayerChart fit together

xvelte does not replace or mirror the complete LayerChart API:

```text
Chart.Container (xvelte)
├── Chart.Style (xvelte, rendered automatically)
└── BarChart / LineChart / AreaChart / Chart / ... (LayerChart v2)
    ├── axes, grids, marks, labels, legends, highlights (LayerChart v2)
    └── tooltip snippet
        └── Chart.Tooltip (xvelte presentation)
```

`Chart.Container` supplies xvelte's configuration and theme variables. LayerChart supplies the chart engine, data accessors, scales, SVG/Canvas/HTML layers, marks, layout, interaction state, legend, and tooltip positioning.

Choose a simplified LayerChart component such as `BarChart`, `LineChart`, `AreaChart`, `ScatterChart`, or `PieChart` for common visualizations. Use LayerChart's composable `Chart` and primitives when the visualization needs a custom structure. Refer to the [LayerChart v2 component catalog](https://www.layerchart.com/docs/components) instead of expecting those options on xvelte's `Chart.Container`.

## Basic usage

```svelte
<script lang="ts">
	import { BarChart } from "layerchart";

	import * as Chart from "$lib/components/ui/chart";

	const chartData = [
		{ month: "January", desktop: 186, mobile: 80 },
		{ month: "February", desktop: 305, mobile: 200 },
		{ month: "March", desktop: 237, mobile: 120 },
		{ month: "April", desktop: 73, mobile: 190 },
		{ month: "May", desktop: 209, mobile: 130 },
		{ month: "June", desktop: 214, mobile: 140 }
	];

	const chartConfig = {
		desktop: {
			label: "Desktop",
			color: "var(--chart-1)"
		},
		mobile: {
			label: "Mobile",
			color: "var(--chart-2)"
		}
	} satisfies Chart.ChartConfig;

	const series = [
		{ key: "desktop", label: chartConfig.desktop.label, color: "var(--color-desktop)" },
		{ key: "mobile", label: chartConfig.mobile.label, color: "var(--color-mobile)" }
	];
</script>

<figure class="w-full">
	<figcaption class="mb-3">
		<h2 class="font-medium">Visitors by device</h2>
		<p class="text-sm text-muted-foreground">Monthly visitors during the first half of the year.</p>
	</figcaption>

	<Chart.Container config={chartConfig} class="min-h-64 w-full">
		<BarChart data={chartData} x="month" axis="x" seriesLayout="group" {series} legend>
			{#snippet tooltip()}
				<Chart.Tooltip />
			{/snippet}
		</BarChart>
	</Chart.Container>
</figure>
```

The keys in `chartConfig`, the LayerChart `series` keys, and the generated variables such as `--color-desktop` must describe the same series. LayerChart v2 automatically chooses a suitable scale for categorical month values; add an explicit scale only when the visualization needs different behavior.

## Examples

### Light and dark series colors

Use `theme` instead of `color` when a series needs different values in each mode:

```svelte
<script lang="ts">
	import * as Chart from "$lib/components/ui/chart";

	const chartConfig = {
		revenue: {
			label: "Revenue",
			theme: {
				light: "oklch(0.55 0.18 250)",
				dark: "oklch(0.78 0.14 250)"
			}
		},
		expenses: {
			label: "Expenses",
			color: "var(--chart-2)"
		}
	} satisfies Chart.ChartConfig;
</script>
```

Container generates `--color-revenue` under both the normal and `.dark` selectors. A single `color` value is written into both selectors. A config entry may use `color` or `theme`, not both.

### Line chart with a formatted axis and tooltip

```svelte
<script lang="ts">
	import { LineChart } from "layerchart";

	import { getLocale } from "$lib/paraglide/runtime";
	import * as Chart from "$lib/components/ui/chart";

	const chartConfig = {
		requests: {
			label: "Requests",
			color: "var(--chart-3)"
		}
	} satisfies Chart.ChartConfig;

	const series = [{ key: "requests", label: chartConfig.requests.label, color: "var(--color-requests)" }];
</script>

<Chart.Container config={chartConfig} class="min-h-64 w-full">
	<LineChart
		data={requestData}
		x="date"
		{series}
		axis="x"
		props={{
			xAxis: {
				format: (value) => new Intl.DateTimeFormat(getLocale(), { month: "short" }).format(value)
			}
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip labelFormatter={(value) => new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium" }).format(value)} />
		{/snippet}
	</LineChart>
</Chart.Container>
```

Axis, series, curve, motion, padding, legend, and interaction props belong to LayerChart. See the [LayerChart v2 LineChart documentation](https://www.layerchart.com/docs/components/LineChart) for its full API.

### Tooltip keys and indicators

```svelte
<Chart.Tooltip labelKey="visitors" nameKey="browser" indicator="dashed" />
```

`labelKey` chooses the config or data key used for the heading. `nameKey` chooses the config entry used for each series name. Indicators can be `dot`, `line`, or `dashed`.

For data such as:

```ts
const chartData = [
	{ browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
	{ browser: "safari", visitors: 200, fill: "var(--color-safari)" }
];

const chartConfig = {
	visitors: { label: "Total visitors" },
	chrome: { label: "Chrome", color: "var(--chart-1)" },
	safari: { label: "Safari", color: "var(--chart-2)" }
} satisfies Chart.ChartConfig;
```

the tooltip resolves “Total visitors” as its heading and uses “Chrome” or “Safari” for the item name when LayerChart's payload includes the matching data fields.

### Custom tooltip rows

Use the `formatter` snippet to replace the complete default row for each visible series:

```svelte
<Chart.Tooltip>
	{#snippet formatter({ value, name, index })}
		<div class="flex w-full items-center justify-between gap-6">
			<span class="text-muted-foreground">{index + 1}. {name}</span>
			<strong class="font-mono tabular-nums">{currencyFormatter.format(Number(value))}</strong>
		</div>
	{/snippet}
</Chart.Tooltip>
```

The snippet also receives the complete LayerChart tooltip `item` and the filtered `payload` array. It runs only for rows that have both a defined value and a LayerChart label; other rows fall back to the built-in presentation.

### Config icons

`ChartConfig` accepts any Svelte component already available in the app as an optional series `icon`. When Tooltip resolves that config entry, it renders the icon instead of the colored indicator. Chart itself requires no icon package or predefined icon export.

### Direct LayerChart composition

Container also works with LayerChart's base `Chart`, layers, axes, and marks:

```svelte
<script lang="ts">
	import { Axis, Chart as LayerChart, Layer, Spline } from "layerchart";

	import * as Chart from "$lib/components/ui/chart";
</script>

<Chart.Container config={chartConfig} class="min-h-64 w-full">
	<LayerChart data={chartData} x="date" y="value">
		<Layer>
			<Axis placement="bottom" />
			<Spline stroke="var(--color-value)" />
		</Layer>
	</LayerChart>
</Chart.Container>
```

Treat this as an architectural example and verify individual props against the [LayerChart v2 Chart API](https://www.layerchart.com/docs/components/Chart) and [component catalog](https://www.layerchart.com/docs/components), because xvelte does not redefine their types or behavior.

## Chart configuration

`ChartConfig` is a record keyed by series or data identity:

```ts
type ChartConfig = Record<
	string,
	{
		label?: string;
		icon?: Component;
	} & (
		| { color?: string; theme?: never }
		| {
				color?: never;
				theme: { light: string; dark: string };
		  }
	)
>;
```

| Field   | Type                              | Purpose                                                            |
| ------- | --------------------------------- | ------------------------------------------------------------------ |
| `label` | `string`                          | Human-readable series or metric name used by the local Tooltip.    |
| `icon`  | Svelte `Component`                | Optional series icon rendered by Tooltip instead of its indicator. |
| `color` | `string`                          | One CSS color value used in both light and dark modes.             |
| `theme` | `{ light: string; dark: string }` | Separate CSS color values for each supported theme.                |

For every entry with `color` or `theme`, `Chart.Style` generates a scoped custom property named `--color-KEY`. Use it in LayerChart series, marks, labels, or data:

```ts
const series = [{ key: "desktop", color: "var(--color-desktop)" }];
```

Keys become part of CSS custom-property names. Prefer stable CSS-safe identifiers such as `desktop`, `mobile`, or `net_revenue`; avoid spaces and punctuation that would produce invalid custom properties.

The config is reactive through `Chart.Container`. Updating a color, theme, label, or icon updates the local context and regenerates the scoped style content.

## Public API

The tables below cover xvelte's API. Chart shapes, simplified charts, axes, scales, legends, animations, interactions, and rendering layers are provided by stable LayerChart 2.1.0; use the [LayerChart v2 documentation](https://www.layerchart.com/docs) for those options.

### `Chart.Container`

Type: `ContainerProps`, based on native HTML attributes and a bindable `HTMLElement` ref.

| Prop       | Type                   | Default     | Behavior                                                                                                          |
| ---------- | ---------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `config`   | `ChartConfig`          | Required    | Provides labels, icons, and colors to local descendants and generated CSS.                                        |
| `id`       | `string`               | Generated   | Builds the internal `data-chart="chart-ID"` scope. It is consumed and is not forwarded as the root's native `id`. |
| `children` | `Snippet \| undefined` | `undefined` | LayerChart component and any chart-local content.                                                                 |
| `ref`      | `HTMLElement \| null`  | `null`      | Bindable container element; the rendered element is a `div`.                                                      |
| `class`    | `string`               | `undefined` | Merged with the aspect ratio, layout, text, and LayerChart override classes.                                      |

Remaining native attributes and handlers are forwarded to the root `div`. Use a simple CSS-safe `id` value because it is interpolated into an unquoted `data-chart` CSS selector. If the page needs a native DOM ID, wrap Container or use another identifying `data-*` attribute; the `id` prop is reserved for style scoping.

Container defaults to `aspect-video`, `display: flex`, centered content, visible overflow, and extra-small text. Override its aspect ratio or set an explicit height/minimum height through `class` when the chart needs different dimensions.

### `Chart.Style`

Type: `StyleProps`.

| Prop     | Type          | Default  | Behavior                                                                        |
| -------- | ------------- | -------- | ------------------------------------------------------------------------------- |
| `id`     | `string`      | Required | Matches the Container's complete `data-chart` value, normally `chart-ID`.       |
| `config` | `ChartConfig` | Required | Generates scoped `--color-KEY` declarations from entries with a color or theme. |

Style renders a `<style>` element only when at least one config entry supplies `color` or `theme`. `Chart.Container` already renders it with the correct scope, so normal compositions should not add another `Chart.Style`.

`THEMES` is exported as `{ light: "", dark: ".dark" }`. Generated light declarations target the chart directly; dark declarations target it below the app's `.dark` class.

### `Chart.Tooltip`

Type: `TooltipProps`, based on native `div` attributes with `children` removed.

| Prop             | Type                                                                      | Default             | Behavior                                                                               |
| ---------------- | ------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `hideLabel`      | `boolean`                                                                 | `false`             | Hides the tooltip heading.                                                             |
| `label`          | `string`                                                                  | `undefined`         | Explicit heading or config key when `labelKey` is not set.                             |
| `indicator`      | `"dot" \| "line" \| "dashed"`                                             | `"dot"`             | Selects the built-in series marker shape.                                              |
| `nameKey`        | `string`                                                                  | Series key or label | Chooses the config/data key used to resolve each row's name and icon.                  |
| `labelKey`       | `string`                                                                  | LayerChart x value  | Chooses the config/data key used to resolve the heading.                               |
| `hideIndicator`  | `boolean`                                                                 | `false`             | Hides the built-in color marker; a configured icon still renders.                      |
| `labelClassName` | `string`                                                                  | `undefined`         | Merged onto the heading only.                                                          |
| `labelFormatter` | `(value, payload) => string \| number \| Snippet`, `null`, or `undefined` | String conversion   | Formats or replaces the heading; `null` keeps the resolved value unchanged.            |
| `formatter`      | Row snippet                                                               | `undefined`         | Replaces each eligible default series row.                                             |
| `color`          | `string`                                                                  | Payload color       | Overrides every built-in indicator color.                                              |
| `ref`            | `HTMLDivElement \| null`                                                  | `null`              | Bindable tooltip panel element.                                                        |
| `class`          | `string`                                                                  | `undefined`         | Merged with the panel's grid, border, background, radius, spacing, and shadow classes. |

The `formatter` snippet receives:

```ts
{
	value: unknown;
	name: string;
	item: TooltipPayload;
	index: number;
	payload: TooltipPayload[];
}
```

Remaining native `div` attributes are forwarded to the visual tooltip panel. Tooltip wraps that panel in LayerChart's `Tooltip.Root` with `variant="none"`; LayerChart owns positioning, visibility, and portal behavior. xvelte does not expose the remaining `Tooltip.Root` props through this component.

### Types, constants, and helpers

| Export                        | Signature or shape                                           | Purpose                                                                                        |
| ----------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `ChartConfig`                 | Series configuration record                                  | Labels, icons, and color/theme values shared by local chart parts.                             |
| `ChartContextValue`           | `{ config: ChartConfig }`                                    | xvelte context value provided by Container.                                                    |
| `TooltipPayload`              | LayerChart `Tooltip.TooltipSeries`                           | One series entry in LayerChart's active tooltip state.                                         |
| `ExtractSnippetParams<T>`     | Conditional utility type                                     | Extracts the first parameter type from a Svelte snippet.                                       |
| `THEMES`                      | `{ light: "", dark: ".dark" }`                               | Selectors used by Style when generating theme CSS.                                             |
| `getChartContext`             | `() => ChartContextValue`                                    | Reads the nearest xvelte Chart.Container configuration.                                        |
| `setChartContext`             | `(value: ChartContextValue) => ChartContextValue`            | Provides xvelte chart configuration; used by Container and available for advanced composition. |
| `getPayloadConfigFromPayload` | `(config, payload, key, data?) => config entry \| undefined` | Resolves the config entry represented by a LayerChart tooltip payload.                         |

The xvelte `getChartContext` helper is different from LayerChart's helper with the same name. `Chart.Tooltip` uses both: xvelte's context supplies `ChartConfig`, while LayerChart's context supplies tooltip data, accessors, colors, and interaction state.

`getPayloadConfigFromPayload` checks, in order, the payload key, payload label, a string field on the payload, a string field on `payload.config`, and a string field on the source datum. It returns the resolved config entry, falling back to the original key.

Use `index.ts` and the exported props types as the source of truth for the local API.

## Tooltip behavior

- Tooltip must render inside both `Chart.Container` and a LayerChart chart that provides tooltip context. Missing either context causes an error.
- LayerChart determines which datum and series are active. xvelte removes series whose value is `undefined` before rendering rows.
- The default heading comes from LayerChart's x accessor. `label`, `labelKey`, and `labelFormatter` can replace or format it.
- With one visible series and a `line` or `dashed` indicator, the heading moves beside the series details. Dot indicators keep the heading above the rows.
- A config icon takes precedence over the colored indicator. Otherwise indicator color resolves from `color`, LayerChart's item config color, or the payload color.
- Default headings and values call `toLocaleString(getLocale())` with the active Paraglide locale. Use `formatter` for currency, units, percentages, custom date styles, or time zones.
- A falsey formatted heading such as an empty string or numeric zero is not rendered by the current local template.
- LayerChart v2 owns tooltip hit testing and placement. Configure modes such as band, bisect, quadtree, or manual interaction on the LayerChart component; see the [LayerChart v2 tooltip guide](https://www.layerchart.com/docs/guides/tooltip).

## Styling and DOM contract

Chart.Container exposes:

| Selector                      | Element           | Purpose                                                                      |
| ----------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `[data-slot="chart"]`         | Root `div`        | Public chart container, sizing, theme scope, and LayerChart style overrides. |
| `[data-chart="chart-ID"]`     | Same root `div`   | Unique selector used by generated series color variables.                    |
| `[data-slot="chart-style"]`   | Generated `style` | Series color variables scoped to the matching chart ID.                      |
| `[data-slot="chart-tooltip"]` | Tooltip `div`     | Public tooltip content and layout.                                           |

`Style` renders only when the configuration contains explicit series colors, so its slot is conditional.

Container intentionally adjusts LayerChart's `.lc-*` classes:

- removes axis tick marks and non-grid axis rules;
- applies semantic border colors to Cartesian and radial grid lines;
- removes highlight guide strokes and point outlines;
- preserves opacity across stacked/hovered area, spline, highlight line, and highlight point series;
- normalizes chart and axis label sizing and semantic text colors;
- makes LayerChart's root container full width;
- normalizes legend gaps, alignment, swatch size, and radius;
- keeps tooltip hit rectangles and layout SVG groups transparent.

These selectors target LayerChart v2's class contract. Recheck them when upgrading LayerChart, especially across major versions. The [LayerChart v1-to-v2 migration guide](https://www.layerchart.com/docs/guides/migrations/v1-to-v2) explains the major architecture and class/API changes relevant to older examples.

## Accessibility

Charts require both a visual treatment and an equivalent way to understand the data.

- Give every chart a nearby title and concise description, normally with `figure` and `figcaption`.
- Provide the underlying values as a table, list, downloadable dataset, or adjacent summary when exact values matter. Tooltips alone are not an accessible replacement.
- Do not communicate series only through color. Use labels, patterns, direct annotations, distinct shapes, or an accessible legend as appropriate.
- Keep config labels meaningful and unique. They become tooltip names and may also feed LayerChart legends.
- Verify contrast for series, axes, grids, labels, highlights, and tooltip text in light and dark themes.
- Ensure pointer-only tooltip information is also available through focus, visible labels, or equivalent text. LayerChart interaction behavior depends on the selected chart and tooltip mode.
- Avoid unnecessary animation and respect reduced-motion preferences through LayerChart's motion options.
- When legends are interactive, test their buttons, selected states, focus order, and effect on the accompanying data description.

Do not add `role="img"` around interactive controls. For a purely static chart, an appropriately named image role may be useful, but a labelled figure plus accessible data usually communicates more information.

## Localization

Chart contains no built-in human-readable strings and does not require Paraglide messages. Config labels, captions, axis ticks, legend text, units, custom tooltip labels, and accessible summaries are supplied by the app and should follow its localization conventions.

The built-in Tooltip calls `toLocaleString(getLocale())` for default headings and values, so dates and numbers follow the active Paraglide locale. Use `labelFormatter`, the `formatter` snippet, `Intl.NumberFormat`, or `Intl.DateTimeFormat` when the app requires a currency, unit, notation, date style, or time zone.

## Dependencies

Chart requires Svelte 5, stable LayerChart 2.1, the local utility helpers, and Tailwind CSS. Install its runtime and development packages with one of these command groups:

```sh
# bun
bun add layerchart@^2.1.0 clsx tailwind-merge
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install layerchart@^2.1.0 clsx tailwind-merge
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add layerchart@^2.1.0 clsx tailwind-merge
pnpm add -D @inlang/paraglide-js tailwindcss
```

Do not replace the stable version with `layerchart@next` when reproducing the current xvelte component. This implementation is written against stable v2.1.0. Use the [LayerChart v2 documentation](https://www.layerchart.com/docs), [v2 release guide](https://www.layerchart.com/docs/releases/layerchart-2.0.0), and official component pages for its chart APIs.

LayerChart already declares its required D3 and LayerStack packages as dependencies. Install a D3 package separately only when app code imports it directly, for example `d3-scale` to create a custom scale.

### Shared utilities

Chart imports `cn`, `WithElementRef`, and `WithoutChildren` from `$lib/utils`. Add these exact definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The package block above includes `clsx` and `tailwind-merge`, which this code imports.

### Paraglide locale

Configure and compile Paraglide so `$lib/paraglide/runtime.js` exports `getLocale`. Chart has no message keys, but Tooltip reads the active locale from that generated runtime for its default heading and value formatting.

### Global CSS

Your global stylesheet must import Tailwind and expose the semantic and chart colors used by Container and Tooltip. The values below are xvelte's defaults and may be replaced while preserving their names and mappings:

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--border: oklch(0.923 0.003 48.717);
	--chart-1: oklch(0.897 0.196 126.665);
	--chart-2: oklch(0.768 0.233 130.85);
	--chart-3: oklch(0.648 0.2 131.684);
	--chart-4: oklch(0.532 0.157 131.589);
	--chart-5: oklch(0.453 0.124 130.933);
	--radius: 0.45rem;
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--foreground: oklch(0.985 0.001 106.423);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--border: oklch(1 0 0 / 10%);
	--chart-1: oklch(0.897 0.196 126.665);
	--chart-2: oklch(0.768 0.233 130.85);
	--chart-3: oklch(0.648 0.2 131.684);
	--chart-4: oklch(0.532 0.157 131.589);
	--chart-5: oklch(0.453 0.124 130.933);
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-muted-foreground: var(--muted-foreground);
	--color-border: var(--border);
	--color-chart-1: var(--chart-1);
	--color-chart-2: var(--chart-2);
	--color-chart-3: var(--chart-3);
	--color-chart-4: var(--chart-4);
	--color-chart-5: var(--chart-5);
	--radius-lg: var(--radius);
}
```

The app remains responsible for applying its `.dark` class, normally through root-level theme management. LayerChart v2 ships its own default component styles; no LayerChart stylesheet import is required by the local component.

Chart requires no other xvelte UI component, icon export, hook, attachment, context outside its own folder, localization message, `tw-animate-css` import, or global keyframe. The generated Paraglide runtime is required. Keep `chart-context.ts` and `chart-utils.ts` with the component because Container and Tooltip import them directly.

## Credits

Chart is adapted from the [shadcn-svelte Chart](https://www.shadcn-svelte.com/docs/components/chart). Its presentation layer has been adapted to stable LayerChart 2.1.0, xvelte's native context conventions, local theme tokens, utility imports, tooltip behavior, and public props types.

## File organization

| File                     | Responsibility                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `chart-container.svelte` | Provides chart config context, generated style scope, responsive layout, and LayerChart class overrides.  |
| `chart-style.svelte`     | Generates scoped light and dark `--color-KEY` declarations.                                               |
| `chart-tooltip.svelte`   | Presents LayerChart tooltip state with local labels, icons, indicators, formatting, and styles.           |
| `chart-context.ts`       | Provides and retrieves the local reactive ChartConfig context.                                            |
| `chart-utils.ts`         | Defines public config/payload types, theme selectors, snippet utility type, and payload-to-config lookup. |
| `index.ts`               | Exports all components, props types, shared types, helpers, and constants.                                |

Use `index.ts` and the exported props types as the source of truth for the local API. If this guide and the implementation disagree, verify the installed LayerChart 2.1 API and update the guide with the code change.

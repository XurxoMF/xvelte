# Stepper

A composable step-navigation component for multi-stage tasks. It owns a bindable one-based current step, derives active/completed/inactive state from mounted items, supports horizontal and vertical layouts, orientation-aware arrow navigation, direct selection, and previous/next controls.

Use Stepper to show progress and navigate a short ordered workflow such as setup, checkout, or onboarding. Do not use it as a complete form controller: validation, panel rendering, persistence, submission, and rules about which steps may be visited remain application responsibilities.

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
	import * as Stepper from "$lib/components/ui/stepper";
</script>
```

`index.ts` exports `Root`, `Nav`, `Item`, `Trigger`, `Indicator`, `Separator`, `Title`, `Description`, `Next`, and `Previous`, together with a matching props type for every part.

---

## Anatomy

```svelte
<Stepper.Root>
	<Stepper.Nav>
		<Stepper.Item>
			<Stepper.Trigger>
				<Stepper.Indicator>1</Stepper.Indicator>
				<Stepper.Title>Account</Stepper.Title>
				<Stepper.Description>Basic details</Stepper.Description>
			</Stepper.Trigger>
			<Stepper.Separator />
		</Stepper.Item>
	</Stepper.Nav>

	<!-- App-owned step panel -->

	<Stepper.Previous>Previous</Stepper.Previous>
	<Stepper.Next>Next</Stepper.Next>
</Stepper.Root>
```

Root provides state but renders no element. Nav lays out registered Items. Trigger selects its Item; Indicator, Title, Description, and Separator read state through the surrounding group attributes. Previous and Next may be placed anywhere beneath Root.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Stepper from "$lib/components/ui/stepper";

	const steps = [
		{ title: "Account", description: "Your details" },
		{ title: "Plan", description: "Choose access" },
		{ title: "Review", description: "Confirm choices" }
	];

	let step = $state(1);
</script>

<Stepper.Root bind:step>
	<Stepper.Nav aria-label="Account setup progress">
		{#each steps as item, index (item.title)}
			<Stepper.Item>
				<Stepper.Trigger>
					<Stepper.Indicator>{index + 1}</Stepper.Indicator>
					<Stepper.Title>{item.title}</Stepper.Title>
					<Stepper.Description>{item.description}</Stepper.Description>
				</Stepper.Trigger>
				<Stepper.Separator aria-hidden="true" />
			</Stepper.Item>
		{/each}
	</Stepper.Nav>

	<div class="my-6 rounded-lg border p-4">
		{#if step === 1}
			Account form
		{:else if step === 2}
			Plan selection
		{:else}
			Review and submit
		{/if}
	</div>

	<div class="flex justify-between">
		<Stepper.Previous>Previous</Stepper.Previous>
		<Stepper.Next>Next</Stepper.Next>
	</div>
</Stepper.Root>
```

Steps are one-based. Root does not render or hide panels; use `step` in app markup as shown.

---

## Examples

### Vertical stepper

```svelte
<Stepper.Root bind:step orientation="vertical">
	<Stepper.Nav aria-label="Import progress">
		{#each importSteps as item, index (item.id)}
			<Stepper.Item id={item.id} class="min-h-20">
				<Stepper.Trigger>
					<Stepper.Indicator>{index + 1}</Stepper.Indicator>
					<div>
						<Stepper.Title>{item.title}</Stepper.Title>
						<Stepper.Description>{item.description}</Stepper.Description>
					</div>
				</Stepper.Trigger>
				<Stepper.Separator aria-hidden="true" />
			</Stepper.Item>
		{/each}
	</Stepper.Nav>
</Stepper.Root>
```

Vertical orientation changes Nav layout, separator placement, text alignment, and keyboard navigation to Arrow Up/Down.

### Validate before advancing

Next changes `step` immediately before calling its forwarded `onclick`. When validation must block navigation, use an app-owned button rather than Stepper.Next:

```svelte
<script lang="ts">
	function continueIfValid() {
		if (!currentPanelIsValid()) {
			error = "Complete the required fields before continuing.";
			return;
		}

		step += 1;
	}
</script>

<button type="button" onclick={continueIfValid}>Continue</button>
```

Use Stepper.Next when unconditional movement is correct.

### Disable direct selection

```svelte
<Stepper.Trigger disabled={index + 1 > highestCompletedStep + 1}>
	<Stepper.Indicator>{index + 1}</Stepper.Indicator>
	<Stepper.Title>{item.title}</Stepper.Title>
</Stepper.Trigger>
```

Arrow navigation skips disabled triggers. Previous and Next only consider the registered step bounds; they do not inspect whether the destination Trigger is disabled.

### Delegated previous and next controls

```svelte
<Stepper.Previous>
	{#snippet child({ props })}
		<button {...props} type="button" class="rounded-md border px-3 py-2">Back</button>
	{/snippet}
</Stepper.Previous>

<Stepper.Next>
	{#snippet child({ props })}
		<button {...props} type="button" class="rounded-md bg-primary px-3 py-2">Continue</button>
	{/snippet}
</Stepper.Next>
```

Spread all supplied props so click handling and automatic disabled state remain connected.

### Conditional steps

```svelte
{#if needsBilling}
	<Stepper.Item id="billing">…</Stepper.Item>
{/if}
```

Items register in mount order. When an earlier item disappears, the local context adjusts the one-based `step` to keep the same logical position where possible and clamps removal of the final active step. Use stable IDs and understand that a changed item order changes numeric step positions.

---

## Public API

Stepper is a local component with no external state primitive. The tables document its complete xvelte-owned API; native attributes mentioned below are forwarded. The component's `index.ts`, exported types, and source are the source of truth.

### Root and navigation

| Part and type        | Prop             | Type                             | Default        | Behavior                                                                                          |
| -------------------- | ---------------- | -------------------------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `Root` — `RootProps` | `step`           | `number`                         | `1`            | Bindable one-based selected step. Values are not automatically clamped when assigned directly.    |
|                      | `orientation`    | `"horizontal" \| "vertical"`     | `"horizontal"` | Shared layout and keyboard-navigation axis.                                                       |
|                      | `children`       | `Snippet`                        | —              | Provides every descendant part; Root renders no wrapper.                                          |
| `Nav` — `NavProps`   | Native div props | `HTMLAttributes<HTMLDivElement>` | —              | Adds orientation data/ARIA, group hooks, flex layout, children, merged class, and bindable `ref`. |

Nav's `aria-orientation` does not add a widget role. Add an accessible label and an appropriate surrounding landmark or list semantics when the workflow requires them.

### Item and trigger

| Part and type              | Prop                | Type                  | Default             | Behavior                                                                                                      |
| -------------------------- | ------------------- | --------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `Item` — `ItemProps`       | `id`                | `string`              | Svelte-generated ID | Stable DOM ID and `data-step` identifier; registration order determines numeric step.                         |
|                            | Native div props    | —                     | —                   | Forwards children, handlers, merged class, and bindable `ref`. Native `id` is replaced by the local typed ID. |
| `Trigger` — `TriggerProps` | `disabled`          | `boolean`             | `false`             | Prevents direct selection and is skipped by arrow navigation.                                                 |
|                            | `onclick`           | Native button handler | —                   | Runs after the local Item has been selected.                                                                  |
|                            | `onkeydown`         | Native button handler | —                   | Runs after local orientation-aware arrow handling.                                                            |
|                            | Native button props | —                     | —                   | Forwards children, attributes, merged class, and bindable button `ref`.                                       |

Trigger receives `aria-current="step"` only while active. Horizontal Arrow Left/Right and vertical Arrow Up/Down select and focus the next enabled mounted Trigger without wrapping.

### Visual parts

`IndicatorProps`, `SeparatorProps`, `TitleProps`, and `DescriptionProps` each extend native `<div>` attributes with children, merged `class`, and a bindable `HTMLDivElement` ref.

| Part          | State behavior                                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Indicator`   | Primary circle for active/completed steps; muted circle for inactive state; focus ring responds to the surrounding Trigger.                         |
| `Separator`   | Primary when its Item is completed, muted otherwise, horizontal/vertical placement from Nav, and hidden automatically for the last registered Item. |
| `Title`       | Medium title with orientation-aware text alignment.                                                                                                 |
| `Description` | Muted supporting text with orientation-aware alignment.                                                                                             |

These are presentational divs. They do not create heading or description relationships automatically; callers may provide roles or use semantic delegated wrappers outside them when necessary.

### Previous and Next

`PreviousProps` and `NextProps` inherit xvelte Button props except the original `children`, then add `children` and a delegated `child({ props })` snippet.

| Part       | Local defaults and behavior                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Previous` | `variant="outline"`, `size="default"`; decrements before the caller's `onclick`; disabled on the first step or when caller `disabled` is true.           |
| `Next`     | `variant="default"`, `size="default"`; increments before the caller's `onclick`; disabled on the last registered step or when caller `disabled` is true. |

Both add their stable `data-slot`, forward remaining Button props, and allow delegated rendering. Neither validates panels, submits forms intentionally, skips disabled Item triggers, or wraps around.

---

## Styling and DOM contract

| Part        | Stable `data-slot`    | State hooks                                                  |
| ----------- | --------------------- | ------------------------------------------------------------ |
| Nav         | `stepper-nav`         | `data-orientation`, `aria-orientation`, `group/stepper-nav`. |
| Item        | `stepper-item`        | `id`, `data-step`, `data-state="active                       | completed | inactive"`, `group/stepper-item`. |
| Trigger     | `stepper-trigger`     | `data-state`, `aria-current`, `group/stepper-trigger`.       |
| Indicator   | `stepper-indicator`   | Reads Trigger state and focus through group selectors.       |
| Separator   | `stepper-separator`   | Own `data-state`; reads Nav orientation.                     |
| Title       | `stepper-title`       | Reads Nav orientation.                                       |
| Description | `stepper-description` | Reads Nav orientation.                                       |
| Previous    | `stepper-previous`    | xvelte Button hooks and variants.                            |
| Next        | `stepper-next`        | xvelte Button hooks and variants.                            |

All locally styled div/button parts merge classes with `cn()` or the Button component. Root has no element or class. State attributes and named group classes are part of the local composition contract.

---

## Accessibility

Trigger is a native button, supports direct activation, and marks the active step with `aria-current="step"`. Arrow navigation follows orientation, selects the destination, focuses it, skips disabled triggers, stops at either end, and does not implement Home/End or wrapping.

Nav and Item are plain divs, while Title and Description are presentational divs. Add a clear accessible name to Nav and use surrounding semantic headings, lists, or regions where needed. Associate the active panel with its trigger in app code if assistive users must understand that relationship.

Do not rely on color alone: the active `aria-current`, visible numbers/titles, and completed wording or icons should make progress understandable. Announce validation errors near the relevant panel and move focus deliberately when a step change replaces substantial content.

---

## Localization

Stepper contains no built-in human-readable copy and requires no localization messages. The app supplies and translates titles, descriptions, button labels, progress announcements, validation errors, and active-panel content.

IDs, numeric `step`, `data-state`, and orientation values are implementation data and must not be translated.

---

## Dependencies

### Packages

```sh
# Bun
bun add clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add clsx tailwind-merge
pnpm add -D tailwindcss
```

Stepper has no external state primitive or icon dependency. Button may add its own runtime and development packages; follow its README.

### Global styles and theme tokens

```css
@import "tailwindcss";

:root {
	--background: oklch(1 0 0);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--ring: oklch(0.709 0.01 56.259);
}

.dark {
	--background: oklch(0.147 0.004 49.25);
	--primary: oklch(0.768 0.233 130.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--muted: oklch(0.268 0.007 34.298);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--ring: oklch(0.553 0.013 58.071);
}

@theme inline {
	--color-background: var(--background);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-ring: var(--ring);
}
```

The values may be replaced by the app's theme. No animation import, keyframe, custom variant, font, or global layout rule is required.

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

Previous and Next reuse Button. Copy its component folder and follow its README for the complete installation requirements:

```text
button/
├── button-root.svelte
└── index.ts
```

### Component files and other integration

Copy the complete folder; its context file is internal but required:

```text
stepper/
├── index.ts
├── stepper-context.svelte.ts
├── stepper-description.svelte
├── stepper-indicator.svelte
├── stepper-item.svelte
├── stepper-nav.svelte
├── stepper-next.svelte
├── stepper-previous.svelte
├── stepper-root.svelte
├── stepper-separator.svelte
├── stepper-title.svelte
└── stepper-trigger.svelte
```

Stepper requires no hook, public attachment, localization setup, shared style, image, font, or network service. The private native Svelte context is contained in the copied folder.

---

## Credits

The original composition is adapted from [shadcn-svelte-extras Stepper](https://shadcn-svelte-extras.com/docs/components/stepper), with local state, orientation, registration, and keyboard behavior defining the documented API.

---

## File organization

| File                         | Responsibility                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `stepper-root.svelte`        | Bindable one-based step, orientation, and root context.                               |
| `stepper-context.svelte.ts`  | Item registry, state derivation, selection, bounds, and keyboard focus navigation.    |
| `stepper-nav.svelte`         | Horizontal/vertical navigation layout and orientation attributes.                     |
| `stepper-item.svelte`        | Stable ID, mount-order registration, state attributes, and last-item layout.          |
| `stepper-trigger.svelte`     | Direct selection, active semantics, disabled state, and arrow navigation.             |
| `stepper-indicator.svelte`   | Number/icon container and state styling.                                              |
| `stepper-separator.svelte`   | Completed-state connector, orientation, and automatic last-item hiding.               |
| `stepper-title.svelte`       | Orientation-aware title presentation.                                                 |
| `stepper-description.svelte` | Orientation-aware supporting text.                                                    |
| `stepper-previous.svelte`    | Bound-aware previous Button and delegated rendering.                                  |
| `stepper-next.svelte`        | Bound-aware next Button and delegated rendering.                                      |
| `index.ts`                   | Public parts and every exported props type.                                           |
| `README.md`                  | Composition, examples, API, behavior, accessibility, styling, and installation guide. |

The component's `index.ts` and exported types are the source of truth for the public API.

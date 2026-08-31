# Walkthrough

A Dialog-backed guided tour that highlights elements by DOM ID, positions step content around each target, scrolls off-screen targets into view, manages modal keyboard focus, and exposes navigation state to custom content. Use it for short contextual tours whose targets already exist in the page. Do not use it as a substitute for persistent help content or when people must keep interacting with the highlighted page while reading a step.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Walkthrough from "$lib/components/ui/walkthrough";
	import type { Step, WalkthroughContext } from "$lib/components/ui/walkthrough";
</script>
```

Walkthrough's `index.ts` exports `Root` and the `RootProps`, `Step`, and `WalkthroughContext` types.

---

## Anatomy

Walkthrough exposes only its root. The root owns the spotlight, floating content, step state, and context while composing Dialog internally for modal behavior:

```svelte
<Walkthrough.Root {steps} bind:open />
```

Each `Step.target` points to an existing element's `id` without a leading `#`:

```svelte
<section id="profile-settings">...</section>
```

The internal content, modal overlay, and spotlight components are implementation details and are not exported.

---

## Basic usage

```svelte
<script lang="ts">
	import * as Walkthrough from "$lib/components/ui/walkthrough";
	import type { Step } from "$lib/components/ui/walkthrough";

	let open = $state(false);

	const steps: Step[] = [
		{
			target: "project-navigation",
			title: "Project navigation",
			description: "Move between your project's main sections.",
			position: "right"
		},
		{
			target: "profile-settings",
			title: "Profile settings",
			description: "Update your name, language, and notification preferences.",
			position: "bottom"
		}
	];
</script>

<button type="button" onclick={() => (open = true)}>Start tour</button>

<nav id="project-navigation">...</nav>
<section id="profile-settings">...</section>

<Walkthrough.Root {steps} bind:open onComplete={() => console.info("Tour completed")} />
```

Render `Root` while every referenced target can be found in the document. A missing target leaves the content at its initial position and the spotlight at its previous or empty rectangle. Opening the walkthrough moves focus into its dialog and makes the obscured page unavailable to pointer and keyboard interaction until the walkthrough closes.

---

## Examples

### Target padding and placement

`padding` expands every highlighted rectangle without changing the target. Floating UI may flip the requested position when there is not enough room:

```svelte
<Walkthrough.Root {steps} bind:open padding={8} />
```

Use `position: "top"`, `"bottom"`, `"left"`, or `"right"` on individual steps. The default is `"bottom"`.

### Without the visual overlay

Hide the dimming layer and highlighted rectangle while retaining Dialog's modal semantics, focus management, transparent pointer blocker, and floating step content:

```svelte
<Walkthrough.Root {steps} bind:open showOverlay={false} />
```

The Dialog overlay is always disabled inside Walkthrough, so enabling `showOverlay` renders only the specialized Walkthrough layer with its highlighted opening. Disabling it removes that visual treatment but keeps an invisible full-screen blocker so background controls cannot be activated while the dialog is modal.

### Custom walkthrough content

The `children` snippet replaces the complete default card while preserving positioning, modal semantics, focus capture, Escape handling, and focus restoration. It receives the current context:

```svelte
<Walkthrough.Root {steps} bind:open>
	{#snippet children(ctx: Walkthrough.WalkthroughContext)}
		<div class="w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-xl">
			<p class="text-xs">Step {ctx.currentStepIndex + 1} of {steps.length}</p>
			<h2 class="mt-2 font-semibold">{ctx.currentStep?.title}</h2>
			<p class="mt-1 text-sm text-muted-foreground">{ctx.currentStep?.description}</p>

			<div class="mt-4 flex justify-between gap-2">
				<button type="button" onclick={ctx.close}>Close tour</button>
				<div class="flex gap-2">
					{#if ctx.currentStepIndex > 0}
						<button type="button" onclick={ctx.prev}>Back</button>
					{/if}
					<button type="button" onclick={ctx.next}>{ctx.isLastStep ? "Finish" : "Next"}</button>
				</div>
			</div>
		</div>
	{/snippet}
</Walkthrough.Root>
```

Custom copy belongs to your app and must be translated there. Include at least one visible close control in custom content. Dialog moves focus to the first suitable custom control when opening and keeps subsequent keyboard navigation inside the content. Calling `close` preserves the current index, so reopening resumes the same step. Calling `next` on the final step completes the tour, closes it, resets to the first step after 300ms, and then invokes `onComplete`.

### Controlled visibility

`open` is required and bindable. Closing it externally has the same resume behavior as `ctx.close`:

```svelte
<button type="button" onclick={() => (open = !open)}>{open ? "Pause tour" : "Resume tour"}</button>

<Walkthrough.Root {steps} bind:open />
```

Keep a non-empty `steps` array while opening the walkthrough. Changes that make the current index invalid are not clamped automatically.

---

## Public API

### `Walkthrough.Root`

Type: `RootProps`.

| Prop          | Type                            | Default     | xvelte behavior                                                                                                               |
| ------------- | ------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `steps`       | `Step[]`                        | `[]`        | Ordered tour definitions. Although the exported type requires it, the implementation falls back to an empty array.            |
| `open`        | `boolean`                       | `false`     | Required bindable visibility state. Closing does not reset progress; completing does.                                         |
| `padding`     | `number`                        | `0`         | Expands every side of the measured spotlight rectangle in CSS pixels.                                                         |
| `showOverlay` | `boolean`                       | `true`      | Shows the specialized dimming and highlighted opening. A transparent modal pointer blocker remains when this is `false`.      |
| `onComplete`  | `() => void`                    | `undefined` | Runs about 300ms after finishing the last step, after the index resets. It does not run when the tour is merely closed.       |
| `children`    | `Snippet<[WalkthroughContext]>` | `undefined` | Replaces the default card and receives navigation state and actions. It does not replace the outer positioned dialog wrapper. |

`Root` does not render a DOM wrapper of its own and does not expose `class`, `ref`, native attributes, current-step binding, or a direct reset action. Its `index.ts` and exported types are the source of truth.

### `Step`

```ts
type Step = {
	target: string;
	title: string;
	description: string;
	position?: "top" | "bottom" | "left" | "right" | undefined;
};
```

| Field         | Requirement | Behavior                                                                                         |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `target`      | Required    | DOM `id` without `#`. The component resolves it with `document.getElementById`.                  |
| `title`       | Required    | Heading shown by the default card.                                                               |
| `description` | Required    | Supporting copy shown by the default card.                                                       |
| `position`    | Optional    | Requested side, defaulting to `bottom`; collision handling can flip or shift the final position. |

### `WalkthroughContext`

| Member             | Type                         | Behavior                                                            |
| ------------------ | ---------------------------- | ------------------------------------------------------------------- |
| `isOpen`           | `readonly boolean`           | Current bound open state.                                           |
| `currentStepIndex` | `readonly number`            | Zero-based current index.                                           |
| `currentStep`      | `readonly Step \| undefined` | Current definition, or `undefined` when the index does not resolve. |
| `isLastStep`       | `readonly boolean`           | Whether the current index equals `steps.length - 1`.                |
| `next()`           | `() => void`                 | Advances one step or completes the tour from the last step.         |
| `prev()`           | `() => void`                 | Moves back one step when possible.                                  |
| `close()`          | `() => void`                 | Closes without invoking `onComplete` or resetting the index.        |

The context setters and getters are internal and are not exported by the component's `index.ts`.

---

## Styling and DOM contract

Stable local hooks are:

| Internal element           | Hook                                |
| -------------------------- | ----------------------------------- |
| Full-screen modal blocker  | `data-slot="walkthrough-overlay"`   |
| Dimmed highlight rectangle | `data-slot="walkthrough-spotlight"` |
| Positioned dialog wrapper  | `data-slot="walkthrough-content"`   |

The portalled Dialog content wrapper uses fixed positioning, `z-9999`, Dialog's open/closed fade, and Floating UI's `offset(12)`, `flip()`, and `shift({ padding: 10 })` middleware. The full-viewport Walkthrough blocker uses `z-9998`, prevents pointer interaction with the page, and owns the 300ms fade. When `showOverlay` is enabled, its nested spotlight uses a 500ms geometry transition, a fixed 6px radius, and a fixed `rgba(0, 0, 0, 0.7)` shadow that dims everything outside the highlighted rectangle. Walkthrough disables Dialog.Content's ordinary uniform overlay to avoid duplicate visual layers.

The default card uses `popover`, `popover-foreground`, `muted-foreground`, and `border` theme tokens and a fixed width of 21.875rem (`w-87.5`). Its action controls come from the Button component. There is no public `class` prop; use the `children` snippet when you need a different card structure or presentation.

The spotlight itself has `pointer-events-none`, while its full-screen blocker always receives pointer events while the walkthrough is open. With `showOverlay={false}`, the blocker remains transparent and the `walkthrough-spotlight` element is not rendered.

---

## Accessibility

The positioned content composes Dialog.Content and inherits Bits UI's modal semantics, focus scope, and dismissible layer. It follows these keyboard and focus rules:

- Opening moves focus directly to the default Next or Finish button. Dialog chooses the initial focus target for custom content.
- `Tab` and `Shift+Tab` cycle through controls inside the current step through Dialog's focus scope. Focus attempts outside the modal are contained by Bits UI.
- Every default-card step change returns focus to its Next or Finish button. The dialog's title and description remain associated through ARIA and are announced with the focused action.
- `Escape`, the close button, external `open={false}`, and completion close the dialog. Focus returns to the element that was focused before opening when it still exists.
- The dialog exposes `aria-modal="true"`. Default content uses visible Dialog Title and Description parts; custom content receives screen-reader-only Dialog Title and Description parts from the current step.
- The icon-only close Button has the localized accessible name `Close walkthrough`, and its decorative icon is hidden from assistive technology. Back, Next, and Finish use their visible text as their accessible names.

The full-screen blocker prevents background pointer input whether the visual overlay is shown or hidden, while Dialog's focus scope prevents keyboard focus from escaping. Highlighted targets keep their existing DOM semantics but are unavailable for interaction until the walkthrough closes. Include a visible close button and concise heading in custom content; all custom controls remain responsible for their own names and states.

Smooth automatic scrolling follows the browser and user's motion settings; the component does not provide its own reduced-motion switch.

---

## Localization

The default content uses these Paraglide messages from `messages/en.json`:

| Message ID                      | English text        | Parameters                             |
| ------------------------------- | ------------------- | -------------------------------------- |
| `dry_wolf_step`                 | `Step {step}`       | `step`: one-based current step number. |
| `even_palm_back`                | `Back`              | None.                                  |
| `flint_dove_finish`             | `Finish`            | None.                                  |
| `young_elm_next`                | `Next`              | None.                                  |
| `silver_moth_close_walkthrough` | `Close walkthrough` | None.                                  |

`Step.title` and `Step.description` come from your app and must already be translated for the active locale. A custom `children` snippet replaces all default visible copy and controls, so it owns their translations and accessible names. The built-in close label is used only by the default icon button.

---

## Dependencies

Install all runtime packages and development tooling in one package-manager group:

```sh
# Bun
bun add @floating-ui/dom bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss tw-animate-css

# npm
npm install @floating-ui/dom bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss tw-animate-css

# pnpm
pnpm add @floating-ui/dom bits-ui @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss tw-animate-css
```

`@floating-ui/dom` measures targets and positions the content. Bits UI supplies Dialog's modal semantics and focus behavior. Paraglide supplies the default navigation copy. The remaining packages support Dialog, Button, animation classes, the icon facade, and the shared class helper.

Add the Tailwind import, dark-mode variant, semantic values, and mappings used directly by Walkthrough. These are sample xvelte values; replace them with your own theme while preserving the variable names:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
	--border: oklch(0.923 0.003 48.717);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
}

.dark {
	--border: oklch(1 0 0 / 10%);
	--muted-foreground: oklch(0.709 0.01 56.259);
	--popover: oklch(0.216 0.006 56.043);
	--popover-foreground: oklch(0.985 0.001 106.423);
}

@theme inline {
	--color-border: var(--border);
	--color-muted-foreground: var(--muted-foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
}
```

Copy the Button component from `$lib/components/ui/button`:

```text
src/lib/components/ui/button/
├── button-root.svelte
└── index.ts
```

Follow the Button component's README to install its complete API, theme tokens, and helper requirements.

Copy the Dialog component from `$lib/components/ui/dialog`:

```text
src/lib/components/ui/dialog/
├── dialog-close.svelte
├── dialog-content.svelte
├── dialog-description.svelte
├── dialog-footer.svelte
├── dialog-header.svelte
├── dialog-overlay.svelte
├── dialog-portal.svelte
├── dialog-root.svelte
├── dialog-title.svelte
├── dialog-trigger.svelte
└── index.ts
```

Follow the Dialog component's README to install its complete API, Bits UI dependency, animation styles, theme tokens, localization, and helper requirements. Walkthrough requires the `Dialog.Content.showOverlay` option documented there.

Add this semantic icon export to `$lib/icons.ts`:

```ts
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
```

Add the five message IDs listed under Localization to `messages/en.json`, then generate Paraglide's `$lib/paraglide/messages.js` output through your existing Paraglide setup. The message table is the complete required localization copy, so it is not duplicated here.

Walkthrough does not directly import `$lib/utils`; the required Dialog and Button components do. Follow their READMEs for the exact `cn` helper and full theme requirements. Dialog and Bits UI provide focus trapping, restoration, Escape handling, and ARIA relationships; the Walkthrough blocker prevents pointer interaction with the page and optionally provides the specialized dimming layer. No hook or attachment is required. Copy every source file listed under File organization; `walkthrough-context.ts` is required internal code even though its helpers are not public exports.

---

## Credits

The component is adapted from [More Shadcn's Walkthrough component](https://more-shadcn.noair.fun/docs/components/walkthrough). The local xvelte API, behavior, and limitations documented here are defined by this repository's implementation.

---

## File organization

| File                           | Responsibility                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `walkthrough-root.svelte`      | Public state, completion behavior, context setup, and coordination of internal elements.         |
| `walkthrough-content.svelte`   | Dialog composition, target lookup, positioning, focus preference, and default or custom content. |
| `walkthrough-spotlight.svelte` | Transparent modal blocker plus optional dimming shadow and animated highlight rectangle.         |
| `walkthrough-context.ts`       | Internal `Step` and context types plus native Svelte context helpers.                            |
| `index.ts`                     | Public component and type exports.                                                               |
| `README.md`                    | Installation and usage guide.                                                                    |

The component's `index.ts` and exported `RootProps`, `Step`, and `WalkthroughContext` types are the source of truth for the public API.

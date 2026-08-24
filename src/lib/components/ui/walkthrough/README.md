# Walkthrough

A guided-tour overlay that highlights elements by DOM ID, positions step content around each target, scrolls off-screen targets into view, and exposes navigation state to custom content. Use it for short contextual tours whose targets already exist in the page. Do not use it as a modal, a guaranteed interaction blocker, or a substitute for persistent help content.

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

Import the component from its public `index.ts` entry point:

```svelte
<script lang="ts">
	import * as Walkthrough from "$lib/components/ui/walkthrough";
	import type { Step, WalkthroughContext } from "$lib/components/ui/walkthrough";
</script>
```

Walkthrough's `index.ts` exports `Root` and the `RootProps`, `Step`, and `WalkthroughContext` types.

## Anatomy

Walkthrough exposes only its root. The root owns the spotlight, floating content, step state, and context:

```svelte
<Walkthrough.Root {steps} bind:open />
```

Each `Step.target` points to an existing element's `id` without a leading `#`:

```svelte
<section id="profile-settings">...</section>
```

The internal content and spotlight components are implementation details and are not exported.

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

Render `Root` while every referenced target can be found in the document. A missing target leaves the content at its initial position and the spotlight at its previous or empty rectangle.

## Examples

### Target padding and placement

`padding` expands every highlighted rectangle without changing the target. Floating UI may flip the requested position when there is not enough room:

```svelte
<Walkthrough.Root {steps} bind:open padding={8} />
```

Use `position: "top"`, `"bottom"`, `"left"`, or `"right"` on individual steps. The default is `"bottom"`.

### Custom walkthrough content

The `children` snippet replaces the complete default card while preserving positioning and the outer `role="dialog"` wrapper. It receives the current context:

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

Custom copy belongs to your app and must be translated there. Calling `close` preserves the current index, so reopening resumes the same step. Calling `next` on the final step completes the tour, closes it, resets to the first step after 300ms, and then invokes `onComplete`.

### Controlled visibility

`open` is required and bindable. Closing it externally has the same resume behavior as `ctx.close`:

```svelte
<button type="button" onclick={() => (open = !open)}>{open ? "Pause tour" : "Resume tour"}</button>

<Walkthrough.Root {steps} bind:open />
```

Keep a non-empty `steps` array while opening the walkthrough. Changes that make the current index invalid are not clamped automatically.

## Public API

### `Walkthrough.Root`

Type: `RootProps`.

| Prop         | Type                            | Default     | xvelte behavior                                                                                                               |
| ------------ | ------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `steps`      | `Step[]`                        | `[]`        | Ordered tour definitions. Although the exported type requires it, the implementation falls back to an empty array.            |
| `open`       | `boolean`                       | `false`     | Required bindable visibility state. Closing does not reset progress; completing does.                                         |
| `padding`    | `number`                        | `0`         | Expands every side of the measured spotlight rectangle in CSS pixels.                                                         |
| `onComplete` | `() => void`                    | `undefined` | Runs about 300ms after finishing the last step, after the index resets. It does not run when the tour is merely closed.       |
| `children`   | `Snippet<[WalkthroughContext]>` | `undefined` | Replaces the default card and receives navigation state and actions. It does not replace the outer positioned dialog wrapper. |

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

## Styling and DOM contract

Stable local hooks are:

| Internal element           | Hook                                |
| -------------------------- | ----------------------------------- |
| Dimmed highlight rectangle | `data-slot="walkthrough-spotlight"` |
| Positioned content wrapper | `data-slot="walkthrough-content"`   |

The content wrapper uses fixed positioning, `z-9999`, a 200ms Svelte fade, and Floating UI's `offset(12)`, `flip()`, and `shift({ padding: 10 })` middleware. The spotlight uses `z-9998`, a 300ms fade, a 500ms geometry transition, a fixed 6px radius, and a fixed `rgba(0, 0, 0, 0.7)` overlay shadow.

The default card uses `popover`, `popover-foreground`, `muted-foreground`, and `border` theme tokens and a fixed width of 21.875rem (`w-87.5`). Its action controls come from the Button component. There is no public `class` prop; use the `children` snippet when you need a different card structure or presentation.

The spotlight has `pointer-events-none`, so it dims the page but does not block interaction with background content.

## Accessibility

The positioned content wrapper uses `role="dialog"`, but the current implementation does not provide `aria-modal`, associate the dialog with its visible title or description, move or trap focus, restore focus, close on Escape, or hide background content from assistive technology. The spotlight also leaves background elements interactive.

The default close button contains only an icon and has no accessible name. Back, Next, and Finish buttons do have visible text. Highlighted targets keep their existing semantics and must remain accessible independently of the tour.

These limitations mean the current component is appropriate only where the walkthrough is supplementary and users can still understand and operate the page without it. For a strict modal tour, update the implementation with focus management, Escape handling, an accessible close name, and dialog labeling before using it. Custom content can add a visibly labelled close control, but cannot add attributes to the outer dialog through the current public API.

Smooth automatic scrolling follows the browser and user's motion settings; the component does not provide its own reduced-motion switch.

## Localization

The default content uses these Paraglide messages from `messages/en.json`:

| Message ID          | English text  | Parameters                             |
| ------------------- | ------------- | -------------------------------------- |
| `dry_wolf_step`     | `Step {step}` | `step`: one-based current step number. |
| `even_palm_back`    | `Back`        | None.                                  |
| `flint_dove_finish` | `Finish`      | None.                                  |
| `young_elm_next`    | `Next`        | None.                                  |

`Step.title` and `Step.description` come from your app and must already be translated for the active locale. A custom `children` snippet replaces all default visible copy, so it also owns its translations. The default icon-only close action currently has no localized accessible label.

## Dependencies

Install all runtime packages and development tooling in one package-manager group:

```sh
# Bun
bun add @floating-ui/dom @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install @floating-ui/dom @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add @floating-ui/dom @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss
```

`@floating-ui/dom` measures targets and positions the content. Paraglide supplies the default navigation copy. The remaining runtime packages support the required Button component, icon facade, and shared class helper.

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

Add this semantic icon export to `$lib/icons.ts`:

```ts
export { default as CloseIcon } from "@tabler/icons-svelte/icons/x";
```

Add the four message IDs listed under Localization to `messages/en.json`, then generate Paraglide's `$lib/paraglide/messages.js` output through your existing Paraglide setup. The message table is the complete required localization copy, so it is not duplicated here.

Walkthrough does not directly import `$lib/utils`; the required Button component does. Follow Button's README for the exact `cn` helper and its full theme requirements. No other xvelte component, hook, attachment, shared stylesheet, animation package, or context outside this component folder is required. Copy every source file listed under File organization; `walkthrough-context.ts` is required internal code even though its helpers are not public exports.

## Credits

The component is adapted from [More Shadcn's Walkthrough component](https://more-shadcn.noair.fun/docs/components/walkthrough). The local xvelte API, behavior, and limitations documented here are defined by this repository's implementation.

## File organization

| File                           | Responsibility                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `walkthrough-root.svelte`      | Public state, completion behavior, context setup, and coordination of internal elements. |
| `walkthrough-content.svelte`   | Target lookup, scrolling, Floating UI positioning, and default or custom step content.   |
| `walkthrough-spotlight.svelte` | Highlight rectangle and dimmed-page overlay.                                             |
| `walkthrough-context.ts`       | Internal `Step` and context types plus native Svelte context helpers.                    |
| `index.ts`                     | Public component and type exports.                                                       |
| `README.md`                    | Installation and usage guide.                                                            |

The component's `index.ts` and exported `RootProps`, `Step`, and `WalkthroughContext` types are the source of truth for the public API.

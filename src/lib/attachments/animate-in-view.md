# animateInView

Creates advanced scroll-driven GSAP tweens and timelines with ScrollTrigger while keeping setup, selector scoping, reduced-motion behavior, and cleanup inside a Svelte attachment. Use it for scrubbed progress, direction-aware reveals, pinned sequences, snapping, velocity-aware callbacks, and coordinated timelines; use the lighter Animations style for ordinary entrance, exit, and loop effects that are not tied to scroll position.

<!-- xvelte-example: overview -->

## Contents

- [Installation](#installation)
- [Import](#import)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [ScrollTrigger behavior and lifecycle](#scrolltrigger-behavior-and-lifecycle)
- [Styling and DOM contract](#styling-and-dom-contract)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [File organization](#file-organization)

---

## Installation

Copy `animate-in-view.ts` and `animate-in-view.md`, then install Svelte 5 and GSAP:

```sh
# Bun
bun add gsap
bun add -D svelte

# npm
npm install gsap
npm install -D svelte

# pnpm
pnpm add gsap
pnpm add -D svelte
```

The attachment registers ScrollTrigger when it runs in the browser. Applications do not need to register ScrollTrigger separately for this attachment, but additional GSAP plugins used by a custom tween or timeline must be imported and registered by the application.

---

## Import

Import the attachment directly from its file:

```svelte
<script lang="ts">
	import { animateInView } from "$lib/attachments/animate-in-view";
</script>
```

The file also exports these public types:

```ts
import type {
	AnimateInViewBaseOptions,
	AnimateInViewCreatedContext,
	AnimateInViewElement,
	AnimateInViewOptions,
	AnimateInViewReducedMotion,
	AnimateInViewScrollTriggerVars,
	AnimateInViewTimelineContext,
	AnimateInViewTimelineOptions,
	AnimateInViewTweenOptions,
	AnimateInViewTweenVars
} from "$lib/attachments/animate-in-view";
```

There is no attachment `index.ts`; `animate-in-view.ts` and its exported declarations are the source of truth.

---

## Basic usage

Use `from` and `to` for one tween. The attached element is both the ScrollTrigger trigger and animation target unless `target` says otherwise:

```svelte
<script lang="ts">
	import { animateInView } from "$lib/attachments/animate-in-view";
</script>

<section
	{@attach animateInView({
		from: { autoAlpha: 0, y: 24 },
		to: { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
		scrollTrigger: {
			start: "top 80%",
			end: "bottom 20%",
			toggleActions: "play reverse play reverse"
		}
	})}
>
	Latest activity
</section>
```

`animateInView` creates a paused `gsap.fromTo()` tween and gives its playback to ScrollTrigger. `scrollTrigger` accepts the native GSAP configuration except `trigger`, which is always the attached element. This example plays on entrance and reverses when the configured range is left in either direction.

---

## Examples

### Observe a wrapper and animate its child

Keep the trigger in normal document flow and target a descendant when large transforms, pinning, or independent layout measurements are involved:

```svelte
<article
	{@attach animateInView({
		target: "[data-animation-target]",
		from: { autoAlpha: 0, x: 48, scale: 0.96 },
		to: { autoAlpha: 1, x: 0, scale: 1, duration: 0.7, ease: "power3.out" },
		scrollTrigger: {
			start: "top 85%",
			toggleActions: "play none none reverse"
		}
	})}
>
	<div data-animation-target>Transform-safe content</div>
</article>
```

Selector targets are scoped to descendants of the attached node. A direct element reference, window, or GSAP-compatible collection can also be passed. Horizontal translations may extend a page or container's scrollable overflow; use an appropriate `overflow-x-clip` boundary when that overflow is not part of the design.

### Build a custom scrubbed timeline

The `timeline` mode receives a paused timeline plus the attached node, resolved target, scoped selector, and GSAP instance:

```svelte
<section
	{@attach animateInView({
		scrollTrigger: {
			start: "top bottom",
			end: "bottom top",
			scrub: 0.5
		},
		timeline: (timeline, { select }) => {
			timeline
				.fromTo(select("[data-heading]"), { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.35 })
				.fromTo(select("[data-progress]"), { scaleX: 0 }, { scaleX: 1, duration: 0.65, ease: "none" }, 0.35);
		}
	})}
>
	<h2 data-heading>Quarterly progress</h2>
	<div data-progress class="h-1 origin-left bg-primary"></div>
</section>
```

With `scrub`, tween durations represent proportions of the complete scroll range rather than wall-clock seconds. The example gives 35% of the range to the heading and 65% to the progress bar. Reverse scrolling moves the same timeline backward from its current position without starting a separate exit animation.

The builder can use every timeline method, including labels, relative positions, staggers, repeats, callbacks, and values provided by registered GSAP plugins. Do not start the timeline manually inside the builder; ScrollTrigger owns playback after the builder returns.

### Use a custom scroll container

Pass the bound container through ScrollTrigger's native `scroller` option:

```svelte
<script lang="ts">
	import { animateInView } from "$lib/attachments/animate-in-view";

	let scroller = $state<HTMLElement>();
</script>

<div bind:this={scroller} class="h-80 overflow-y-auto">
	<section
		{@attach animateInView({
			from: { autoAlpha: 0, y: 20 },
			to: { autoAlpha: 1, y: 0, duration: 0.5 },
			scrollTrigger: {
				scroller,
				start: "top 75%"
			}
		})}
	>
		Container-aware content
	</section>
</div>
```

When a reactive value read by the attachment expression changes, Svelte detaches the previous instance and creates a new one. The old GSAP context and ScrollTrigger are reverted first.

### Pin and snap a timeline

Native ScrollTrigger configuration remains available without xvelte-specific translations:

```svelte
<section
	{@attach animateInView({
		scrollTrigger: {
			start: "top top",
			end: "+=1200",
			pin: true,
			scrub: 0.8,
			snap: "labelsDirectional"
		},
		timeline: (timeline, { select }) => {
			timeline
				.addLabel("intro")
				.from(select("[data-intro]"), { autoAlpha: 0, scale: 0.9 })
				.addLabel("details")
				.from(select("[data-details]"), { autoAlpha: 0, y: 24 })
				.addLabel("complete")
				.to(select("[data-meter]"), { scaleX: 1, ease: "none" });
		}
	})}
>
	...
</section>
```

Pinning can insert a GSAP-managed spacer and temporarily change positioning. Test pinned layouts at every responsive breakpoint and avoid nesting a pinned trigger inside a transformed ancestor unless the ScrollTrigger configuration deliberately handles that layout.

### Access the created instances

`onCreate` runs after the tween or timeline is built and, under normal motion, after its ScrollTrigger is created:

```svelte
<section
	{@attach animateInView({
		from: { autoAlpha: 0 },
		to: { autoAlpha: 1 },
		onCreate: ({ animation, scrollTrigger, reducedMotion }) => {
			console.log({ animation, scrollTrigger, reducedMotion });
		}
	})}
>
	Diagnostics
</section>
```

The callback can run again when the user's reduced-motion preference changes because GSAP reverts the previous media-query setup and creates the matching one. Do not retain an instance after its setup has been reverted.

### Select a reduced-motion policy

```svelte
<div
	{@attach animateInView({
		from: { scaleX: 0 },
		to: { scaleX: 1, ease: "none" },
		reducedMotion: "allow",
		scrollTrigger: { scrub: true }
	})}
>
	Scroll position
</div>
```

Use `"allow"` only when motion is essential to the requested interaction or the properties provide functional state such as a scroll-position meter. The default `"finish"` applies the animation's final state immediately without creating ScrollTrigger. `"skip"` leaves the element's authored styles untouched and creates no animation.

---

## Public API

### `animateInView(options)`

```ts
function animateInView(options: AnimateInViewOptions): Attachment<AnimateInViewElement>;
```

`AnimateInViewElement` is `HTMLElement | SVGElement`. `AnimateInViewOptions` is a union of `AnimateInViewTweenOptions` and `AnimateInViewTimelineOptions`; supplying both direct tween properties and a timeline is a type error.

### Shared options

| Option          | Type                                             | Default          | Behavior                                                                                              |
| --------------- | ------------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `target`        | `gsap.DOMTarget`                                 | Attached element | Element, scoped selector, window, or collection animated by direct mode and exposed to timeline mode. |
| `scrollTrigger` | `AnimateInViewScrollTriggerVars`                 | `{}`             | Native `ScrollTrigger.Vars` except `trigger`; the attachment supplies the trigger and animation.      |
| `reducedMotion` | `"skip" \| "finish" \| "allow"`                  | `"finish"`       | Chooses whether reduced motion omits, immediately completes, or preserves scroll animation.           |
| `disabled`      | `boolean`                                        | `false`          | Returns an inert attachment without registering GSAP or creating animation state.                     |
| `onCreate`      | `(context: AnimateInViewCreatedContext) => void` | `undefined`      | Receives each animation and the ScrollTrigger created for the current media-query setup.              |

`AnimateInViewScrollTriggerVars` preserves ScrollTrigger options such as `scroller`, `start`, `end`, `scrub`, `pin`, `snap`, `once`, `toggleActions`, markers, refresh behavior, and callbacks. Refer to the [official ScrollTrigger API](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) for their complete semantics.

### Direct tween mode

```ts
type AnimateInViewTweenOptions = AnimateInViewBaseOptions & {
	from: AnimateInViewTweenVars;
	to: AnimateInViewTweenVars;
	timeline?: never;
};
```

| Option | Type                     | Behavior                                                                                              |
| ------ | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `from` | `AnimateInViewTweenVars` | Starting properties passed to `gsap.fromTo()`.                                                        |
| `to`   | `AnimateInViewTweenVars` | Ending properties, duration, easing, callbacks, stagger, keyframes, and registered-plugin properties. |

`AnimateInViewTweenVars` is GSAP's `TweenVars` without `paused` and `scrollTrigger`. The attachment forces the tween to start paused and creates exactly one controlling ScrollTrigger. Those fields are also removed at runtime if an untyped object spread supplies them.

### Timeline mode

```ts
type AnimateInViewTimelineOptions = AnimateInViewBaseOptions & {
	timeline: (timeline: gsap.core.Timeline, context: AnimateInViewTimelineContext) => void;
	from?: never;
	to?: never;
};
```

The builder receives an empty paused timeline and this context:

| Field    | Type                      | Behavior                                                                |
| -------- | ------------------------- | ----------------------------------------------------------------------- |
| `node`   | `AnimateInViewElement`    | Attached element used as the selector scope and ScrollTrigger trigger.  |
| `target` | `gsap.TweenTarget`        | Resolved `target`, or `node` when no separate target was provided.      |
| `select` | `gsap.utils.SelectorFunc` | Selects descendants without leaking matching elements outside the node. |
| `gsap`   | `typeof gsap`             | The same registered GSAP instance used internally by the attachment.    |

### Created context

`AnimateInViewCreatedContext` adds these fields to `AnimateInViewTimelineContext`:

| Field           | Type                  | Behavior                                                                                          |
| --------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| `animation`     | `gsap.core.Animation` | Direct tween or custom timeline created for the current setup.                                    |
| `scrollTrigger` | `ScrollTrigger`       | Controlling instance; omitted when `reducedMotion="finish"` completes without scroll observation. |
| `reducedMotion` | `boolean`             | Whether the current media-query setup matches reduced motion.                                     |

---

## ScrollTrigger behavior and lifecycle

- The attachment runs only in the browser. It registers ScrollTrigger, then creates one GSAP context scoped to the attached element.
- Direct mode creates one paused `gsap.fromTo()` tween. Timeline mode creates one paused timeline and synchronously calls the builder to populate it.
- Under normal motion, one ScrollTrigger receives the attached node as `trigger` and the created tween or timeline as `animation`.
- ScrollTrigger calculates start and end positions from normal document flow and updates animation state in sync with scrolling. It refreshes its measurements for supported resize and refresh events.
- `scrub: true` maps animation progress directly to scroll progress. A numeric value adds catch-up smoothing in seconds.
- `toggleActions` controls play, pause, resume, restart, reset, complete, and reverse behavior at the four directional boundaries when `scrub` is not controlling progress.
- Selector strings passed through `target` or `select()` are scoped to the attached element through `gsap.context()`.
- GSAP's match-media context recreates the setup when reduced-motion preference changes.
- Svelte detachment calls `context.revert()`, which reverts media-query setup, kills the owned animation and ScrollTrigger, removes pinning state, and restores GSAP-managed inline styles.

The attachment does not automatically call `ScrollTrigger.refresh()` after unrelated asynchronous layout changes. Call the official refresh API from application code after fonts, images, accordions, injected content, or other layout work changes positions without a normal ScrollTrigger refresh event.

---

## Styling and DOM contract

The attachment renders no element, adds no class or `data-*` attribute, and requires no xvelte CSS variable or global animation stylesheet. GSAP writes inline styles for animated CSS properties and may use transform matrices while an animation is active. Cleanup reverts the GSAP-owned changes to their pre-attachment values.

The attached node is the stable trigger. `target` controls what is animated and may be the same node, a descendant selector, a direct reference, or a collection. Prefer a descendant target when the trigger's normal-flow geometry must remain independent of a large transform.

Pinning is a ScrollTrigger-owned DOM behavior: it can add a spacer and adjust positioning while active. These nodes and inline styles are implementation details of GSAP, not stable xvelte styling hooks.

`animateInView` does not depend on `animations.css`. Avoid running a CSS animation and a GSAP tween that both own `transform`, `filter`, `opacity`, or another complete property on the same element at the same time; use separate wrappers when effects must compose.

---

## Accessibility

Animation must remain supplementary to content and state. Keep meaningful content available without scrolling through a decorative sequence, do not require motion to understand instructions, and do not pin interfaces in ways that trap keyboard or screen-magnification users.

The default `reducedMotion="finish"` creates the tween or timeline, immediately applies its final state, and skips ScrollTrigger. It is suitable for decorative reveals because the content remains visible without movement. `"skip"` preserves authored styles and is useful when those styles are already the accessible final presentation. `"allow"` must be chosen deliberately for functional scroll-linked output or motion the application has separately determined should remain.

Opacity and transforms do not remove interactive descendants from the accessibility tree. Do not leave focusable controls visually hidden at the initial scroll position unless their focusability, visibility, and reading order are managed independently. ScrollTrigger does not announce progress or state changes; provide semantic values and accessible names for functional meters or controls.

---

## Localization

`animateInView` contains no human-readable copy and requires no localization messages. GSAP selector strings, property names, labels, and ScrollTrigger positions are technical values and are not translated. The application supplies and translates any visible content, status, instruction, or accessible name animated by the attachment.

---

## Dependencies

Install the packages shown in [Installation](#installation). `gsap` is a runtime dependency and Svelte is a development dependency used for the attachment type and `{@attach ...}` syntax.

GSAP includes ScrollTrigger in the package, but ScrollTrigger is imported and registered separately by `animate-in-view.ts`. GSAP 3.15.1 is distributed under the [GSAP Standard License](https://gsap.com/standard-license/); review that dependency license for the app's distribution and usage rather than assuming it inherits xvelte's MIT license.

No Tailwind CSS setup, global stylesheet, semantic token, keyframe, icon export, `$lib/utils` helper, UI component, hook, other attachment, context module, localization message, image, font, or network service is required. The examples use Tailwind classes only for presentation.

Additional GSAP plugins are optional. Install or import them from the GSAP package according to their official documentation, register them with `gsap.registerPlugin(...)`, and then use their tween properties inside `from`, `to`, or `timeline`. The attachment registers only ScrollTrigger.

---

## File organization

| File                 | Responsibility                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `animate-in-view.ts` | Exported types, tween/timeline creation, ScrollTrigger ownership, scoped targets, reduced motion, cleanup. |
| `animate-in-view.md` | Installation, usage, complete API, lifecycle, accessibility, styling, and dependency guide.                |

`animate-in-view.ts` and its exported declarations are the source of truth for the public API.

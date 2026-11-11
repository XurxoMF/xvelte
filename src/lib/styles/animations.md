# Animations

Composable Tailwind CSS utilities for entrance, exit, loop, disclosure, and caret animations, with configurable opacity, blur, scale, rotation, translation, timing, repetition, direction, and fill behavior. Every animation reduces to one `1ms` iteration for people who prefer reduced motion. Use the utilities when component state already controls when an animation starts; they do not observe viewport visibility or delay DOM removal by themselves.

<!-- xvelte-example: overview -->

## Contents

- [Import](#import)
- [Basic usage](#basic-usage)
- [Examples](#examples)
- [Public API](#public-api)
- [Styling and browser behavior](#styling-and-browser-behavior)
- [Accessibility](#accessibility)
- [Localization](#localization)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Import

Import the stylesheet after Tailwind in the global stylesheet of an app that needs the utilities:

```css
@import "tailwindcss";
@import "../lib/styles/animations.css";
```

The import registers Tailwind theme values, keyframes, and utilities; it does not add a JavaScript export.

---

## Basic usage

Combine one base animation with any number of matching effect utilities:

```svelte
<div class="animate-in animation-duration-300 animation-ease-out fade-in-0 zoom-in-95 slide-in-from-bottom-4">New content</div>
```

`animate-in` runs from the configured entrance values to the element's ordinary styles. `animate-out` runs from the ordinary styles to the configured exit values. Effects remain independent, so opacity, blur, scale, rotation, and translation can be combined on one element.

Use `animateInView` from `$lib/attachments/animate-in-view` when animation must follow viewport position, scroll progress, direction, velocity, pinning, snapping, or a custom GSAP timeline. Keep ordinary entrance, exit, loop, disclosure, and caret effects in this stylesheet so basic state animation does not require JavaScript.

---

## Examples

### State-driven entrance and exit

Keep both effect groups on the element and use a state variant to select the animation:

```svelte
<div
	data-state={open ? "open" : "closed"}
	class="animation-duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
>
	Panel content
</div>
```

The controlling component must keep the element mounted long enough for an exit animation to finish. A class cannot postpone an `{#if}` removal by itself; use a primitive with presence management or a Svelte `out:` transition when removal timing belongs to Svelte.

### Timing, repetition, and arbitrary values

```svelte
<span class="animate-in animation-delay-150 animation-duration-[450ms] animation-ease-out animation-fill-both fade-in-0 blur-in-[6px]">Connected</span
>

<span class="animate-in animation-duration-1000 animation-repeat-infinite animation-direction-alternate spin-in-1/2">Working</span>
```

Use the `animation-*` controls when only an animation property should change. Tailwind's built-in `duration-*` and `ease-*` utilities remain fallback inputs for existing component classes, but they can also affect CSS transitions on the same element and are not the preferred API for new animation code.

### Loops

`animate-loop` repeats indefinitely by default. Loop effects reach their configured value halfway through each iteration and return to the element's ordinary style at the end, so one iteration is one complete cycle:

```svelte
<div class="animate-loop animation-duration-2000 fade-loop-80 slide-loop-to-top-2 zoom-loop-105">Synchronizing</div>
```

Add an integer suffix to limit the number of complete cycles. This example runs five times and then stops:

```svelte
<div class="animate-loop-5 animation-duration-700 spin-loop-6">Attention requested</div>
```

`animation-repeat-*` can also override the iteration count. Prefer `animate-loop-<count>` when the count belongs to the loop declaration itself.

### Logical slide directions

```svelte
<div class="animate-in slide-in-from-start-6">Appears from the inline start edge</div>
<div class="animate-out slide-out-to-end-6">Leaves through the inline end edge</div>
```

The `start` and `end` forms follow the element's text direction. Use `left` and `right` when the movement must remain physical.

### Disclosure and caret animations

```svelte
<div class="animate-accordion-down overflow-hidden">Accordion content</div>
<span class="animate-caret-blink" aria-hidden="true">|</span>
```

Accordion and collapsible animations read the height variables provided by their supported primitives. Keep `overflow-hidden` on disclosure content when content should not paint outside the animated height.

---

## Public API

`animations.css` is the source of truth for the generated classes and accepted Tailwind values.

### Base and ready-to-use animations

| Utility                                              | Effect                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `animate-in`                                         | Animate from the configured entrance values to the element's ordinary styles. |
| `animate-out`                                        | Animate from the element's ordinary styles to the configured exit values.     |
| `animate-loop`                                       | Run a complete ordinary → configured → ordinary cycle indefinitely.           |
| `animate-loop-<count>`                               | Run the loop for an integer number of complete cycles.                        |
| `animate-accordion-down`, `animate-accordion-up`     | Animate supported accordion content between zero and its measured height.     |
| `animate-collapsible-down`, `animate-collapsible-up` | Animate supported collapsible content between zero and its measured height.   |
| `animate-caret-blink`                                | Run the built-in repeating caret blink.                                       |

### Effect utilities

| Utility family                                                             | Effect                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `fade-in`, `fade-in-<percentage>`                                          | Start an entrance at zero opacity or a specified opacity.                            |
| `fade-out`, `fade-out-<percentage>`                                        | End an exit at zero opacity or a specified opacity.                                  |
| `blur-in`, `blur-in-<size>`                                                | Start an entrance blurred; the unsuffixed value is `20px`.                           |
| `blur-out`, `blur-out-<size>`                                              | End an exit blurred; the unsuffixed value is `20px`.                                 |
| `zoom-in`, `zoom-in-<scale>`, `-zoom-in-<scale>`                           | Set the entrance scale, including negative values.                                   |
| `zoom-out`, `zoom-out-<scale>`, `-zoom-out-<scale>`                        | Set the exit scale, including negative values.                                       |
| `spin-in`, `spin-in-<rotation>`, `-spin-in`, `-spin-in-<rotation>`         | Set the entrance rotation; the unsuffixed magnitude is `30deg`.                      |
| `spin-out`, `spin-out-<rotation>`, `-spin-out`, `-spin-out-<rotation>`     | Set the exit rotation; the unsuffixed magnitude is `30deg`.                          |
| `slide-in-from-<direction>`, `slide-in-from-<direction>-<distance>`        | Set entrance translation from `top`, `bottom`, `left`, `right`, `start`, or `end`.   |
| `slide-out-to-<direction>`, `slide-out-to-<direction>-<distance>`          | Set exit translation toward `top`, `bottom`, `left`, `right`, `start`, or `end`.     |
| `fade-loop`, `fade-loop-<percentage>`                                      | Set opacity at the midpoint of a loop.                                               |
| `blur-loop`, `blur-loop-<size>`                                            | Set blur at the midpoint of a loop.                                                  |
| `zoom-loop`, `zoom-loop-<scale>`, `-zoom-loop-<scale>`                     | Set scale at the midpoint of a loop, including negative values.                      |
| `spin-loop`, `spin-loop-<rotation>`, `-spin-loop`, `-spin-loop-<rotation>` | Set rotation at the midpoint of a loop.                                              |
| `slide-loop-to-<direction>`, `slide-loop-to-<direction>-<distance>`        | Set midpoint translation toward `top`, `bottom`, `left`, `right`, `start`, or `end`. |

Percentage, scale, rotation, blur, and distance families accept their documented Tailwind theme values and arbitrary values. Slide distances also accept spacing integers, fractions, lengths, percentages, and `full` where Tailwind resolves them.

### Animation controls

| Utility                                                                                                                               | Effect                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `animation-duration-<milliseconds>`                                                                                                   | Set only the animation duration; duration theme values and arbitrary durations are also accepted. |
| `animation-delay-<milliseconds>`                                                                                                      | Set the animation delay from built-in values, a number, or an arbitrary duration.                 |
| `animation-ease-<easing>`                                                                                                             | Set animation timing from Tailwind's easing theme or an arbitrary value.                          |
| `animation-repeat-0`, `animation-repeat-1`, `animation-repeat-infinite`, `animation-repeat-<count>`                                   | Set the iteration count.                                                                          |
| `animation-direction-normal`, `animation-direction-reverse`, `animation-direction-alternate`, `animation-direction-alternate-reverse` | Set the animation direction.                                                                      |
| `animation-fill-none`, `animation-fill-forwards`, `animation-fill-backwards`, `animation-fill-both`                                   | Set how keyframe styles apply before and after playback.                                          |
| `animation-running`, `animation-paused`, `animation-play-state-<value>`                                                               | Set the animation play state.                                                                     |

The control families accept arbitrary values where their CSS property permits one, such as `animation-delay-[1.2s]`, `animation-ease-[cubic-bezier(0.2,0.8,0.2,1)]`, or `animation-play-state-[paused]`.

### CSS custom properties

The utilities set non-inheriting `--xv-animation-*`, `--xv-enter-*`, `--xv-exit-*`, and `--xv-loop-*` properties. `--xv-reduced-animation-duration`, `--xv-reduced-animation-delay`, and `--xv-reduced-animation-iteration-count` inherit from the root only while reduced motion is requested. These properties are stable xvelte implementation hooks, but the public classes remain the preferred composition API.

---

## Styling and browser behavior

Entrance effects share `xv-enter`, exit effects share `xv-exit`, and loop effects share `xv-loop`, so opacity, blur, scale, rotation, and both translation axes compose on the same element. Entrance and exit animations default to `150ms`, `ease`, one iteration, normal direction, and no fill mode. Loops default to `1s ease-in-out` and infinite complete cycles. Accordion and collapsible animations default to `200ms ease-out`.

The transform keyframes own the complete `transform` property and the blur effect owns the complete `filter` property while the animation runs. Existing transforms or filters on the same element can therefore be replaced during playback; animate a wrapper when those properties must remain independent. Another utility that assigns the complete `animation` property can likewise replace these animations.

Logical `start` and `end` slides follow `dir`. Registered custom properties do not inherit into descendants, preventing a parent animation's values from altering a nested animation.

---

## Accessibility

Under `prefers-reduced-motion: reduce`, every animation in this stylesheet uses a `1ms` duration, zero delay, and one iteration. The animation still starts and ends, preserving `animationend` for primitives that coordinate presence or delayed DOM removal. The `animation-duration-*`, `animation-delay-*`, `animation-repeat-*`, and finite-loop utilities repeat those reduced-motion overrides with `!important` so their longhand declarations cannot restore motion accidentally.

Do not use animation as the only indication of a state change. Preserve focus, announcements, labels, and visibility independently of the visual effect. Avoid indefinite movement except for concise progress feedback, and make decorative blinking content hidden from assistive technology.

---

## Localization

Animations contains no human-readable copy and requires no localization messages. Logical slide directions respond to the document or element direction; physical left and right directions intentionally do not.

---

## Dependencies

Animations requires Tailwind CSS 4. Install it as a development dependency when the app does not already provide it:

```sh
# Bun
bun add -D tailwindcss

# npm
npm install -D tailwindcss

# pnpm
pnpm add -D tailwindcss
```

Copy `animations.css` and `animations.md` into `src/lib/styles`, then add the import shown in [Import](#import). No animation package is required. The style uses Tailwind's spacing, duration, easing, rotation, blur, and translation values; `--tw-duration` and `--tw-ease` remain compatibility fallbacks for existing Tailwind classes. It requires no xvelte semantic color, icon, JavaScript helper, component, hook, attachment, context module, localization message, or additional shared style.

Accordion and collapsible presets require a component or primitive that provides one of the supported measured-height variables. Copy the relevant xvelte component and follow its own guide instead of assuming that a height variable exists globally.

---

## Credits

The entrance, exit, disclosure, and caret foundations are adapted from [tw-animate-css 1.4.0](https://github.com/Wombosvideo/tw-animate-css/tree/v1.4.0), originally created by Luca Bosin/Wombosvideo and distributed under the MIT License. Xvelte adds its own namespaced internals, animation-only controls, complete-cycle loop API, and automatic reduced-motion behavior; the repository-level `LICENSE` retains the upstream copyright notice.

---

## File organization

| File             | Responsibility                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `animations.css` | Registered properties, theme values, keyframes, ready-to-use animations, and composable Tailwind utilities. |
| `animations.md`  | Installation, complete utility families, behavior, limitations, dependencies, and examples.                 |

`animations.css` is the source of truth for the available classes, keyframes, and custom properties.

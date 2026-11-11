# Shimmer

A current-color text shimmer with configurable color, duration, spread, angle, repetition, direction, reduced-motion handling, and right-to-left support. Use it for short-lived processing or generation feedback; do not use perpetual motion as decoration or as the only status announcement.

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

Import the stylesheet after Tailwind in the global stylesheet of an app that needs the utility:

```css
@import "tailwindcss";
@import "../lib/styles/shimmer.css";
```

The import registers Tailwind utilities; it does not add a JavaScript export.

---

## Basic usage

```svelte
<p class="shimmer font-medium">Generating preview</p>
```

The base color comes from `currentColor`, so ordinary text-color utilities determine the non-highlighted part of the gradient.

---

## Examples

Combine modifiers on the same element:

```svelte
<p class="shimmer font-semibold shimmer-angle-45 shimmer-color-primary shimmer-duration-1200 shimmer-spread-16">Synchronizing changes</p>
```

Run a single pass in the opposite direction or disable an inherited shimmer:

```svelte
<p class="shimmer shimmer-once shimmer-reverse">Upload complete</p><p class="shimmer shimmer-none">Ready</p>
```

Colors accept theme names, arbitrary colors, and an optional opacity modifier:

```svelte
<p class="shimmer shimmer-color-sky-400/70">Processing audio</p><p class="shimmer shimmer-color-[oklch(0.75_0.18_80)]">Rendering image</p>
```

---

## Public API

The CSS file is the source of truth for these classes.

| Utility                           | Effect                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `shimmer`                         | Apply the animated text-clipped gradient.                                                  |
| `shimmer-once`                    | Run one iteration instead of looping.                                                      |
| `shimmer-reverse`                 | Reverse the animation direction.                                                           |
| `shimmer-none`                    | Remove the gradient and restore the current text color.                                    |
| `shimmer-color-<color>`           | Set a Tailwind theme color or arbitrary color; supports an opacity modifier such as `/60`. |
| `shimmer-duration-<milliseconds>` | Set the animation duration, for example `shimmer-duration-1200`.                           |
| `shimmer-spread-<size>`           | Set the highlight spread from a spacing integer, length, or percentage.                    |
| `shimmer-angle-<degrees>`         | Set the highlight angle from an integer degree value.                                      |

| CSS custom property   | Purpose                                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| `--shimmer-color`     | Highlight color; defaults to a translucent derivative of `currentColor`. |
| `--shimmer-duration`  | Animation duration; defaults to `2s`.                                    |
| `--shimmer-spread`    | Highlight width; defaults to `calc(3ch + 40px)`.                         |
| `--shimmer-angle`     | Angle offset; defaults to `20deg`.                                       |
| `--shimmer-image`     | Complete background-image override; `shimmer-none` sets it to `none`.    |
| `--shimmer-text-fill` | WebKit text-fill override; `shimmer-none` restores `currentColor`.       |

---

## Styling and browser behavior

Shimmer creates a non-repeating gradient wider than the text, clips it to the glyphs, and animates its background position. Dark mode derives a brighter default highlight. Right-to-left documents reverse the base animation automatically; adding `shimmer-reverse` reverses the declared direction and should be checked in both document directions when direction is semantically important.

Under `prefers-reduced-motion: reduce`, the animation and gradient are removed and the original text color remains visible. `shimmer-none` provides the same static presentation for application state or responsive variants.

Because the utility owns `background-image`, `background-position`, text clipping, text fill, and `animation`, competing declarations on the same element can replace the effect. Wrap the text when another background or animation is also required.

---

## Accessibility

Animation is automatically disabled for reduced-motion preferences. Keep the text meaningful when static and use shimmer only as visual reinforcement. If the text reports a changing asynchronous status, expose that status with appropriate semantics such as `role="status"` or an existing live region; the utility itself does not announce changes.

Avoid an indefinite shimmer on long passages, controls, error messages, or content that people must read continuously. Ensure the base and highlighted colors remain legible in both light and dark themes.

---

## Localization

Shimmer contains no built-in copy and requires no localization messages. The app supplies and translates the animated text. The animation reverses automatically in right-to-left documents.

---

## Dependencies

Shimmer requires Tailwind CSS 4. Install it as a development dependency when the app does not already provide it:

```sh
# Bun
bun add -D tailwindcss

# npm
npm install -D tailwindcss

# pnpm
pnpm add -D tailwindcss
```

Copy `shimmer.css` and `shimmer.md` into `src/lib/styles`, then add the import shown in [Import](#import). The utility uses `currentColor` and Tailwind's color and spacing values but requires no xvelte semantic token, icon, JavaScript helper, component, hook, attachment, context module, localization message, or additional shared style.

---

## Credits

The implementation is adapted from the [shadcn-svelte Shimmer utility](https://www.shadcn-svelte.com/docs/utils/shimmer) for xvelte's standalone style organization and documentation.

---

## File organization

| File          | Responsibility                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `shimmer.css` | Registered properties, keyframes, direction and motion handling, and Tailwind utility definitions. |
| `shimmer.md`  | Installation, API, behavior, and usage guide.                                                      |

`shimmer.css` is the source of truth for the available classes and custom properties.

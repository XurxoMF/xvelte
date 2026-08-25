# Video Player

A self-contained video player with a poster, WebVTT captions, custom playback and volume controls, buffering feedback, autoplay handling, and fullscreen support. Use it when the local visual treatment and compact API fit the experience. Prefer a native `<video controls>` element or a more complete player when you need broad media-format handling, keyboard shortcuts, configurable tracks, or production-ready accessible controls without modifying this component.

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
	import * as VideoPlayer from "$lib/components/ui/video-player";
</script>
```

Video Player's `index.ts` exports `Root` and the `RootProps` type.

## Anatomy

Video Player has one public part:

```svelte
<VideoPlayer.Root src="/videos/launch.mp4" captions="/captions/launch.en.vtt" />
```

`Root` renders a fixed-aspect container, a native `<video>` without native controls, one default captions track, and local overlays for loading, play/pause, volume, time, and fullscreen.

## Basic usage

```svelte
<script lang="ts">
	import * as VideoPlayer from "$lib/components/ui/video-player";
</script>

<VideoPlayer.Root src="/videos/product-tour.mp4" poster="/images/product-tour-poster.webp" captions="/captions/product-tour.en.vtt" />
```

Place the media, poster, and WebVTT file in your app's static assets or provide URLs that the browser can load.

## Examples

### Looping background-style playback

Browsers generally require autoplaying media to start muted. The component retries a rejected autoplay request after muting the video, but setting `muted` communicates the intended behavior clearly:

```svelte
<VideoPlayer.Root src="/videos/ambient-loop.mp4" poster="/images/ambient-loop.webp" captions="/captions/ambient-loop.en.vtt" autoplay muted loop />
```

`muted` initializes the player only when the component mounts. Changing that prop later does not update the internal mute state.

### Custom sizing

The player fills the available width and keeps a 16:9 aspect ratio. Override local presentation through `class`:

```svelte
<VideoPlayer.Root
	src="/videos/interview.mp4"
	poster="/images/interview.webp"
	captions="/captions/interview.en.vtt"
	class="mx-auto max-w-3xl rounded-none shadow-none"
/>
```

The built-in `min-w-75` class may cause horizontal overflow in containers narrower than 18.75rem; override it with `min-w-0` when necessary.

## Public API

### `VideoPlayer.Root`

Type: `RootProps`. This is a purpose-built API and is not based on native video or div attributes.

| Prop       | Type      | Default     | xvelte behavior                                                                                                    |
| ---------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `src`      | `string`  | Required    | Sets the native video's media URL.                                                                                 |
| `captions` | `string`  | Required    | Sets the URL of one default `<track kind="captions">`.                                                             |
| `poster`   | `string`  | `undefined` | Sets the native video poster.                                                                                      |
| `autoplay` | `boolean` | `false`     | Calls `play()` after mounting; if that rejects, mutes the video and tries once more.                               |
| `loop`     | `boolean` | `false`     | Forwards the native `loop` attribute.                                                                              |
| `muted`    | `boolean` | `false`     | Sets the initial muted state. Later prop changes are not observed because controls own the state after mounting.   |
| `class`    | `string`  | `undefined` | Merged after the root container's built-in classes with `cn`, so conflicting Tailwind utilities can override them. |

The component does not expose `ref`, `children`, `controls`, `preload`, `playsinline`, multiple sources or tracks, native video events, control labels, or arbitrary HTML attributes. Its `index.ts` and exported types are the source of truth.

### Built-in behavior

- Clicking the video or play overlays toggles playback.
- Controls appear on pointer movement, remain visible while paused, and hide after 2.5 seconds while playing.
- The progress range updates `currentTime`; the volume control uses xvelte Slider on a `0` to `100` scale with a step of `1`.
- Unmuting restores the last non-zero volume. Moving the Slider above zero also unmutes playback.
- While the mute button is focused, `ArrowUp` and `ArrowDown` change volume by one percentage point; raising it from mute starts at 1%.
- The time display uses `m:ss` and does not show hours.
- The fullscreen button requests fullscreen on the root container. Fullscreen state is not synchronized through a `fullscreenchange` listener, so browser- or keyboard-initiated exits can leave its icon stale.
- There is no media error state; a failed source can leave the loading overlay visible.

## Styling and DOM contract

The stable local hook is:

| Element          | Hook                       |
| ---------------- | -------------------------- |
| Player container | `data-slot="video-player"` |

The root uses `aspect-video`, full width, `min-w-75`, a black background, `rounded-xl`, and `shadow-lg`. Internal controls deliberately use black and white overlays rather than semantic theme surfaces. Bottom icon buttons and the volume thumb override the global semantic ring with a white 50%-opacity halo that remains legible over video. The full-size play overlay moves that halo to its visible circular control instead of outlining the entire player.

`class` applies only to the root container. Internal loading, control, slider, and icon elements have no video-specific public `data-slot` hooks. The volume control exposes Slider's stable track, range, and thumb hooks. Component-scoped CSS hides the native thumb of the transparent progress range; its visual track mirrors keyboard focus with a white ring.

Hidden controls ignore pointer input, become visible when keyboard focus enters them, and expand the volume Slider on both hover and `focus-within`.

The player uses `cn`, so later conflicting Tailwind utilities passed through `class` win where `tailwind-merge` recognizes the conflict.

## Accessibility

The captions URL is required and rendered as a default captions track, but the local API does not expose the track's `srclang` or `label`. Supply a valid WebVTT file whose language matches the media; multilingual tracks are not supported.

The current component has significant accessibility limitations:

- The root uses `role="application"`, which can change a screen reader's normal browsing behavior.
- Play, mute, and fullscreen buttons are icon-only and have no built-in accessible names.
- The progress range has no label. The volume Slider is keyboard operable, but the current Slider wrapper does not expose thumb props for an accessible name.
- The volume button supports `ArrowUp` and `ArrowDown` while focused. The progress range retains its native keyboard behavior; there are no player-wide media shortcuts.
- The native `controls` attribute is not exposed.

Because the purpose-built API cannot add the missing labels or native video attributes, do not use the current component as the only production media control for an accessibility-critical experience without updating its implementation. Decorative icons should remain hidden from assistive technology once accessible button names are added.

## Localization

The component contains no translatable built-in words. Its visible time is numeric and formatted as `m:ss`.

Captions are external content and must be translated in their WebVTT files. The local API accepts only one captions URL and does not expose language selection. The unlabeled controls described in Accessibility are an implementation limitation, not text that can currently be overridden or translated.

## Dependencies

Install the runtime packages first and Tailwind CSS as a development dependency:

```sh
# Bun
bun add bits-ui @tabler/icons-svelte clsx tailwind-merge
bun add -D tailwindcss

# npm
npm install bits-ui @tabler/icons-svelte clsx tailwind-merge
npm install -D tailwindcss

# pnpm
pnpm add bits-ui @tabler/icons-svelte clsx tailwind-merge
pnpm add -D tailwindcss
```

The component requires Tailwind CSS to process its utility classes. Add the stylesheet import and the one semantic token used by its focus rings; replace the sample color with your theme value:

```css
@import "tailwindcss";

:root {
	--ring: oklch(0.709 0.01 56.259);
}

@theme inline {
	--color-ring: var(--ring);
}

@layer base {
	*:focus-visible {
		@apply border-ring ring-3 ring-ring/50 outline-none;
	}
}
```

Add these semantic icon exports to `$lib/icons.ts`:

```ts
export { default as ExitFullscreenIcon } from "@tabler/icons-svelte/icons/minimize";
export { default as FullscreenIcon } from "@tabler/icons-svelte/icons/maximize";
export { default as LoaderIcon } from "@tabler/icons-svelte/icons/loader";
export { default as PauseIcon } from "@tabler/icons-svelte/icons/player-pause";
export { default as PlayIcon } from "@tabler/icons-svelte/icons/player-play";
export { default as VolumeIcon } from "@tabler/icons-svelte/icons/volume";
export { default as VolumeLowIcon } from "@tabler/icons-svelte/icons/volume-2";
export { default as VolumeMutedIcon } from "@tabler/icons-svelte/icons/volume-off";
```

Video Player requires the `cn` helper from `$lib/utils`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

Copy the complete `$lib/components/ui/slider` folder and follow its README to install its Bits UI primitive, global variants, and shared utility types. Video Player requires no other xvelte component, hook, attachment, context, shared style, animation package, or localization runtime. Copy both Video Player source files listed under File organization and provide the media, poster when used, and captions assets from your app.

## Credits

The player is adapted from [More Shadcn's Video component](https://more-shadcn.noair.fun/docs/components/video). The API and behavior documented here describe the local xvelte Video Player implementation.

## File organization

| File                       | Responsibility                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `video-player-root.svelte` | Player state, native media element, Slider volume, controls, styling, and behavior. |
| `index.ts`                 | Public component and type exports.                                                  |
| `README.md`                | Installation and usage guide.                                                       |

The component's `index.ts` and exported `RootProps` type are the source of truth for the public API.

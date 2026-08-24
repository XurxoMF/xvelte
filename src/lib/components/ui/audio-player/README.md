# Audio Player

A composable audio player built around the native HTML audio element. It provides shared playback state, play/pause control, a seek track, elapsed and total time, mute control, and a vertical volume panel while letting your app arrange the controls.

Use Audio Player for finite audio files that need a compact, custom interface. Do not use it when native browser controls are sufficient or when the product requires playlists, buffering/error states, captions or transcripts managed by the player, playback-rate controls, live-stream duration formatting, Media Session integration, or a fully accessible range-control API without extending the component.

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
	import * as AudioPlayer from "$lib/components/ui/audio-player";
</script>
```

Audio Player's `index.ts` exports `Root`, `PlayButton`, `Slider`, `Time`, and `Volume`, together with the `RootProps`, `PlayButtonProps`, `SliderProps`, `TimeProps`, and `VolumeProps` types.

## Anatomy

Compose the controls as descendants of `Root` so they can read its audio-player context:

```svelte
<AudioPlayer.Root src="/audio/track.mp3">
	<!-- Media information supplied by your app -->
	<AudioPlayer.PlayButton aria-label="Play or pause audio" />
	<AudioPlayer.Slider />
	<AudioPlayer.Time />
	<AudioPlayer.Volume aria-label="Mute or unmute audio" />
</AudioPlayer.Root>
```

`Root` renders a native `<audio>` element without browser controls, followed by its `children`. The other parts must be placed beneath the same root; using them outside it throws because no context is available. Your app supplies the media information and arranges the controls.

## Basic usage

```svelte
<script lang="ts">
	import * as AudioPlayer from "$lib/components/ui/audio-player";
</script>

<AudioPlayer.Root src="/audio/field-recording.mp3" role="group" aria-label="Audio player: Evening field recording" class="w-full max-w-xl p-4">
	<div class="flex items-center gap-4">
		<AudioPlayer.PlayButton aria-label="Play or pause audio" />

		<div class="grid min-w-0 flex-1 gap-2">
			<AudioPlayer.Slider />
			<AudioPlayer.Time aria-live="off" />
		</div>

		<AudioPlayer.Volume aria-label="Mute or unmute audio" />
	</div>
</AudioPlayer.Root>
```

The root supplies only its card surface; the example's flex and grid classes define the actual player layout. See [Accessibility](#accessibility) before using the current range controls in production.

## Examples

### Player with track information

Any content may be composed around the public controls:

```svelte
<script lang="ts">
	import * as AudioPlayer from "$lib/components/ui/audio-player";
</script>

<AudioPlayer.Root src="/audio/northern-lights.mp3" role="group" aria-labelledby="track-title" class="max-w-lg p-4">
	<div class="mb-4 min-w-0">
		<p id="track-title" class="truncate font-medium">Northern Lights</p>
		<p class="truncate text-sm text-muted-foreground">The Observatory</p>
	</div>

	<div class="flex items-center gap-3">
		<AudioPlayer.PlayButton aria-label="Play or pause Northern Lights" />

		<div class="grid flex-1 gap-2">
			<AudioPlayer.Slider />
			<AudioPlayer.Time />
		</div>

		<AudioPlayer.Volume aria-label="Mute or unmute Northern Lights" />
	</div>
</AudioPlayer.Root>
```

### Styling the controls

`PlayButton` and `Volume` reuse the xvelte Button API. Their internal defaults can be changed with Button variant, size, and native button props:

```svelte
<AudioPlayer.Root src="/audio/preview.mp3" class="p-3">
	<div class="flex items-center gap-3">
		<AudioPlayer.PlayButton variant="default" size="icon-lg" aria-label="Play or pause preview" />
		<AudioPlayer.Slider class="h-2 rounded-full" />
		<AudioPlayer.Time class="min-w-max text-foreground" />
		<AudioPlayer.Volume variant="outline" aria-label="Mute or unmute preview" />
	</div>
</AudioPlayer.Root>
```

Do not replace the controls' `onclick` handlers through forwarded props: doing so overrides the internal play/pause or mute action. Add separate controls or extend the public component when application callbacks are required.

### Multiple independent players

Each root owns a separate native audio element and context. Controls always use their nearest root:

```svelte
{#each episodes as episode (episode.src)}
	<AudioPlayer.Root src={episode.src} role="group" aria-label={`Audio player: ${episode.title}`} class="p-4">
		<p class="mb-3 font-medium">{episode.title}</p>

		<div class="flex items-center gap-3">
			<AudioPlayer.PlayButton aria-label={`Play or pause ${episode.title}`} />
			<AudioPlayer.Slider />
			<AudioPlayer.Time />
		</div>
	</AudioPlayer.Root>
{/each}
```

The roots do not coordinate playback. Starting one player does not pause another.

## Public API

Audio Player's public API consists only of the five components and their props types exported by `index.ts`. The state class and context helpers are internal details and are not exported.

### `AudioPlayer.Root`

Type: `RootProps`, based on native `div` attributes with a required audio source and bindable outer reference.

| Prop       | Type                     | Default     | xvelte behavior                                                                              |
| ---------- | ------------------------ | ----------- | -------------------------------------------------------------------------------------------- |
| `src`      | `string`                 | Required    | Passed to the internal native `<audio>` element.                                             |
| `children` | `Snippet`                | `undefined` | Renders after the native audio element and receives no snippet parameters.                   |
| `ref`      | `HTMLDivElement \| null` | `null`      | Bindable reference to the outer player `div`; the native audio element is not exposed.       |
| `class`    | `string`                 | `undefined` | Merged with the local card surface, border, radius, shadow, text color, and overflow styles. |

Native `div` attributes are forwarded to the outer element. The internal `<audio>` receives only `src` plus internal bindings for `paused`, `currentTime`, `duration`, `volume`, and `muted`; props for `preload`, `crossorigin`, `loop`, autoplay, `<source>`, `<track>`, media events, or a native-audio ref are not part of the current public API.

Changing `src` updates the native source. Playback, load, and decode failures are not exposed through public state or callbacks.

### `AudioPlayer.PlayButton`

Type: `PlayButtonProps`, the xvelte Button root props without `children`.

| Prop      | Type                        | Default       | xvelte behavior                                                                           |
| --------- | --------------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| `variant` | `Button.RootVariants`       | `"secondary"` | Selects any public Button variant.                                                        |
| `size`    | `Button.RootSizes`          | `"icon"`      | Selects any public Button size; local classes still set the control to `3rem` by default. |
| `ref`     | `HTMLButtonElement \| null` | `null`        | Forwarded bindable reference to the Button root.                                          |
| `class`   | `string`                    | `undefined`   | Merged with the local circular size and shadow classes.                                   |

The component renders its own play or pause icon according to native playback state and therefore accepts no `children`. It forwards remaining Button and native button props. It owns the `onclick` behavior; overriding `onclick` or `data-slot` through forwarded props can break the public control or its stable DOM hook.

No accessible name is built in. You must provide an `aria-label`; because the playback state is not public, the current API cannot expose a state-specific “Play” versus “Pause” label without modifying the component.

### `AudioPlayer.Slider`

Type: `SliderProps`, based on native outer-`div` attributes with a bindable reference.

| Prop    | Type                     | Default     | xvelte behavior                                                                             |
| ------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------- |
| `ref`   | `HTMLDivElement \| null` | `null`      | Bindable reference to the visual track wrapper, not the internal range input.               |
| `class` | `string`                 | `undefined` | Merged with the local track height, width, overflow, positioning, and secondary background. |

`Slider` displays current progress as a primary-colored inner bar and overlays an invisible `input type="range"`. Its range is `0` to the native duration, with a `0.01`-second step; input seeks immediately. Native outer-`div` attributes are forwarded, but children are not rendered and there are no public props or refs for the range input, progress bar, min, max, step, accessible name, or seek callback.

### `AudioPlayer.Time`

Type: `TimeProps`, based on native `span` attributes with a bindable reference.

| Prop    | Type                      | Default     | xvelte behavior                                                       |
| ------- | ------------------------- | ----------- | --------------------------------------------------------------------- |
| `ref`   | `HTMLSpanElement \| null` | `null`      | Bindable reference to the rendered time `span`.                       |
| `class` | `string`                  | `undefined` | Merged with small, medium-weight, muted, tabular-number text styling. |

`Time` renders `current / duration` as zero-padded `m:ss`, beginning at `0:00 / 0:00`. It does not render custom children and has no modes for elapsed-only, remaining time, hours, localized formatting, or live-stream durations.

### `AudioPlayer.Volume`

Type: `VolumeProps`, the xvelte Button root props without `children`.

| Prop      | Type                        | Default     | xvelte behavior                                                                     |
| --------- | --------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `variant` | `Button.RootVariants`       | `"ghost"`   | Selects any public Button variant.                                                  |
| `size`    | `Button.RootSizes`          | `"icon"`    | Selects any public Button size; local classes set the control to `2rem` by default. |
| `ref`     | `HTMLButtonElement \| null` | `null`      | Forwarded bindable reference to the internal Button root.                           |
| `class`   | `string`                    | `undefined` | Merged with the local size, muted foreground, and foreground hover styles.          |

Clicking toggles the native muted state without discarding the selected volume. The icon represents muted/zero, low, or high volume. Hovering or keyboard-focusing the control opens a Hover Card immediately; it contains an invisible vertical range input from `0` to `1` with a `0.01` step. Changing the range updates volume but does not unmute an already muted player.

The component accepts no `children`, accessible label, volume callback, panel props, range-input props, or range ref beyond the forwarded Button attributes. Overriding `onclick` or `data-slot` can break its control behavior or stable hook.

Use `index.ts` and the exported props types as the source of truth for the public API. Button's exported types define the inherited control props.

## Styling and DOM contract

Audio Player uses semantic Tailwind tokens, the xvelte Button and Hover Card styles, `tw-animate-css` for the volume panel, and native audio state. It exposes no public CSS variables or variants of its own.

Stable xvelte hooks:

| Part         | `data-slot`                | Notable DOM behavior                                                                    |
| ------------ | -------------------------- | --------------------------------------------------------------------------------------- |
| `Root`       | `audio-player`             | Outer card `div`; contains an unstyled native `<audio>` followed by your app's content. |
| `PlayButton` | `audio-player-play-button` | xvelte Button with an internal play or pause SVG.                                       |
| `Slider`     | `audio-player-slider`      | Visual track `div` containing progress and an invisible horizontal range input.         |
| `Time`       | `audio-player-time`        | Generated `span` with tabular elapsed and duration text.                                |
| `Volume`     | `audio-player-volume`      | xvelte Button wrapped by Hover Card and paired with a portalled vertical panel.         |

The internal progress bar, native audio element, seek input, volume bar, and volume input do not have xvelte `data-slot` hooks. Volume additionally renders the public Hover Card hooks `hover-card-trigger` and `hover-card-content` from that dependency.

Classes passed to the component parts are merged after their local classes with `cn`, so conflicting Tailwind utilities favor classes from your app. The play and volume Button props are forwarded after local defaults; preserve their internal events and stable slots.

## Accessibility

The native audio element is not exposed with browser controls, so the custom controls are responsible for the complete interaction.

- Give `Root` an appropriate group or region label that identifies the track, podcast, or recording.
- `PlayButton` and `Volume` are icon-only buttons without built-in accessible names. Always provide `aria-label`. The current public state does not let your app switch the play button label between “Play” and “Pause”, so a combined label such as “Play or pause [track]” is the available fallback without changing the component.
- The seek and volume range inputs currently have no accessible names, and their props are not public. An `aria-label` placed on `Slider` labels only its outer `div`, not the input. This cannot be corrected through the current public API.
- The volume range is rendered inside a Hover Card/Link Preview whose content removes descendants from the tab order. It is therefore not a complete keyboard-accessible volume control. The mute button remains keyboard operable when labeled.
- `Volume` currently places its Button inside the default anchor rendered by `HoverCard.Trigger`, producing nested interactive semantics. This composition should be changed to render-delegate the trigger directly to the button before claiming full conformance.
- Because of these range-control limitations, extend the components to expose labeled input props or use native `<audio controls>` before treating this player as WCAG-complete in production.
- `Time` updates frequently. Avoid `aria-live` on it unless announcements are intentionally throttled; continuous elapsed-time announcements are disruptive.
- Provide a transcript for spoken content and captions or an equivalent synchronized alternative when the audio accompanies visual media. The current `Root` cannot render `<track>` inside its internal audio element.
- Do not communicate playing, muted, or progress state only through color. The icons change visually, but accessible state text is not currently exposed.

## Localization

Audio Player has no built-in translatable strings or localization messages. Your app supplies the player label, track metadata, button labels, transcript links, error messages, and other accessible text.

`Time` always uses the locale-independent `m:ss / m:ss` format with ASCII digits and a slash separator; it has no locale or formatter prop. Icon names, `data-slot` values, and media-state identifiers are implementation details and must not be translated.

## Dependencies

Audio Player expects a Svelte 5 project using Tailwind CSS 4. Install its runtime and styling packages with one of the following commands:

```sh
# bun
bun add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
bun add -D tailwindcss tw-animate-css

# npm
npm install bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
npm install -D tailwindcss tw-animate-css

# pnpm
pnpm add bits-ui @tabler/icons-svelte tailwind-variants clsx tailwind-merge
pnpm add -D tailwindcss tw-animate-css
```

The player uses the browser's native `HTMLAudioElement` and media events; no separate audio playback package is required.

### Required xvelte components

Copy these complete UI components with Audio Player:

- `$lib/components/ui/button`, used by `PlayButton` and `Volume`: copy `src/lib/components/ui/button/button-root.svelte` and `src/lib/components/ui/button/index.ts`.
- `$lib/components/ui/hover-card`, used by `Volume` for its portalled vertical volume panel: copy `src/lib/components/ui/hover-card/hover-card-root.svelte`, `src/lib/components/ui/hover-card/hover-card-trigger.svelte`, `src/lib/components/ui/hover-card/hover-card-content.svelte`, `src/lib/components/ui/hover-card/hover-card-portal.svelte`, and `src/lib/components/ui/hover-card/index.ts`.

Copy those component files unchanged. Their `index.ts` exports and types are the source of truth; follow each component's README to install any additional dependencies. Hover Card is backed by Bits UI's Link Preview primitive.

Create `src/lib/components/ui/audio-player/audio-player-context.svelte.ts` with these complete contents. The component needs this internal file, but your app should not import it directly:

```ts
import { createContext } from "svelte";

/** Owns the native audio element, reactive playback state, and player controls. */
export class AudioPlayerState {
	audio = $state<HTMLAudioElement>();
	paused = $state(true);
	duration = $state(0);
	currentTime = $state(0);
	volume = $state(1);
	muted = $state(false);

	/** Whether native playback is currently running. */
	isPlaying = $derived(!this.paused);

	constructor() {
		this.togglePlay = this.togglePlay.bind(this);
		this.seek = this.seek.bind(this);
		this.setVolume = this.setVolume.bind(this);
		this.toggleMute = this.toggleMute.bind(this);
	}

	/** Toggles playback on the native audio element. */
	togglePlay() {
		if (!this.audio) return;

		if (this.audio.paused) {
			void this.audio.play();
		} else {
			this.audio.pause();
		}
	}

	/** @param time - Playback position to seek to, in seconds. */
	seek(time: number) {
		if (!this.audio) return;

		this.audio.currentTime = time;
		this.currentTime = time;
	}

	/** @param volume - Native audio volume between 0 and 1. */
	setVolume(volume: number) {
		if (!this.audio) return;

		this.audio.volume = volume;
		this.volume = volume;
	}

	/** Toggles the native muted state without discarding the chosen volume. */
	toggleMute() {
		this.muted = !this.muted;
	}
}

const [getAudioPlayerState, setAudioPlayerState] = createContext<AudioPlayerState>();

/**
 * Provides audio-player state to descendant controls.
 *
 * @param state - Reactive state owned by `AudioPlayer.Root`.
 */
export function setAudioPlayerContext(state: AudioPlayerState) {
	return setAudioPlayerState(state);
}

/** @returns The state from the nearest audio-player root. */
export function getAudioPlayerContext() {
	return getAudioPlayerState();
}
```

No other xvelte component or internal module is required.

### Global CSS

The application stylesheet, `src/routes/layout.css` in xvelte, must load Tailwind CSS and `tw-animate-css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
```

Hover Card's `data-open:` and `data-closed:` animation utilities require the xvelte custom variants. The project also uses a class-based dark variant:

```css
@custom-variant dark (&:is(.dark *));

@custom-variant data-open {
	&:where([data-state="open"]),
	&:where([data-open]:not([data-open="false"])) {
		@slot;
	}
}

@custom-variant data-closed {
	&:where([data-state="closed"]),
	&:where([data-closed]:not([data-closed="false"])) {
		@slot;
	}
}
```

Audio Player and its required Button and Hover Card components use `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `danger`, `border`, `input`, and `ring`, plus the shared radius scale. Your theme must define and expose all of them:

```css
:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.147 0.004 49.25);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.147 0.004 49.25);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.147 0.004 49.25);
	--primary: oklch(0.841 0.238 128.85);
	--primary-foreground: oklch(0.405 0.101 131.063);
	--secondary: oklch(0.967 0.001 286.375);
	--secondary-foreground: oklch(0.21 0.006 285.885);
	--muted: oklch(0.97 0.001 106.424);
	--muted-foreground: oklch(0.553 0.013 58.071);
	--danger: oklch(0.577 0.245 27.325);
	--border: oklch(0.923 0.003 48.717);
	--input: oklch(0.923 0.003 48.717);
	--ring: oklch(0.709 0.01 56.259);
	--radius: 0.45rem;
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-danger: var(--danger);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
}
```

Define equivalent values inside `.dark` if the application supports a dark theme. The values above are xvelte's light defaults and may be replaced while preserving the semantic variable and `@theme` names. No audio-player-specific CSS variables or keyframes need to be copied; `tw-animate-css` supplies Hover Card's enter, exit, fade, zoom, and slide utilities.

### Icons

The player imports five semantic names from `$lib/icons`. The icon facade must contain these exports:

```ts
export { default as PauseIcon } from "@tabler/icons-svelte/icons/player-pause";
export { default as PlayIcon } from "@tabler/icons-svelte/icons/player-play";
export { default as VolumeHighIcon } from "@tabler/icons-svelte/icons/volume-3";
export { default as VolumeLowIcon } from "@tabler/icons-svelte/icons/volume-2";
export { default as VolumeMutedIcon } from "@tabler/icons-svelte/icons/volume-off";
```

Keep these aliases in the shared facade instead of importing Tabler directly from the components.

### Shared utilities

The player, Button, and Hover Card components import `cn`, `WithElementRef`, and `WithoutChildrenOrChild` from `$lib/utils`. `PlayButton` and `Volume` additionally use Bits UI's `WithoutChildren` helper. Add these exact local definitions to `src/lib/utils.ts` when they are not already present:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};
```

The `any` conditional types may require the same targeted ESLint exceptions used by xvelte. Audio Player does not require public hooks, attachments, localization messages, or shared styles beyond the internal context module and dependencies listed above.

## Credits

Audio Player is adapted from the [more-shadcn-svelte Audio component](https://more-shadcn.noair.fun/docs/components/audio). Its state, composition, icons, styling, types, and imports have been modified to follow xvelte conventions.

## File organization

| File                              | Responsibility                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `audio-player-root.svelte`        | Owns the native audio element, provides context, and renders the outer player surface. |
| `audio-player-play-button.svelte` | Toggles native playback and renders the current play or pause icon.                    |
| `audio-player-slider.svelte`      | Displays playback progress and seeks through the native audio timeline.                |
| `audio-player-time.svelte`        | Formats and renders current time and duration.                                         |
| `audio-player-volume.svelte`      | Toggles mute and exposes a Hover Card with a vertical native volume input.             |
| `audio-player-context.svelte.ts`  | Owns internal reactive media state and actions shared by descendant controls.          |
| `index.ts`                        | Exports every public component part and props type.                                    |

Use `index.ts` and the exported props types as the source of truth for the public API. The context module is private. If this guide and the implementation disagree, verify the installed Button, Hover Card, Bits UI, and browser media APIs and update this guide with the code change.

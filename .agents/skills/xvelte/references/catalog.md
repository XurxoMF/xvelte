# Xvelte public-unit catalog

Use this catalog for discovery only. Verify installed paths, then read the selected unit's local `<slug>.md` guide, public entry point, and exported types before using it. Component guides live at `src/lib/components/ui/<slug>/<slug>.md`; standalone guides live beside their source. A consuming project may include only a subset of these units.

## Components

All component paths are relative to `src/lib/components/ui`.

- `accordion`
- `alert` — static callouts with neutral, danger, warning, success, info, and important semantic tones
- `alert-dialog`
- `aspect-ratio`
- `attachment` — composable file and image cards with metadata, upload states, sizes, orientations, independent actions, full-card triggers, and scrollable groups
- `audio-player` — composable native audio playback with seek/time controls, Slider-based volume, semantic volume states, and one-point keyboard adjustment
- `avatar`
- `badge` — compact labels with neutral and semantic status variants
- `breadcrumb`
- `bubble` — conversational content surfaces with seven semantic variants, logical alignment, grouping, reactions, and polymorphic links or buttons
- `button` — native actions with neutral, danger, warning, success, info, and important variants
- `button-group`
- `button-hold`
- `calendar`
- `calendar-range` — responsive date-range selection with evenly distributed weekday columns and multiple-month layouts
- `canvas`
- `card`
- `carousel` — horizontal or vertical Embla carousel with responsive inside-edge navigation, touch and mouse dragging, plugins, and programmatic controls
- `chart`
- `checkbox`
- `code-block` — composable code, terminal, log, and diff output with headers, actions, copying, wrapping, numbering, row states, streaming-friendly rendering, and optional lazy Shiki highlighting
- `collapsible`
- `color-picker`
- `combobox` — searchable single or multiple selection with controlled open state, configurable filtering and positioning, disabled options, separators, and loading content
- `command`
- `compare-slider`
- `context-menu`
- `date-strip` — compact paginated date selection with locale-aware week starts and labels from the active Paraglide locale
- `dialog` — modal content with managed focus, dismissal, optional automatic overlay, and optional generated close controls
- `drawer`
- `dropdown-menu`
- `empty`
- `field`
- `file-drop-zone`
- `floating-menu`
- `footnote` — semantic footnote references, ordered definitions, and accessible return links with repeated-reference support
- `horizontal-scroll`
- `hover-card`
- `input`
- `input-group`
- `input-ipv4` — responsive four-segment IPv4 entry with internal equal-width octets, paste normalization, validation, and form submission
- `input-ipv6` — responsive eight-segment IPv6 entry with internal equal-width hextets, compressed-address paste expansion, validation, and form submission
- `input-otp`
- `input-phone` — composable international phone state, searchable country flags and Paraglide-locale country names, formatting, and validation
- `item`
- `kbd`
- `knob` — compact rotary range control with page-safe touch dragging, stepped wheel input, keyboard navigation, and double-click reset
- `label`
- `list` — semantic ordered and unordered lists with configurable spacing and reusable exported class variants
- `markdown` — headless mdast renderer for CommonMark, GFM, images, footnotes, GitHub alerts, sanitized or explicitly trusted raw HTML, safe URLs, and lazy Shiki languages
- `marker` — inline conversation statuses, system notes, bordered rows, labeled separators, decorative icons, and polymorphic links or buttons
- `menubar`
- `message` — aligned conversation rows with optional avatars, grouped messages, body columns, sender headers, statuses, timestamps, and action footers
- `message-scroller` — anchored streaming-chat scrolling with history preservation, opening positions, visibility tracking, and programmatic message jumps
- `navigation-menu`
- `pagination`
- `point-picker` — scale-preserving two-dimensional coordinate input with range-derived aspect ratio, configurable origin and grid intervals, pointer control, and keyboard control
- `popover`
- `progress`
- `qr-code`
- `questionnaire` — multi-step native forms with single, multiple, freeform, skippable, validated, shortcut-enabled, and SSR-ready questions
- `radio-group`
- `resizable`
- `scroll-area` — manually composed Root and Viewport with self-registering vertical and horizontal scrollbars plus an automatic two-axis corner
- `select`
- `separator`
- `sheet`
- `sidebar` — responsive container-bound or viewport-fixed application navigation with off-canvas, icon-collapse, and inset layout modes
- `skeleton`
- `slider`
- `sonner` — themed global toast renderer whose state icons, subtle borders, and rich states use xvelte's danger, warning, success, and info tokens, with a locally exported, fully forwarded toast runtime
- `sortable` — declarative drag-and-drop lists with internally updated bindable ID order, ordering helpers, optional lifecycle callbacks, stable drag-state attributes, and explicit handles
- `spinner`
- `star-rating`
- `status-dot`
- `stepper`
- `switch`
- `table`
- `table-of-contents`
- `tabs`
- `textarea`
- `timeline`
- `toggle`
- `toggle-group`
- `tooltip`
- `trace` — composable status rows and expandable details for agent activity, tool calls, tasks, and sources
- `tree-view`
- `typography` — semantic text primitives plus a simple Prose container for consistent document rhythm
- `video-player` — self-contained captioned video playback with focus-aware controls, Slider-based volume, semantic volume states, and one-point keyboard adjustment
- `walkthrough` — Dialog-backed modal guided tours with optional highlighted-target overlay, responsive floating placement, and keyboard navigation
- `widget-grid` — responsive declarative dashboards with headless items, collision-aware pointer and keyboard movement, and pointer and keyboard resizing

## Attachments

Paths are relative to `src/lib/attachments`.

- `animateInView` (`animate-in-view.ts`) — GSAP ScrollTrigger tweens and fully custom timelines with scoped targets,
  scrub, pin, snap, reduced-motion policies, and automatic cleanup
- `shortcut.ts`

## Hooks

Paths are relative to `src/lib/hooks`.

- `is-mobile.svelte.ts`
- `use-frecency.svelte.ts`
- `use-highlighted-code.svelte.ts` — reactive streaming syntax highlighting with lazy access to every bundled Shiki language and alias plus ANSI and plain-text fallbacks
- `use-markdown.svelte.ts` — pure and reactive CommonMark/GFM parsing to mdast with stable heading IDs and GitHub alert metadata
- `use-ramp.svelte.ts`
- `use-toc.svelte.ts`

## Styles

Paths are relative to `src/lib/styles`.

- `animations.css` — composable entrance, exit, loop, disclosure, and caret animations with modular effects, finite or infinite repetition, animation-specific timing controls, and automatic reduced-motion handling
- `scroll-fade.css` — direction-aware, scroll-position-aware edge fades for overflowing content, with physical and logical directions, independent sizing, a static browser fallback, and right-to-left support
- `shimmer.css` — a current-color text shimmer with configurable color, duration, spread, angle, repetition, direction, reduced-motion handling, and right-to-left support

## Tauri

Paths are relative to `src/lib/tauri`.

- `classes/file-system/` — reactive-ready `File` and `Directory` models with scoped creation, inspection, text and JSON I/O, recursive directory operations, extensible file subclasses, and Unix permission updates
- `hooks/is-tauri.ts` — SSR-safe `IsTauri` runtime snapshot exposing `"tauri"` or `"web"` through `current`

## Shared entry points

- `src/lib/icons.ts` — semantic icon facade
- `src/lib/utils.ts` — shared utility types and functions

## Catalog maintenance

Update this file in the same change whenever a public unit is added, removed, moved, renamed, recategorized, or gains a capability important for discovery. Do not list generated outputs such as `src/lib/paraglide`.

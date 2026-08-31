# Xvelte public-unit catalog

Use this catalog for discovery only. Verify installed paths, then read the selected unit's local `README.md`, public barrel, and exported types before using it. A consuming project may include only a subset of these units.

## Components

All component paths are relative to `src/lib/components/ui`.

- `accordion`
- `alert` — static callouts with neutral, danger, warning, success, info, and important semantic tones
- `alert-dialog`
- `aspect-ratio`
- `audio-player` — composable native audio playback with seek/time controls, Slider-based volume, semantic volume states, and one-point keyboard adjustment
- `avatar`
- `badge` — compact labels with neutral and semantic status variants
- `breadcrumb`
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
- `code` — Shiki code blocks with lazy-loaded languages, custom Scroll Area controls on both axes, fixed copy actions, and expandable overflow
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
- `markdown` — headless mdast renderer for CommonMark, GFM, GitHub alerts, xvelte components, and lazy Shiki languages
- `menubar`
- `navigation-menu`
- `pagination`
- `point-picker` — scale-preserving two-dimensional coordinate input with range-derived aspect ratio, configurable origin and grid intervals, pointer control, and keyboard control
- `popover`
- `progress`
- `qr-code`
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
- `tree-view`
- `typography` — semantic text primitives plus a simple Prose container for consistent document rhythm
- `video-player` — self-contained captioned video playback with focus-aware controls, Slider-based volume, semantic volume states, and one-point keyboard adjustment
- `walkthrough` — Dialog-backed modal guided tours with optional highlighted-target overlay, responsive floating placement, and keyboard navigation
- `widget-grid` — responsive declarative dashboards with headless items, collision-aware pointer and keyboard movement, and pointer and keyboard resizing

## Attachments

Paths are relative to `src/lib/attachments`.

- `shortcut.ts`

## Hooks

Paths are relative to `src/lib/hooks`.

- `is-mobile.svelte.ts`
- `use-frecency.svelte.ts`
- `use-markdown.svelte.ts` — pure and reactive CommonMark/GFM parsing to mdast with stable heading IDs and GitHub alert metadata
- `use-ramp.svelte.ts`
- `use-toc.svelte.ts`

## Shared entry points

- `src/lib/icons.ts` — semantic icon facade
- `src/lib/utils.ts` — shared utility types and functions

## Catalog maintenance

Update this file in the same change whenever a public unit is added, removed, moved, renamed, recategorized, or gains a capability important for discovery. Do not list generated outputs such as `src/lib/paraglide`.

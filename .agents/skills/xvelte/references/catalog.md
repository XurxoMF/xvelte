# Xvelte public-unit catalog

Use this catalog for discovery only. Verify installed paths, then read the selected unit's local `README.md`, public barrel, and exported types before using it. A consuming project may include only a subset of these units.

## Components

All component paths are relative to `src/lib/components/ui`.

- `accordion`
- `alert`
- `alert-dialog`
- `aspect-ratio`
- `audio-player`
- `avatar`
- `badge`
- `breadcrumb`
- `button`
- `button-group`
- `button-hold`
- `calendar`
- `calendar-range` — responsive date-range selection with evenly distributed weekday columns and multiple-month layouts
- `canvas`
- `card`
- `carousel`
- `chart`
- `checkbox`
- `code` — Shiki code blocks with caller-provided, on-demand language loaders
- `collapsible`
- `color-picker`
- `combobox`
- `command`
- `compare-slider`
- `context-menu`
- `date-strip`
- `dialog`
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
- `input-phone` — composable international phone state, searchable country flags, formatting, and validation
- `item`
- `kbd`
- `knob`
- `label`
- `list` — semantic ordered and unordered lists with configurable spacing and reusable exported class variants
- `menubar`
- `navigation-menu`
- `pagination`
- `point-picker` — scale-preserving two-dimensional coordinate input with range-derived aspect ratio, configurable origin and grid intervals, pointer control, and keyboard control
- `popover`
- `progress`
- `qr-code`
- `radio-group`
- `resizable`
- `scroll-area`
- `select`
- `separator`
- `sheet`
- `sidebar`
- `skeleton`
- `slider`
- `sonner` — themed global toast renderer with a locally exported, fully forwarded toast runtime
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
- `typography`
- `video`
- `walkthrough`
- `widget-grid` — responsive declarative dashboards with headless items, explicit drag, and one touch-friendly native resize handle per item

## Attachments

Paths are relative to `src/lib/attachments`.

- `shortcut.ts`

## Hooks

Paths are relative to `src/lib/hooks`.

- `is-mobile.svelte.ts`
- `use-frecency.svelte.ts`
- `use-ramp.svelte.ts`
- `use-toc.svelte.ts`

## Shared entry points

- `src/lib/icons.ts` — semantic icon facade
- `src/lib/utils.ts` — shared utility types and functions

## Catalog maintenance

Update this file in the same change whenever a public unit is added, removed, moved, renamed, recategorized, or gains a capability important for discovery. Do not list generated outputs such as `src/lib/paraglide`.

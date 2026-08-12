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
- `calendar`
- `canvas`
- `card`
- `carousel`
- `chart`
- `checkbox`
- `code`
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
- `emoji-picker`
- `empty`
- `field`
- `file-drop-zone`
- `floating-menu`
- `hold-button`
- `horizontal-scroll`
- `hover-card`
- `input`
- `input-group`
- `input-otp`
- `ipv4-input`
- `ipv6-input`
- `item`
- `kbd`
- `knob`
- `label`
- `list`
- `menubar`
- `native-select`
- `navigation-menu`
- `number-field`
- `pagination`
- `phone-input`
- `ping-indicator`
- `point-picker`
- `popover`
- `progress`
- `qr-code`
- `radio-group`
- `range-calendar`
- `resizable`
- `scroll-area`
- `select`
- `separator`
- `sheet`
- `sidebar`
- `skeleton`
- `slider`
- `sonner`
- `sortable`
- `spinner`
- `star-rating`
- `status-dot`
- `stepper`
- `switch`
- `table`
- `table-of-contents`
- `tabs`
- `tags-input`
- `textarea`
- `timeline`
- `toggle`
- `toggle-group`
- `tooltip`
- `tree-view`
- `typography`
- `video`
- `walkthrough`

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

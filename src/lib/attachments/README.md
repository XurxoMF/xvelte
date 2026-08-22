# Attachments

Svelte attachments that add reusable browser behavior to elements without rendering markup. The collection currently contains `shortcut`, a window attachment for one or more keyboard commands.

Use an attachment when behavior belongs to an existing element and must be installed and removed with that element's lifecycle. Attachments require Svelte 5 and the `{@attach ...}` syntax; they are not legacy Svelte actions and are not used with `use:`.

## Contents

- [Installation](#installation)
- [shortcut](#shortcut)
- [Credits](#credits)
- [File organization](#file-organization)

---

## Installation

Copy `src/lib/attachments/shortcut.ts` to the same path in your project. Install Svelte as a development dependency if the project does not already provide it:

```sh
# Bun
bun add -D svelte

# npm
npm install -D svelte

# pnpm
pnpm add -D svelte
```

`shortcut` uses the Svelte 5 [`Attachment`](https://svelte.dev/docs/svelte/svelte-attachments) type and is intended for `{@attach ...}`. It requires no CSS, theme variables, icons, `$lib/utils` helpers, xvelte components, hooks, localization messages, or additional files.

---

## shortcut

Registers one or more keyboard shortcuts on `<svelte:window>` and removes the listeners automatically when the attachment is detached. Matching is case-insensitive for `KeyboardEvent.key` and exact for every modifier.

Use it for app-level commands such as opening search, saving a draft, or closing an interface. Do not use it to replace visible controls, override common browser or assistive-technology commands, or capture ordinary typing without checking the event target.

### Import

Import the function and optional types directly from the attachment file:

```svelte
<script lang="ts">
	import { shortcut, type Shortcut, type ShortcutEvent } from "$lib/attachments/shortcut";
</script>
```

There is no attachment `index.ts`; `shortcut.ts` is the source of truth for its exports and API.

### Basic usage

```svelte
<script lang="ts">
	import { shortcut } from "$lib/attachments/shortcut";

	let searchOpen = $state(false);
</script>

<svelte:window
	{@attach shortcut({
		key: "k",
		meta: true,
		action: () => (searchOpen = true)
	})}
/>

{#if searchOpen}
	<div role="dialog" aria-label="Search">...</div>
{/if}
```

The example matches Command-K only. Because modifier matching is exact, Command-Shift-K does not match unless `shift: true` is included in another shortcut.

### Examples

#### Register multiple shortcuts

```svelte
<script lang="ts">
	import { shortcut, type Shortcut } from "$lib/attachments/shortcut";

	let commandOpen = $state(false);
	let saved = $state(false);

	const shortcuts: Shortcut[] = [
		{
			key: "k",
			ctrl: true,
			action: () => (commandOpen = true)
		},
		{
			key: "s",
			ctrl: true,
			action: async () => {
				await saveDraft();
				saved = true;
			}
		}
	];
</script>

<svelte:window {@attach shortcut(shortcuts)} />
```

One listener is installed for each event type present in the array. When several definitions match the same event, only the first matching entry runs, so array order is significant. Async actions are started but not awaited by the attachment; handle failures inside the action when necessary.

#### Support macOS and Windows/Linux

Define separate exact combinations because an omitted modifier means that modifier must not be pressed:

```svelte
<svelte:window
	{@attach shortcut([
		{ key: "k", meta: true, action: openCommandMenu },
		{ key: "k", ctrl: true, action: openCommandMenu }
	])}
/>
```

On a keyboard event with both Control and Meta pressed, neither definition matches. Add that combination explicitly only if the app needs it.

#### Ignore editable controls and key repetition

Use `when` to keep global commands out of inputs and to reject repeated `keydown` events:

```svelte
<script lang="ts">
	import { shortcut } from "$lib/attachments/shortcut";

	function isOutsideEditableControl(event: KeyboardEvent) {
		const target = event.target;
		return (
			!event.repeat &&
			!(target instanceof HTMLInputElement) &&
			!(target instanceof HTMLTextAreaElement) &&
			!(target instanceof HTMLElement && target.isContentEditable)
		);
	}
</script>

<svelte:window
	{@attach shortcut({
		key: "/",
		action: focusSearch,
		when: isOutsideEditableControl
	})}
/>
```

The attachment does not filter `event.repeat` or editable targets automatically.

#### Listen for release instead of press

```svelte
<svelte:window
	{@attach shortcut({
		key: "Alt",
		event: "keyup",
		action: hideKeyboardHints,
		preventDefault: false
	})}
/>
```

`keydown` is the default. `keyup` is useful for release behavior. The API also accepts `keypress` because it is part of `ShortcutEvent`, but that browser event is deprecated; prefer `keydown` or `keyup` for new code.

### Public API

#### `shortcut(options)`

```ts
function shortcut(options: Shortcut | Shortcut[]): Attachment<Window>;
```

| Parameter | Type                     | Behavior                                                                           |
| --------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `options` | `Shortcut \| Shortcut[]` | Registers one definition or an ordered list. An empty array installs no listeners. |

The returned attachment is designed for `<svelte:window>`. On attachment, it groups definitions by event type and adds one window listener for each type. On detachment, it removes those listeners.

#### `Shortcut`

| Field             | Type                                              | Default     | Behavior                                                                                                   |
| ----------------- | ------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `key`             | `string`                                          | Required    | Compared case-insensitively with `KeyboardEvent.key`; it represents the produced key, not a physical code. |
| `action`          | `(event: KeyboardEvent) => void \| Promise<void>` | Required    | Runs for the first matching definition and receives the original event.                                    |
| `event`           | `"keydown" \| "keyup" \| "keypress"`              | `"keydown"` | Selects the window event to observe.                                                                       |
| `ctrl`            | `boolean`                                         | `false`     | Requires the Control modifier to have exactly this state.                                                  |
| `shift`           | `boolean`                                         | `false`     | Requires the Shift modifier to have exactly this state.                                                    |
| `alt`             | `boolean`                                         | `false`     | Requires the Alt modifier to have exactly this state.                                                      |
| `meta`            | `boolean`                                         | `false`     | Requires the Meta/Command modifier to have exactly this state.                                             |
| `preventDefault`  | `boolean`                                         | `true`      | Calls `preventDefault()` before the action when a match is found.                                          |
| `stopPropagation` | `boolean`                                         | `false`     | Calls `stopPropagation()` before the action when enabled.                                                  |
| `when`            | `(event: KeyboardEvent) => boolean`               | `undefined` | Additional predicate evaluated after the event, key, and modifiers match.                                  |

`ShortcutEvent` is the exported union used by `event`.

### Keyboard behavior and lifecycle

- Key matching uses `event.key.toLowerCase()`, so letter case is ignored but keyboard layout and active modifiers can affect the reported value.
- All four modifier states must match. Unspecified modifiers are treated as `false`.
- Default prevention and propagation changes occur only after a complete match, including `when`.
- Only the first matching definition runs for a given event.
- Native key repetition is preserved. Reject `event.repeat` in `when` when an action should run once per press.
- Changing reactive values used to create the attachment lets Svelte detach the previous attachment and install the new one.
- Detaching the element or destroying its component removes every registered listener.

### Accessibility

Every shortcut must have an equivalent visible, keyboard-operable control. Display the available combination near that control or in help content, and keep the displayed hint synchronized with the registered definition.

Avoid intercepting browser, operating-system, and assistive-technology shortcuts. Be especially careful with unmodified letter keys, editable controls, screen-reader browse commands, and `preventDefault`. Platform-specific Command and Control combinations should be presented appropriately for the user's platform.

The attachment does not announce that an action ran, move focus, or manage the accessibility of the resulting interface; the action and rendered UI own those responsibilities.

### Localization

`shortcut` contains no built-in human-readable copy and requires no localization messages. `key` values are browser identifiers and are not translated. Any visible shortcut label, help text, action feedback, or error message belongs to your app and must be localized there.

### Dependencies

The Svelte package and copy command are covered under Installation. No runtime package beyond Svelte, global CSS, theme variables, icons, `$lib/utils` exports, UI components, hooks, contexts, attachments, or localization setup are required.

---

## Credits

`shortcut` is adapted from the [Shortcut action in shadcn-svelte-extras](https://shadcn-svelte-extras.com/docs/actions/shortcut). The API and exact matching behavior documented here describe the local xvelte attachment.

---

## File organization

| File          | Responsibility                                                               |
| ------------- | ---------------------------------------------------------------------------- |
| `shortcut.ts` | Exported types, attachment creation, exact matching, listeners, and cleanup. |
| `README.md`   | Installation, usage, API, lifecycle, and accessibility guide.                |

`shortcut.ts` and its exported `Shortcut`, `ShortcutEvent`, and `shortcut` declarations are the source of truth for the public API.

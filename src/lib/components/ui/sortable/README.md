# Sortable

A declarative list for reordering content with pointer or keyboard controls. Root owns the `svelte-dnd-action` lifecycle and updates a bindable identifier order internally, each Item registers itself through context, and explicit DragHandle descendants keep ordinary item interactions separate from reordering.

Use Sortable for one ordered collection whose visual design and application data belong to your app. Do not use it for free-positioned layouts, moving items between independent lists, or cases where simple Move up and Move down buttons would be clearer.

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
- [File organization](#file-organization)

## Import

```svelte
<script lang="ts">
	import type { SortableItemId, SortableItemState, SortableOrder } from "$lib/components/ui/sortable";

	import * as Sortable from "$lib/components/ui/sortable";
</script>
```

The component exports `Root`, `Item`, `DragHandle`, and `orderItems`, plus the public `RootProps`, `ItemProps`, `DragHandleProps`, `SortableItemId`, `SortableOrder`, and `SortableItemState` types.

## Anatomy

Declare Items directly inside Root. Every movable Item needs an explicit descendant DragHandle:

```svelte
<Sortable.Root>
	<Sortable.Item id="first">
		<span>First task</span>
		<Sortable.DragHandle aria-label="Move First task">Drag</Sortable.DragHandle>
	</Sortable.Item>
</Sortable.Root>
```

Each Item renders its own element and registers its ID and lifecycle state with the nearest Root, like the other declarative xvelte components. Root coordinates `svelte-dnd-action` and writes provisional and final IDs to `order`; no `items` prop or item-rendering snippet is needed.

## Basic usage

Initialize `order` from persisted IDs, bind it to Root, and use `orderItems` to produce the single keyed loop consumed by Svelte. Root changes `order` internally during pointer and keyboard movement, so an effect can persist every change without lifecycle callbacks:

```svelte
<script lang="ts">
	import * as Sortable from "$lib/components/ui/sortable";

	type Task = { id: number; label: string };

	const tasks: Task[] = [
		{ id: 1, label: "Confirm venue" },
		{ id: 2, label: "Send invitations" },
		{ id: 3, label: "Order supplies" }
	];

	let order = $state<(string | number)[]>(loadTaskOrder());
	const orderedTasks = $derived(Sortable.orderItems(tasks, order, (task) => task.id));

	$effect(() => {
		void persistTaskOrder(order);
	});
</script>

<Sortable.Root class="space-y-2" bind:order>
	{#each orderedTasks as task (task.id)}
		<Sortable.Item id={task.id} class="flex items-center gap-3 rounded-md border p-3 data-[dragging=true]:opacity-60">
			<span class="flex-1">{task.label}</span>

			<Sortable.DragHandle aria-label={`Move ${task.label}`} />
		</Sortable.Item>
	{/each}
</Sortable.Root>
```

`orderItems` never mutates `tasks` or `order`. It ignores persisted IDs that no longer exist and appends new tasks missing from the saved order in their input order. Keep the loop keyed by the same stable IDs supplied to Item.

`order` is live, not drop-only state. Whenever the active Item reaches a new provisional position, Root writes that exact current ID sequence to the binding and then calls `onDragging`. Reading `order` inside `onDragging` therefore returns the same provisional order currently displayed, even though the Item has not been dropped yet. When the pointer is released, or a keyboard drag is completed, Root commits the final sequence and only then calls `onDragEnd` once. `onDragEnd` observes the completed interaction; it does not perform or enable the reordering.

The effect runs for initial normalization and every provisional move. Use `onDragEnd` instead when persistence should happen only once after a completed interaction, or when it needs the active Item snapshot. Always spread every delegated DragHandle prop because it contains the attachment that connects the handle to the drag-and-drop action.

## Examples

### Item-level lifecycle

Root callbacks receive the active state and the complete order. Item callbacks receive only that Item's current state:

```svelte
<Sortable.Root
	bind:order
	onDragStart={(active, states) => console.log("Started", active, states)}
	onDragging={(active, states) => console.log("Moving", active, states)}
	onDragEnd={(active, states) => console.log("Finished", active, states)}
>
	{#each orderedTasks as task (task.id)}
		<Sortable.Item id={task.id} onDragging={(state) => console.log("Position", state.index)}>
			<span>{task.label}</span>
			<Sortable.DragHandle aria-label={`Move ${task.label}`}>Drag</Sortable.DragHandle>
		</Sortable.Item>
	{/each}
</Sortable.Root>
```

### Disabled sorting

```svelte
<Sortable.Root bind:order disabled={saving} data-saving={saving || undefined}>
	{#each orderedTasks as task (task.id)}
		<Sortable.Item id={task.id}>...</Sortable.Item>
	{/each}
</Sortable.Root>
```

Root and every rendered Item expose `data-disabled="true"`. The dependency prevents pointer and keyboard dragging; your app remains responsible for the disabled visual treatment.

### Delegated Item element

```svelte
<Sortable.Item id={task.id}>
	{#snippet child({ props })}
		<article {...props} class="flex items-center gap-3 rounded-md border p-3">
			<span class="flex-1">{task.label}</span>
			<Sortable.DragHandle aria-label={`Move ${task.label}`}>Drag</Sortable.DragHandle>
		</article>
	{/snippet}
</Sortable.Item>
```

Spread every supplied prop on the delegated element to preserve its ref attachment and stable state attributes.

## Public API

Sortable wraps the installed `svelte-dnd-action` drag-handle API. See the [official drag-handle documentation](https://github.com/isaacHagoel/svelte-dnd-action#drag-handles-support) for dependency-owned interaction details. The component's `index.ts` and exported types are the source of truth.

### `Sortable.Root`

| Prop           | Type                      | Default | Behavior                                                                       |
| -------------- | ------------------------- | ------- | ------------------------------------------------------------------------------ |
| `children`     | `Snippet`                 | —       | Declarative Item registrations. Non-Item output is unsupported.                |
| `order`        | `(string \| number)[]`    | `[]`    | Bindable authoritative ID order, updated internally before observer callbacks. |
| `disabled`     | `boolean`                 | `false` | Prevents pointer and keyboard reordering.                                      |
| `onDragStart`  | `(state, states) => void` | —       | Optionally observes the initial state when dragging starts.                    |
| `onDragging`   | `(state, states) => void` | —       | Optionally observes provisional ordering after `order` updates.                |
| `onDragEnd`    | `(state, states) => void` | —       | Runs once after release or keyboard completion and the final `order` update.   |
| `flipDuration` | `number`                  | `150`   | Milliseconds used to coordinate dependency position transitions.               |
| `ref`          | `HTMLDivElement \| null`  | `null`  | Bindable rendered Root element.                                                |
| `class`        | `ClassValue`              | —       | Forwarded unchanged; Root adds no visual classes.                              |

Initialize `order` before rendering when restoring persisted state. Root normalizes it against registered Items: stale IDs are removed, duplicates are ignored, and newly registered IDs are appended. During dragging Root writes a new array to the binding before calling `onDragging` or `onDragEnd`; callbacks never need to reorder app data. Render the keyed Item loop from `orderItems` so Svelte and the dependency share the same DOM order. Observe `order` with an effect for every change, or use `onDragEnd` when only the completed interaction matters.

Each Root callback receives the active `SortableItemState` first and the complete ordered `SortableItemState[]` second. Root forwards remaining native `div` props and handlers, while owning the DnD action, `onconsider`, `onfinalize`, and stable data attributes.

### `Sortable.Item`

| Prop          | Type                     | Default                   | Behavior                                                                         |
| ------------- | ------------------------ | ------------------------- | -------------------------------------------------------------------------------- |
| `id`          | `string \| number`       | Hydration-stable local ID | Registers the Item; use an explicit ID for application ordering and persistence. |
| `children`    | `Snippet`                | —                         | Item content, normally including one DragHandle.                                 |
| `child`       | `Snippet<[{ props }]>`   | —                         | Replaces the default `div`; spread every supplied prop.                          |
| `onDragStart` | `(state) => void`        | —                         | Runs when this Item starts being dragged.                                        |
| `onDragging`  | `(state) => void`        | —                         | Runs whenever this Item's provisional index changes or is republished.           |
| `onDragEnd`   | `(state) => void`        | —                         | Runs with this Item's committed position.                                        |
| `ref`         | `HTMLDivElement \| null` | `null`                    | Bindable visible Item element.                                                   |
| `class`       | `ClassValue`             | —                         | Forwarded unchanged; Item adds no visual classes.                                |

Remaining native `div` props are forwarded to the visible Item element. IDs must be unique within a Root. Item declarations must remain descendants of that Root and should be keyed by their explicit IDs when generated with `{#each}`.

### `Sortable.DragHandle`

| Prop         | Type                   | Default                       | Behavior                                                       |
| ------------ | ---------------------- | ----------------------------- | -------------------------------------------------------------- |
| `children`   | `Snippet`              | Grip icon                     | Replaces the default visible grip icon.                        |
| `child`      | `Snippet<[{ props }]>` | —                             | Replaces the default ghost Button; spread every supplied prop. |
| `aria-label` | `string`               | Localized `"Drag to reorder"` | Accessible handle name.                                        |
| `ref`        | `HTMLElement \| null`  | `null`                        | Bindable rendered handle element.                              |
| `class`      | `ClassValue`           | —                             | Merged with the default grab-cursor classes.                   |

Without `child`, DragHandle renders the same ghost `Button.Root` with `size="icon-sm"` and grip icon used by WidgetGrid. With `child`, it applies the behavior and state props to the user's element instead. Give each handle a contextual accessible name.

### `orderItems`

```ts
function orderItems<Item>(items: readonly Item[], order: readonly SortableItemId[], getId: (item: Item) => SortableItemId): Item[];
```

Returns a new array without changing either input. Known IDs follow `order`, stale IDs are ignored, and records absent from `order` follow in their original input order. `getId` must return the same identifier supplied to the corresponding Item.

### Public ordering types

```ts
type SortableItemId = string | number;
type SortableOrder = SortableItemId[];

type SortableItemState = {
	id: SortableItemId;
	index: number;
};
```

Snapshots contain only ordering metadata. Keep labels, records, and other application payload in app state and map them by `id`.

## Styling and DOM contract

Root and Item are headless. DragHandle provides the collection's standard compact ghost Button by default.

| Part       | Stable hook                        | Additional stable state          |
| ---------- | ---------------------------------- | -------------------------------- |
| Root       | `data-slot="sortable"`             | `data-dragging`, `data-disabled` |
| Item       | `data-slot="sortable-item"`        | `data-dragging`, `data-disabled` |
| DragHandle | `data-slot="sortable-drag-handle"` | `data-disabled`                  |

Boolean state attributes are present with value `"true"` and omitted otherwise. Root `data-dragging` means any registered Item is being dragged; Item `data-dragging` identifies the active Item, including its temporary pointer shadow.

Root and Item default to `div`, and Item may delegate its element. DragHandle defaults to Button and merges `cursor-grab touch-none active:cursor-grabbing` with its `class`; delegated handles receive the same merged class and behavioral props. Root and Item classes are forwarded unchanged. `svelte-dnd-action` also applies temporary inline styles, ARIA attributes, tab stops, cloned drag elements, and shadow decoration; those are dependency-owned and are not stable styling hooks.

The component requires no semantic color, CSS variable, global keyframe, or shared stylesheet.

## Accessibility

`svelte-dnd-action` provides pointer and keyboard dragging plus screen-reader announcements. Press Space or Enter on a focused handle to pick up or drop an Item, and use the arrow keys while it is picked up to change its position.

- Render one clear DragHandle for each movable Item.
- The default handle is a native Button with focus styling. When using `child`, prefer an equivalent native button and spread every supplied prop.
- Give repeated handles item-specific accessible names such as `Move Quarterly report`.
- Keep Item IDs unique and stable.
- Do not place unrelated actions inside the handle.
- Provide Move up and Move down alternatives when the workflow requires simpler assistive controls.

When Root is disabled, the dependency prevents starting a drag. The app should also communicate that state visually.

## Localization

DragHandle uses one Paraglide message from `messages/en.json`:

| Message ID         | English value     | Used by                             |
| ------------------ | ----------------- | ----------------------------------- |
| `merry_finch_drag` | `Drag to reorder` | Default DragHandle accessible label |

Override `aria-label` for item-specific copy. Item content, persistence messages, and alternative movement controls belong to the app and use its localization system.

## Dependencies

### Packages

```sh
# Bun
bun add svelte-dnd-action @tabler/icons-svelte clsx tailwind-merge tailwind-variants
bun add -D @inlang/paraglide-js tailwindcss

# npm
npm install svelte-dnd-action @tabler/icons-svelte clsx tailwind-merge tailwind-variants
npm install -D @inlang/paraglide-js tailwindcss

# pnpm
pnpm add svelte-dnd-action @tabler/icons-svelte clsx tailwind-merge tailwind-variants
pnpm add -D @inlang/paraglide-js tailwindcss
```

The component targets `svelte-dnd-action@^0.9.69` and uses `dragHandleZone`, `dragHandle`, public event metadata, and the public shadow marker.

### Component files

Copy the complete `src/lib/components/ui/sortable` folder:

- `sortable-root.svelte`
- `sortable-item.svelte`
- `sortable-drag-handle.svelte`
- `sortable-context.svelte.ts`
- `sortable-types.ts`
- `index.ts`
- `README.md`

Sortable also requires `src/lib/components/ui/button`: copy `button-root.svelte`, `index.ts`, and `README.md`, then follow Button's README for its complete package, utility, and semantic-token setup. The context file is internal but required. Sortable needs no other xvelte component, hook, public attachment, shared component stylesheet, image, font, network service, or route-level integration.

### Shared utilities

Sortable imports `cn`, `WithElementRef`, and `WithoutChildren` from `$lib/utils`. Copy their existing documented definitions from xvelte; Button's README covers the `cn` packages and setup.

### Icons

DragHandle uses the semantic icon facade. Add this exact export to `src/lib/icons.ts`:

```ts
export { default as DragHandleIcon } from "@tabler/icons-svelte/icons/grip-vertical";
```

The package block includes `@tabler/icons-svelte`.

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the message listed in [Localization](#localization) to `messages/en.json`.

### Global styles

Sortable adds no component-specific stylesheet, variable, keyframe, or font. Its default DragHandle uses Button's semantic colors and focus styles, so copy and configure Button first.

## File organization

| File                          | Responsibility                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `sortable-root.svelte`        | Transparent declarative wrapper, DnD action, lifecycle translation, and stable Root state.              |
| `sortable-item.svelte`        | Visible Item element, context registration, pointer-shadow replacement, callbacks, delegation, and ref. |
| `sortable-drag-handle.svelte` | Explicit dependency handle action, delegated element, localized label, and ref.                         |
| `sortable-context.svelte.ts`  | Native Svelte contexts, Item registry, action ordering, shadow cleanup, and callback routing.           |
| `sortable-types.ts`           | Public ID, order, snapshot types, and the non-mutating `orderItems` helper.                             |
| `index.ts`                    | Public components, helper, and exported prop and ordering types.                                        |
| `README.md`                   | Composition, examples, API, DOM contract, accessibility, localization, and installation.                |

The component's `index.ts` and exported types are the source of truth for the public API.

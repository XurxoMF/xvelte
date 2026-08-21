# Sortable

A headless drag-and-drop list for reordering objects with stable string or number IDs. It keeps provisional ordering responsive during a drag, supports pointer and keyboard interaction through `svelte-dnd-action`, reports intermediate and committed arrays, and requires an explicit DragHandle inside every draggable Item.

Use Sortable when the app owns the item layout and needs reorder callbacks without prescribed visual styling. Do not use it for moving arbitrary elements without data IDs, nesting interactive drop zones without additional design work, or cases where ordinary move-up/move-down controls would be clearer.

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

---

## Import

Import every public part through the component's `index.ts`:

```svelte
<script lang="ts">
	import type { SortableItem, SortableRenderState } from "$lib/components/ui/sortable";

	import * as Sortable from "$lib/components/ui/sortable";
</script>
```

The component exports `Root`, `Item`, and `DragHandle`; the `RootProps`, `ItemProps`, `DragHandleProps`, `SortableItem`, and `SortableRenderState` types are also public.

---

## Anatomy

Root renders the current ordering through its required `item` snippet. Each rendered entry needs an Item and a descendant DragHandle:

```svelte
<Sortable.Root {items} item={sortableItem} />

{#snippet sortableItem(entry: Entry, state: Sortable.SortableRenderState)}
	<Sortable.Item>
		<span>{entry.label}</span>
		<Sortable.DragHandle aria-label={`Move ${entry.label}`}>Drag</Sortable.DragHandle>
	</Sortable.Item>
{/snippet}
```

Item is only the draggable entry container. It deliberately does not activate whole-item dragging. Without a DragHandle inside it, the Item cannot be dragged.

---

## Basic usage

Keep app state synchronized from `onConsider` so provisional positions remain available outside the component, and use `onDrop` for persistence:

```svelte
<script lang="ts">
	import type { SortableRenderState } from "$lib/components/ui/sortable";

	import * as Sortable from "$lib/components/ui/sortable";

	type Task = {
		id: number;
		label: string;
	};

	let tasks = $state<Task[]>([
		{ id: 1, label: "Confirm venue" },
		{ id: 2, label: "Send invitations" },
		{ id: 3, label: "Order supplies" }
	]);

	function updateOrder(next: Task[]) {
		tasks = next;
	}

	function saveOrder(next: Task[]) {
		tasks = next;
		void persistTaskOrder(next.map((task) => task.id));
	}
</script>

{#snippet taskItem(task: Task, state: SortableRenderState)}
	<Sortable.Item class="flex items-center gap-3 rounded-md border bg-background p-3" data-dragging={state.dragging || undefined}>
		<span class="flex-1">{task.label}</span>

		<Sortable.DragHandle>
			{#snippet child({ props })}
				<button {...props} type="button" class="cursor-grab rounded-sm px-2 py-1 active:cursor-grabbing" aria-label={`Move ${task.label}`}>
					Drag
				</button>
			{/snippet}
		</Sortable.DragHandle>
	</Sortable.Item>
{/snippet}

<Sortable.Root items={tasks} item={taskItem} onConsider={updateOrder} onDrop={saveOrder} />
```

Always spread every delegated DragHandle prop. Those props contain the attachment that registers the element with the drag-and-drop library.

---

## Examples

### Disabled sorting

```svelte
<Sortable.Root items={tasks} item={taskItem} disabled={saving} onConsider={updateOrder} onDrop={saveOrder} />
```

`disabled` prevents the zone from starting or accepting drag operations. The component does not automatically change Item or DragHandle styling, so reflect the state visually and remove misleading instructions in app code.

### Observe drag state

The item snippet receives its current index and whether it represents the active or temporary shadow entry:

```svelte
{#snippet taskItem(task: Task, { index, dragging }: SortableRenderState)}
	<Sortable.Item data-dragging={dragging || undefined} class="flex items-center gap-3 opacity-100 data-[dragging=true]:opacity-50">
		<span>{index + 1}. {task.label}</span>
		<Sortable.DragHandle aria-label={`Move ${task.label}`}>Drag</Sortable.DragHandle>
	</Sortable.Item>
{/snippet}
```

Use `dragging` for lightweight visual feedback. Do not use the temporary render state as persisted app data.

### Delegated Item element

Item can apply its props to an app-owned element:

```svelte
<Sortable.Item>
	{#snippet child({ props })}
		<article {...props} class="flex items-center gap-3 rounded-md border p-3">
			<span class="flex-1">{task.label}</span>
			<Sortable.DragHandle aria-label={`Move ${task.label}`}>Drag</Sortable.DragHandle>
		</article>
	{/snippet}
</Sortable.Item>
```

Spread all supplied Item props so its stable slot and bindable reference attachment remain connected. Delegation does not make the Item a handle.

---

## Public API

Sortable is a local wrapper around the installed `svelte-dnd-action` drag-handle API. The tables document the complete xvelte API; see the [official drag-handle documentation](https://github.com/isaacHagoel/svelte-dnd-action#drag-handles-support) for dependency-owned interaction details. The component's `index.ts`, exported types, and source are the source of truth.

### `Sortable.Root`

`RootProps<Item>` accepts an item type extending `SortableItem`.

| Prop           | Type                                   | Default  | Behavior                                                                    |
| -------------- | -------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `items`        | `Item[]`                               | Required | App-owned ordered objects. Every object needs a stable, unique `id`.        |
| `item`         | `Snippet<[Item, SortableRenderState]>` | Required | Renders each entry in the action-owned provisional order.                   |
| `disabled`     | `boolean`                              | `false`  | Passes the disabled state to the drag-handle zone.                          |
| `onDragStart`  | `(item: Item, index: number) => void`  | —        | Runs once the local wrapper identifies the source item at drag start.       |
| `onConsider`   | `(items: Item[]) => void`              | —        | Reports cleaned provisional ordering during the interaction.                |
| `onDrop`       | `(items: Item[]) => void`              | —        | Reports the cleaned final ordering after the drag stops.                    |
| `flipDuration` | `number`                               | `150`    | Milliseconds supplied to the dependency's position-transition coordination. |
| `ref`          | `HTMLDivElement \| null`               | `null`   | Bindable Root element.                                                      |
| `class`        | `string`                               | —        | Applied directly; Root has no local visual classes.                         |

Root forwards remaining native `div` attributes and handlers. It owns `items`, the dependency actions, `onconsider`, `onfinalize`, and `data-slot`; overriding those through forwarded attributes can break reordering.

The component synchronizes external `items` while idle by comparing array length and IDs. Changes to other object fields with the same IDs do not replace the internal array until IDs or order change, so keep item objects stable or change the surrounding Root key when a full refresh is required.

`onConsider` and `onDrop` receive arrays with the dependency's temporary shadow entry removed and duplicate IDs discarded. The callbacks do not bind `items` automatically; assign the result in app state when it should become authoritative.

### `Sortable.Item`

| Prop       | Type                   | Default | Behavior                                                                                  |
| ---------- | ---------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `children` | `Snippet`              | —       | Renders item content and the required descendant DragHandle inside a default `div`.       |
| `child`    | `Snippet<[{ props }]>` | —       | Replaces the default element. Spread every supplied prop on the delegated element.        |
| `ref`      | `HTMLElement \| null`  | `null`  | Bindable reference connected through a Svelte attachment for direct and delegated output. |
| `class`    | `string`               | —       | Forwarded unchanged; Item provides no visual classes.                                     |

Item forwards compatible native element attributes. It supplies the stable `data-slot` and reference attachment but no drag action, role, label, keyboard behavior, or visual state. A descendant DragHandle is required for dragging.

### `Sortable.DragHandle`

| Prop         | Type                   | Default                       | Behavior                                                                            |
| ------------ | ---------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `children`   | `Snippet`              | —                             | Renders visible handle content inside the default `div`.                            |
| `child`      | `Snippet<[{ props }]>` | —                             | Replaces the default element. Spread every supplied prop to preserve drag behavior. |
| `aria-label` | `string`               | Localized `"Drag to reorder"` | Accessible name forwarded to the handle element.                                    |
| `ref`        | `HTMLElement \| null`  | `null`                        | Bindable handle reference.                                                          |
| `class`      | `string`               | —                             | Forwarded unchanged; DragHandle provides no visual classes.                         |

DragHandle registers its rendered element with `svelte-dnd-action`. Remaining compatible native element attributes are forwarded. Prefer a context-specific accessible label such as `Move Quarterly report` when multiple handles are present.

### Public types

```ts
type SortableItem = {
	id: string | number;
};

type SortableRenderState = {
	index: number;
	dragging: boolean;
};
```

---

## Styling and DOM contract

Sortable is intentionally headless and adds no visual classes.

| Part       | Stable hook                        | Default element |
| ---------- | ---------------------------------- | --------------- |
| Root       | `data-slot="sortable"`             | `div`           |
| Item       | `data-slot="sortable-item"`        | `div`           |
| DragHandle | `data-slot="sortable-drag-handle"` | `div`           |

The dependency adds temporary inline styles, ARIA attributes, tab stops, and shadow elements while dragging. Treat those as dependency-owned implementation details. Use `SortableRenderState.dragging` or app-owned attributes for visual state instead of depending on undocumented generated markup.

Item and DragHandle do not merge classes; the provided `class` value is forwarded unchanged. Root also has no class-merging utility. The component has no semantic color requirement, CSS variable, keyframe, shared stylesheet, icon, or animation class.

---

## Accessibility

`svelte-dnd-action` supplies pointer and keyboard drag behavior and screen-reader announcements. The local wrapper ensures DragHandle has a default accessible label, but the app still owns the visible interaction design.

- Render exactly one clear DragHandle inside every Item that should be movable.
- Give each handle a contextual accessible name when the generic default would make several controls indistinguishable.
- Use a native `button` through `child` when the handle should have familiar control semantics and visible focus styling; spread every supplied prop.
- Keep a visible focus indicator and adequate pointer target on the handle.
- Do not put essential item actions on the handle itself because activating it starts reordering behavior.
- Keep IDs unique and stable. Duplicate IDs are removed by local cleanup and can make the rendered list inconsistent.
- Provide non-drag alternatives such as Move up and Move down actions when the workflow needs the simplest predictable assistive interaction.

Without DragHandle an Item remains ordinary content and cannot be moved by pointer or keyboard.

---

## Localization

DragHandle uses one Paraglide message from `messages/en.json`:

| Message ID         | English value     | Used by                              |
| ------------------ | ----------------- | ------------------------------------ |
| `merry_finch_drag` | `Drag to reorder` | Default DragHandle accessible label. |

Override `aria-label` for item-specific copy. Visible item content, disabled explanations, status text, persistence errors, and alternative move actions belong to the app and must use its localization system.

---

## Dependencies

### Packages

Install the runtime drag-and-drop package first and the localization compiler as a development dependency:

```sh
# Bun
bun add svelte-dnd-action
bun add -D @inlang/paraglide-js

# npm
npm install svelte-dnd-action
npm install -D @inlang/paraglide-js

# pnpm
pnpm add svelte-dnd-action
pnpm add -D @inlang/paraglide-js
```

The local component targets the stable version declared by xvelte (`svelte-dnd-action@^0.9.69`) and uses `dragHandleZone`, `dragHandle`, drag event metadata, and the shadow-item marker. Follow the [official package documentation](https://github.com/isaacHagoel/svelte-dnd-action) when changing dependency-owned behavior.

### Component files

Copy the complete `src/lib/components/ui/sortable` component folder:

- `sortable-root.svelte`
- `sortable-item.svelte`
- `sortable-drag-handle.svelte`
- `index.ts`
- `README.md`

Sortable requires no other xvelte component, shared utility, icon export, hook, public attachment, context module, shared style, font, image, or network service. Its private Svelte attachments are defined inside Item and DragHandle.

### Localization setup

Configure Paraglide so `$lib/paraglide/messages.js` is generated and add the message listed in [Localization](#localization) to `messages/en.json`. Its exact key and value are already shown there and are not duplicated here.

### Global styles

No global stylesheet import, semantic token, theme mapping, custom variant, keyframe, or component-specific CSS variable is required. Add app-owned styles to Root, Item, and DragHandle through their `class` props.

---

## File organization

| File                          | Responsibility                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `sortable-root.svelte`        | Drag-handle zone, provisional ordering, shadow cleanup, callbacks, disabled state, and item snippet rendering. |
| `sortable-item.svelte`        | Headless item container, public reference attachment, delegated element, and stable slot.                      |
| `sortable-drag-handle.svelte` | Required drag-handle registration, default localized label, delegated element, reference, and stable slot.     |
| `index.ts`                    | Public components and all exported props, item, and render-state types.                                        |
| `README.md`                   | Composition, examples, API, drag behavior, styling, accessibility, localization, and dependencies.             |

The component's `index.ts`, exported types, and local source are the source of truth for the public API.

import { createContext, tick } from "svelte";
import { SvelteSet } from "svelte/reactivity";

import { SHADOW_ITEM_MARKER_PROPERTY_NAME, SOURCES } from "svelte-dnd-action";

import type { SortableItemId, SortableItemState, SortableOrder } from "./sortable-types";

type SortableDndItem = {
	id: SortableItemId;
	[SHADOW_ITEM_MARKER_PROPERTY_NAME]?: boolean | undefined;
};

type SortableSource = (typeof SOURCES)[keyof typeof SOURCES];

type RootLifecycleCallbacks = {
	readonly onDragStart: ((state: SortableItemState, states: SortableItemState[]) => void) | undefined;
	readonly onDragging: ((state: SortableItemState, states: SortableItemState[]) => void) | undefined;
	readonly onDragEnd: ((state: SortableItemState, states: SortableItemState[]) => void) | undefined;
};

type SortableContextOptions = RootLifecycleCallbacks & {
	readonly disabled: boolean;
	get order(): SortableOrder;
	set order(value: SortableOrder);
};

type ItemLifecycleCallbacks = {
	readonly onDragStart: ((state: SortableItemState) => void) | undefined;
	readonly onDragging: ((state: SortableItemState) => void) | undefined;
	readonly onDragEnd: ((state: SortableItemState) => void) | undefined;
};

type SortableItemOptions = ItemLifecycleCallbacks & {
	/** Stable application identifier. */
	readonly id: SortableItemId;
};

/** Coordinates declarative Items, bindable ordering, and the dependency-owned drag lifecycle. */
export class SortableContext {
	items = $state<SortableItemContext[]>([]);
	dndItems = $state<SortableDndItem[]>([]);
	activeItem = $state<SortableItemContext>();
	#preferredOrder: SortableOrder;
	#mounted = false;
	#syncVersion = 0;

	/** @param options - Reactive Root ordering, disabled state, and lifecycle callbacks. */
	constructor(readonly options: SortableContextOptions) {
		this.#preferredOrder = [...options.order];
	}

	/** @returns Whether a pointer or keyboard drag is active. */
	get dragging() {
		return this.activeItem !== undefined;
	}

	/** Commits the fully registered initial order after descendant Items finish mounting. */
	mount() {
		this.#mounted = true;
		this.scheduleRegisteredOrderSync();
	}

	/** Clears mounted and active interaction state. */
	destroy() {
		this.#mounted = false;
		this.clearActiveItem();
	}

	/**
	 * Adds one declarative Item and merges it into the current preferred order.
	 *
	 * @param item - Item context to register.
	 * @returns Cleanup that removes the Item and its ID from the current order.
	 */
	registerItem(item: SortableItemContext) {
		if (this.items.some((candidate) => candidate.id === item.id)) {
			console.warn(`Sortable.Item identifiers must be unique. Ignoring duplicate id: ${String(item.id)}`);
		}
		if (!this.items.includes(item)) this.items.push(item);
		this.rebuildDndItems(this.#preferredOrder);
		this.scheduleRegisteredOrderSync();

		return () => {
			const index = this.items.indexOf(item);
			if (index !== -1) this.items.splice(index, 1);
			if (this.activeItem === item) this.clearActiveItem();
			this.dndItems = this.dndItems.filter((value) => this.isShadow(value) || value.id !== item.registeredId);
			this.commitOrder(this.states(this.dndItems).map(({ id }) => id));
		};
	}

	/**
	 * Synchronizes an externally initialized or deliberately replaced bound order while idle.
	 *
	 * @param value - Bound identifier order from Root.
	 */
	syncOrder(value: SortableOrder) {
		if (this.dragging || this.sameOrder(value, this.#preferredOrder)) return;
		this.#preferredOrder = [...value];
		this.rebuildDndItems(value);
		this.scheduleRegisteredOrderSync();
	}

	/**
	 * Replaces one changed Item identifier without discarding the current position.
	 *
	 * @param item - Registered Item whose identifier changed.
	 * @param previousId - Identifier currently represented in the order.
	 */
	syncItem(item: SortableItemContext, previousId: SortableItemId) {
		if (this.dragging || item.id === previousId) return;
		if (this.items.some((candidate) => candidate !== item && candidate.id === item.id)) {
			console.warn(`Sortable.Item identifiers must be unique. Ignoring duplicate id: ${String(item.id)}`);
			return;
		}

		const next = this.dndItems.map((value) => (value.id === previousId ? { id: item.id } : value));
		this.dndItems = next;
		this.commitOrder(this.states(next).map(({ id }) => id));
	}

	/**
	 * Starts one drag and publishes its initial ordered snapshot.
	 *
	 * @param id - Identifier reported by svelte-dnd-action.
	 * @param source - Pointer or keyboard interaction source.
	 */
	start(id: SortableItemId, source: SortableSource) {
		const item = this.items.find((candidate) => candidate.id === id);
		if (!item || this.activeItem === item) return;

		this.activeItem = item;
		item.dragging = true;
		if (source === SOURCES.POINTER) item.replaceElement();
		const states = this.states(this.dndItems);
		const state = states.find((candidate) => candidate.id === item.id);
		if (!state) return;
		item.notify("start", state);
		this.options.onDragStart?.(state, states);
	}

	/**
	 * Applies the provisional order internally before publishing optional observer callbacks.
	 *
	 * @param values - Raw ordered values emitted by svelte-dnd-action.
	 */
	move(values: SortableDndItem[]) {
		this.dndItems = values;
		const item = this.activeItem;
		if (!item) return;
		const states = this.states(values);
		this.commitOrder(states.map(({ id }) => id));
		const state = states.find((candidate) => candidate.id === item.id);
		if (!state) return;
		item.notify("move", state);
		this.options.onDragging?.(state, states);
	}

	/**
	 * Commits the final order before publishing end callbacks suitable for persistence.
	 *
	 * @param values - Raw final values emitted by svelte-dnd-action.
	 */
	finish(values: SortableDndItem[]) {
		const item = this.activeItem;
		const states = this.states(values);
		this.dndItems = states.map(({ id }) => ({ id }));
		this.commitOrder(states.map(({ id }) => id));
		if (item) {
			const state = states.find((candidate) => candidate.id === item.id);
			if (state) {
				item.notify("end", state);
				this.options.onDragEnd?.(state, states);
			}
		}
		this.clearActiveItem();
	}

	/**
	 * Returns whether an action entry is the temporary pointer-drag placeholder.
	 *
	 * @param value - Raw action entry.
	 */
	isShadow(value: SortableDndItem) {
		return value[SHADOW_ITEM_MARKER_PROPERTY_NAME] === true;
	}

	/**
	 * Converts dependency-owned action data into de-duplicated public states.
	 *
	 * @param values - Raw action ordering.
	 */
	states(values: SortableDndItem[]) {
		const ids: SortableOrder = [];

		for (const value of values) {
			const id = this.isShadow(value) ? this.activeItem?.id : value.id;
			if (id === undefined || ids.includes(id)) continue;
			ids.push(id);
		}

		return ids.map((id, index) => ({ id, index }));
	}

	/**
	 * Rebuilds action entries from a preferred order and all currently registered unique IDs.
	 *
	 * @param preferredOrder - IDs that should lead the resulting order.
	 */
	rebuildDndItems(preferredOrder: readonly SortableItemId[]) {
		const registeredIds = this.items.map((item) => item.id);
		const normalized = this.normalizeOrder(preferredOrder, registeredIds);
		this.dndItems = normalized.map((id) => ({ id }));
	}

	/**
	 * Keeps known preferred IDs first and appends missing registered IDs in declaration order.
	 *
	 * @param preferredOrder - Requested leading ID sequence.
	 * @param registeredIds - Currently available Item IDs.
	 */
	normalizeOrder(preferredOrder: readonly SortableItemId[], registeredIds: readonly SortableItemId[]) {
		const available = new SvelteSet(registeredIds);
		const seen = new SvelteSet<SortableItemId>();
		const normalized: SortableOrder = [];

		for (const id of preferredOrder) {
			if (!available.has(id) || seen.has(id)) continue;
			seen.add(id);
			normalized.push(id);
		}
		for (const id of registeredIds) {
			if (seen.has(id)) continue;
			seen.add(id);
			normalized.push(id);
		}

		return normalized;
	}

	/** Schedules normalization after the current descendant registration cycle. */
	scheduleRegisteredOrderSync() {
		if (!this.#mounted) return;
		const version = ++this.#syncVersion;
		void tick().then(() => {
			if (version !== this.#syncVersion || !this.#mounted || this.dragging) return;
			const normalized = this.normalizeOrder(
				this.#preferredOrder,
				this.items.map((item) => item.id)
			);
			this.dndItems = normalized.map((id) => ({ id }));
			this.commitOrder(normalized);
		});
	}

	/**
	 * Updates Root's binding only when the identifier sequence changed.
	 *
	 * @param value - New authoritative order.
	 */
	commitOrder(value: SortableOrder) {
		this.#preferredOrder = [...value];
		if (!this.sameOrder(this.options.order, value)) this.options.order = [...value];
	}

	/**
	 * Compares two identifier sequences.
	 *
	 * @param left - First order.
	 * @param right - Second order.
	 */
	sameOrder(left: readonly SortableItemId[], right: readonly SortableItemId[]) {
		return left.length === right.length && left.every((id, index) => id === right[index]);
	}

	/** Clears the active Item and its public dragging state. */
	clearActiveItem() {
		if (this.activeItem) this.activeItem.dragging = false;
		this.activeItem = undefined;
	}
}

/** Represents one declaratively registered Item and its visible drag state. */
export class SortableItemContext {
	element = $state<HTMLElement | null>(null);
	dragging = $state(false);
	renderVersion = $state(0);
	/** Identifier currently represented by the action-owned order. */
	registeredId: SortableItemId;
	#unregisterItem: (() => void) | undefined;

	/**
	 * @param sortable - Nearest Sortable Root context.
	 * @param options - Reactive Item identifier and callbacks.
	 */
	constructor(
		readonly sortable: SortableContext,
		readonly options: SortableItemOptions
	) {
		this.registeredId = options.id;
		this.#unregisterItem = sortable.registerItem(this);
	}

	/** @returns Current stable application identifier. */
	get id() {
		return this.options.id;
	}

	/**
	 * Registers the visible direct Root child used by the DnD action.
	 *
	 * @param element - Default or delegated Item element.
	 * @returns Cleanup that clears the element reference.
	 */
	registerElement(element: HTMLElement) {
		this.element = element;
		return () => {
			if (this.element === element) this.element = null;
		};
	}

	/** Recreates the visible Item node so the pointer action can retain the original and decorate its replacement as the shadow. */
	replaceElement() {
		this.renderVersion += 1;
	}

	/** Synchronizes changed Item identifiers when no drag is active. */
	sync() {
		this.sortable.syncItem(this, this.registeredId);
		if (!this.sortable.dragging) this.registeredId = this.id;
	}

	/** Removes this Item from its nearest Root. */
	destroy() {
		this.#unregisterItem?.();
		this.#unregisterItem = undefined;
	}

	/**
	 * Invokes the Item callback matching one lifecycle phase.
	 *
	 * @param phase - Public drag lifecycle phase.
	 * @param state - Current state for this Item.
	 */
	notify(phase: "start" | "move" | "end", state: SortableItemState) {
		switch (phase) {
			case "start":
				this.options.onDragStart?.(state);
				break;
			case "move":
				this.options.onDragging?.(state);
				break;
			case "end":
				this.options.onDragEnd?.(state);
		}
	}
}

const [getSortableContext, provideSortableContext] = createContext<SortableContext>();
const [getSortableItemContext, provideSortableItemContext] = createContext<SortableItemContext>();

/**
 * Creates and provides Root state to declarative Sortable descendants.
 *
 * @param options - Reactive Root values and callbacks.
 * @returns Provided Root context.
 */
export function setSortableContext(options: SortableContextOptions) {
	return provideSortableContext(new SortableContext(options));
}

/**
 * Creates, registers, and provides one Item state.
 *
 * @param options - Reactive Item values and callbacks.
 * @returns Provided Item context.
 */
export function setSortableItemContext(options: SortableItemOptions) {
	return provideSortableItemContext(new SortableItemContext(getSortableContext(), options));
}

/** @returns State from the nearest Sortable Item. */
export { getSortableItemContext };

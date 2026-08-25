import { createContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";

import type { WidgetGridAdapterInteraction, WidgetGridAdapterItem, WidgetGridAdapterOptions } from "./widget-grid-adapter";
import type { WidgetGridItemState } from "./widget-grid-types";

import { WidgetGridAdapter } from "./widget-grid-adapter";

type ItemLifecycleCallbacks = {
	readonly onMoveStart: ((state: WidgetGridItemState) => void) | undefined;
	readonly onMoving: ((state: WidgetGridItemState) => void) | undefined;
	readonly onMoveEnd: ((state: WidgetGridItemState) => void) | undefined;
	readonly onResizeStart: ((state: WidgetGridItemState) => void) | undefined;
	readonly onResizing: ((state: WidgetGridItemState) => void) | undefined;
	readonly onResizeEnd: ((state: WidgetGridItemState) => void) | undefined;
};

type RootLifecycleCallbacks = {
	readonly onMoveStart: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
	readonly onMoving: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
	readonly onMoveEnd: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
	readonly onResizeStart: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
	readonly onResizing: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
	readonly onResizeEnd: ((state: WidgetGridItemState, states: WidgetGridItemState[]) => void) | undefined;
};

type WidgetGridContextOptions = WidgetGridAdapterOptions & RootLifecycleCallbacks;

type WidgetGridItemOptions = ItemLifecycleCallbacks & {
	readonly state: WidgetGridItemState;
};

/** Coordinates declarative items, handles, interaction state, and the internal layout adapter. */
export class WidgetGridContext {
	items = $state<WidgetGridItemContext[]>([]);
	readonly adapter: WidgetGridAdapter;

	/** @param options - Reactive Root values and lifecycle callbacks. */
	constructor(readonly options: WidgetGridContextOptions) {
		this.adapter = new WidgetGridAdapter(options, {
			onInteraction: (kind, item, state, states) => this.onInteraction(kind, item, state, states)
		});
	}

	/** @returns Whether any registered item is moving. */
	get moving() {
		return this.items.some((item) => item.moving);
	}

	/** @returns Whether any registered item is resizing. */
	get resizing() {
		return this.items.some((item) => item.resizing);
	}

	/** @param root - Root DOM element used to initialize the browser-only adapter. */
	mount(root: HTMLElement) {
		void this.adapter.mount(root);
	}

	/** Destroys all engine and observer state owned by Root. */
	destroy() {
		this.adapter.destroy();
	}

	/**
	 * Adds one declarative Item to the Root registry.
	 *
	 * @param item - Mounted nearest-root item context.
	 * @returns Cleanup that removes the item.
	 */
	registerItem(item: WidgetGridItemContext) {
		if (!this.items.includes(item)) this.items.push(item);
		this.adapter.registerItem(item);
		return () => {
			this.adapter.unregisterItem(item);
			const index = this.items.indexOf(item);
			if (index !== -1) this.items.splice(index, 1);
		};
	}

	/** Applies changed Root configuration to the adapter. */
	sync() {
		this.adapter.updateOptions();
	}

	/**
	 * Routes translated engine events to Item callbacks first and Root callbacks second.
	 *
	 * @param kind - Public lifecycle phase.
	 * @param adapterItem - Directly affected registered item.
	 * @param state - Current affected-item state.
	 * @param states - Current complete registered-item snapshot.
	 */
	onInteraction(kind: WidgetGridAdapterInteraction, adapterItem: WidgetGridAdapterItem, state: WidgetGridItemState, states: WidgetGridItemState[]) {
		const item = adapterItem as WidgetGridItemContext;
		item.notify(kind, state);
		switch (kind) {
			case "moveStart":
				this.options.onMoveStart?.(state, states);
				break;
			case "moving":
				this.options.onMoving?.(state, states);
				break;
			case "moveEnd":
				this.options.onMoveEnd?.(state, states);
				break;
			case "resizeStart":
				this.options.onResizeStart?.(state, states);
				break;
			case "resizing":
				this.options.onResizing?.(state, states);
				break;
			case "resizeEnd":
				this.options.onResizeEnd?.(state, states);
		}
	}
}

/** Represents one Item and owns its declarative descendant-handle registries. */
export class WidgetGridItemContext implements WidgetGridAdapterItem {
	element = $state<HTMLElement | null>(null);
	content = $state<HTMLElement | null>(null);
	moving = $state(false);
	resizing = $state(false);
	dragHandles = new SvelteSet<HTMLElement>();
	resizeHandle = $state<HTMLElement | null>(null);
	#unregisterItem: (() => void) | undefined;

	/**
	 * @param grid - Nearest WidgetGrid Root state.
	 * @param options - Reactive Item state and callbacks.
	 */
	constructor(
		readonly grid: WidgetGridContext,
		readonly options: WidgetGridItemOptions
	) {}

	/** @returns Current public state read from reactive Item props. */
	get state() {
		return this.options.state;
	}

	/** @returns Number of mounted explicit DragHandle descendants. */
	get dragHandleCount() {
		return this.dragHandles.size;
	}

	/** @returns Whether the single explicit ResizeHandle is mounted. */
	get resizeHandleCount() {
		return this.resizeHandle ? 1 : 0;
	}

	/** @param value - Whether the Item is currently moving. */
	setMoving(value: boolean) {
		this.moving = value;
	}

	/** @param value - Whether the Item is currently resizing. */
	setResizing(value: boolean) {
		this.resizing = value;
	}

	/**
	 * Registers the internal engine wrapper rendered by Item.
	 *
	 * @param element - Direct Root child used by the adapter.
	 * @returns Cleanup that clears the internal element reference.
	 */
	registerElement(element: HTMLElement) {
		this.element = element;
		return () => {
			this.#unregisterItem?.();
			this.#unregisterItem = undefined;
			if (this.element === element) this.element = null;
		};
	}

	/**
	 * Registers the complete mounted Item after all descendant handles exist.
	 *
	 * @returns Cleanup that removes the Item from Root.
	 */
	mount() {
		this.#unregisterItem?.();
		this.#unregisterItem = this.grid.registerItem(this);
		return () => {
			this.#unregisterItem?.();
			this.#unregisterItem = undefined;
		};
	}

	/**
	 * Exposes the public default or delegated Item element.
	 *
	 * @param element - Visible item content element.
	 * @returns Cleanup that clears the public reference.
	 */
	registerContent(element: HTMLElement) {
		this.content = element;
		return () => {
			if (this.content === element) this.content = null;
		};
	}

	/** @param state - Externally changed public item state to apply through the adapter. */
	sync(state: WidgetGridItemState) {
		void state;
		this.grid.adapter.updateItem(this);
	}

	/**
	 * Registers one explicit descendant drag handle.
	 *
	 * @param element - Rendered handle element.
	 * @returns Cleanup that removes the handle.
	 */
	registerDragHandle(element: HTMLElement) {
		this.dragHandles.add(element);
		this.grid.adapter.dragHandlesChanged(this);
		return () => {
			this.dragHandles.delete(element);
			this.grid.adapter.dragHandlesChanged(this);
		};
	}

	/**
	 * Registers the Item's single bottom-right resize handle.
	 *
	 * @param element - Rendered handle element.
	 * @returns Cleanup that clears the registration.
	 */
	registerResizeHandle(element: HTMLElement) {
		if (this.resizeHandle && this.resizeHandle !== element) {
			console.warn("WidgetGrid.Item supports exactly one WidgetGrid.ResizeHandle");
			return () => {};
		}

		this.resizeHandle = element;
		this.grid.adapter.resizeHandleChanged(this);
		return () => {
			if (this.resizeHandle !== element) return;
			this.resizeHandle = null;
			this.grid.adapter.resizeHandleChanged(this);
		};
	}

	/**
	 * Invokes the Item callback matching one translated lifecycle phase.
	 *
	 * @param kind - Public lifecycle phase.
	 * @param state - Current directly affected item state.
	 */
	notify(kind: WidgetGridAdapterInteraction, state: WidgetGridItemState) {
		switch (kind) {
			case "moveStart":
				this.options.onMoveStart?.(state);
				break;
			case "moving":
				this.options.onMoving?.(state);
				break;
			case "moveEnd":
				this.options.onMoveEnd?.(state);
				break;
			case "resizeStart":
				this.options.onResizeStart?.(state);
				break;
			case "resizing":
				this.options.onResizing?.(state);
				break;
			case "resizeEnd":
				this.options.onResizeEnd?.(state);
		}
	}
}

const [getWidgetGridContext, provideWidgetGridContext] = createContext<WidgetGridContext>();
const [getWidgetGridItemContext, provideWidgetGridItemContext] = createContext<WidgetGridItemContext>();

/**
 * Creates and provides Root state to declarative WidgetGrid descendants.
 *
 * @param options - Reactive Root values and callbacks.
 * @returns Provided Root context.
 */
export function setWidgetGridContext(options: WidgetGridContextOptions) {
	return provideWidgetGridContext(new WidgetGridContext(options));
}

/** @returns State from the nearest WidgetGrid Root. */
export { getWidgetGridContext };

/**
 * Creates and provides one Item state to its descendant handles.
 *
 * @param options - Reactive Item values and callbacks.
 * @returns Provided Item context.
 */
export function setWidgetGridItemContext(options: WidgetGridItemOptions) {
	return provideWidgetGridItemContext(new WidgetGridItemContext(getWidgetGridContext(), options));
}

/** @returns State from the nearest WidgetGrid Item. */
export { getWidgetGridItemContext };

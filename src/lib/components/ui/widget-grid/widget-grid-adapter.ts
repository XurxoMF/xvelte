import type { GridItemHTMLElement, GridStack, GridStackWidget } from "gridstack";
import type { WidgetGridItemState, WidgetGridMode } from "./widget-grid-types";

const BREAKPOINT_WIDTHS = {
	xs: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536
} as const;

/** Root configuration consumed only by the internal layout adapter. */
export type WidgetGridAdapterOptions = {
	readonly columns: number | Partial<Record<keyof typeof BREAKPOINT_WIDTHS, number>>;
	readonly gap: number;
	readonly mode: WidgetGridMode;
	readonly disabled: boolean;
	readonly draggable: boolean;
	readonly resizable: boolean;
};

/** Registered item boundary used by the adapter without exposing engine-owned values publicly. */
export type WidgetGridAdapterItem = {
	readonly element: HTMLElement | null;
	readonly state: WidgetGridItemState;
	readonly dragHandleCount: number;
	readonly resizeHandleCount: number;
	setMoving(value: boolean): void;
	setResizing(value: boolean): void;
};

/** Lifecycle kinds emitted by the adapter after translating engine interactions. */
export type WidgetGridAdapterInteraction = "moveStart" | "moving" | "moveEnd" | "resizeStart" | "resizing" | "resizeEnd";

/** Adapter callbacks implemented by the context state. */
export type WidgetGridAdapterCallbacks = {
	/** Publishes one translated lifecycle event and the current complete snapshot. */
	onInteraction(kind: WidgetGridAdapterInteraction, item: WidgetGridAdapterItem, state: WidgetGridItemState, states: WidgetGridItemState[]): void;
};

/**
 * Keeps all GridStack-specific DOM, option, and event translation behind the WidgetGrid API.
 */
export class WidgetGridAdapter {
	#root: HTMLElement | null = null;
	#grid: GridStack | null = null;
	#items = new Set<WidgetGridAdapterItem>();
	#resizeObserver: ResizeObserver | null = null;
	#mountVersion = 0;

	/**
	 * @param options - Reactive root configuration accessors.
	 * @param callbacks - Context-owned lifecycle publisher.
	 */
	constructor(
		private readonly options: WidgetGridAdapterOptions,
		private readonly callbacks: WidgetGridAdapterCallbacks
	) {}

	/**
	 * Initializes the browser-only engine for the rendered Root element.
	 *
	 * @param root - WidgetGrid Root DOM element.
	 */
	async mount(root: HTMLElement) {
		this.destroy();
		this.#root = root;
		const mountVersion = ++this.#mountVersion;
		const { GridStack } = await import("gridstack");
		if (this.#root !== root || mountVersion !== this.#mountVersion) return;

		this.#grid = GridStack.init(
			{
				auto: false,
				animate: true,
				alwaysShowResizeHandle: true,
				cellHeight: "auto",
				column: this.#resolveColumns(root.clientWidth),
				draggable: { handle: '[data-slot="widget-grid-drag-handle"]' },
				float: this.options.mode === "free",
				margin: Math.max(0, this.options.gap),
				resizable: { handles: "se", element: '[data-slot="widget-grid-resize-handle"]' }
			},
			root
		);

		if (!this.#grid) return;
		this.#bindEngineEvents();
		for (const item of this.#items) this.#makeItem(item);
		this.#resizeObserver = new ResizeObserver(() => this.#syncColumns());
		this.#resizeObserver.observe(root);
		this.updateOptions();
	}

	/** Destroys engine state, observers, and listeners without removing Svelte-owned DOM. */
	destroy() {
		this.#mountVersion++;
		this.#resizeObserver?.disconnect();
		this.#resizeObserver = null;
		this.#grid?.off("dragstart drag dragstop resizestart resize resizestop");
		this.#grid?.destroy(false);
		this.#grid = null;
		this.#root = null;
	}

	/**
	 * Adds an item to the adapter registry and initializes it when the engine is ready.
	 *
	 * @param item - Context-owned item registration.
	 */
	registerItem(item: WidgetGridAdapterItem) {
		this.#items.add(item);
		this.#makeItem(item);
	}

	/**
	 * Removes one item from the engine while leaving Svelte responsible for its DOM.
	 *
	 * @param item - Item registration being destroyed.
	 */
	unregisterItem(item: WidgetGridAdapterItem) {
		this.#items.delete(item);
		const element = item.element as GridItemHTMLElement | null;
		if (this.#grid && element?.gridstackNode) this.#grid.removeWidget(element, false, false);
	}

	/**
	 * Applies externally changed item props unless that same item is under direct interaction.
	 *
	 * @param item - Item whose public state changed.
	 */
	updateItem(item: WidgetGridAdapterItem) {
		const grid = this.#grid;
		const element = item.element as GridItemHTMLElement | null;
		if (!grid || !element?.gridstackNode) return;
		if (element.classList.contains("ui-draggable-dragging") || element.classList.contains("ui-resizable-resizing")) return;

		grid.update(element, this.#toEngineState(item, false));
		this.#syncItemInteraction(item);
	}

	/** Applies changed root columns, gap, mode, and interaction defaults to the active engine. */
	updateOptions() {
		const grid = this.#grid;
		if (!grid) return;
		grid.margin(Math.max(0, this.options.gap));
		grid.float(this.options.mode === "free");
		this.#syncColumns();
		for (const item of this.#items) this.#syncItemInteraction(item);
	}

	/**
	 * Re-scans the engine's explicit drag selector after a handle mounts or unmounts.
	 *
	 * @param item - Item whose handle registry changed.
	 */
	dragHandlesChanged(item: WidgetGridAdapterItem) {
		const grid = this.#grid;
		const element = item.element as GridItemHTMLElement | null;
		if (!grid || !element?.gridstackNode) return;
		if (item.dragHandleCount > 0) grid.refreshDragHandles(element);
		this.#syncItemInteraction(item);
	}

	/**
	 * Rebuilds native GridStack interaction bindings after the single ResizeHandle mounts.
	 *
	 * @param item - Item whose ResizeHandle registration changed.
	 */
	resizeHandleChanged(item: WidgetGridAdapterItem) {
		const grid = this.#grid;
		const element = item.element as GridItemHTMLElement | null;
		if (!grid || !element?.gridstackNode) return;
		if (item.resizeHandleCount > 0) grid.prepareDragDrop(element, true);
		this.#syncItemInteraction(item);
	}

	/** @returns A translated snapshot of every registered item in current DOM order. */
	snapshot() {
		const orderedElements = this.#root ? Array.from(this.#root.children) : [];
		const orderedItems = [...this.#items].sort(
			(a, b) => orderedElements.indexOf(a.element as Element) - orderedElements.indexOf(b.element as Element)
		);
		return orderedItems.map((item) => this.#readState(item));
	}

	/** @param item - Item to initialize as one engine widget. */
	#makeItem(item: WidgetGridAdapterItem) {
		const grid = this.#grid;
		const element = item.element as GridItemHTMLElement | null;
		if (!grid || !element || element.gridstackNode) return;
		grid.makeWidget(element, this.#toEngineState(item, true));
		if (item.dragHandleCount > 0) grid.refreshDragHandles(element);
		this.#syncItemInteraction(item);
	}

	/** @param item - Public item translated into engine creation or update options. */
	#toEngineState(item: WidgetGridAdapterItem, initial: boolean): GridStackWidget {
		const state = item.state;
		const result: GridStackWidget = {
			w: state.width ?? 1,
			h: state.height ?? 1,
			minW: state.minWidth,
			maxW: state.maxWidth,
			minH: state.minHeight,
			maxH: state.maxHeight,
			locked: state.static === true,
			noMove: !this.#canMove(item),
			noResize: !this.#canResize(item)
		};

		if (state.x !== undefined) result.x = state.x;
		if (state.y !== undefined) result.y = state.y;
		if (initial && (state.x === undefined || state.y === undefined)) result.autoPosition = true;
		return result;
	}

	/** @param item - Item whose effective drag and resize enablement should be updated. */
	#syncItemInteraction(item: WidgetGridAdapterItem) {
		const grid = this.#grid;
		const element = item.element as GridItemHTMLElement | null;
		if (!grid || !element?.gridstackNode) return;
		grid.movable(element, this.#canMove(item));
		grid.resizable(element, this.#canResize(item));
	}

	/** @param item - Item tested against root, item, static, and explicit-handle drag rules. */
	#canMove(item: WidgetGridAdapterItem) {
		const state = item.state;
		return !this.options.disabled && state.static !== true && (state.draggable ?? this.options.draggable) && item.dragHandleCount > 0;
	}

	/** @param item - Item tested against root, item, static, and explicit-handle resize rules. */
	#canResize(item: WidgetGridAdapterItem) {
		const state = item.state;
		return !this.options.disabled && state.static !== true && (state.resizable ?? this.options.resizable) && item.resizeHandleCount === 1;
	}

	/** Registers translated native GridStack drag and resize events. */
	#bindEngineEvents() {
		this.#grid
			?.on("dragstart", (_event, element) => this.#emit("moveStart", element))
			.on("drag", (_event, element) => this.#emit("moving", element))
			.on("dragstop", (_event, element) => this.#emit("moveEnd", element))
			.on("resizestart", (_event, element) => this.#emit("resizeStart", element))
			.on("resize", (_event, element) => this.#emit("resizing", element))
			.on("resizestop", (_event, element) => this.#emit("resizeEnd", element));
	}

	/** @param element - Engine element mapped back to its context registration. */
	#findItem(element: Element) {
		return [...this.#items].find((item) => item.element === element);
	}

	/**
	 * Publishes one translated interaction and keeps public state attributes synchronized.
	 *
	 * @param kind - Public lifecycle phase.
	 * @param element - Directly affected engine widget element.
	 */
	#emit(kind: WidgetGridAdapterInteraction, element: Element) {
		const item = this.#findItem(element);
		if (!item) return;
		if (kind === "moveStart") item.setMoving(true);
		if (kind === "moveEnd") item.setMoving(false);
		if (kind === "resizeStart") item.setResizing(true);
		if (kind === "resizeEnd") item.setResizing(false);
		this.callbacks.onInteraction(kind, item, this.#readState(item), this.snapshot());
	}

	/** @param item - Registration whose engine position is merged with public configuration. */
	#readState(item: WidgetGridAdapterItem): WidgetGridItemState {
		const configured = item.state;
		const node = (item.element as GridItemHTMLElement | null)?.gridstackNode;
		return {
			id: configured.id,
			x: node?.x ?? configured.x ?? 0,
			y: node?.y ?? configured.y ?? 0,
			width: node?.w ?? configured.width ?? 1,
			height: node?.h ?? configured.height ?? 1,
			minWidth: configured.minWidth,
			maxWidth: configured.maxWidth,
			minHeight: configured.minHeight,
			maxHeight: configured.maxHeight,
			draggable: configured.draggable,
			resizable: configured.resizable,
			static: configured.static
		};
	}

	/** @param width - Current Root width used to select a configured minimum-width breakpoint. */
	#resolveColumns(width: number) {
		if (typeof this.options.columns === "number") return Math.max(1, Math.floor(this.options.columns));
		let columns = 1;
		for (const [breakpoint, minimumWidth] of Object.entries(BREAKPOINT_WIDTHS)) {
			const configured = this.options.columns[breakpoint as keyof typeof BREAKPOINT_WIDTHS];
			if (configured !== undefined && width >= minimumWidth) columns = configured;
		}
		return Math.max(1, Math.floor(columns));
	}

	/** Updates the engine column count from the Root's observed content width. */
	#syncColumns() {
		if (!this.#grid || !this.#root) return;
		const columns = this.#resolveColumns(this.#root.clientWidth);
		if (this.#grid.getColumn() !== columns) this.#grid.column(columns, this.options.mode === "stack" ? "compact" : "move");
	}
}

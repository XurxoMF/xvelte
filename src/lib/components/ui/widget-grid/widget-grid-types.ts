/** Responsive column-count keys resolved from the WidgetGrid container width. */
export type WidgetGridBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** Collision and compaction behavior used while arranging widgets. */
export type WidgetGridMode = "stack" | "free";

/** Persistable position, dimensions, constraints, and interaction settings for one widget. */
export type WidgetGridItemState = {
	/** Stable application identifier included in lifecycle snapshots. */
	id: string | number;
	/** Zero-based horizontal grid position, or automatic placement when omitted. */
	x?: number | undefined;
	/** Zero-based vertical grid position, or automatic placement when omitted. */
	y?: number | undefined;
	/** Width in grid columns. */
	width?: number | undefined;
	/** Height in grid rows. */
	height?: number | undefined;
	/** Minimum width in grid columns. */
	minWidth?: number | undefined;
	/** Maximum width in grid columns. */
	maxWidth?: number | undefined;
	/** Minimum height in grid rows. */
	minHeight?: number | undefined;
	/** Maximum height in grid rows. */
	maxHeight?: number | undefined;
	/** Item-level override for manual dragging. */
	draggable?: boolean | undefined;
	/** Item-level override for manual resizing. */
	resizable?: boolean | undefined;
	/** Fully locks the widget against moving, resizing, and collision reflow. */
	static?: boolean | undefined;
};

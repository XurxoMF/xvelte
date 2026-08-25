import type { RootProps } from "./scroll-area-root.svelte";
import type { ViewportProps } from "./scroll-area-viewport.svelte";
import type { ScrollbarVerticalProps, VerticalThumbProps } from "./scroll-area-scrollbar-vertical.svelte";
import type { HorizontalThumbProps, ScrollbarHorizontalProps } from "./scroll-area-scrollbar-horizontal.svelte";

import Root from "./scroll-area-root.svelte";
import Viewport from "./scroll-area-viewport.svelte";
import ScrollbarVertical from "./scroll-area-scrollbar-vertical.svelte";
import ScrollbarHorizontal from "./scroll-area-scrollbar-horizontal.svelte";

export {
	Root,
	Viewport,
	ScrollbarVertical,
	ScrollbarHorizontal,
	//
	type RootProps,
	type ViewportProps,
	type ScrollbarVerticalProps,
	type ScrollbarHorizontalProps,
	type VerticalThumbProps,
	type HorizontalThumbProps
};

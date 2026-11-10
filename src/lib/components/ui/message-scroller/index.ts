import { useMessageScroller, useMessageScrollerScrollable, useMessageScrollerVisibility } from "@shadcn-svelte/primitives/message-scroller";

import type {
	MessageScrollerDefaultScrollPosition,
	MessageScrollerScrollAlign,
	MessageScrollerScrollable,
	MessageScrollerScrollOptions,
	MessageScrollerVisibilityState
} from "@shadcn-svelte/primitives/message-scroller";
import type { ButtonProps } from "./message-scroller-button.svelte";
import type { ContentProps } from "./message-scroller-content.svelte";
import type { ItemProps } from "./message-scroller-item.svelte";
import type { ProviderProps } from "./message-scroller-provider.svelte";
import type { RootProps } from "./message-scroller-root.svelte";
import type { ViewportProps } from "./message-scroller-viewport.svelte";

import Button from "./message-scroller-button.svelte";
import Content from "./message-scroller-content.svelte";
import Item from "./message-scroller-item.svelte";
import Provider from "./message-scroller-provider.svelte";
import Root from "./message-scroller-root.svelte";
import Viewport from "./message-scroller-viewport.svelte";

/** Initial transcript position applied on the first non-empty render. */
type DefaultScrollPosition = MessageScrollerDefaultScrollPosition;

/** Alignment accepted by programmatic message jumps. */
type ScrollAlign = MessageScrollerScrollAlign;

/** Options accepted by Message Scroller's programmatic scroll commands. */
type ScrollOptions = MessageScrollerScrollOptions;

/** Snapshot describing whether more transcript content exists at either edge. */
type Scrollable = MessageScrollerScrollable;

/** Snapshot of the visible message IDs and current anchored turn. */
type VisibilityState = MessageScrollerVisibilityState;

export {
	Provider,
	Root,
	Viewport,
	Content,
	Item,
	Button,
	//
	type ProviderProps,
	type RootProps,
	type ViewportProps,
	type ContentProps,
	type ItemProps,
	type ButtonProps,
	//
	type DefaultScrollPosition,
	type ScrollAlign,
	type ScrollOptions,
	type Scrollable,
	type VisibilityState,
	//
	useMessageScroller,
	useMessageScrollerScrollable,
	useMessageScrollerVisibility
};

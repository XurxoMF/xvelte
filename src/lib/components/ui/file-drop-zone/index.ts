import type { RootProps } from "./file-drop-zone-root.svelte";
import type { TriggerProps } from "./file-drop-zone-trigger.svelte";
import type { DragOverlayProps } from "./file-drop-zone-drag-overlay.svelte";
import type { FileRejectedReason } from "./file-drop-zone-context.svelte.js";

import Root from "./file-drop-zone-root.svelte";
import Trigger from "./file-drop-zone-trigger.svelte";
import DragOverlay from "./file-drop-zone-drag-overlay.svelte";
import { ACCEPT_AUDIO, ACCEPT_IMAGE, ACCEPT_VIDEO, BYTE, GIGABYTE, KILOBYTE, MEGABYTE, displaySize } from "./file-drop-zone-utils";

export {
	Root,
	Trigger,
	DragOverlay,
	//
	type RootProps,
	type TriggerProps,
	type DragOverlayProps,
	type FileRejectedReason,
	//
	ACCEPT_AUDIO,
	ACCEPT_IMAGE,
	ACCEPT_VIDEO,
	BYTE,
	KILOBYTE,
	MEGABYTE,
	GIGABYTE,
	displaySize
};

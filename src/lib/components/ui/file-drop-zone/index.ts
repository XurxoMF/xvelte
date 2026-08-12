import Root, { type RootProps } from "./file-drop-zone-root.svelte";
import Trigger, { type TriggerProps } from "./file-drop-zone-trigger.svelte";
import Textarea, { type TextareaProps } from "./file-drop-zone-textarea.svelte";
import DragOverlay, { type DragOverlayProps } from "./file-drop-zone-drag-overlay.svelte";
import type { FileRejectedReason } from "./file-drop-zone-context.svelte.js";
import { ACCEPT_AUDIO, ACCEPT_IMAGE, ACCEPT_VIDEO, BYTE, GIGABYTE, KILOBYTE, MEGABYTE, displaySize } from "./file-drop-zone-utils";

export {
	Root,
	Trigger,
	Textarea,
	DragOverlay,
	//
	type RootProps,
	type TriggerProps,
	type TextareaProps,
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

import Root from "./file-drop-zone-root.svelte";
import Textarea, { type TextareaProps } from "./file-drop-zone-textarea.svelte";
import Trigger from "./file-drop-zone-trigger.svelte";
import type { FileDropZoneRootProps, FileDropZoneTriggerProps, FileRejectedReason } from "./types";

export {
	Root,
	Trigger,
	Textarea,
	type FileDropZoneRootProps as RootProps,
	type FileDropZoneTriggerProps as TriggerProps,
	type TextareaProps,
	type FileRejectedReason
};
export { ACCEPT_AUDIO, ACCEPT_IMAGE, ACCEPT_VIDEO, BYTE, GIGABYTE, KILOBYTE, MEGABYTE, displaySize } from "./file-drop-zone-utils";

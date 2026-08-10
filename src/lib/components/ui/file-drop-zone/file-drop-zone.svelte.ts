import type { HTMLAttributes } from "svelte/elements";

import { Context } from "runed";
import type { ReadableBoxedValues } from "svelte-toolbelt";

export type FileRejectedReason = "Maximum file size exceeded" | "File type not allowed" | "Maximum files uploaded";

type FileDropZoneStateOptions = ReadableBoxedValues<{
	id: string;
	disabled: boolean;
	onUpload: (files: File[]) => Promise<void>;
	maxFiles: number | undefined;
	fileCount: number | undefined;
	maxFileSize: number | undefined;
	onFileRejected: ((opts: { reason: FileRejectedReason; file: File }) => void) | undefined;
	accept: string | undefined;
}>;

/** Validates files and coordinates uploads shared by all drop-zone parts. */
class FileDropZoneState {
	uploading = $state(false);

	/** @param opts - Boxed constraints, callbacks, and native input options. */
	constructor(readonly opts: FileDropZoneStateOptions) {
		if (this.opts.maxFiles !== undefined && this.opts.fileCount === undefined) {
			console.warn("Make sure to provide FileDropZone with `fileCount` when using the `maxFiles` prompt");
		}

		this.onchange = this.onchange.bind(this);
		this.ondrop = this.ondrop.bind(this);
	}

	/** @param e - Drop event containing files to validate and upload. */
	async ondrop(
		e: DragEvent & {
			currentTarget: EventTarget;
		}
	) {
		if (this.opts.disabled.current || !this.canUploadFiles) return;

		e.preventDefault();

		const droppedFiles = Array.from(e.dataTransfer?.files ?? []);

		await this.upload(droppedFiles);
	}

	/** @param e - Native file-input change event. */
	async onchange(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (this.opts.disabled.current) return;

		const selectedFiles = e.currentTarget.files;

		if (!selectedFiles) return;

		await this.upload(Array.from(selectedFiles));

		// Reset the native input so selecting the same rejected file emits another change event.
		(e.target as HTMLInputElement).value = "";
	}

	/**
	 * Validates one file against size, count, extension, and MIME constraints.
	 *
	 * @param file - File to validate.
	 * @param fileNumber - One-based count including previously uploaded files.
	 * @returns The first rejection reason, or undefined when accepted.
	 */
	shouldAcceptFile(file: File, fileNumber: number): FileRejectedReason | undefined {
		if (this.opts.maxFileSize.current !== undefined && file.size > this.opts.maxFileSize.current) return "Maximum file size exceeded";

		if (this.opts.maxFiles.current !== undefined && fileNumber > this.opts.maxFiles.current) return "Maximum files uploaded";

		if (!this.opts.accept.current) return undefined;

		const acceptedTypes = this.opts.accept.current.split(",").map((a) => a.trim().toLowerCase());
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			// Empty MIME values and explicit extensions are matched against the filename.
			if (fileType === "" || pattern.startsWith(".")) {
				return fileName.endsWith(pattern);
			}

			// Wildcards such as `video/*` accept every subtype in the requested MIME family.
			if (pattern.endsWith("/*")) {
				const baseType = pattern.slice(0, pattern.indexOf("/*"));
				return fileType.startsWith(baseType + "/");
			}

			// Remaining patterns are exact MIME types such as `video/mp4`.
			return fileType === pattern;
		});

		if (!isAcceptable) return "File type not allowed";

		return undefined;
	}

	/** @param uploadFiles - Candidate files to validate before invoking the upload callback. */
	upload = async (uploadFiles: File[]) => {
		this.uploading = true;
		try {
			const validFiles: File[] = [];

			for (let i = 0; i < uploadFiles.length; i++) {
				const file = uploadFiles[i];
				const rejectedReason = this.shouldAcceptFile(file, (this.opts.fileCount?.current ?? 0) + i + 1);

				if (rejectedReason) {
					this.opts.onFileRejected.current?.({ file, reason: rejectedReason });
					continue;
				}

				validFiles.push(file);
			}

			if (validFiles.length > 0) await this.opts.onUpload.current(validFiles);
		} finally {
			this.uploading = false;
		}
	};

	canUploadFiles = $derived.by(() => {
		if (this.opts.disabled.current) return false;
		if (this.uploading) return false;
		if (
			this.opts.maxFiles.current !== undefined &&
			this.opts.fileCount.current !== undefined &&
			this.opts.fileCount.current >= this.opts.maxFiles.current
		)
			return false;
		return true;
	});

	props = $derived.by(() => ({
		disabled: !this.canUploadFiles,
		id: this.opts.id.current,
		accept: this.opts.accept.current,
		multiple: this.opts.maxFiles.current === undefined || this.opts.maxFiles.current - (this.opts.fileCount.current ?? 0) > 1,
		type: "file",
		onchange: this.onchange
	}));
}

/** Adapts a label-like trigger into a drag-and-drop target. */
class FileDropZoneTrigger {
	/** @param rootState - Drop-zone state that receives dropped files. */
	constructor(readonly rootState: FileDropZoneState) {}

	/** @param e - Drag event whose default must be prevented to allow dropping. */
	ondragover(e: DragEvent) {
		e.preventDefault();
	}

	/** @param e - Drop event forwarded to the root uploader. */
	ondrop(
		e: DragEvent & {
			currentTarget: EventTarget & HTMLLabelElement;
		}
	) {
		this.rootState.ondrop(e);
	}

	props = $derived.by(() => ({
		ondragover: this.ondragover.bind(this),
		ondrop: this.ondrop.bind(this),
		for: this.rootState.opts.id.current,
		"aria-disabled": !this.rootState.canUploadFiles
	}));
}

type FileDropZoneTextareaOptions = ReadableBoxedValues<{
	ondragover: HTMLAttributes<HTMLTextAreaElement>["ondragover"];
	ondrop: HTMLAttributes<HTMLTextAreaElement>["ondrop"];
	onpaste: HTMLAttributes<HTMLTextAreaElement>["onpaste"];
}>;

/** Adds file drag-and-drop and paste behavior to a textarea. */
class FileDropZoneTextareaState {
	/**
	 * @param opts - Boxed native handlers to preserve after internal behavior.
	 * @param rootState - Drop-zone state that receives extracted files.
	 */
	constructor(
		readonly opts: FileDropZoneTextareaOptions,
		readonly rootState: FileDropZoneState
	) {}

	/** @param e - Drag event whose default is prevented before forwarding. */
	ondragover(e: Parameters<NonNullable<HTMLAttributes<HTMLTextAreaElement>["ondragover"]>>[0]) {
		e.preventDefault();
		this.opts.ondragover.current?.(e);
	}

	/** @param e - Drop event sent to both internal and consumer handlers. */
	ondrop(e: Parameters<NonNullable<HTMLAttributes<HTMLTextAreaElement>["ondrop"]>>[0]) {
		this.rootState.ondrop(e);
		this.opts.ondrop.current?.(e);
	}

	/** @param e - Paste event from which clipboard files are extracted. */
	onpaste(e: Parameters<NonNullable<HTMLAttributes<HTMLTextAreaElement>["onpaste"]>>[0]) {
		const clipboardData = e.clipboardData;
		if (!clipboardData) {
			this.opts.onpaste.current?.(e);
			return;
		}

		const files = Array.from(clipboardData.items)
			.map((item) => item.getAsFile())
			.filter((file) => file !== null);

		this.rootState.upload(files);

		this.opts.onpaste.current?.(e);
	}

	props = $derived.by(() => ({
		ondragover: this.ondragover.bind(this),
		ondrop: this.ondrop.bind(this),
		onpaste: this.onpaste.bind(this)
	}));
}

const ctx = new Context<FileDropZoneState>("file-drop-zone-state");

/** @param opts - Boxed upload constraints and callbacks to provide to descendants. */
export function useFileDropZone(opts: FileDropZoneStateOptions) {
	return ctx.set(new FileDropZoneState(opts));
}

/** @returns Trigger behavior connected to the nearest drop-zone root. */
export function useFileDropZoneTrigger() {
	return new FileDropZoneTrigger(ctx.get());
}

/** @param opts - Boxed textarea handlers to compose with file behavior. */
export function useFileDropZoneTextarea(opts: FileDropZoneTextareaOptions) {
	return new FileDropZoneTextareaState(opts, ctx.get());
}

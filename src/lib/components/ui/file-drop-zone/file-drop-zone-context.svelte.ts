import { createContext } from "svelte";

/** Returns the files carried by a drag or clipboard data transfer. */
function getFiles(dataTransfer: DataTransfer | null): File[] {
	return Array.from(dataTransfer?.files ?? []);
}

/** Returns whether a drag data transfer contains files. */
function hasFiles(dataTransfer: DataTransfer | null): boolean {
	return dataTransfer?.types.includes("Files") ?? false;
}

/** Reasons a candidate file can be rejected before upload. */
export type FileRejectedReason = "Maximum file size exceeded" | "File type not allowed" | "Maximum files uploaded";

type FileDropZoneOptions = {
	readonly id: string;
	readonly disabled: boolean;
	readonly onUpload: (files: File[]) => Promise<void>;
	readonly maxFiles: number | undefined;
	readonly fileCount: number | undefined;
	readonly maxFileSize: number | undefined;
	readonly onFileRejected: ((options: { reason: FileRejectedReason; file: File }) => void) | undefined;
	readonly accept: string | undefined;
};

/** Validates files and coordinates uploads shared by all drop-zone parts. */
export class FileDropZoneContext {
	uploading = $state(false);

	/** @param options - Reactive constraints, callbacks, and native input options. */
	constructor(readonly options: FileDropZoneOptions) {
		if (this.options.maxFiles !== undefined && this.options.fileCount === undefined) {
			console.warn("Make sure to provide FileDropZone with `fileCount` when using the `maxFiles` prompt");
		}
	}

	/** @param event - Drop event containing files to validate and upload. */
	ondrop = async (event: DragEvent & { currentTarget: EventTarget }) => {
		if (this.options.disabled || !this.canUploadFiles) return;

		event.preventDefault();
		await this.upload(getFiles(event.dataTransfer));
	};

	/** @param event - Document paste event whose clipboard files should be uploaded. */
	onpaste = async (event: ClipboardEvent) => {
		if (this.options.disabled || !this.canUploadFiles) return;

		const files = getFiles(event.clipboardData);
		if (files.length > 0) await this.upload(files);
	};

	/** @param event - Native file-input change event. */
	onchange = async (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		if (this.options.disabled) return;

		const files = event.currentTarget.files;
		if (!files) return;

		await this.upload(Array.from(files));

		// Reset the input so selecting the same rejected file emits another change event.
		event.currentTarget.value = "";
	};

	/**
	 * Validates one file against size, count, extension, and MIME constraints.
	 *
	 * @param file - File to validate.
	 * @param fileNumber - One-based count including previously uploaded files.
	 * @returns The first rejection reason, or undefined when accepted.
	 */
	shouldAcceptFile(file: File, fileNumber: number): FileRejectedReason | undefined {
		if (this.options.maxFileSize !== undefined && file.size > this.options.maxFileSize) return "Maximum file size exceeded";
		if (this.options.maxFiles !== undefined && fileNumber > this.options.maxFiles) return "Maximum files uploaded";
		if (!this.options.accept) return undefined;

		const acceptedTypes = this.options.accept.split(",").map((value) => value.trim().toLowerCase());
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			// Empty MIME values and explicit extensions are matched against the filename.
			if (fileType === "" || pattern.startsWith(".")) return fileName.endsWith(pattern);

			// Wildcards such as `video/*` accept every subtype in the requested MIME family.
			if (pattern.endsWith("/*")) {
				const baseType = pattern.slice(0, pattern.indexOf("/*"));
				return fileType.startsWith(`${baseType}/`);
			}

			return fileType === pattern;
		});

		return isAcceptable ? undefined : "File type not allowed";
	}

	/** @param files - Candidate files to validate before invoking the upload callback. */
	upload = async (files: File[]) => {
		this.uploading = true;

		try {
			const validFiles: File[] = [];

			for (let index = 0; index < files.length; index++) {
				const file = files[index];
				const reason = this.shouldAcceptFile(file, (this.options.fileCount ?? 0) + index + 1);

				if (reason) {
					this.options.onFileRejected?.({ file, reason });
					continue;
				}

				validFiles.push(file);
			}

			if (validFiles.length > 0) await this.options.onUpload(validFiles);
		} finally {
			this.uploading = false;
		}
	};

	canUploadFiles = $derived.by(() => {
		if (this.options.disabled || this.uploading) return false;
		if (this.options.maxFiles !== undefined && this.options.fileCount !== undefined && this.options.fileCount >= this.options.maxFiles) return false;

		return true;
	});

	props = $derived.by(() => ({
		disabled: !this.canUploadFiles,
		id: this.options.id,
		accept: this.options.accept,
		multiple: this.options.maxFiles === undefined || this.options.maxFiles - (this.options.fileCount ?? 0) > 1,
		type: "file" as const,
		onchange: this.onchange
	}));
}

type FileDropZoneDragOverlayOptions = {
	readonly disabled: boolean;
};

/** Tracks page-level file drags and coordinates drops with the root upload state. */
export class FileDropZoneDragOverlayState {
	#depth = $state(0);

	/**
	 * @param options - Reactive overlay configuration.
	 * @param fileDropZone - Parent drop-zone state receiving accepted drops.
	 */
	constructor(
		readonly options: FileDropZoneDragOverlayOptions,
		readonly fileDropZone: FileDropZoneContext
	) {}

	canDropFiles = $derived.by(() => !this.options.disabled && this.fileDropZone.canUploadFiles);
	show = $derived.by(() => this.#depth > 0 && this.canDropFiles);

	/** @param event - Window drag-enter event used to track nested targets. */
	ondragenter = (event: DragEvent) => {
		if (hasFiles(event.dataTransfer)) this.#depth++;
	};

	/** @param event - Window drag-leave event used to track nested targets. */
	ondragleave = (event: DragEvent) => {
		if (hasFiles(event.dataTransfer)) this.#depth = Math.max(this.#depth - 1, 0);
	};

	/** @param event - Drag-over event that enables a file drop while the overlay is visible. */
	ondragover = (event: DragEvent) => {
		if (this.show) event.preventDefault();
	};

	/** Clears the nested drag depth after a drop, drag end, or cancelled drag. */
	reset = () => {
		this.#depth = 0;
	};

	/** @param event - Overlay drop event whose files should be uploaded. */
	ondrop = async (event: DragEvent & { currentTarget: EventTarget }) => {
		this.reset();
		if (this.canDropFiles) await this.fileDropZone.ondrop(event);
	};
}

const [getFileDropZoneContext, provideFileDropZoneContext] = createContext<FileDropZoneContext>();

/** @param options - Reactive upload constraints and callbacks to provide to descendants. */
export function setFileDropZoneContext(options: FileDropZoneOptions) {
	return provideFileDropZoneContext(new FileDropZoneContext(options));
}

/** @returns The state from the nearest file-drop-zone root. */
export { getFileDropZoneContext };

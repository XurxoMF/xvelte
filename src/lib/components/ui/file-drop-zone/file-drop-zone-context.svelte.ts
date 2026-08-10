import { createContext } from "svelte";

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
		await this.upload(Array.from(event.dataTransfer?.files ?? []));
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

const [getFileDropZoneContext, provideFileDropZoneContext] = createContext<FileDropZoneContext>();

/** @param options - Reactive upload constraints and callbacks to provide to descendants. */
export function setFileDropZoneContext(options: FileDropZoneOptions) {
	return provideFileDropZoneContext(new FileDropZoneContext(options));
}

/** @returns The state from the nearest file-drop-zone root. */
export { getFileDropZoneContext };

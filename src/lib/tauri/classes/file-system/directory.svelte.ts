import { invoke } from "@tauri-apps/api/core";
import { dirname, join } from "@tauri-apps/api/path";
import { exists, mkdir, readDir, remove } from "@tauri-apps/plugin-fs";

import { File } from "./file.svelte";

/** Values required to construct a directory without resolving its parent path. */
export type DirectoryOptions = {
	/** Absolute directory path accepted by the configured Tauri filesystem scope. */
	path: string;
	/** Parent directory, or `null` when this path is a filesystem root. */
	parent: Directory | null;
};

/** Files and child directories immediately contained by a directory. */
export type DirectoryContents = {
	/** File models in the directory. */
	files: File[];
	/** Child directory models in the directory. */
	directories: Directory[];
};

/** Creates a contextual standard error while preserving the original failure. */
function directoryError(action: string, path: string, cause: unknown): Error {
	return new Error(`Failed to ${action} directory "${path}".`, { cause });
}

/** Checks the platform path error emitted when a filesystem root has no parent. */
function isMissingParentError(cause: unknown): boolean {
	return String(cause).toLowerCase().includes("path does not have a parent");
}

/** Represents a directory available through Tauri's scoped filesystem APIs. */
export class Directory {
	private readonly _path: string;
	private readonly _parent: Directory | null;

	/**
	 * Creates a directory model from an already resolved path and parent.
	 * @param options - Directory path and its resolved parent.
	 */
	constructor(options: DirectoryOptions) {
		this._path = options.path;
		this._parent = options.parent;
	}

	/** Absolute path represented by this instance. */
	get path(): string {
		return this._path;
	}

	/** Parent directory, or `null` for a filesystem root. */
	get parent(): Directory | null {
		return this._parent;
	}

	/**
	 * Resolves a path and its ancestors into directory models without creating them on disk.
	 * @param path - Absolute directory path accepted by the configured Tauri filesystem scope.
	 * @returns A model created by the class on which the method was called.
	 */
	static async create<T extends Directory>(this: new (options: DirectoryOptions) => T, path: string): Promise<T> {
		try {
			let parent: Directory | null = null;

			try {
				const parentPath = await dirname(path);
				if (parentPath !== path) parent = await Directory.create(parentPath);
			} catch (cause) {
				if (!isMissingParentError(cause)) throw cause;
			}

			return new this({ path, parent });
		} catch (cause) {
			throw directoryError("resolve", path, cause);
		}
	}

	/** Ensures that the directory exists, creating missing ancestors recursively. */
	async ensureExists(): Promise<void> {
		try {
			if (await exists(this.path)) return;

			await mkdir(this.path, { recursive: true });
		} catch (cause) {
			throw directoryError("ensure", this.path, cause);
		}
	}

	/**
	 * Checks whether the directory exists.
	 * @returns Whether an entry exists at the directory path.
	 */
	async exists(): Promise<boolean> {
		try {
			return await exists(this.path);
		} catch (cause) {
			throw directoryError("check", this.path, cause);
		}
	}

	/**
	 * Changes the Unix permission bits of the directory after ensuring it exists; other platforms validate access and perform no mutation.
	 * @param mode - Unix permission bits between `0o0000` and `0o7777`.
	 */
	async setPermissions(mode: number): Promise<void> {
		try {
			await this.ensureExists();
			await invoke("set_path_permissions", { path: this.path, mode });
		} catch (cause) {
			throw directoryError("set permissions for", this.path, cause);
		}
	}

	/**
	 * Checks whether the directory is absent or contains no entries.
	 * @returns `true` when the directory is absent or empty.
	 */
	async isEmpty(): Promise<boolean> {
		try {
			if (!(await exists(this.path))) return true;

			return (await readDir(this.path)).length === 0;
		} catch (cause) {
			throw directoryError("inspect", this.path, cause);
		}
	}

	/**
	 * Reads the directory's immediate children as file and directory models.
	 * @returns Separate arrays of files and directories.
	 */
	async getContents(): Promise<DirectoryContents> {
		try {
			if (!(await exists(this.path))) return { files: [], directories: [] };

			const files: File[] = [];
			const directories: Directory[] = [];

			for (const entry of await readDir(this.path)) {
				const path = await this.join(entry.name);

				if (entry.isDirectory) directories.push(await Directory.create(path));
				else files.push(new File({ path, directory: this }));
			}

			return { files, directories };
		} catch (cause) {
			throw directoryError("read", this.path, cause);
		}
	}

	/** Deletes the directory and all of its contents when it exists. */
	async delete(): Promise<void> {
		try {
			if (!(await exists(this.path))) return;

			await remove(this.path, { recursive: true });
		} catch (cause) {
			throw directoryError("delete", this.path, cause);
		}
	}

	/**
	 * Joins child path segments onto this directory using the host platform's separator.
	 * @param paths - Child path segments to append.
	 * @returns The joined absolute path.
	 */
	async join(...paths: string[]): Promise<string> {
		return join(this.path, ...paths);
	}
}

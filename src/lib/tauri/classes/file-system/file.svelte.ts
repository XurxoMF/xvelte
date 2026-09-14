import { invoke } from "@tauri-apps/api/core";
import { dirname } from "@tauri-apps/api/path";
import { create as createFile, exists, readTextFile, remove, writeTextFile } from "@tauri-apps/plugin-fs";

import { Directory } from "./directory.svelte";

/** Values required to construct a filesystem file without resolving its parent path. */
export type FileOptions = {
	/** Absolute file path accepted by the configured Tauri filesystem scope. */
	path: string;
	/** Parent directory associated with the file. */
	directory: Directory;
};

/** Creates a contextual standard error while preserving the original failure. */
function fileError(action: string, path: string, cause: unknown): Error {
	return new Error(`Failed to ${action} file "${path}".`, { cause });
}

/** Represents a file available through Tauri's scoped filesystem APIs. */
export class File {
	private readonly _path: string;
	private readonly _dir: Directory;

	/**
	 * Creates a file model from an already resolved path and parent directory.
	 * @param options - File path and its parent directory.
	 */
	constructor(options: FileOptions) {
		this._path = options.path;
		this._dir = options.directory;
	}

	/** Absolute path represented by this instance. */
	get path(): string {
		return this._path;
	}

	/** Parent directory represented by this instance. */
	get dir(): Directory {
		return this._dir;
	}

	/**
	 * Resolves a path into a new file model without creating the file on disk.
	 * The polymorphic constructor keeps inherited calls such as `ImageFile.create()` typed as the subclass.
	 * @param path - Absolute file path accepted by the configured Tauri filesystem scope.
	 * @returns A model created by the class on which the method was called.
	 */
	static async create<T extends File>(this: new (options: FileOptions) => T, path: string): Promise<T> {
		try {
			const directory = await Directory.create(await dirname(path));

			return new this({ path, directory });
		} catch (cause) {
			throw fileError("resolve", path, cause);
		}
	}

	/** Ensures that the parent directory and file exist, creating either one when absent. */
	async ensureExists(): Promise<void> {
		try {
			await this.dir.ensureExists();

			if (await exists(this.path)) return;

			const handle = await createFile(this.path);
			await handle.close();
		} catch (cause) {
			throw fileError("ensure", this.path, cause);
		}
	}

	/**
	 * Checks whether the file exists.
	 * @returns Whether an entry exists at the file path.
	 */
	async exists(): Promise<boolean> {
		try {
			return await exists(this.path);
		} catch (cause) {
			throw fileError("check", this.path, cause);
		}
	}

	/** Deletes the file when it exists. */
	async delete(): Promise<void> {
		try {
			if (!(await exists(this.path))) return;

			await remove(this.path);
		} catch (cause) {
			throw fileError("delete", this.path, cause);
		}
	}

	/**
	 * Changes the Unix permission bits of the file after ensuring it exists; other platforms validate access and perform no mutation.
	 * @param mode - Unix permission bits between `0o0000` and `0o7777`.
	 */
	async setPermissions(mode: number): Promise<void> {
		try {
			await this.ensureExists();
			await invoke("set_path_permissions", { path: this.path, mode });
		} catch (cause) {
			throw fileError("set permissions for", this.path, cause);
		}
	}

	/**
	 * Reads the complete file as UTF-8 text, creating an empty file first when absent.
	 * @returns The file contents.
	 */
	async readText(): Promise<string> {
		try {
			await this.ensureExists();

			return await readTextFile(this.path);
		} catch (cause) {
			throw fileError("read", this.path, cause);
		}
	}

	/**
	 * Replaces the file contents with UTF-8 text, creating the file and its parent directories when absent.
	 * @param text - Complete text to write.
	 */
	async writeText(text: string): Promise<void> {
		try {
			await this.ensureExists();
			await writeTextFile(this.path, text);
		} catch (cause) {
			throw fileError("write", this.path, cause);
		}
	}

	/**
	 * Parses the complete file as JSON. An empty file returns an empty object for compatibility with newly ensured files.
	 * @returns The parsed JSON value.
	 */
	async readJSON<T>(): Promise<T> {
		try {
			const contents = await this.readText();

			return contents.trim() === "" ? ({} as T) : (JSON.parse(contents) as T);
		} catch (cause) {
			throw fileError("read JSON from", this.path, cause);
		}
	}

	/**
	 * Serializes a value as indented JSON and replaces the file contents.
	 * @param data - JSON-compatible value to serialize.
	 */
	async writeJSON<T>(data: T): Promise<void> {
		try {
			await this.writeText(JSON.stringify(data, null, 4));
		} catch (cause) {
			throw fileError("write JSON to", this.path, cause);
		}
	}
}

# File system

Reactive-ready `File` and `Directory` models for creating, inspecting, reading, writing, and deleting scoped filesystem entries in a Tauri application, with recursive directory handling, JSON convenience methods, platform-aware paths, and Unix permission updates. Use them for native filesystem state that benefits from an extensible class API; do not use them in a normal browser or as a replacement for Tauri capability scopes.

## Contents

- [Import](#import)
- [Basic usage](#basic-usage)
- [Extending File](#extending-file)
- [Public API](#public-api)
- [Runtime and security](#runtime-and-security)
- [Accessibility and localization](#accessibility-and-localization)
- [Dependencies](#dependencies)
- [File organization](#file-organization)

---

## Import

```ts
import type { DirectoryContents, DirectoryOptions, FileOptions } from "$lib/tauri/classes/file-system";

import { Directory, File } from "$lib/tauri/classes/file-system";
```

`index.ts` exports the `File` and `Directory` classes and their public option and result types. Importing from the folder keeps the implementation filenames private and avoids ambiguity with the browser's global `File` constructor.

---

## Basic usage

Resolve application paths with Tauri's path API, then create models for them. The static `create()` methods build class instances; `ensureExists()` performs the filesystem creation.

```ts
import { appDataDir, join } from "@tauri-apps/api/path";

import { Directory, File } from "$lib/tauri/classes/file-system";

const dataDirectory = await Directory.create(await join(await appDataDir(), "documents"));
await dataDirectory.ensureExists();

const settings = await File.create(await dataDirectory.join("settings.json"));
await settings.writeJSON({ theme: "dark" });

const savedSettings = await settings.readJSON<{ theme: string }>();
```

All filesystem calls are asynchronous. Operations outside the configured Tauri filesystem scope reject with an `Error` whose `cause` preserves the original plugin or command failure.

---

## Extending File

`File.create()` uses the constructor on which it was called, so a subclass with a compatible constructor retains its concrete result type:

```ts
import { File } from "$lib/tauri/classes/file-system";

export class ImageFile extends File {
	width = $state(0);
	height = $state(0);
}

const image = await ImageFile.create("/an/allowed/path/photo.png");
// image is ImageFile
```

The source files use the `.svelte.ts` extension so subclasses and future implementations can use Svelte runes such as `$state` and `$derived`. A subclass constructor must accept `FileOptions`, or it can inherit the base constructor unchanged.

---

## Public API

### `File`

| Member                 | Behavior                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `new File(options)`    | Creates a model from `FileOptions` without touching the filesystem.                                                         |
| `File.create(path)`    | Resolves the parent directory and creates a correctly typed model without creating the file.                                |
| `path`                 | Read-only absolute path supplied to the model.                                                                              |
| `dir`                  | Read-only parent `Directory`.                                                                                               |
| `ensureExists()`       | Recursively creates the parent directory and creates and closes an empty file handle when the file is absent.               |
| `exists()`             | Reports whether an entry exists at the path.                                                                                |
| `delete()`             | Removes the file when present.                                                                                              |
| `setPermissions(mode)` | Applies Unix permission bits through the scoped Rust command; validates scope but performs no mutation on non-Unix targets. |
| `readText()`           | Ensures the file exists and reads all UTF-8 text.                                                                           |
| `writeText(text)`      | Ensures the file exists and replaces its UTF-8 contents.                                                                    |
| `readJSON<T>()`        | Parses the complete contents as `T`; a newly created empty file returns `{}` cast as `T`.                                   |
| `writeJSON<T>(data)`   | Serializes `data` with four-space indentation and replaces the file contents.                                               |

`FileOptions` contains the required `path: string` and `directory: Directory` fields.

### `Directory`

| Member                   | Behavior                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `new Directory(options)` | Creates a model from `DirectoryOptions` without touching the filesystem.                          |
| `Directory.create(path)` | Resolves parent models up to the filesystem root without creating directories.                    |
| `path`                   | Read-only absolute path supplied to the model.                                                    |
| `parent`                 | Read-only parent `Directory`, or `null` at a filesystem root.                                     |
| `ensureExists()`         | Creates the directory and missing ancestors recursively when absent.                              |
| `exists()`               | Reports whether an entry exists at the path.                                                      |
| `setPermissions(mode)`   | Applies Unix permission bits through the same scoped Rust command.                                |
| `isEmpty()`              | Returns `true` for an absent or empty directory.                                                  |
| `getContents()`          | Returns immediate child models as `{ files, directories }`; it does not recurse into descendants. |
| `delete()`               | Recursively removes the directory and its contents when present.                                  |
| `join(...paths)`         | Joins child segments using the host platform's path rules.                                        |

`DirectoryOptions` contains `path: string` and `parent: Directory | null`. `DirectoryContents` contains `files: File[]` and `directories: Directory[]`.

The `file-system` folder's `index.ts` and exported declarations are the source of truth for the public API.

---

## Runtime and security

The models call native Tauri APIs and therefore reject when their methods run during SSR or in an ordinary browser. Importing them does not perform filesystem work, so the shared SvelteKit site can still prerender and build normally.

Tauri permissions are the security boundary. The default configuration below permits recursive reads and writes only in the application-specific config, data, local-data, cache, and log directories. Access to a selected file or another location requires an explicit capability scope or a runtime scope grant from the application; the classes never broaden scope themselves.

The custom `set_path_permissions` command requires an absolute path, rejects parent-directory segments and modes above `0o7777`, and checks the filesystem plugin's active scope before touching the path. On Unix it changes permission bits; on Windows and other non-Unix targets it intentionally succeeds without changing permissions.

---

## Accessibility and localization

The classes render no DOM and own no labels, focus behavior, keyboard interaction, or visible copy. They require no localization messages. Application interfaces that expose destructive operations such as `delete()` remain responsible for accessible confirmation, progress, and error feedback.

---

## Dependencies

### JavaScript package

```sh
# Bun
bun add @tauri-apps/api @tauri-apps/plugin-fs

# npm
npm install @tauri-apps/api @tauri-apps/plugin-fs

# pnpm
pnpm add @tauri-apps/api @tauri-apps/plugin-fs
```

### Cargo crate and initialization

Add the plugin crate:

```toml
[dependencies]
tauri-plugin-fs = "2"
```

Initialize it and register the permission command in `src-tauri/src/lib.rs`:

```rust
mod file_system;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![file_system::set_path_permissions])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Capabilities

Merge these permissions into the capability assigned to the application window:

```json
{
	"permissions": ["core:default", "fs:default", "fs:allow-app-write-recursive"]
}
```

`fs:default` grants scoped recursive reads and app-directory creation in Tauri's application-specific directories. `fs:allow-app-write-recursive` adds the write and removal operations used by these classes within the same application-specific scope. Add narrower explicit scopes for any other paths the app must access; do not grant the whole home directory merely to make arbitrary paths work.

### Rust permission command

Copy `src-tauri/src/file_system.rs` with this complete content:

```rust
use std::path::{Component, PathBuf};

use tauri::AppHandle;
use tauri_plugin_fs::FsExt;

/// Changes Unix permission bits after enforcing the same path scope as the filesystem plugin.
#[tauri::command]
pub fn set_path_permissions(app: AppHandle, path: PathBuf, mode: u32) -> Result<(), String> {
    if !path.is_absolute() {
        return Err("the permission path must be absolute".into());
    }

    if path.components().any(|component| component == Component::ParentDir) {
        return Err("the permission path cannot contain parent-directory segments".into());
    }

    if mode > 0o7777 {
        return Err("the permission mode must be between 0o0000 and 0o7777".into());
    }

    if !app.fs_scope().is_allowed(&path) {
        return Err("the permission path is outside the configured filesystem scope".into());
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let permissions = std::fs::Permissions::from_mode(mode);
        std::fs::set_permissions(&path, permissions).map_err(|error| error.to_string())?;
    }

    #[cfg(not(unix))]
    let _ = mode;

    Ok(())
}
```

No CSS, semantic tokens, icons, `$lib/utils` exports, xvelte components, hooks, attachments, fonts, images, localization setup, or network services are required. Copy the complete `src/lib/tauri/classes/file-system` folder together with the Rust command and configuration above.

The underlying filesystem behavior and capability model are documented by the official [Tauri filesystem plugin](https://v2.tauri.app/plugin/file-system/) and its [JavaScript API reference](https://v2.tauri.app/reference/javascript/fs/).

---

## File organization

| File                           | Responsibility                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `file.svelte.ts`               | Extensible file model, lifecycle operations, text and JSON helpers, and scoped permission invocation.           |
| `directory.svelte.ts`          | Directory hierarchy, recursive creation/removal, child listing, path joining, and scoped permission invocation. |
| `index.ts`                     | Public classes and TypeScript types.                                                                            |
| `file-system.md`               | Installation, extension, API, runtime, security, and dependency guide.                                          |
| `src-tauri/src/file_system.rs` | Scope-validated, platform-aware permission command required by `setPermissions()`.                              |

The folder's `index.ts` and exported types are the source of truth for the public API.

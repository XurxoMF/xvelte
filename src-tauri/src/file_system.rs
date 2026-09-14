use std::path::{Component, PathBuf};

use tauri::AppHandle;
use tauri_plugin_fs::FsExt;

/// Changes Unix permission bits after enforcing the same path scope as the filesystem plugin.
#[tauri::command]
pub fn set_path_permissions(app: AppHandle, path: PathBuf, mode: u32) -> Result<(), String> {
    if !path.is_absolute() {
        return Err("the permission path must be absolute".into());
    }

    if path
        .components()
        .any(|component| component == Component::ParentDir)
    {
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

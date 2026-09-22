mod modules;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            modules::file_system::set_path_permissions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

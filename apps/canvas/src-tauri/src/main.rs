// Pastel Studio Canvas: the editor in a frameless window, opened the way Focus Space opens its own (the
// app's top bar is the title bar, from @pastel-studio/desktop). The page reaches the disk only through
// the commands below, and only inside the projects folder or a folder the person picked in this session.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::Engine;
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::sync::Mutex;
use tauri::{ipc::Response, AppHandle, Manager, State, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_dialog::DialogExt;

/// The folders the page may read and write: the projects folder, then each one the person picks.
struct Roots(Mutex<Vec<PathBuf>>);

#[derive(serde::Serialize)]
struct Entry {
    name: String,
    dir: bool,
}

fn projects_folder(app: &AppHandle) -> Result<PathBuf, String> {
    let docs = app.path().document_dir().map_err(|e| e.to_string())?;
    Ok(docs.join("Pastel Canvas"))
}

/// The path, if it is absolute, has no `..` and sits in an allowed folder.
fn allowed(roots: &State<Roots>, path: &str) -> Result<PathBuf, String> {
    let p = PathBuf::from(path);
    if !p.is_absolute() || p.components().any(|c| matches!(c, Component::ParentDir)) {
        return Err(format!("Not an absolute path: {path}"));
    }
    let roots = roots.0.lock().map_err(|e| e.to_string())?;
    if roots.iter().any(|r| p.starts_with(r)) {
        Ok(p)
    } else {
        Err(format!("Outside the projects folder: {path}"))
    }
}

#[tauri::command]
fn projects_root(app: AppHandle) -> Result<String, String> {
    let root = projects_folder(&app)?;
    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    Ok(root.to_string_lossy().into_owned())
}

/// Asks for a folder and allows it for the rest of the session. Async: the dialog blocks its thread.
#[tauri::command(async)]
fn pick_folder(app: AppHandle, roots: State<Roots>) -> Result<Option<String>, String> {
    let Some(picked) = app.dialog().file().blocking_pick_folder() else { return Ok(None) };
    let path = picked.into_path().map_err(|e| e.to_string())?;
    roots.0.lock().map_err(|e| e.to_string())?.push(path.clone());
    Ok(Some(path.to_string_lossy().into_owned()))
}

#[tauri::command]
fn list_dir(roots: State<Roots>, path: String) -> Result<Vec<Entry>, String> {
    let p = allowed(&roots, &path)?;
    if !p.exists() {
        return Ok(vec![]);
    }
    let mut out = vec![];
    for e in fs::read_dir(p).map_err(|e| e.to_string())? {
        let e = e.map_err(|e| e.to_string())?;
        let dir = e.file_type().map(|t| t.is_dir()).unwrap_or(false);
        out.push(Entry { name: e.file_name().to_string_lossy().into_owned(), dir });
    }
    Ok(out)
}

#[tauri::command]
fn path_exists(roots: State<Roots>, path: String) -> Result<bool, String> {
    Ok(allowed(&roots, &path)?.exists())
}

#[tauri::command]
fn read_file(roots: State<Roots>, path: String) -> Result<Response, String> {
    let p = allowed(&roots, &path)?;
    fs::read(p).map(Response::new).map_err(|e| e.to_string())
}

/// Writes a file from base64, creating its folder.
#[tauri::command]
fn write_file(roots: State<Roots>, path: String, base64: String) -> Result<(), String> {
    let p = allowed(&roots, &path)?;
    let bytes = base64::engine::general_purpose::STANDARD.decode(base64).map_err(|e| e.to_string())?;
    if let Some(parent) = Path::new(&p).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(p, bytes).map_err(|e| e.to_string())
}

#[tauri::command]
fn make_dir(roots: State<Roots>, path: String) -> Result<(), String> {
    fs::create_dir_all(allowed(&roots, &path)?).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_file(roots: State<Roots>, path: String) -> Result<(), String> {
    let p = allowed(&roots, &path)?;
    if p.is_file() {
        fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let root = projects_folder(app.handle())?;
            app.manage(Roots(Mutex::new(vec![root])));
            // The shadow keeps Windows 11's rounded corners and resize edges. Tauri's file-drop handler
            // is off; it swallows HTML5 drag and drop in WebView2, which the library and layers use.
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("Pastel Studio Canvas")
                .inner_size(1600.0, 960.0)
                .min_inner_size(1100.0, 700.0)
                .center()
                .decorations(false)
                .shadow(true)
                .disable_drag_drop_handler()
                .build()?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            projects_root,
            pick_folder,
            list_dir,
            path_exists,
            read_file,
            write_file,
            make_dir,
            remove_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running Pastel Studio Canvas");
}

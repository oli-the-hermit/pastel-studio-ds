// The documentation site in a frameless window, for presenting the library without browser chrome.
// The window is opened the way Focus Space opens its own: the site's top bar is the title bar (it moves
// the window and draws the buttons, from @pastel-studio/desktop), and F11 toggles full screen.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{WebviewUrl, WebviewWindowBuilder};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // The shadow keeps Windows 11's rounded corners and resize edges. Tauri's file-drop handler
            // is off; it swallows HTML5 drag and drop in WebView2, which the demos use.
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("Pastel Studio Design System")
                .inner_size(1440.0, 900.0)
                .min_inner_size(900.0, 600.0)
                .center()
                .decorations(false)
                .shadow(true)
                .disable_drag_drop_handler()
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the Pastel Studio docs app");
}

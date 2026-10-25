// The documentation site in a borderless, maximized window, for presenting the library without browser chrome.
// The page is the docs build as it is; a small script adds a drag strip along the top edge and window buttons
// that show only when the pointer is near the top-right corner. F11 toggles full screen; Esc leaves it.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{WebviewUrl, WebviewWindowBuilder};

const CHROME: &str = r#"
(() => {
  const ready = () => {
    if (document.getElementById('psd-chrome')) return;
    const win = () => window.__TAURI__.window.getCurrentWindow();
    const style = document.createElement('style');
    style.textContent = `
      #psd-drag { position: fixed; inset: 0 0 auto 0; height: 10px; z-index: 2147483646; }
      #psd-chrome { position: fixed; top: 0; right: 0; z-index: 2147483647; display: flex; gap: 2px; padding: 8px 10px 14px 28px;
        opacity: 0; transition: opacity 160ms ease; }
      #psd-chrome:hover, #psd-chrome:focus-within { opacity: 1; }
      #psd-chrome button { width: 34px; height: 28px; border: 0; border-radius: 8px; font: 15px/1 system-ui, sans-serif; cursor: pointer;
        background: color-mix(in srgb, var(--ps-surface-3, #2a2a2a) 92%, transparent); color: var(--ps-text-1, #eee); }
      #psd-chrome button:hover { background: var(--ps-surface-4, #3a3a3a); }
      #psd-chrome button.close:hover { background: #c42b1c; color: #fff; }
    `;
    document.head.appendChild(style);
    const drag = document.createElement('div');
    drag.id = 'psd-drag';
    drag.setAttribute('data-tauri-drag-region', '');
    drag.addEventListener('dblclick', () => win().toggleMaximize());
    const bar = document.createElement('div');
    bar.id = 'psd-chrome';
    for (const [label, text, act, cls] of [['Minimize', '–', () => win().minimize(), ''], ['Maximize', '□', () => win().toggleMaximize(), ''], ['Close', '✕', () => win().close(), 'close']]) {
      const b = document.createElement('button');
      b.type = 'button'; b.title = label; b.setAttribute('aria-label', label); b.textContent = text; if (cls) b.className = cls;
      b.addEventListener('click', act);
      bar.appendChild(b);
    }
    document.body.append(drag, bar);
    document.addEventListener('keydown', async (e) => {
      if (e.key === 'F11') { e.preventDefault(); const w = win(); await w.setFullscreen(!(await w.isFullscreen())); }
      else if (e.key === 'Escape' && (await win().isFullscreen())) await win().setFullscreen(false);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
"#;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("Pastel Studio Design System")
                .inner_size(1440.0, 900.0)
                .min_inner_size(900.0, 600.0)
                .decorations(false)
                .maximized(true)
                .initialization_script(CHROME)
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the Pastel Studio docs app");
}

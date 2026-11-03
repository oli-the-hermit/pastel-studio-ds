/**
 * The frameless window's calls. Tauri's modules are imported lazily, so an app in a plain browser
 * never loads them; every call is safe to skip there by checking `isDesktop()` first.
 */

/** Whether the page runs inside a Tauri window. */
export function isDesktop(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Spread on the title bar and its free space to let them move the window. Tauri only honours the
 * attribute on the pressed element, so put it on each empty part, not only the bar.
 */
export const DRAG_REGION = { 'data-tauri-drag-region': true } as const;

const currentWindow = async () => (await import('@tauri-apps/api/window')).getCurrentWindow();

export async function minimizeWindow(): Promise<void> {
  await (await currentWindow()).minimize();
}

export async function toggleMaximizeWindow(): Promise<void> {
  await (await currentWindow()).toggleMaximize();
}

export async function closeWindow(): Promise<void> {
  await (await currentWindow()).close();
}

export async function isFullscreen(): Promise<boolean> {
  return (await currentWindow()).isFullscreen();
}

export async function setFullscreen(on: boolean): Promise<void> {
  await (await currentWindow()).setFullscreen(on);
}

/** Calls `handler` with the maximized state now and after every resize; resolves to the unsubscribe. */
export async function watchMaximized(handler: (maximized: boolean) => void): Promise<() => void> {
  const win = await currentWindow();
  handler(await win.isMaximized());
  return win.onResized(async () => handler(await win.isMaximized()));
}

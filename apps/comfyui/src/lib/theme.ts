import { accentTokens, resolveTheme, type ResolvedTheme } from '@pastel-studio/react';
import { app } from '../comfy';
import { getSettings, refreshSettings, subscribeSettings, type ThemeChoice } from './settings';

// The library's applyTheme paints a document's root. Here every node and the overlay layer is
// its own root inside a shadow tree, so the same tokens go on each of those elements.

const themed = new Set<HTMLElement>();

/** ComfyUI's palette: light palettes say so; everything else is dark. */
function comfyTheme(): ResolvedTheme {
  return app.extensionManager?.colorPalette?.getActiveColorPalette?.()?.light_theme ? 'light' : 'dark';
}

export function resolveChoice(choice: ThemeChoice): ResolvedTheme {
  return choice === 'comfy' ? comfyTheme() : resolveTheme(choice);
}

function paint(el: HTMLElement): void {
  const { theme, accent } = getSettings();
  const resolved = resolveChoice(theme);
  el.dataset.theme = resolved;
  el.style.colorScheme = resolved;
  for (const [name, value] of Object.entries(accentTokens(accent, resolved))) el.style.setProperty(name, value);
}

/** Keeps an element in the chosen theme and accent from now on. */
export function followTheme(el: HTMLElement): () => void {
  themed.add(el);
  paint(el);
  return () => themed.delete(el);
}

/**
 * ComfyUI announces a palette change before it makes that palette active: wait for the active
 * palette to be the announced one (a frame or two), then repaint.
 */
function afterPaletteChange(event: Event): void {
  const id = (event as CustomEvent<{ value?: unknown }>).detail?.value;
  let tries = 0;
  // Timers, not animation frames: a hidden tab pauses frames and the change would wait for it.
  const check = () => {
    const active = app.extensionManager?.colorPalette?.getActiveColorPalette?.();
    if (active?.id === id || ++tries > 50) refreshSettings();
    else setTimeout(check, 20);
  };
  check();
}

/** Repaints on every settings change, ComfyUI palette change, and OS theme change. */
export function startTheming(): void {
  subscribeSettings(() => themed.forEach(paint));
  app.ui?.settings?.addEventListener?.('Comfy.ColorPalette.change', afterPaletteChange);
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => refreshSettings());
}

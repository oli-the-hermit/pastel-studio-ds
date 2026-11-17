import { followTheme } from '../lib/theme';
import { designSystemSheet, registerFonts } from './styles';

/** Keys that still reach the window while typing in our UI. */
function passesThrough(e: KeyboardEvent): boolean {
  // Escape: the design system's modals close on it from a window listener.
  if (e.key === 'Escape') return true;
  // Ctrl/Cmd+Enter queues the prompt.
  return e.key === 'Enter' && (e.ctrlKey || e.metaKey);
}

/**
 * Keeps our keys and right-clicks away from ComfyUI. Events from a shadow root reach ComfyUI
 * retargeted to the host, so its "is this a text field?" check no longer sees the textarea and
 * its shortcuts (Delete, Ctrl+B, P, …) would fire while typing.
 */
export function isolateEvents(host: HTMLElement): void {
  host.addEventListener('keydown', (e) => {
    if (!passesThrough(e)) e.stopPropagation();
  });
  host.addEventListener('keyup', (e) => e.stopPropagation());
  host.addEventListener('contextmenu', (e) => e.stopPropagation());
}

/**
 * A host element for a node's UI; its shadow root keeps our styles and ComfyUI's apart. Call
 * `release` when the node goes, so the theme stops repainting it.
 */
export function createShadowHost(): { host: HTMLDivElement; container: HTMLDivElement; release: () => void } {
  registerFonts();
  const host = document.createElement('div');
  host.className = 'pastel-studio-host';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.adoptedStyleSheets = [designSystemSheet()];

  const container = document.createElement('div');
  container.className = 'pastel-node';
  shadow.append(container);
  isolateEvents(host);
  return { host, container, release: followTheme(container) };
}

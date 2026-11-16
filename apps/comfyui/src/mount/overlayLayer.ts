import { designSystemSheet, registerFonts } from './styles';
import { isolateEvents } from './shadowHost';

let layer: HTMLDivElement | null = null;

/**
 * One page-level layer for every node's menus, modals and toasts. Nodes sit under a CSS
 * transform, which would clip and scale anything floating inside them, so floating layers
 * render here instead: outside the canvas, inside the design system's styles.
 */
export function overlayLayer(): HTMLDivElement {
  if (layer?.isConnected) return layer;
  registerFonts();
  const host = document.createElement('div');
  host.className = 'pastel-studio-overlays';
  // Zero-sized and fixed: it takes no room and no clicks; its fixed children cover the page.
  Object.assign(host.style, { position: 'fixed', top: '0', left: '0', width: '0', height: '0', zIndex: '10000' });
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.adoptedStyleSheets = [designSystemSheet()];
  layer = document.createElement('div');
  layer.className = 'pastel-overlay-layer';
  layer.dataset.theme = 'dark';
  shadow.append(layer);
  isolateEvents(host);
  document.body.append(host);
  return layer;
}

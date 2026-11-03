// Screen and world coordinates. The world is the canvas before pan and zoom; the screen is the
// viewport's own box. Elements are measured from the DOM, so whatever the browser laid out is the truth.
import { getState, setView, type View } from '../model/store';
import type { Page } from '../model/types';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

let viewport: HTMLElement | null = null;
export const setViewportElement = (el: HTMLElement | null) => { viewport = el; };
export const viewportElement = () => viewport;

export const elementOf = (id: string): HTMLElement | null => viewport?.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(id)}"]`) ?? null;

/** An element's box on the screen (relative to the viewport). */
export function screenRect(id: string): Rect | undefined {
  const el = elementOf(id);
  if (!el || !viewport) return undefined;
  const v = viewport.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  return { x: b.left - v.left, y: b.top - v.top, w: b.width, h: b.height };
}

export function toWorld(clientX: number, clientY: number, view: View = getState().view) {
  const v = viewport?.getBoundingClientRect() ?? { left: 0, top: 0 };
  return { x: (clientX - v.left - view.x) / view.zoom, y: (clientY - v.top - view.y) / view.zoom };
}

/** An element's box in world units. */
export function worldRect(id: string, view: View = getState().view): Rect | undefined {
  const r = screenRect(id);
  if (!r) return undefined;
  return { x: (r.x - view.x) / view.zoom, y: (r.y - view.y) / view.zoom, w: r.w / view.zoom, h: r.h / view.zoom };
}

export const clampZoom = (z: number) => Math.min(8, Math.max(0.05, z));

/** Zooms by a factor around a point of the viewport (its center by default). */
export function zoomBy(factor: number, at?: { x: number; y: number }) {
  const view = getState().view;
  const box = viewport?.getBoundingClientRect();
  const p = at ?? { x: (box?.width ?? 0) / 2, y: (box?.height ?? 0) / 2 };
  const zoom = clampZoom(view.zoom * factor);
  const k = zoom / view.zoom;
  setView({ zoom, x: p.x - (p.x - view.x) * k, y: p.y - (p.y - view.y) * k });
}

export function zoomTo(zoom: number) {
  zoomBy(zoom / getState().view.zoom);
}

/** Fits the given frames (all of the page's by default) in the viewport. */
export function zoomToFit(page: Page | undefined, ids?: string[]) {
  if (!page || !viewport) return;
  const view = getState().view;
  const rects = (ids ?? page.frames.map((f) => f.id)).map((id) => worldRect(id, view)).filter((r): r is Rect => !!r);
  if (!rects.length) return;
  const x0 = Math.min(...rects.map((r) => r.x));
  const y0 = Math.min(...rects.map((r) => r.y));
  const x1 = Math.max(...rects.map((r) => r.x + r.w));
  const y1 = Math.max(...rects.map((r) => r.y + r.h));
  const box = viewport.getBoundingClientRect();
  const margin = 64;
  const zoom = clampZoom(Math.min((box.width - margin * 2) / (x1 - x0), (box.height - margin * 2) / (y1 - y0), 1));
  setView({ zoom, x: (box.width - (x1 - x0) * zoom) / 2 - x0 * zoom, y: (box.height - (y1 - y0) * zoom) / 2 - y0 * zoom });
}

/** Snaps a moving box to the nearest edges or centers within `threshold`; returns the shift and the lines hit. */
export function snap(r: Rect, xs: number[], ys: number[], threshold: number) {
  const best = (points: number[], lines: number[]) => {
    let hit: { d: number; line: number } | undefined;
    for (const p of points) for (const l of lines) {
      const d = l - p;
      if (Math.abs(d) <= threshold && (!hit || Math.abs(d) < Math.abs(hit.d))) hit = { d, line: l };
    }
    return hit;
  };
  const bx = best([r.x, r.x + r.w / 2, r.x + r.w], xs);
  const by = best([r.y, r.y + r.h / 2, r.y + r.h], ys);
  return { dx: bx?.d ?? 0, dy: by?.d ?? 0, gx: bx?.line, gy: by?.line };
}

export const edges = (rects: Rect[]) => ({
  xs: rects.flatMap((r) => [r.x, r.x + r.w / 2, r.x + r.w]),
  ys: rects.flatMap((r) => [r.y, r.y + r.h / 2, r.y + r.h]),
});

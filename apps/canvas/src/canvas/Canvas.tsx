// The canvas: frames rendered as real DOM inside a panned and zoomed world, and an overlay in screen
// space for what the editor draws (selection, handles, guides, drop lines, frame names).
//
// In edit mode the components must not react to the pointer, so a capturing listener on the viewport
// takes every press first and stops it before it reaches them. Only the text being typed into is let through.
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { insertNodes, updateNode } from '../model/actions';
import { currentPage, edit, endMerge, getState, select, setEditing, setHover, setView, useEditor } from '../model/store';
import { find, isContainer, isInside, move } from '../model/tree';
import { breakpointFrames, lookup, mutate } from '../model/virtual';
import { nodesFor, PAYLOAD_MIME, type Payload } from '../model/payload';
import type { CanvasNode, Page } from '../model/types';
import { importImages, isImageFile } from '../storage/images';
import { edges, elementOf, screenRect, setViewportElement, snap, toWorld, worldRect, zoomBy, type Rect } from './geometry';
import { RenderNode } from './RenderNode';

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

interface Drop {
  parentId?: string;
  index?: number;
  /** For a container without a stack: where in it, in its own coordinates. */
  local?: { x: number; y: number };
  /** The insertion line, or the container's box, on the screen. */
  line?: Rect;
  box?: Rect;
}

type Gesture =
  | { kind: 'pan'; sx: number; sy: number; vx: number; vy: number }
  | { kind: 'move'; ids: string[]; start: { x: number; y: number }; origins: Map<string, { x: number; y: number }>; box: Rect; parentOrigin: { x: number; y: number }; xs: number[]; ys: number[]; moved: boolean }
  | { kind: 'reorder'; id: string; sx: number; sy: number; moved: boolean; drop?: Drop }
  | { kind: 'resize'; id: string; handle: Handle; start: { x: number; y: number }; box: Rect; origin: { x: number; y: number }; positioned: boolean; aspect: number }
  | { kind: 'press' };

/** The node ids under an element, from its frame down to the deepest. */
function pathAt(target: EventTarget | null, world: HTMLElement): string[] {
  const ids: string[] = [];
  let el = target instanceof Element ? target : null;
  while (el && el !== world) {
    const id = (el as HTMLElement).dataset?.nodeId;
    if (id) ids.unshift(id);
    el = el.parentElement;
  }
  return ids;
}

/** Which node a click picks: the frame's direct child at first, deeper once you're working inside. */
function pick(page: Page, path: string[], deep: boolean): string | undefined {
  const pages = getState().pages;
  const usable = path.filter((id) => { const hit = lookup(page, id, pages); return hit && !hit.node.locked; });
  if (!usable.length) return undefined;
  if (deep) return usable[usable.length - 1];
  const sel = getState().selection;
  if (sel.length === 1 && usable.includes(sel[0]) && (sel[0] === usable[usable.length - 1] || lookup(page, sel[0], pages)?.parent)) return sel[0];
  let depth = 1;
  if (sel.length) {
    const parent = lookup(page, sel[0], pages)?.parent?.id;
    const i = parent ? usable.indexOf(parent) : -1;
    if (i >= 0) depth = i + 1;
  }
  return usable[Math.min(depth, usable.length - 1)];
}

/** Where a drop at a client point lands: the deepest container under it, and the place among its children. */
function dropAt(page: Page, cx: number, cy: number, exclude?: string): Drop | undefined {
  for (const el of document.elementsFromPoint(cx, cy) as HTMLElement[]) {
    const id = el.dataset?.nodeId;
    if (!id || (exclude && isInside(page, id, exclude))) continue;
    const node = find(page, id)?.node;
    if (!node || !isContainer(node)) continue;
    const box = screenRect(id);
    if (!node.stack) {
      const w = toWorld(cx, cy);
      const r = worldRect(id);
      return { parentId: id, local: { x: Math.round(w.x - (r?.x ?? 0)), y: Math.round(w.y - (r?.y ?? 0)) }, box };
    }
    const row = node.stack.direction === 'row';
    const kids = (node.children ?? []).filter((k) => !k.absolute && !k.hidden && k.id !== exclude);
    const vp = elementOf(id)?.closest<HTMLElement>('.cv-viewport')?.getBoundingClientRect();
    const local = { x: cx - (vp?.left ?? 0), y: cy - (vp?.top ?? 0) };
    let index = node.children?.length ?? 0;
    let line: Rect | undefined;
    for (const k of kids) {
      const r = screenRect(k.id);
      if (!r) continue;
      const mid = row ? r.x + r.w / 2 : r.y + r.h / 2;
      if ((row ? local.x : local.y) < mid) {
        index = node.children!.indexOf(k);
        line = row ? { x: r.x - 2, y: r.y, w: 3, h: r.h } : { x: r.x, y: r.y - 2, w: r.w, h: 3 };
        break;
      }
    }
    if (!line) {
      const last = kids.length ? screenRect(kids[kids.length - 1].id) : undefined;
      if (last) line = row ? { x: last.x + last.w, y: last.y, w: 3, h: last.h } : { x: last.x, y: last.y + last.h, w: last.w, h: 3 };
      else if (box) line = row ? { x: box.x + 8, y: box.y + 8, w: 3, h: Math.max(box.h - 16, 12) } : { x: box.x + 8, y: box.y + 8, w: Math.max(box.w - 16, 12), h: 3 };
    }
    return { parentId: id, index, line, box };
  }
  return undefined;
}

interface Overlay {
  selected: { id: string; rect: Rect }[];
  hover?: Rect;
  frames: { id: string; name: string; size: string; rect: Rect }[];
}

export function Canvas() {
  const page = useEditor((s) => currentPage(s));
  const view = useEditor((s) => s.view);
  const selection = useEditor((s) => s.selection);
  const hover = useEditor((s) => s.hover);
  const editing = useEditor((s) => s.editing);
  const vpRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | undefined>(undefined);
  const spaceDown = useRef(false);
  const [overlay, setOverlay] = useState<Overlay>({ selected: [], frames: [] });
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [drop, setDrop] = useState<Drop>();
  const [panning, setPanning] = useState(false);

  const measure = useCallback(() => {
    const s = getState();
    const p = currentPage(s);
    if (!p) return setOverlay({ selected: [], frames: [] });
    const selected = s.selection.map((id) => ({ id, rect: screenRect(id) })).filter((x): x is { id: string; rect: Rect } => !!x.rect);
    const hoverRect = s.hover && !s.selection.includes(s.hover) ? screenRect(s.hover) : undefined;
    const frames = p.frames.filter((f) => !f.hidden).flatMap((f) => [
      { id: f.id, name: f.name },
      ...breakpointFrames(f).map((b) => ({ id: b.id, name: `${f.name} · ${b.name}` })),
    ]).map((f) => {
      const r = worldRect(f.id, s.view);
      return { ...f, size: r ? `${Math.round(r.w)} × ${Math.round(r.h)}` : '', rect: screenRect(f.id)! };
    }).filter((f) => f.rect);
    setOverlay({ selected, hover: hoverRect, frames });
  }, []);

  useLayoutEffect(measure, [page, view, selection, hover, measure]);
  useEffect(() => {
    // Images load and fonts settle after a change: a light re-measure keeps the boxes true.
    const t = setInterval(measure, 400);
    window.addEventListener('resize', measure);
    return () => { clearInterval(t); window.removeEventListener('resize', measure); };
  }, [measure]);

  useEffect(() => {
    setViewportElement(vpRef.current);
    return () => setViewportElement(null);
  }, []);

  // Space held: the pointer pans.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target as HTMLElement).closest('input, textarea, [contenteditable]')) { spaceDown.current = true; setPanning(true); e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') { spaceDown.current = false; setPanning(false); } };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Wheel: pan; Ctrl + wheel (and a pinch): zoom at the pointer.
  useEffect(() => {
    const vp = vpRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const box = vp.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) zoomBy(Math.exp(-e.deltaY * 0.0022), { x: e.clientX - box.left, y: e.clientY - box.top });
      else {
        const v = getState().view;
        setView({ ...v, x: v.x - (e.shiftKey ? e.deltaY : e.deltaX), y: v.y - (e.shiftKey ? 0 : e.deltaY) });
      }
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, []);

  // The pointer, taken before the components see it.
  useEffect(() => {
    const vp = vpRef.current!;
    const world = worldRef.current!;
    const editingEl = (t: EventTarget | null) => {
      const id = getState().editing;
      return !!id && t instanceof Element && !!t.closest(`[data-node-id="${CSS.escape(id)}"]`);
    };
    const swallow = (e: Event) => {
      if (editingEl(e.target) || (e.target as Element).closest?.('.cv-overlay-ui')) return;
      if (world.contains(e.target as Node)) { e.stopPropagation(); if (e.type !== 'pointerdown') e.preventDefault(); }
    };

    const onDown = (e: PointerEvent) => {
      if (editingEl(e.target)) return;
      const p = currentPage();
      if (!p) return;
      const handle = (e.target as HTMLElement).closest<HTMLElement>('[data-handle]')?.dataset.handle as Handle | undefined;
      const label = (e.target as HTMLElement).closest<HTMLElement>('[data-frame-label]')?.dataset.frameLabel;
      if (world.contains(e.target as Node)) { e.stopPropagation(); e.preventDefault(); }
      if (getState().editing) setEditing(undefined);
      vp.setPointerCapture(e.pointerId);

      if (e.button === 1 || spaceDown.current) {
        const v = getState().view;
        gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y };
        return;
      }
      if (e.button !== 0) return;

      if (handle) {
        const id = getState().selection[0];
        const hit = id ? lookup(p, id, getState().pages) : undefined;
        const box = id ? worldRect(id) : undefined;
        if (!hit || !box) return;
        const positioned = !hit.parent || !hit.parent.stack || !!hit.node.absolute;
        gesture.current = { kind: 'resize', id, handle, start: toWorld(e.clientX, e.clientY), box, origin: { x: hit.node.x ?? 0, y: hit.node.y ?? 0 }, positioned, aspect: box.w / Math.max(box.h, 1) };
        return;
      }

      const path = label ? [label] : pathAt(e.target, world);
      const id = path.length ? pick(p, path, e.ctrlKey || e.metaKey) : undefined;
      if (!id) {
        if (!e.shiftKey) select([]);
        const v = getState().view;
        gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y };
        return;
      }
      const sel = getState().selection;
      if (e.shiftKey) {
        select(sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]);
        gesture.current = { kind: 'press' };
        return;
      }
      const ids = sel.includes(id) ? sel : [id];
      if (!sel.includes(id)) select([id]);

      const pages = getState().pages;
      const nodes = ids.map((i) => lookup(p, i, pages)).filter((h): h is NonNullable<typeof h> => !!h);
      const positioned = nodes.length > 0 && nodes.every((h) => !h.parent || !h.parent.stack || h.node.absolute);
      const sameParent = nodes.every((h) => h.parent?.id === nodes[0].parent?.id);
      // A breakpoint's frame sits where its frame puts it, and it can't be dragged on its own.
      const fixedFrame = nodes.some((h) => h.virtual === 'breakpoint-frame');
      if (positioned && sameParent && !fixedFrame) {
        const parent = nodes[0].parent;
        const parentBox = parent ? worldRect(parent.id) : undefined;
        const parentOrigin = parentBox ? { x: parentBox.x, y: parentBox.y } : { x: 0, y: 0 };
        const boxes = ids.map((i) => worldRect(i)).filter((r): r is Rect => !!r);
        const box = { x: Math.min(...boxes.map((b) => b.x)), y: Math.min(...boxes.map((b) => b.y)), w: 0, h: 0 };
        box.w = Math.max(...boxes.map((b) => b.x + b.w)) - box.x;
        box.h = Math.max(...boxes.map((b) => b.y + b.h)) - box.y;
        const siblings = (parent ? parent.children ?? [] : [...p.frames, ...p.frames.flatMap(breakpointFrames)]).filter((n) => !ids.includes(n.id) && !n.hidden);
        const others = siblings.map((n) => worldRect(n.id)).filter((r): r is Rect => !!r);
        if (parentBox) others.push(parentBox);
        const { xs, ys } = edges(others);
        gesture.current = {
          kind: 'move', ids, start: toWorld(e.clientX, e.clientY), box, parentOrigin, xs, ys, moved: false,
          origins: new Map(nodes.map((h) => [h.node.id, { x: h.node.x ?? 0, y: h.node.y ?? 0 }])),
        };
      } else if (ids.length === 1 && !nodes[0]?.virtual) {
        gesture.current = { kind: 'reorder', id, sx: e.clientX, sy: e.clientY, moved: false };
      } else {
        gesture.current = { kind: 'press' };
      }
    };

    const onMove = (e: PointerEvent) => {
      const g = gesture.current;
      const p = currentPage();
      if (!g) {
        if (!p || getState().editing) return;
        const path = pathAt(document.elementFromPoint(e.clientX, e.clientY), world);
        setHover(path.length ? pick(p, path, e.ctrlKey || e.metaKey) : undefined);
        return;
      }
      if (!p) return;
      if (g.kind === 'pan') {
        setView({ ...getState().view, x: g.vx + e.clientX - g.sx, y: g.vy + e.clientY - g.sy });
      } else if (g.kind === 'move') {
        const w = toWorld(e.clientX, e.clientY);
        let dx = w.x - g.start.x;
        let dy = w.y - g.start.y;
        if (!g.moved && Math.hypot(dx, dy) * getState().view.zoom < 3) return;
        g.moved = true;
        const s = e.altKey ? { dx: 0, dy: 0, gx: undefined, gy: undefined } : snap({ ...g.box, x: g.box.x + dx, y: g.box.y + dy }, g.xs, g.ys, 6 / getState().view.zoom);
        dx = Math.round(dx + s.dx);
        dy = Math.round(dy + s.dy);
        setGuides({ x: s.gx, y: s.gy });
        edit((draft) => {
          for (const [id, o] of g.origins) mutate(draft, id, (node) => { node.x = o.x + dx; node.y = o.y + dy; }, getState().pages);
        }, `move:${g.ids.join()}`);
      } else if (g.kind === 'reorder') {
        if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 4) return;
        g.moved = true;
        g.drop = dropAt(p, e.clientX, e.clientY, g.id);
        setDrop(g.drop);
      } else if (g.kind === 'resize') {
        const w = toWorld(e.clientX, e.clientY);
        const dx = w.x - g.start.x;
        const dy = w.y - g.start.y;
        let { x, y, w: width, h: height } = g.box;
        if (g.handle.includes('e')) width += dx;
        if (g.handle.includes('s')) height += dy;
        if (g.handle.includes('w')) { width -= dx; x += dx; }
        if (g.handle.includes('n')) { height -= dy; y += dy; }
        if (e.shiftKey && g.handle.length === 2) height = width / g.aspect;
        width = Math.max(1, Math.round(width));
        height = Math.max(1, Math.round(height));
        const horizontal = g.handle !== 'n' && g.handle !== 's';
        const vertical = g.handle !== 'e' && g.handle !== 'w';
        updateNode(g.id, (n) => {
          if (horizontal) n.width = { mode: 'fixed', value: width };
          if (vertical) n.height = { mode: 'fixed', value: height };
          if (g.positioned) {
            if (g.handle.includes('w')) n.x = Math.round(g.origin.x + (x - g.box.x));
            if (g.handle.includes('n')) n.y = Math.round(g.origin.y + (y - g.box.y));
          }
        }, `resize:${g.id}`);
      }
    };

    const onUp = (e: PointerEvent) => {
      const g = gesture.current;
      gesture.current = undefined;
      if (vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
      setGuides({});
      setDrop(undefined);
      endMerge();
      if (g?.kind === 'reorder' && g.moved && g.drop) {
        const d = g.drop;
        edit((draft) => {
          if (d.parentId === undefined) return;
          const target = find(draft, d.parentId)?.node;
          move(draft, g.id, d.parentId, d.index ?? target?.children?.length ?? 0);
          const node = find(draft, g.id)?.node;
          if (node && d.local) { node.x = d.local.x; node.y = d.local.y; }
        });
      }
    };

    const onDouble = (e: MouseEvent) => {
      const p = currentPage();
      if (!p || editingEl(e.target)) return;
      const path = pathAt(e.target, world);
      const sel = getState().selection[0];
      if (!sel) return;
      const pages = getState().pages;
      const node = lookup(p, sel, pages)?.node;
      if (node?.type === 'text' && path.includes(sel)) return setEditing(sel);
      const i = path.indexOf(sel);
      if (i >= 0 && i < path.length - 1) {
        const next = path[i + 1];
        select([next]);
        if (lookup(p, next, pages)?.node.type === 'text') setEditing(next);
      }
    };

    const onLeave = () => setHover(undefined);

    vp.addEventListener('pointerdown', onDown, true);
    vp.addEventListener('pointermove', onMove);
    vp.addEventListener('pointerup', onUp);
    vp.addEventListener('pointercancel', onUp);
    vp.addEventListener('pointerleave', onLeave);
    vp.addEventListener('dblclick', onDouble, true);
    for (const t of ['mousedown', 'mouseup', 'click', 'contextmenu', 'keydown', 'focusin']) vp.addEventListener(t, swallow, true);
    return () => {
      vp.removeEventListener('pointerdown', onDown, true);
      vp.removeEventListener('pointermove', onMove);
      vp.removeEventListener('pointerup', onUp);
      vp.removeEventListener('pointercancel', onUp);
      vp.removeEventListener('pointerleave', onLeave);
      vp.removeEventListener('dblclick', onDouble, true);
      for (const t of ['mousedown', 'mouseup', 'click', 'contextmenu', 'keydown', 'focusin']) vp.removeEventListener(t, swallow, true);
    };
  }, []);

  // Drops from the library, and image files from the system.
  const onDragOver = (e: React.DragEvent) => {
    const ours = e.dataTransfer.types.includes(PAYLOAD_MIME);
    const files = e.dataTransfer.types.includes('Files');
    if (!ours && !files) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const p = currentPage();
    if (p) setDrop(dropAt(p, e.clientX, e.clientY));
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDrop(undefined);
    const p = currentPage();
    if (!p) return;
    const d = dropAt(p, e.clientX, e.clientY);
    const w = toWorld(e.clientX, e.clientY);
    const raw = e.dataTransfer.getData(PAYLOAD_MIME);
    const nodes: CanvasNode[] = raw
      ? nodesFor(JSON.parse(raw) as Payload)
      : (await importImages([...e.dataTransfer.files].filter(isImageFile))).flatMap((a) => nodesFor({ kind: 'asset', id: a.id }));
    if (!nodes.length) return;
    if (!d || nodes.every((n) => n.type === 'frame')) insertNodes(nodes, { parentId: undefined, x: Math.round(w.x), y: Math.round(w.y) });
    else insertNodes(nodes, { parentId: d.parentId, index: d.index, x: d.local?.x, y: d.local?.y });
  };

  const single = overlay.selected.length === 1 ? overlay.selected[0] : undefined;
  const singleNode = single && page ? lookup(page, single.id, getState().pages)?.node : undefined;

  return (
    <div
      ref={vpRef}
      className="cv-viewport"
      data-panning={panning || undefined}
      onDragOver={onDragOver}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDrop(undefined); }}
      onDrop={(e) => void onDrop(e)}
    >
      <div ref={worldRef} className="cv-world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }} data-editing={editing ? true : undefined}>
        {page?.frames.map((f) => (
          <React.Fragment key={f.id}>
            <RenderNode node={f} />
            {breakpointFrames(f).map((b) => <RenderNode key={b.id} node={b} />)}
          </React.Fragment>
        ))}
      </div>

      <div className="cv-overlay" aria-hidden="true">
        {overlay.frames.map((f) => (
          <div key={f.id} className="cv-overlay-ui cv-frame-label" data-frame-label={f.id} data-selected={selection.includes(f.id) || undefined} style={{ left: f.rect.x, top: f.rect.y - 22, maxWidth: Math.max(f.rect.w, 60) }}>
            <span className="cv-frame-name">{f.name}</span>
            <span className="cv-frame-size">{f.size}</span>
          </div>
        ))}
        {overlay.hover && <div className="cv-hover" style={box(overlay.hover)} />}
        {overlay.selected.map((s) => <div key={s.id} className="cv-selected" style={box(s.rect)} />)}
        {single && singleNode && !editing && HANDLES.map((h) => (
          <div key={h} className="cv-overlay-ui cv-handle" data-handle={h} style={handleStyle(h, single.rect)} />
        ))}
        {single && singleNode && <div className="cv-size-badge" style={{ left: single.rect.x + single.rect.w / 2, top: single.rect.y + single.rect.h + 8 }}>{Math.round(single.rect.w / view.zoom)} × {Math.round(single.rect.h / view.zoom)}</div>}
        {guides.x !== undefined && <div className="cv-guide cv-guide-x" style={{ left: guides.x * view.zoom + view.x }} />}
        {guides.y !== undefined && <div className="cv-guide cv-guide-y" style={{ top: guides.y * view.zoom + view.y }} />}
        {drop?.box && <div className="cv-drop-box" style={box(drop.box)} />}
        {drop?.line && <div className="cv-drop-line" style={box(drop.line)} />}
      </div>
    </div>
  );
}

const box = (r: Rect): React.CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });

function handleStyle(h: Handle, r: Rect): React.CSSProperties {
  const x = h.includes('w') ? r.x : h.includes('e') ? r.x + r.w : r.x + r.w / 2;
  const y = h.includes('n') ? r.y : h.includes('s') ? r.y + r.h : r.y + r.h / 2;
  const cursor = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize' }[h];
  return { left: x, top: y, cursor };
}

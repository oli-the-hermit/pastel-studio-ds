// What the shortcuts, the menus and the panels do to the document.
import { currentPage, edit, getState, select } from './store';
import { cloneFresh, find, insert, isContainer, nextName, remove } from './tree';
import { newFrame, newStack } from './factory';
import type { CanvasNode, Page } from './types';

/** Where something new goes: inside a selected container, after another selected element, or in the first frame. */
export function insertionPoint(page: Page): { parentId?: string; index?: number } {
  const sel = getState().selection;
  if (sel.length === 1) {
    const hit = find(page, sel[0]);
    if (hit && isContainer(hit.node)) return { parentId: hit.node.id };
    if (hit?.parent) return { parentId: hit.parent.id, index: hit.index + 1 };
  }
  if (page.frames[0]) return { parentId: page.frames[0].id };
  return {};
}

/** Adds nodes and selects them. A node that isn't a frame, with nowhere to go, gets a frame of its own. */
export function insertNodes(nodes: CanvasNode[], at?: { parentId?: string; index?: number; x?: number; y?: number }) {
  const page = currentPage();
  if (!page || !nodes.length) return;
  edit((draft) => {
    // New frames go on the canvas, to the right of the others, unless they were dropped somewhere.
    const frames = !at && nodes.every((n) => n.type === 'frame');
    const right = Math.max(0, ...draft.frames.map((f) => (f.x ?? 0) + (f.width.mode === 'fixed' ? f.width.value : 400)));
    const target: { parentId?: string; index?: number; x?: number; y?: number } = frames
      ? { parentId: undefined, x: draft.frames.length ? right + 120 : 0, y: draft.frames[0]?.y ?? 0 }
      : (at ?? insertionPoint(draft));
    for (const n of nodes) if (n.type !== 'frame' && n.name === n.component?.name) n.name = nextName(draft, n.name);
    if (target.parentId === undefined) {
      if (nodes.every((n) => n.type === 'frame')) {
        nodes.forEach((n, i) => { n.x = (target.x ?? 0) + i * 40; n.y = (target.y ?? 0) + i * 40; });
        insert(draft, undefined, undefined, nodes);
      } else {
        const frame = newFrame(nextName(draft, 'Frame'), target.x ?? 0, target.y ?? 0, 480, 320);
        frame.children = nodes;
        insert(draft, undefined, undefined, [frame]);
      }
      return;
    }
    const parent = find(draft, target.parentId)?.node;
    if (parent && !parent.stack) {
      // A frame without a stack places its children where they were dropped.
      nodes.forEach((n, i) => { n.x = (target.x ?? 24) + i * 16; n.y = (target.y ?? 24) + i * 16; });
    }
    insert(draft, target.parentId, target.index, nodes);
  });
  select(nodes.map((n) => n.id));
}

export function deleteSelection() {
  const ids = getState().selection;
  if (!ids.length) return;
  edit((page) => void remove(page, ids));
  select([]);
}

let clipboard: CanvasNode[] = [];

export function copySelection() {
  const page = currentPage();
  if (!page) return;
  clipboard = getState().selection.map((id) => find(page, id)?.node).filter((n): n is CanvasNode => !!n).map((n) => structuredClone(n));
  void navigator.clipboard?.writeText(JSON.stringify({ pastelCanvas: 1, nodes: clipboard })).catch(() => {});
}

export function cutSelection() {
  copySelection();
  deleteSelection();
}

export async function paste() {
  let nodes = clipboard;
  try {
    const text = await navigator.clipboard?.readText();
    const parsed = text ? JSON.parse(text) : undefined;
    if (parsed?.pastelCanvas === 1 && Array.isArray(parsed.nodes)) nodes = parsed.nodes;
  } catch {
    // Not ours, or no permission: the in-app clipboard stands.
  }
  if (!nodes.length) return;
  const fresh = nodes.map(cloneFresh);
  for (const n of fresh) if (n.type === 'frame') { n.x = (n.x ?? 0) + 40; n.y = (n.y ?? 0) + 40; }
  if (fresh.every((n) => n.type === 'frame')) insertNodes(fresh, { parentId: undefined, x: fresh[0].x, y: fresh[0].y });
  else insertNodes(fresh);
}

export function duplicateSelection() {
  const page = currentPage();
  if (!page) return;
  const ids: string[] = [];
  edit((draft) => {
    for (const id of getState().selection) {
      const hit = find(draft, id);
      if (!hit) continue;
      const copy = cloneFresh(hit.node);
      if (copy.x !== undefined && (!hit.parent || !hit.parent.stack || copy.absolute)) {
        copy.x = (copy.x ?? 0) + (hit.parent ? 16 : (hit.node.width.mode === 'fixed' ? hit.node.width.value : 400) + 80);
        copy.y = (copy.y ?? 0) + (hit.parent ? 16 : 0);
      }
      hit.list.splice(hit.index + 1, 0, copy);
      ids.push(copy.id);
    }
  });
  select(ids);
}

/** Wraps the selected siblings in a new stack, where the first of them was. */
export function groupSelection() {
  const page = currentPage();
  const ids = getState().selection;
  if (!page || !ids.length) return;
  const first = find(page, ids[0]);
  if (!first?.parent || ids.some((id) => find(page, id)?.parent?.id !== first.parent!.id)) return;
  const stack = newStack(nextName(page, 'Stack'), first.parent.stack?.direction === 'row' ? 'row' : 'column');
  stack.style = {};
  stack.stack = { ...stack.stack!, padX: undefined, padY: undefined };
  edit((draft) => {
    const parent = find(draft, first.parent!.id)!.node;
    const kids = parent.children!;
    const index = Math.min(...ids.map((id) => kids.findIndex((k) => k.id === id)));
    stack.children = kids.filter((k) => ids.includes(k.id));
    parent.children = kids.filter((k) => !ids.includes(k.id));
    parent.children.splice(index, 0, stack);
  });
  select([stack.id]);
}

/** Replaces a selected stack with its children. */
export function ungroupSelection() {
  const page = currentPage();
  const id = getState().selection[0];
  if (!page || !id) return;
  const hit = find(page, id);
  if (!hit?.parent || hit.node.type !== 'stack') return;
  const kids = hit.node.children ?? [];
  edit((draft) => {
    const h = find(draft, id)!;
    h.list.splice(h.index, 1, ...(h.node.children ?? []));
  });
  select(kids.map((k) => k.id));
}

/** Moves the selection one place earlier or later among its siblings. */
export function reorderSelection(delta: -1 | 1) {
  const id = getState().selection[0];
  if (!id) return;
  edit((page) => {
    const hit = find(page, id);
    if (!hit) return;
    const to = hit.index + delta;
    if (to < 0 || to >= hit.list.length) return;
    hit.list.splice(hit.index, 1);
    hit.list.splice(to, 0, hit.node);
  }, `reorder:${id}`);
}

/** Nudges positioned elements; elements in a stack move among their siblings instead. */
export function nudgeSelection(dx: number, dy: number) {
  const page = currentPage();
  const ids = getState().selection;
  if (!page || !ids.length) return;
  const first = find(page, ids[0]);
  if (first?.parent?.stack && !first.node.absolute) {
    const dir = first.parent.stack.direction;
    const d = (dir === 'row' ? dx : dy) || (dir === 'row' ? dy : dx);
    if (d) reorderSelection(d < 0 ? -1 : 1);
    return;
  }
  edit((draft) => {
    for (const id of ids) {
      const node = find(draft, id)?.node;
      if (node) { node.x = (node.x ?? 0) + dx; node.y = (node.y ?? 0) + dy; }
    }
  }, `nudge:${ids.join()}`);
}

export function updateNode(id: string, fn: (node: CanvasNode) => void, merge?: string) {
  edit((page) => {
    const node = find(page, id)?.node;
    if (node) fn(node);
  }, merge);
}

/** Selects the parent of the selection, or clears it at a frame. */
export function selectParent() {
  const page = currentPage();
  const id = getState().selection[0];
  if (!page || !id) return;
  const hit = find(page, id);
  select(hit?.parent ? [hit.parent.id] : []);
}

// Reading and changing a page's tree. Changes mutate a draft: the store clones the page first.
import { uid, type CanvasNode, type Page } from './types';

export interface Found {
  node: CanvasNode;
  /** Undefined for a page's frame. */
  parent?: CanvasNode;
  /** The list the node sits in: the parent's children, or the page's frames. */
  list: CanvasNode[];
  index: number;
  /** Ancestors from the frame down, without the node. */
  path: CanvasNode[];
}

export function find(page: Page, id: string): Found | undefined {
  const visit = (list: CanvasNode[], parent: CanvasNode | undefined, path: CanvasNode[]): Found | undefined => {
    for (let index = 0; index < list.length; index++) {
      const node = list[index];
      if (node.id === id) return { node, parent, list, index, path };
      if (node.children) {
        const hit = visit(node.children, node, [...path, node]);
        if (hit) return hit;
      }
    }
    return undefined;
  };
  return visit(page.frames, undefined, []);
}

export function walk(list: CanvasNode[], fn: (node: CanvasNode, parent?: CanvasNode) => void, parent?: CanvasNode) {
  for (const node of list) {
    fn(node, parent);
    if (node.children) walk(node.children, fn, node);
  }
}

/** Whether `id` is `ancestorId` or sits somewhere inside it. */
export function isInside(page: Page, id: string, ancestorId: string): boolean {
  if (id === ancestorId) return true;
  const hit = find(page, id);
  return !!hit?.path.some((n) => n.id === ancestorId);
}

export const isContainer = (node: CanvasNode) => node.type === 'frame' || node.type === 'stack';

/** Removes nodes; returns them in the order they were found. */
export function remove(page: Page, ids: string[]): CanvasNode[] {
  const out: CanvasNode[] = [];
  for (const id of ids) {
    const hit = find(page, id);
    if (!hit) continue;
    hit.list.splice(hit.index, 1);
    out.push(hit.node);
  }
  return out;
}

/** Inserts into a container (or the page's frames when `parentId` is undefined) at `index` (the end when undefined). */
export function insert(page: Page, parentId: string | undefined, index: number | undefined, nodes: CanvasNode[]) {
  const list = parentId === undefined ? page.frames : (find(page, parentId)?.node.children ?? undefined);
  if (!list) throw new Error(`No container ${parentId}`);
  list.splice(index ?? list.length, 0, ...nodes);
}

/** Moves a node into a container at an index, keeping the index right when it moves within one list. */
export function move(page: Page, id: string, parentId: string | undefined, index: number) {
  const hit = find(page, id);
  if (!hit) return;
  const sameList = (parentId === undefined && !hit.parent) || hit.parent?.id === parentId;
  hit.list.splice(hit.index, 1);
  insert(page, parentId, sameList && hit.index < index ? index - 1 : index, [hit.node]);
}

/** A deep copy with new ids, for duplicate and paste. */
export function cloneFresh(node: CanvasNode): CanvasNode {
  return { ...structuredClone(node), id: uid(), children: node.children?.map(cloneFresh) };
}

/** A readable default name: "Stack 3". */
export function nextName(page: Page, base: string): string {
  let n = 0;
  walk(page.frames, (node) => {
    const m = node.name.match(new RegExp(`^${base} (\\d+)$`));
    if (m) n = Math.max(n, Number(m[1]));
  });
  return `${base} ${n + 1}`;
}
